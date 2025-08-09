<template>
  <button class="btn btn-sm role-tertiary" @click="openDialog">
    Top Up
  </button>
</template>

<script>
export default {
  props: {
    row: { type: Object, required: true },
    col: { type: Object, required: true },
    value: null,
  },
  methods: {
    openDialog() {
      const namespace = this.row.metadata.namespace;
      const name = this.row.metadata.name;

      this.$store.dispatch('cluster/promptModal', {
        component: 'TopUpBalanceDialog',
        componentProps: {
          name,
          namespace
        },
        modalWidth: '400px',
        modalSticky: true
      });
    }
  }
};
</script>
