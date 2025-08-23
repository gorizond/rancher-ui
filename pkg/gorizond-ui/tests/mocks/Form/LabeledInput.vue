<template>
  <div class="labeled-input-mock">
    <label v-if="label">{{ label }}</label>
    <input 
      :value="value" 
      @input="$emit('input', $event.target.value)"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </div>
</template>

<script>
export default {
  name: 'LabeledInput',
  props: {
    value: [String, Number],
    label: String,
    placeholder: String,
    disabled: Boolean
  }
}
</script>
