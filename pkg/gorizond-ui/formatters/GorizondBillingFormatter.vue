<script>
export default {
  props: {
    value: { type: String, default: '' },
    row:   { type: Object, required: true },
  },
  computed: {
    isDifferent() {
      if (this.row.spec?.billing === "") {
        return false;
      }
      return this.row.status?.billing !== this.row.spec?.billing;
    }
  }
};
</script>

<template>
  <div>
    <div :class="{ 'text-error': isDifferent }">
      {{ row.spec?.billing === "" ? 'free (free tier use)' : row.status?.billing }}
    </div>
    <div
        v-if="row.spec?.billing && row.spec?.billing !== row.status?.billing"
        class="text-muted text-small"
    >
      choose: {{ row.spec.billing }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.text-error {
  color: var(--error);
  font-weight: 500;
}
</style>