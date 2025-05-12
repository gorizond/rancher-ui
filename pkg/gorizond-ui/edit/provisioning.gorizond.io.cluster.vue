<template>
  <div class="p-6 space-y-6">
    <Banner v-if="!loaded" color="info" label="Loading..." />

    <Card v-else :showActions="true" :buttonAction="onSave" :buttonText="mode === 'create' ? 'Create' : 'Save'" :showHighlightBorder="false">
      <template v-slot:title>
        <div class="type-title">
          <h3>{{ mode }} Gorizond Cluster</h3>
        </div>
      </template>

      <template v-slot:body>
        <div class="space-y-4">
          <!-- Входные поля -->
          <LabeledInput
              v-model:value="model.metadata.name"
              label="Cluster Name"
              placeholder="Enter cluster name"
              :required="mode === 'create'"
              :disabled="mode !== 'create'"
          />

          <LabeledSelect
              v-model:value="model.metadata.namespace"
              label="Workspace (Namespace)"
              :options="workspaces"
              option-label="label"
              option-key="value"
              :disabled="mode !== 'create'"
              :required="mode === 'create'"
          />

          <LabeledSelect
              :disabled="mode === 'view'"
              v-model:value="model.spec.kubernetesVersion"
              label="Kubernetes Version"
              :options="k8sVersions"
              required
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { Banner } from '@components/Banner';
import { LabeledInput } from '@components/Form/LabeledInput';
import { Card } from '@components/Card';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { createOrUpgradeGorizondCluster } from '../utils/gorizond';

const YOUR_PRODUCT_NAME = 'gorizond';
export default {
  props: {
    value: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      required: true
    }
  },

  components: {
    Banner,
    Card,
    LabeledInput,
    LabeledSelect
  },

  data() {
    return {
      loaded: false,
      model: null,
      workspaces: [],
      k8sVersions: []
    };
  },

  async created() {
    this.model = { ...this.value };
    const releases = await this.$store.dispatch('management/request', { url: '/v1-k3s-release/releases' })

    this.k8sVersions = releases.data.map(ws => ({
      label: ws.id.replace('+', '-'),
      value: ws.id.replace('+', '-')
    }));

    const workspaces = await this.$store.dispatch('management/findAll', {
      type: 'management.cattle.io.fleetworkspace'
    });

    const sorted = workspaces.sort((a, b) =>
        new Date(b.metadata.creationTimestamp) - new Date(a.metadata.creationTimestamp)
    );

    this.workspaces = sorted.map(ws => ({
      label: ws.metadata.name,
      value: ws.metadata.name
    }));

    if (this.mode === 'create') {
      this.model.spec = {
        kubernetesVersion: this.k8sVersions.at(-1).value,
      };
      this.model.metadata.namespace = this.workspaces[0].value;
    }

    this.loaded = true;
  },

  methods: {
    async onSave() {
      const clean = JSON.parse(JSON.stringify(this.model || {}));


      try {
        await createOrUpgradeGorizondCluster(
            this.model.metadata.name,
            this.model.metadata.namespace,
            this.model.spec.kubernetesVersion,
            this.$store
        );

        this.$router.push({
          name: `c-cluster-${ YOUR_PRODUCT_NAME }-resource-id`,
          params: {
            id: clean.metadata.name,
            namespace: clean.metadata.namespace
          }
        });
      } catch (err) {
        this.$store.dispatch('growl/fromError', {
          err,
          title: 'Failed to create cluster'
        }, { root: true });
      }
    }
  }
};
</script>
