// Mock for shell components
export const PercentageBar = {
  name: 'PercentageBar',
  template: '<div class="percentage-bar">{{ modelValue }}%</div>',
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    showPercentage: {
      type: Boolean,
      default: true
    },
    preferredDirection: {
      type: String,
      default: 'MORE'
    }
  }
};

export default {
  PercentageBar
};
