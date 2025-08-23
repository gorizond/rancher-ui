<template>
  <div class="labeled-input">
    <label v-if="label">{{ label }}</label>
    <input 
      :value="value" 
      @input="$emit('update:value', $event.target.value)"
      :disabled="disabled"
      :required="required"
      :type="type"
      :min="min"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
export default {
  name: 'LabeledInput',
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'text'
    },
    min: {
      type: [String, Number],
      default: null
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['update:value']
};
</script>
