<template>
  <div class="labeled-select">
    <label v-if="label">{{ label }}</label>
    <select 
      :value="value" 
      @change="$emit('update:value', $event.target.value)"
      :disabled="disabled"
      :required="required"
    >
      <option v-for="option in options" :key="option[optionKey]" :value="option[optionKey]">
        {{ option[optionLabel] }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'LabeledSelect',
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    optionLabel: {
      type: String,
      default: 'label'
    },
    optionKey: {
      type: String,
      default: 'value'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value']
};
</script>
