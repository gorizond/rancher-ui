<template>
  <div class="banner" :class="color">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Banner',
  props: {
    color: {
      type: String,
      default: 'info'
    },
    label: {
      type: String,
      default: ''
    }
  }
};
</script>
