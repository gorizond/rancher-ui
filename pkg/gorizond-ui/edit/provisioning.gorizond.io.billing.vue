<template>
  <div class="p-6 space-y-6">
    <Banner v-if="!loaded" color="info" label="Loading..." />

    <Card v-else :showActions="true" :buttonAction="onSave" :buttonText="mode === 'create' ? 'Create' : 'Save'" :showHighlightBorder="false">
      <template v-slot:title>
        <div class="type-title">
          <h3>{{ mode }} Billing</h3>
        </div>
      </template>

      <template v-slot:body>
        <div class="space-y-4">
          <LabeledInput
              v-model:value="model.metadata.name"
              label="Billing Name"
              placeholder="Enter billing name"
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
        workspaces: []
      };
    },

    async created() {
      this.model = { ...this.value };

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
        this.model = this.model || {};
        this.model.metadata = this.model.metadata || {};
        this.model.metadata.namespace = this.workspaces[0]?.value;
      }

      this.loaded = true;
    },

    methods: {
      async onSave() {
        const clean = JSON.parse(JSON.stringify(this.model || {}));

        try {
          if (this.mode === 'create') {
            const body = {
              apiVersion: 'provisioning.gorizond.io/v1',
              kind: 'Billing',
              metadata: {
                name: clean.metadata.name,
                namespace: clean.metadata.namespace
              }
            };
            await this.$store.dispatch('cluster/request', {
              url: `/apis/provisioning.gorizond.io/v1/namespaces/${ clean.metadata.namespace }/billings`,
              method: 'POST',
              data: body
            });
          }

          this.$router.push({
            name: `c-cluster-${ YOUR_PRODUCT_NAME }-resource`,
            params: {
              cluster: this.$route.params.cluster || '_',
              resource: 'provisioning.gorizond.io.billing'
            }
          });
        } catch (err) {
          this.$store.dispatch('growl/fromError', {
            err,
            title: 'Failed to save billing'
          }, { root: true });
        }
      }
    }
  };
  </script>

