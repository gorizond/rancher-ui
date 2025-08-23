<template>
  <div class="card">
    <div v-if="$slots.title" class="card-title">
      <slot name="title" />
    </div>
    <div v-if="$slots.body" class="card-body">
      <slot name="body" />
    </div>
    <div v-if="showActions" class="card-actions">
      <button @click="buttonAction" v-if="buttonText">{{ buttonText }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    showActions: {
      type: Boolean,
      default: false
    },
    buttonAction: {
      type: Function,
      default: () => {}
    },
    buttonText: {
      type: String,
      default: ''
    },
    showHighlightBorder: {
      type: Boolean,
      default: false
    }
  }
};
</script>
