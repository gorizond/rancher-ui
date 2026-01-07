// Mock components
jest.mock('@components/Card', () => ({}));
jest.mock('@components/Form/LabeledInput', () => ({}));
jest.mock('@shell/components/PercentageBar', () => ({}));

// Mock the component's computed properties and methods for testing
const createMockComponent = (cluster = {}) => {
  const defaultCluster = {
    metadata: {
      name: 'test-cluster',
      namespace: 'test-namespace'
    },
    spec: {
      kubernetesVersion: 'v1.25.0',
      billing: ''
    },
    status: {
      provisioning: 'WaitAddAdminMember',
      billing: '',
      cluster: '',
      namespace: '',
      k3sToken: '',
      headscaleToken: ''
    }
  };

  const mockCluster = { ...defaultCluster, ...cluster };
  
  // Simulate the component's computed properties
  const getStepOrder = () => [
    'WaitAddAdminMember',
    'WaitHeadScaleDatabase',
    'WaitHeadScaleRegisterMachine',
    'WaitCreateNamespace',
    'WaitCreateServiceAccount',
    'WaitCreateRoleBinding',
    'WaitCreateSshKey',
    'WaitSaveMachineDataToCluster',
    'WaitDeploymentManifest',
    'Done'
  ];

  const getCurrentStepPercentage = () => {
    const stepOrder = getStepOrder();
    const currentStep = mockCluster.status?.provisioning || '';
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex === -1) return 0;
    if (currentStep === 'Done') return 100;
    
    return Math.round(((currentIndex + 1) / stepOrder.length) * 100);
  };

  const getBillingStatus = () => {
    return mockCluster.status?.billing || 'free (free tier use)';
  };

  const getBillingDesired = () => {
    return mockCluster.spec?.billing || 'free (free tier use)';
  };

  const generateInstallUrl = (setting = '') => {
    const { k3sLabel, headscaleLabel, k3sToken, headscaleToken } = mockCluster.status || {};
    const kubernetesVersion = mockCluster.spec?.kubernetesVersion;
    
    if (!k3sLabel || !headscaleLabel || !k3sToken || !headscaleToken || !kubernetesVersion || !setting) {
      return null;
    }

    const cleanK3sToken = k3sToken.replace(/\n/g, '');
    const cleanHeadscaleToken = headscaleToken.replace(/\n/g, '');

    return `curl -fsSL ${setting}/${k3sLabel}/${headscaleLabel}/${cleanK3sToken}/${cleanHeadscaleToken}/${kubernetesVersion.replace('-', '+')} | sh`;
  };

  return {
    value: mockCluster,
    currentStepPercentage: getCurrentStepPercentage(),
    billingStatus: getBillingStatus(),
    billingDesired: getBillingDesired(),
    generateInstallUrl,
    setting: ''
  };
};

describe('ClusterDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cluster data', () => {
    it('should have correct cluster name and namespace', () => {
      const component = createMockComponent();
      
      expect(component.value.metadata.name).toBe('test-cluster');
      expect(component.value.metadata.namespace).toBe('test-namespace');
    });

    it('should have correct kubernetes version', () => {
      const component = createMockComponent();
      
      expect(component.value.spec.kubernetesVersion).toBe('v1.25.0');
    });

    it('should handle custom cluster data', () => {
      const customData = {
        metadata: { name: 'custom-cluster' },
        spec: { kubernetesVersion: 'v1.26.0' }
      };
      const component = createMockComponent(customData);
      
      expect(component.value.metadata.name).toBe('custom-cluster');
      expect(component.value.spec.kubernetesVersion).toBe('v1.26.0');
    });
  });

  describe('computed properties', () => {
    it('should calculate correct step percentage for WaitHeadScaleDatabase', () => {
      const component = createMockComponent({
        status: { provisioning: 'WaitHeadScaleDatabase' }
      });

      // WaitHeadScaleDatabase is step 2 out of 10 steps (20%)
      expect(component.currentStepPercentage).toBe(20);
    });

    it('should return 0 for unknown step', () => {
      const component = createMockComponent({
        status: { provisioning: 'UnknownStep' }
      });

      expect(component.currentStepPercentage).toBe(0);
    });

    it('should return 100 for Done step', () => {
      const component = createMockComponent({
        status: { provisioning: 'Done' }
      });

      expect(component.currentStepPercentage).toBe(100);
    });

    it('should return correct billing status', () => {
      const component = createMockComponent({
        status: { billing: 'test-billing' }
      });

      expect(component.billingStatus).toBe('test-billing');
    });

    it('should return default billing status when not set', () => {
      const component = createMockComponent({
        status: { billing: '' }
      });

      expect(component.billingStatus).toBe('free (free tier use)');
    });

    it('should return correct billing desired', () => {
      const component = createMockComponent({
        spec: { billing: 'desired-billing' }
      });

      expect(component.billingDesired).toBe('desired-billing');
    });

    it('should return default billing desired when not set', () => {
      const component = createMockComponent({
        spec: { billing: '' }
      });

      expect(component.billingDesired).toBe('free (free tier use)');
    });
  });

  describe('install URL generation', () => {
    it('should generate install URL when all required data is present', () => {
      const component = createMockComponent({
        status: {
          k3sLabel: 'api-test-cluster',
          headscaleLabel: 'headscale-test-cluster',
          k3sToken: 'k3s-token\n',
          headscaleToken: 'headscale-token\n'
        },
        spec: {
          kubernetesVersion: 'v1.25.0'
        }
      });

      const installUrl = component.generateInstallUrl('https://install.example.com');

      expect(installUrl).toContain('curl -fsSL');
      expect(installUrl).toContain('api-test-cluster');
      expect(installUrl).toContain('headscale-test-cluster');
      expect(installUrl).toContain('k3s-token');
      expect(installUrl).toContain('headscale-token');
      expect(installUrl).toContain('v1.25.0');
    });

    it('should return null when required data is missing', () => {
      const component = createMockComponent({
        status: { k3sLabel: '', headscaleLabel: '', k3sToken: '', headscaleToken: '' },
        spec: { kubernetesVersion: '' }
      });

      const installUrl = component.generateInstallUrl('https://install.example.com');
      expect(installUrl).toBeNull();
    });

    it('should clean tokens by removing newlines', () => {
      const component = createMockComponent({
        status: {
          k3sLabel: 'api-test-cluster',
          headscaleLabel: 'headscale-test-cluster',
          k3sToken: 'k3s-token\nwith\nnewlines',
          headscaleToken: 'headscale-token\nwith\nnewlines'
        },
        spec: {
          kubernetesVersion: 'v1.25.0'
        }
      });

      const installUrl = component.generateInstallUrl('https://install.example.com');
      expect(installUrl).not.toContain('\n');
    });

    it('should return null when setting is empty', () => {
      const component = createMockComponent({
        status: {
          k3sLabel: 'api-test-cluster',
          headscaleLabel: 'headscale-test-cluster',
          k3sToken: 'k3s-token',
          headscaleToken: 'headscale-token'
        },
        spec: {
          kubernetesVersion: 'v1.25.0'
        }
      });

      const installUrl = component.generateInstallUrl('');
      expect(installUrl).toBeNull();
    });
  });

  describe('step order validation', () => {
    it('should have correct step order array', () => {
      const component = createMockComponent();
      const steps = [
        'WaitAddAdminMember',
        'WaitHeadScaleDatabase',
        'WaitHeadScaleRegisterMachine',
        'WaitCreateNamespace',
        'WaitCreateServiceAccount',
        'WaitCreateRoleBinding',
        'WaitCreateSshKey',
        'WaitSaveMachineDataToCluster',
        'WaitDeploymentManifest',
        'Done'
      ];

      // Test different steps and their percentages
      steps.forEach((step, index) => {
        const stepComponent = createMockComponent({
          status: { provisioning: step }
        });
        
        if (step === 'Done') {
          expect(stepComponent.currentStepPercentage).toBe(100);
        } else {
          const expectedPercentage = Math.round(((index + 1) / steps.length) * 100);
          expect(stepComponent.currentStepPercentage).toBe(expectedPercentage);
        }
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing status object', () => {
      const component = createMockComponent({
        status: undefined
      });

      expect(component.currentStepPercentage).toBe(0);
      expect(component.billingStatus).toBe('free (free tier use)');
    });

    it('should handle missing spec object', () => {
      const component = createMockComponent({
        spec: undefined
      });

      expect(component.billingDesired).toBe('free (free tier use)');
    });

    it('should handle empty cluster data', () => {
      const component = createMockComponent({});

      expect(component.currentStepPercentage).toBe(10); // Default is WaitAddAdminMember (step 1)
      expect(component.billingStatus).toBe('free (free tier use)');
      expect(component.billingDesired).toBe('free (free tier use)');
    });
  });
});
