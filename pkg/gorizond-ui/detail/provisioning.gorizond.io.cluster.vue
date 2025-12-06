<template>
  <div class="p-6 space-y-6 gorizond-cluster-detail">
    <Card :showActions="true" :showHighlightBorder="false">
      <template v-slot:title>
        <div class="header">
          <div>
            <p class="eyebrow">Gorizond Cluster</p>
            <h3 class="type-title mb-1">{{ cluster.metadata.name }}</h3>
            <p class="muted">Overview, billing and install command.</p>
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
                    Cluster identity, workspace and Kubernetes version.
                  </p>
                </div>
                <span class="pill">Overview</span>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div class="kv">
                  <p class="kv-label">Namespace</p>
                  <p class="kv-value">{{ cluster.metadata.namespace }}</p>
                </div>
                <div class="kv">
                  <p class="kv-label">Kubernetes Version</p>
                  <p class="kv-value">{{ cluster.spec.kubernetesVersion }}</p>
                </div>
                <div class="kv">
                  <p class="kv-label">Billing (Desired)</p>
                  <p class="kv-value">{{ billingDesired }}</p>
                </div>
                <div class="kv">
                  <p class="kv-label">Billing (Status)</p>
                  <p class="kv-value">{{ billingStatus }}</p>
                </div>
              </div>
            </section>

            <section class="panel panel-section">
              <div class="section-head">
                <div>
                  <p class="eyebrow">Provisioning</p>
                  <p class="muted">Current step and progress.</p>
                </div>
                <span class="pill soft">{{ progressLabel }}</span>
              </div>

              <div class="space-y-3">
                <p class="muted small">
                  Steps: {{ currentStepIndex + 1 }} / {{ steps.length }} —
                  {{ progressLabel }}.
                </p>
                <PercentageBar
                  :modelValue="currentStepPercentage"
                  :showPercentage="false"
                  :preferredDirection="'MORE'"
                />
              </div>
            </section>
          </div>

          <aside class="panel panel-section summary">
            <div class="section-head">
              <div>
                <p class="eyebrow">Install command</p>
                <p class="muted">Use when tokens are ready.</p>
              </div>
            </div>

            <div class="install-block">
              <pre class="install-command" :class="{ pending: !installUrl }"
                >{{ installPreview }}
              </pre>
            </div>
          </aside>
        </div>
      </template>

      <template v-slot:actions>
        <button
          class="btn role-primary"
          :disabled="!installUrl"
          @click="copyInstall"
        >
          {{
            installUrl
              ? t("gorizond.cluster.installLink")
              : "Waiting for tokens"
          }}
        </button>
      </template>
    </Card>
  </div>
</template>

<script>
import { Card } from "@components/Card";
import PercentageBar from "@shell/components/PercentageBar";

export default {
  components: {
    Card,
    PercentageBar,
  },

  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      setting: "",
    };
  },
  computed: {
    cluster() {
      return this.value;
    },
    progressLabel() {
      return this.cluster?.status?.provisioning || "Pending";
    },
    installPreview() {
      if (!this.installUrl) {
        return "Install link will appear when cluster is ready.";
      }

      const match = this.installUrl.match(/curl -fsSL\s+(\S+)\s*\|/);
      const url = match?.[1];

      if (!url) {
        return this.installUrl;
      }

      const parts = url.split("/");
      const len = parts.length;

      if (len >= 3) {
        parts[len - 2] = this.maskToken(parts[len - 2]);
        parts[len - 3] = this.maskToken(parts[len - 3]);
      }

      const maskedUrl = parts.join("/");

      return `curl -fsSL ${maskedUrl} | sh`;
    },
    steps() {
      return [
        "WaitAddAdminMember",
        "WaitHeadScaleDatabase",
        "WaitHeadScaleMigrations",
        "WaitHeadScaleConfig",
        "WaitHeadScaleCreate",
        "WaitHeadScaleCreateUser",
        "WaitHeadScaleToken",
        "WaitKubernetesStorage",
        "WaitKubernetesDeploy",
        "WaitKubernetesToken",
        "Done",
      ];
    },

    currentStepIndex() {
      const provisioning = this.cluster?.status?.provisioning;
      const index = this.steps.indexOf(provisioning);
      return index >= 0 ? index : 0;
    },
    currentStepPercentage() {
      const totalSteps = this.steps.length;
      const currentIndex = this.currentStepIndex;
      return totalSteps > 1 ? (currentIndex / (totalSteps - 1)) * 100 : 0;
    },

    billingStatus() {
      return this.cluster?.status?.billing || "free (free tier use)";
    },
    billingDesired() {
      return this.cluster?.spec?.billing || "free (free tier use)";
    },

    installUrl() {
      const s = this.cluster.status || {};
      const name = this.cluster.metadata?.name;
      const kubernetesVersion = this.cluster.spec?.kubernetesVersion;

      if (
        s.cluster &&
        s.namespace &&
        name &&
        s.k3sToken &&
        s.headscaleToken &&
        kubernetesVersion
      ) {
        const k3sToken = s.k3sToken.replace(/\n/g, "");
        const headscaleToken = s.headscaleToken.replace(/\n/g, "");
        const version = kubernetesVersion.replace("-", "+");

        return `curl -fsSL ${this.setting}/${s.cluster}/${s.namespace}/${name}/${k3sToken}/${headscaleToken}/${version} | sh`;
      }

      return null;
    },
  },
  async created() {
    const setting = await this.$store.dispatch("management/find", {
      type: "management.cattle.io.setting",
      id: "gorizond-install-server-url",
    });
    this.setting = setting.value;
    // TODO restore global Cluster Management button in UI if you are admin :)
    // TODO wait in new solution
    const labels = this.$store.getters["auth/v3User"]?.labels;
    if (labels) {
      if (labels["authz.management.cattle.io/bootstrapping"] === "admin-user") {
        const existingStyle = document.getElementById(
          "gorizond-hide-cluster-link-style"
        );
        if (existingStyle) existingStyle.remove();
      }
    }
  },
  methods: {
    maskToken(token) {
      if (!token) {
        return "";
      }
      if (token.length <= 8) {
        return token;
      }

      return `${token.slice(0, 4)}…${token.slice(-4)}`;
    },
    async copyInstall() {
      if (!this.installUrl) {
        return;
      }
      try {
        await navigator.clipboard.writeText(this.installUrl);
        this.$store.dispatch(
          "growl/success",
          {
            title: "Copied",
            message: "Install link copied to clipboard",
          },
          { root: true }
        );
      } catch (err) {
        this.$store.dispatch(
          "growl/fromError",
          {
            title: "Copy failed",
            err,
          },
          { root: true }
        );
      }
    },
  },
};
</script>

<style scoped>
.gorizond-cluster-detail .header {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
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

.kv {
  background: var(--hover-bg, #f6f7fb);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 6px;
  padding: 12px;
}

.kv-label {
  color: var(--text-muted, #6b7280);
  font-size: 12px;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.kv-value {
  font-weight: 600;
  word-break: break-word;
}

.summary {
  background: var(--body-bg, #fff);
  border: 1px solid var(--border, #e5e7eb);
  position: sticky;
  top: 12px;
  margin-top: 24px;
}

.install-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.install-command {
  background: var(--hover-bg, #f6f7fb);
  border: 1px dashed var(--border, #e5e7eb);
  border-radius: 6px;
  color: var(--text, #111827);
  font-family: var(
    --monospace,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace
  );
  font-size: 13px;
  margin: 0;
  overflow-x: auto;
  padding: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.install-command.pending {
  color: var(--text-muted, #6b7280);
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

@media (max-width: 1280px) {
  .form-grid {
    column-gap: 32px;
    row-gap: 28px;
  }
}
</style>
