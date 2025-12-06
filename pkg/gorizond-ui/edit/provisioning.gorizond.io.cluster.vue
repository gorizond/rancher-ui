<template>
  <div class="p-6 space-y-6 gorizond-cluster-form">
    <Banner v-if="!loaded" color="info" label="Loading..." />

    <Card
      v-else
      :showActions="true"
      :buttonAction="onSave"
      :buttonText="mode === 'create' ? 'Create' : 'Save'"
      :showHighlightBorder="false"
    >
      <template v-slot:title>
        <div class="header">
          <div>
            <p class="eyebrow">Gorizond Cluster</p>
            <h3 class="type-title mb-1">
              {{ mode === "create" ? "Create" : "Edit" }} cluster
            </h3>
            <p class="muted">
              Choose workspace, Kubernetes release and billing plan.
            </p>
          </div>
        </div>
      </template>

      <template v-slot:body>
        <div class="grid gap-6 xl:grid-cols-3 form-grid">
          <div class="xl:col-span-2 space-y-6">
            <section class="panel panel-section">
              <div class="section-head">
                <div>
                  <p class="eyebrow">Basics</p>
                  <p class="muted">
                    Give your cluster an identity and place it in a workspace.
                  </p>
                </div>
                <span class="pill">Required</span>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div class="field">
                  <LabeledInput
                    v-model:value="model.metadata.name"
                    label="Cluster Name"
                    placeholder="Enter cluster name"
                    :required="mode === 'create'"
                    :disabled="mode !== 'create'"
                    tooltip="Cluster name is locked after creation."
                  />
                  <p class="helper">
                    Use a short, human-friendly name. This is used in contexts
                    and CLI.
                  </p>
                </div>

                <div class="field">
                  <LabeledSelect
                    v-model:value="model.metadata.namespace"
                    label="Workspace (Namespace)"
                    :options="workspaces"
                    option-label="label"
                    option-key="value"
                    :disabled="mode !== 'create'"
                    :required="mode === 'create'"
                    tooltip="Workspace scopes Fleet bundles, credentials and billing."
                  />
                  <p class="helper">Inherits workspace policies.</p>
                </div>
              </div>
            </section>

            <section class="panel panel-section">
              <div class="section-head">
                <div>
                  <p class="eyebrow">Runtime & Billing</p>
                  <p class="muted">
                    Choose the Kubernetes release and billing plan.
                  </p>
                </div>
                <span class="pill soft">Configurable</span>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div class="field">
                  <LabeledSelect
                    :disabled="mode === 'view'"
                    v-model:value="model.spec.kubernetesVersion"
                    label="Kubernetes Version"
                    :options="k8sVersions"
                    required
                    tooltip="Latest stable release is preselected for new clusters."
                  />
                  <p class="helper">
                    Upgrade by editing the cluster later; downgrades are
                    blocked. Auto-selects latest stable for new clusters.
                  </p>
                </div>

                <div class="field">
                  <LabeledSelect
                    :disabled="mode === 'view'"
                    v-model:value="model.spec.billing"
                    label="Billing"
                    :options="billingOptions"
                    required
                    tooltip="Defaults to free tier when no billing is set."
                  />
                  <p class="helper">
                    Billing can be updated after provisioning if policies allow
                    it.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside class="panel panel-section summary">
            <div class="section-head">
              <div>
                <p class="eyebrow">Live preview</p>
                <p class="muted">Quickly verify before saving.</p>
              </div>
            </div>

            <dl class="summary-list">
              <div>
                <dt>Cluster</dt>
                <dd>{{ model?.metadata?.name || "Not set yet" }}</dd>
              </div>
              <div>
                <dt>Workspace</dt>
                <dd>{{ selectedWorkspaceLabel }}</dd>
              </div>
              <div>
                <dt>Kubernetes</dt>
                <dd>{{ selectedVersionLabel }}</dd>
              </div>
              <div>
                <dt>Billing</dt>
                <dd>{{ selectedBillingLabel }}</dd>
              </div>
            </dl>

            <p class="muted small summary-note">
              Name and workspace are locked after creation. Billing and
              Kubernetes version can be updated later based on policy.
            </p>
          </aside>
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { Banner } from "@components/Banner";
import { LabeledInput } from "@components/Form/LabeledInput";
import { Card } from "@components/Card";
import LabeledSelect from "@shell/components/form/LabeledSelect";
import { createOrUpgradeGorizondCluster } from "../utils/gorizond";

const YOUR_PRODUCT_NAME = "gorizond";
export default {
  props: {
    value: {
      type: Object,
      default: null,
    },
    mode: {
      type: String,
      required: true,
    },
  },

  components: {
    Banner,
    Card,
    LabeledInput,
    LabeledSelect,
  },

  data() {
    return {
      loaded: false,
      model: null,
      workspaces: [],
      k8sVersions: [],
      billingOptions: [],
    };
  },

  computed: {
    selectedWorkspaceLabel() {
      return this.formatOptionLabel(
        this.workspaces,
        this.model?.metadata?.namespace,
        "Not selected"
      );
    },
    selectedVersionLabel() {
      return this.formatOptionLabel(
        this.k8sVersions,
        this.model?.spec?.kubernetesVersion,
        "Select version"
      );
    },
    selectedBillingLabel() {
      return this.formatOptionLabel(
        this.billingOptions,
        this.model?.spec?.billing,
        "Free tier"
      );
    },
  },

  watch: {
    "model.metadata.namespace": {
      handler: async function (newNs, oldNs) {
        if (!newNs || newNs === oldNs) {
          return;
        }
        await this.loadBillings(newNs);
        if (
          !this.billingOptions.find(
            (o) => o.value === this.model?.spec?.billing
          )
        ) {
          this.model.spec.billing = "-free";
        }
      },
    },
  },

  async created() {
    this.model = {
      ...(this.value || {}),
      metadata: { ...(this.value?.metadata || {}) },
      spec: { ...(this.value?.spec || {}) },
    };
    const releases = await this.$store.dispatch("management/request", {
      url: "/v1-k3s-release/releases",
    });

    this.k8sVersions = releases.data.map((ws) => ({
      label: ws.id.replace("+", "-"),
      value: ws.id.replace("+", "-"),
    }));

    const workspaces = await this.$store.dispatch("management/findAll", {
      type: "management.cattle.io.fleetworkspace",
    });

    const sorted = workspaces.sort(
      (a, b) =>
        new Date(b.metadata.creationTimestamp) -
        new Date(a.metadata.creationTimestamp)
    );

    this.workspaces = sorted.map((ws) => ({
      label: ws.metadata.name,
      value: ws.metadata.name,
    }));

    // Load billings from the selected namespace (Fleet workspace)
    if (this.model?.metadata?.namespace) {
      await this.loadBillings(this.model.metadata.namespace);
    }

    if (this.mode === "create") {
      const latestVersion = this.k8sVersions.at(-1)?.value;

      this.model.spec = {
        ...this.model.spec,
        kubernetesVersion:
          latestVersion || this.model.spec.kubernetesVersion || "",
        billing: "-free",
      };
      this.model.metadata.namespace = this.workspaces[0]?.value;

      if (this.model.metadata.namespace) {
        await this.loadBillings(this.model.metadata.namespace);
      }
      // prepend 'free' and merge fetched billings
      this.ensureFreeBilling();
    } else {
      // map empty API value to UI sentinel '-free'
      if (!this.model.spec) this.model.spec = {};
      if (!this.model.spec.billing || this.model.spec.billing === "") {
        this.model.spec.billing = "-free";
      }
    }

    this.loaded = true;
  },

  methods: {
    formatOptionLabel(options, value, fallback) {
      const found = options.find((o) => o.value === value);

      return found?.label || fallback;
    },
    async loadBillings(namespace) {
      try {
        const res = await this.$store.dispatch("cluster/request", {
          url: `/apis/provisioning.gorizond.io/v1/namespaces/${namespace}/billings`,
          method: "GET",
        });

        // Rancher store sometimes returns plain {data} or the object directly
        const payload = res?.data || res;
        const items = payload?.items || payload?.data || [];

        const options = Array.isArray(items)
          ? items.map((b) => ({
              label: b.metadata?.name,
              value: b.metadata?.name,
            }))
          : [];

        // filter empty options
        const filtered = options.filter((o) => o && o.value);
        // UI sentinel for empty billing is '-free'
        this.billingOptions = [
          { label: "free (free tier use)", value: "-free" },
          ...filtered,
        ];
      } catch (e) {
        this.billingOptions = [
          { label: "free (free tier use)", value: "-free" },
        ];
      }
    },
    ensureFreeBilling() {
      if (!this.billingOptions.find((o) => o.value === "-free")) {
        this.billingOptions.unshift({
          label: "free (free tier use)",
          value: "-free",
        });
      }
    },
    async onSave() {
      const clean = JSON.parse(JSON.stringify(this.model || {}));

      try {
        await createOrUpgradeGorizondCluster(
          this.model.metadata.name,
          this.model.metadata.namespace,
          this.model.spec.kubernetesVersion,
          this.model.spec.billing === "-free" || !this.model.spec.billing
            ? ""
            : this.model.spec.billing,
          this.$store
        );

        this.$router.push({
          name: `c-cluster-${YOUR_PRODUCT_NAME}-resource`,
          params: {
            cluster: this.$route.params.cluster || "_",
            resource: "provisioning.gorizond.io.cluster",
          },
        });
      } catch (err) {
        this.$store.dispatch(
          "growl/fromError",
          {
            err,
            title: "Failed to create cluster",
          },
          { root: true }
        );
      }
    },
  },
};
</script>

<style scoped>
.gorizond-cluster-form .header {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}

.eyebrow {
  color: var(--text-muted, #6b7280);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.muted {
  color: var(--text-muted, #6b7280);
}

.muted.small {
  font-size: 12px;
  line-height: 1.4;
}

.panel {
  background: var(--body-bg, #fff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  padding: 20px;
}

.panel-section {
  padding: 20px;
}

.section-head {
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
}

.pill {
  background: var(--primary-50, #e8f3ff);
  border-radius: 9999px;
  color: var(--primary-600, #0f70d7);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  white-space: nowrap;
}

.pill.soft {
  background: var(--hover-bg, #f6f7fb);
  color: var(--text-muted, #6b7280);
}

.field .helper {
  color: var(--text-muted, #6b7280);
  font-size: 13px;
  margin-top: 6px;
}

.summary {
  background: var(--body-bg, #fff);
  border: 1px solid var(--border, #e5e7eb);
  position: sticky;
  top: 12px;
  margin-top: 24px;
}

.summary-list {
  display: grid;
  gap: 12px;
  margin: 8px 0 16px;
}

.summary-list dt {
  color: var(--text-muted, #6b7280);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-list dd {
  font-weight: 600;
  margin: 4px 0 0;
}

.summary-note {
  border-top: 1px solid var(--border, #e5e7eb);
  margin-top: 12px;
  padding-top: 12px;
}

.form-grid {
  align-items: flex-start;
  column-gap: 48px;
  row-gap: 32px;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
}

section.panel + section.panel {
  margin-top: 24px;
}

@media (max-width: 1024px) {
  .gorizond-cluster-form .header {
    align-items: flex-start;
  }
}

@media (max-width: 1280px) {
  .form-grid {
    column-gap: 32px;
    row-gap: 28px;
  }
}
</style>
