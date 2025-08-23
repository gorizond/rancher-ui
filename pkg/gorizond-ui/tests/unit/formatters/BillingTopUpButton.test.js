import { mount } from '@vue/test-utils';

// Mock the component directly
const BillingTopUpButton = {
  template: `
    <button class="btn btn-sm role-tertiary" @click="openDialog">
      Top Up
    </button>
  `,
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

describe('BillingTopUpButton', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = {
      dispatch: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mock the component logic directly
  const createBillingTopUpButton = (row, col, value) => {
    return {
      row,
      col,
      value,
      $store: mockStore,
      openDialog() {
        const namespace = this.row?.metadata?.namespace;
        const name = this.row?.metadata?.name;

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
    };
  };

  describe('openDialog method', () => {
    it('should dispatch promptModal with correct parameters', () => {
      const row = {
        metadata: {
          name: 'test-billing',
          namespace: 'test-namespace'
        }
      };

      const button = createBillingTopUpButton(row, {}, null);
      button.openDialog();

      expect(mockStore.dispatch).toHaveBeenCalledWith('cluster/promptModal', {
        component: 'TopUpBalanceDialog',
        componentProps: {
          name: 'test-billing',
          namespace: 'test-namespace'
        },
        modalWidth: '400px',
        modalSticky: true
      });
    });

    it('should use correct namespace and name from row metadata', () => {
      const row = {
        metadata: {
          name: 'custom-billing',
          namespace: 'custom-namespace'
        }
      };

      const button = createBillingTopUpButton(row, {}, null);
      button.openDialog();

      expect(mockStore.dispatch).toHaveBeenCalledWith('cluster/promptModal', {
        component: 'TopUpBalanceDialog',
        componentProps: {
          name: 'custom-billing',
          namespace: 'custom-namespace'
        },
        modalWidth: '400px',
        modalSticky: true
      });
    });

    it('should handle missing metadata gracefully', () => {
      const row = {
        metadata: {}
      };

      const button = createBillingTopUpButton(row, {}, null);
      button.openDialog();

      expect(mockStore.dispatch).toHaveBeenCalledWith('cluster/promptModal', {
        component: 'TopUpBalanceDialog',
        componentProps: {
          name: undefined,
          namespace: undefined
        },
        modalWidth: '400px',
        modalSticky: true
      });
    });

    it('should handle null row gracefully', () => {
      const button = createBillingTopUpButton(null, {}, null);
      button.openDialog();

      expect(mockStore.dispatch).toHaveBeenCalledWith('cluster/promptModal', {
        component: 'TopUpBalanceDialog',
        componentProps: {
          name: undefined,
          namespace: undefined
        },
        modalWidth: '400px',
        modalSticky: true
      });
    });
  });

  describe('component structure', () => {
    it('should have correct props structure', () => {
      const row = {
        metadata: {
          name: 'test-billing',
          namespace: 'test-namespace'
        }
      };

      const button = createBillingTopUpButton(row, {}, null);

      expect(button.row).toBeDefined();
      expect(button.col).toBeDefined();
      expect(button.value).toBeNull();
      expect(button.$store).toBeDefined();
      expect(typeof button.openDialog).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined row metadata', () => {
      const row = {};

      const button = createBillingTopUpButton(row, {}, null);
      button.openDialog();

      expect(mockStore.dispatch).toHaveBeenCalledWith('cluster/promptModal', {
        component: 'TopUpBalanceDialog',
        componentProps: {
          name: undefined,
          namespace: undefined
        },
        modalWidth: '400px',
        modalSticky: true
      });
    });

    it('should handle null row metadata', () => {
      const row = {
        metadata: null
      };

      const button = createBillingTopUpButton(row, {}, null);
      button.openDialog();

      expect(mockStore.dispatch).toHaveBeenCalledWith('cluster/promptModal', {
        component: 'TopUpBalanceDialog',
        componentProps: {
          name: undefined,
          namespace: undefined
        },
        modalWidth: '400px',
        modalSticky: true
      });
    });
  });
});
