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

          <LabeledSelect
              :disabled="mode === 'view'"
              v-model:value="model.spec.billing"
              label="Billing"
              :options="billingOptions"
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
      k8sVersions: [],
      billingOptions: []
    };
  },

  watch: {
    'model.metadata.namespace': {
      handler: async function(newNs, oldNs) {
        if (!newNs || newNs === oldNs) {
          return;
        }
        await this.loadBillings(newNs);
        if (!this.billingOptions.find(o => o.value === this.model?.spec?.billing)) {
          this.model.spec.billing = '-free';
        }
      }
    }
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

    // Load billings from the selected namespace (Fleet workspace)
    if (this.model?.metadata?.namespace) {
      await this.loadBillings(this.model.metadata.namespace);
    }

    if (this.mode === 'create') {
      this.model.spec = {
        kubernetesVersion: this.k8sVersions.at(-1).value,
        billing: '-free'
      };
      this.model.metadata.namespace = this.workspaces[0].value;
      await this.loadBillings(this.model.metadata.namespace);
      // prepend 'free' and merge fetched billings
      this.ensureFreeBilling();
    } else {
      // map empty API value to UI sentinel '-free'
      if (!this.model.spec) this.model.spec = {};
      if (!this.model.spec.billing || this.model.spec.billing === '') {
        this.model.spec.billing = '-free';
      }
    }

    this.loaded = true;
  },

  methods: {
    async loadBillings(namespace) {
      try {
        const res = await this.$store.dispatch('cluster/request', {
          url: `/apis/provisioning.gorizond.io/v1/namespaces/${ namespace }/billings`,
          method: 'GET'
        });

        // Rancher store sometimes returns plain {data} or the object directly
        const payload = res?.data || res;
        const items = payload?.items || payload?.data || [];

        const options = Array.isArray(items)
          ? items.map((b) => ({ label: b.metadata?.name, value: b.metadata?.name }))
          : [];

        // filter empty options
        const filtered = options.filter(o => o && o.value);
        // UI sentinel for empty billing is '-free'
        this.billingOptions = [{ label: 'free (free tier use)', value: '-free' }, ...filtered];
      } catch (e) {
        this.billingOptions = [{ label: 'free (free tier use)', value: '-free' }];
      }
    },
    ensureFreeBilling() {
      if (!this.billingOptions.find(o => o.value === '-free')) {
        this.billingOptions.unshift({ label: 'free (free tier use)', value: '-free' });
      }
    },
    async onSave() {
      const clean = JSON.parse(JSON.stringify(this.model || {}));


      try {
        await createOrUpgradeGorizondCluster(
            this.model.metadata.name,
            this.model.metadata.namespace,
            this.model.spec.kubernetesVersion,
            (this.model.spec.billing === '-free' || !this.model.spec.billing) ? '' : this.model.spec.billing,
            this.$store
        );

        this.$router.push({
          name: `c-cluster-${ YOUR_PRODUCT_NAME }-resource`,
          params: {
            cluster: this.$route.params.cluster || '_',
            resource: 'provisioning.gorizond.io.cluster'
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
