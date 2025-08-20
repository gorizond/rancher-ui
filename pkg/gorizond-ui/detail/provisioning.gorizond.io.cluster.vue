<template>
  <div class="p-6 space-y-6">
    <Card
        :showActions="installUrl"
        :buttonAction="copyInstall"
        :buttonText="t('gorizond.cluster.installLink')"
        :showHighlightBorder="false">
      <template v-slot:title>
        <h2 class="text-xl font-semibold">Cluster: {{ cluster.metadata.name }}</h2>
      </template>
      <template v-slot:body>
        <LabeledInput label="Namespace" :value="cluster.metadata.namespace" disabled />
        <LabeledInput label="Kubernetes Version" :value="cluster.spec.kubernetesVersion" disabled />
        <LabeledInput label="Billing (Status)" :value="billingStatus" disabled />
        <LabeledInput label="Billing (Desired)" :value="billingDesired" disabled />
        <div class="space-y-2" v-if="cluster.status.provisioning!=='Done'">
          <h3 class="text-lg font-semibold">{{ t('gorizond.cluster.provisioning') }}: {{ cluster.status.provisioning }}</h3>
          <PercentageBar :modelValue="currentStepPercentage" :showPercentage="false" :preferredDirection="'MORE'" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { Card } from '@components/Card';
import { LabeledInput } from '@components/Form/LabeledInput';
import PercentageBar from '@shell/components/PercentageBar';

export default {
  components: {
    Card,
    LabeledInput,
    PercentageBar
  },

  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      setting: ''
    }
  },
  computed: {
    cluster() {
      return this.value;
    },
    steps() {
      return [
        'WaitAddAdminMember',
        'WaitHeadScaleDatabase',
        'WaitHeadScaleMigrations',
        'WaitHeadScaleConfig',
        'WaitHeadScaleCreate',
        'WaitHeadScaleCreateUser',
        'WaitHeadScaleToken',
        'WaitKubernetesStorage',
        'WaitKubernetesDeploy',
        'WaitKubernetesToken',
        'Done'
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
      return (currentIndex / (totalSteps - 1)) * 100;
    },

    billingStatus() {
      return this.cluster?.status?.billing || 'free (free tier use)';
    },
    billingDesired() {
      return this.cluster?.spec?.billing || 'free (free tier use)';
    },

    installUrl() {
      const s = this.cluster.status || {};
      const name = this.cluster.metadata?.name;
      const kubernetesVersion = this.cluster.spec?.kubernetesVersion;

      if (s.cluster && s.namespace && name && s.k3sToken && s.headscaleToken && kubernetesVersion) {
        const k3sToken = s.k3sToken.replace(/\n/g, '');
        const headscaleToken = s.headscaleToken.replace(/\n/g, '');
        const version = kubernetesVersion.replace('-', '+');

        return `curl -fsSL ${this.setting}/${s.cluster}/${s.namespace}/${name}/${k3sToken}/${headscaleToken}/${version} | sh`;
      }

      return null;
    }
  },
  async created() {
    const setting = await this.$store.dispatch('management/find', {
      type: 'management.cattle.io.setting',
      id: 'gorizond-install-server-url'
    });
    this.setting = setting.value;
    // TODO restore global Cluster Management button in UI if you are admin :)
    // TODO wait in new solution
    const labels = this.$store.getters['auth/v3User']?.labels;
    if (labels) {
      if (labels["authz.management.cattle.io/bootstrapping"] === "admin-user") {
        const existingStyle = document.getElementById('gorizond-hide-cluster-link-style');
        if (existingStyle) existingStyle.remove();
      }
    }
  },
  methods: {

    async copyInstall() {
      try {
        await navigator.clipboard.writeText(this.installUrl);
        this.$store.dispatch('growl/success', {
          title: 'Copied',
          message: 'Install link copied to clipboard'
        }, { root: true });
      } catch (err) {
        this.$store.dispatch('growl/fromError', {
          title: 'Copy failed',
          err
        }, { root: true });
      }
    }
  }
};
</script>
