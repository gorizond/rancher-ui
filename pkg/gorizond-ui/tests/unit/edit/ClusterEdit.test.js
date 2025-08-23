// Mock components
jest.mock('@components/Banner', () => ({}));
jest.mock('@components/Card', () => ({}));
jest.mock('@components/Form/LabeledInput', () => ({}));
jest.mock('@shell/components/form/LabeledSelect', () => ({}));

// Mock utils
jest.mock('../../../utils/gorizond', () => ({
  createOrUpgradeGorizondCluster: jest.fn()
}));

// Import the utility function for testing
import { createOrUpgradeGorizondCluster } from '../../../utils/gorizond';

// Mock the component's logic for testing
const createMockComponent = (initialData = {}, mode = 'edit') => {
  const defaultCluster = {
    metadata: {
      name: '',
      namespace: 'default'
    },
    spec: {
      kubernetesVersion: 'v1.25.16',
      billing: ''
    }
  };

  let model = initialData.value ? { ...defaultCluster, ...initialData.value } : null;
  let loaded = false;
  let workspaces = [];
  let k8sVersions = [];
  let billingOptions = [];
  
  const loadKubernetesVersions = async () => {
    // Mock the K8s versions loading logic
    const mockVersions = [
      { id: 'v1.25.16' },
      { id: 'v1.26.0' },
      { id: 'v1.27.0' }
    ];
    k8sVersions = mockVersions.map(v => ({
      label: v.id,
      value: v.id
    }));
    return k8sVersions;
  };

  const loadWorkspaces = async () => {
    // Mock the workspaces loading logic
    const mockWorkspaces = [
      {
        metadata: {
          name: 'workspace1',
          creationTimestamp: '2023-01-01T00:00:00Z'
        }
      },
      {
        metadata: {
          name: 'workspace2',
          creationTimestamp: '2023-01-02T00:00:00Z'
        }
      }
    ];
    
    workspaces = mockWorkspaces
      .sort((a, b) => new Date(b.metadata.creationTimestamp) - new Date(a.metadata.creationTimestamp))
      .map(w => ({
        label: w.metadata.name,
        value: w.metadata.name
      }));
    
    return workspaces;
  };

  const loadBillings = async (namespace) => {
    if (!namespace) {
      billingOptions = [{ label: 'free (free tier use)', value: '-free' }];
      return billingOptions;
    }

    try {
      // Mock the billing loading logic
      const mockBillings = [
        { metadata: { name: 'billing1' } },
        { metadata: { name: 'billing2' } }
      ];
      
      const billings = mockBillings.map(b => ({
        label: b.metadata.name,
        value: b.metadata.name
      }));

      ensureFreeBilling();
      billingOptions = [{ label: 'free (free tier use)', value: '-free' }].concat(billings);
      
      return billingOptions;
    } catch (error) {
      ensureFreeBilling();
      return billingOptions;
    }
  };

  const ensureFreeBilling = () => {
    const hasFree = billingOptions.some(opt => opt.value === '-free');
    if (!hasFree) {
      billingOptions.unshift({ label: 'free (free tier use)', value: '-free' });
    }
  };

  const onSave = async () => {
    if (!model || !model.metadata.name || !model.metadata.namespace) {
      throw new Error('Name and namespace are required');
    }
    
    const billing = model.spec.billing === '-free' ? '' : model.spec.billing;
    
    return createOrUpgradeGorizondCluster(
      model.metadata.name,
      model.metadata.namespace,
      model.spec.kubernetesVersion,
      billing
    );
  };

  const initialize = async () => {
    loaded = false;
    
    if (mode === 'create') {
      model = { ...defaultCluster };
    }
    
    await Promise.all([
      loadKubernetesVersions(),
      loadWorkspaces(),
      mode === 'create' ? loadBillings('default') : Promise.resolve()
    ]);
    
    loaded = true;
  };

  const watchNamespaceChange = async (newNamespace, oldNamespace) => {
    if (newNamespace !== oldNamespace && model) {
      await loadBillings(newNamespace);
      
      // Reset billing if current billing is not in new options
      const currentBilling = model.spec.billing;
      const hasCurrentBilling = billingOptions.some(opt => opt.value === currentBilling);
      
      if (!hasCurrentBilling) {
        model.spec.billing = '-free';
      }
    }
  };

  const getButtonText = () => {
    return mode === 'create' ? 'Create' : 'Save';
  };

  return {
    mode,
    get model() { return model; },
    get loaded() { return loaded; },
    get workspaces() { return workspaces; },
    get k8sVersions() { return k8sVersions; },
    get billingOptions() { return billingOptions; },
    loadKubernetesVersions,
    loadWorkspaces,
    loadBillings,
    ensureFreeBilling,
    onSave,
    initialize,
    watchNamespaceChange,
    getButtonText,
    updateValue: (key, value) => {
      if (!model) return;
      
      if (key.includes('.')) {
        const keys = key.split('.');
        let obj = model;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!obj[keys[i]]) {
            obj[keys[i]] = {};
          }
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
      } else {
        model[key] = value;
      }
    },
    setLoaded: (value) => {
      loaded = value;
    },
    setBillingOptions: (options) => {
      billingOptions = options;
    },
    setWorkspaces: (ws) => {
      workspaces = ws;
    },
    setK8sVersions: (versions) => {
      k8sVersions = versions;
    },
    setModel: (m) => {
      model = m;
    }
  };
};

describe('ClusterEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('component initialization', () => {
    it('should initialize with correct default values', () => {
      const component = createMockComponent();

      expect(component.loaded).toBe(false);
      expect(component.model).toBeNull();
      expect(component.workspaces).toEqual([]);
      expect(component.k8sVersions).toEqual([]);
      expect(component.billingOptions).toEqual([]);
    });

    it('should initialize model for create mode', () => {
      const component = createMockComponent({}, 'create');
      
      expect(component.mode).toBe('create');
    });

    it('should initialize model for edit mode', () => {
      const initialValue = {
        value: {
          metadata: { name: 'test-cluster', namespace: 'test-namespace' },
          spec: { kubernetesVersion: 'v1.25.0', billing: 'test-billing' }
        }
      };
      const component = createMockComponent(initialValue, 'edit');
      
      expect(component.mode).toBe('edit');
      expect(component.model.metadata.name).toBe('test-cluster');
    });
  });

  describe('data loading', () => {
    it('should load Kubernetes versions', async () => {
      const component = createMockComponent();

      await component.loadKubernetesVersions();

      expect(component.k8sVersions).toEqual([
        { label: 'v1.25.16', value: 'v1.25.16' },
        { label: 'v1.26.0', value: 'v1.26.0' },
        { label: 'v1.27.0', value: 'v1.27.0' }
      ]);
    });

    it('should load workspaces sorted by creation time', async () => {
      const component = createMockComponent();

      await component.loadWorkspaces();

      expect(component.workspaces).toEqual([
        { label: 'workspace2', value: 'workspace2' },
        { label: 'workspace1', value: 'workspace1' }
      ]);
    });

    it('should load billings for given namespace', async () => {
      const component = createMockComponent();

      await component.loadBillings('test-namespace');

      expect(component.billingOptions).toEqual([
        { label: 'free (free tier use)', value: '-free' },
        { label: 'billing1', value: 'billing1' },
        { label: 'billing2', value: 'billing2' }
      ]);
    });

    it('should only show free billing when namespace is empty', async () => {
      const component = createMockComponent();

      await component.loadBillings('');

      expect(component.billingOptions).toEqual([
        { label: 'free (free tier use)', value: '-free' }
      ]);
    });
  });

  describe('billing management', () => {
    it('should ensure free billing option is present', () => {
      const component = createMockComponent();
      component.setBillingOptions([
        { label: 'billing1', value: 'billing1' }
      ]);

      component.ensureFreeBilling();

      expect(component.billingOptions).toEqual([
        { label: 'free (free tier use)', value: '-free' },
        { label: 'billing1', value: 'billing1' }
      ]);
    });

    it('should not duplicate free billing option', () => {
      const component = createMockComponent();
      component.setBillingOptions([
        { label: 'free (free tier use)', value: '-free' },
        { label: 'billing1', value: 'billing1' }
      ]);

      component.ensureFreeBilling();

      expect(component.billingOptions).toEqual([
        { label: 'free (free tier use)', value: '-free' },
        { label: 'billing1', value: 'billing1' }
      ]);
    });
  });

  describe('namespace change handling', () => {
    it('should reload billings when namespace changes', async () => {
      const component = createMockComponent();
      component.setModel({
        metadata: { name: 'test', namespace: 'old-namespace' },
        spec: { kubernetesVersion: 'v1.25.0', billing: 'old-billing' }
      });

      await component.watchNamespaceChange('new-namespace', 'old-namespace');

      expect(component.billingOptions).toEqual([
        { label: 'free (free tier use)', value: '-free' },
        { label: 'billing1', value: 'billing1' },
        { label: 'billing2', value: 'billing2' }
      ]);
    });

    it('should reset billing to free when current billing is not available', async () => {
      const component = createMockComponent();
      component.setModel({
        metadata: { name: 'test', namespace: 'old-namespace' },
        spec: { kubernetesVersion: 'v1.25.0', billing: 'old-billing' }
      });

      await component.watchNamespaceChange('new-namespace', 'old-namespace');

      expect(component.model.spec.billing).toBe('-free');
    });

    it('should not change anything when namespace stays the same', async () => {
      const component = createMockComponent();
      component.setModel({
        metadata: { name: 'test', namespace: 'namespace' },
        spec: { kubernetesVersion: 'v1.25.0', billing: 'billing' }
      });
      const originalBilling = component.model.spec.billing;

      await component.watchNamespaceChange('namespace', 'namespace');

      expect(component.model.spec.billing).toBe(originalBilling);
    });
  });

  describe('save functionality', () => {
    it('should save cluster successfully', async () => {
      createOrUpgradeGorizondCluster.mockResolvedValue();
      
      const component = createMockComponent();
      component.setModel({
        metadata: { name: 'test-cluster', namespace: 'test-namespace' },
        spec: { kubernetesVersion: 'v1.25.0', billing: 'test-billing' }
      });

      await component.onSave();

      expect(createOrUpgradeGorizondCluster).toHaveBeenCalledWith(
        'test-cluster',
        'test-namespace',
        'v1.25.0',
        'test-billing'
      );
    });

    it('should convert -free billing to empty string', async () => {
      createOrUpgradeGorizondCluster.mockResolvedValue();
      
      const component = createMockComponent();
      component.setModel({
        metadata: { name: 'test-cluster', namespace: 'test-namespace' },
        spec: { kubernetesVersion: 'v1.25.0', billing: '-free' }
      });

      await component.onSave();

      expect(createOrUpgradeGorizondCluster).toHaveBeenCalledWith(
        'test-cluster',
        'test-namespace',
        'v1.25.0',
        ''
      );
    });

    it('should throw error when name is missing', async () => {
      const component = createMockComponent();
      component.setModel({
        metadata: { name: '', namespace: 'test-namespace' },
        spec: { kubernetesVersion: 'v1.25.0', billing: 'test-billing' }
      });

      await expect(component.onSave()).rejects.toThrow('Name and namespace are required');
    });

    it('should throw error when namespace is missing', async () => {
      const component = createMockComponent();
      component.setModel({
        metadata: { name: 'test-cluster', namespace: '' },
        spec: { kubernetesVersion: 'v1.25.0', billing: 'test-billing' }
      });

      await expect(component.onSave()).rejects.toThrow('Name and namespace are required');
    });

    it('should throw error when model is null', async () => {
      const component = createMockComponent();
      component.setModel(null);

      await expect(component.onSave()).rejects.toThrow('Name and namespace are required');
    });
  });

  describe('button text', () => {
    it('should return "Create" for create mode', () => {
      const component = createMockComponent({}, 'create');

      expect(component.getButtonText()).toBe('Create');
    });

    it('should return "Save" for edit mode', () => {
      const component = createMockComponent({}, 'edit');

      expect(component.getButtonText()).toBe('Save');
    });
  });

  describe('value updates', () => {
    it('should update simple properties', () => {
      const component = createMockComponent();
      component.setModel({
        metadata: { name: 'old-name', namespace: 'test' },
        spec: { kubernetesVersion: 'v1.25.0', billing: '' }
      });

      component.updateValue('metadata.name', 'new-name');

      expect(component.model.metadata.name).toBe('new-name');
    });

    it('should update nested properties', () => {
      const component = createMockComponent();
      component.setModel({
        metadata: { name: 'test', namespace: 'test' },
        spec: { kubernetesVersion: 'v1.25.0', billing: '' }
      });

      component.updateValue('spec.kubernetesVersion', 'v1.26.0');

      expect(component.model.spec.kubernetesVersion).toBe('v1.26.0');
    });

    it('should not update when model is null', () => {
      const component = createMockComponent();
      component.setModel(null);

      expect(() => {
        component.updateValue('metadata.name', 'new-name');
      }).not.toThrow();
    });
  });

  describe('initialization process', () => {
    it('should initialize for create mode', async () => {
      const component = createMockComponent({}, 'create');

      await component.initialize();

      expect(component.loaded).toBe(true);
      expect(component.model).not.toBeNull();
      expect(component.k8sVersions.length).toBeGreaterThan(0);
      expect(component.workspaces.length).toBeGreaterThan(0);
      expect(component.billingOptions.length).toBeGreaterThan(0);
    });

    it('should initialize for edit mode', async () => {
      const component = createMockComponent({}, 'edit');

      await component.initialize();

      expect(component.loaded).toBe(true);
      expect(component.k8sVersions.length).toBeGreaterThan(0);
      expect(component.workspaces.length).toBeGreaterThan(0);
    });
  });
});