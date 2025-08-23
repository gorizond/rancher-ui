<template>
  <div class="labeled-select-mock">
    <label v-if="label">{{ label }}</label>
    <select 
      :value="value" 
      @change="$emit('input', $event.target.value)"
      :disabled="disabled"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'LabeledSelect',
  props: {
    value: [String, Number],
    label: String,
    options: {
      type: Array,
      default: () => []
    },
    disabled: Boolean
  }
}
</script>
