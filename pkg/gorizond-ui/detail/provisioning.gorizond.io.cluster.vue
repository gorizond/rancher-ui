<script>
export default {
  props: {
    value: {
      type:     Object,
      required: true
    }
  }
};
</script>
<template>
  <div>
    <h1>{{ value.name }}</h1>
    <p>{{ value.spec.kubernetesVersion }}</p>
  </div>
</template>
<style lang="scss" scoped>
</style>