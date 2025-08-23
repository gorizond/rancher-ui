import { init } from '../../product';

describe('Product Configuration', () => {
  let mockPlugin;
  let mockStore;
  let mockDSL;

  beforeEach(() => {
    mockDSL = {
      product: jest.fn(),
      configureType: jest.fn(),
      basicType: jest.fn(),
      weightType: jest.fn(),
      headers: jest.fn()
    };

    mockPlugin = {
      DSL: jest.fn().mockReturnValue(mockDSL)
    };

    mockStore = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('init function', () => {
    it('should call DSL with correct parameters', () => {
      init(mockPlugin, mockStore);

      expect(mockPlugin.DSL).toHaveBeenCalledWith(mockStore, 'gorizond');
    });

    it('should call basicType with correct resource types', () => {
      init(mockPlugin, mockStore);

      expect(mockDSL.basicType).toHaveBeenCalledWith([
        'provisioning.gorizond.io.cluster',
        'provisioning.gorizond.io.billing',
        'provisioning.gorizond.io.billingevent'
      ]);
    });

    it('should call weightType for cluster resource', () => {
      init(mockPlugin, mockStore);

      expect(mockDSL.weightType).toHaveBeenCalledWith(
        'provisioning.gorizond.io.cluster',
        2,
        true
      );
    });

    it('should call weightType for billing resource', () => {
      init(mockPlugin, mockStore);

      expect(mockDSL.weightType).toHaveBeenCalledWith(
        'provisioning.gorizond.io.billing',
        1,
        true
      );
    });
  });

  describe('product configuration', () => {
    it('should configure product with correct properties', () => {
      init(mockPlugin, mockStore);

      expect(mockDSL.product).toHaveBeenCalledWith({
        icon: 'flask',
        inStore: 'management',
        weight: -100,
        showClusterSwitcher: false,
        to: {
          name: 'c-cluster-gorizond-resource',
          params: {
            product: 'gorizond',
            cluster: '_',
            resource: 'provisioning.gorizond.io.cluster'
          },
          meta: {
            product: 'gorizond'
          }
        }
      });
    });
  });

  describe('cluster resource configuration', () => {
    it('should configure cluster type with correct properties', () => {
      init(mockPlugin, mockStore);

      expect(mockDSL.configureType).toHaveBeenCalledWith(
        'provisioning.gorizond.io.cluster',
        {
          displayName: 'gorizond',
          isCreatable: true,
          isEditable: true,
          isRemovable: true,
          showAge: true,
          showState: true,
          canYaml: true,
          customRoute: {
            name: 'c-cluster-gorizond-resource',
            params: {
              product: 'gorizond',
              cluster: '_',
              resource: 'provisioning.gorizond.io.cluster'
            },
            meta: {
              product: 'gorizond'
            }
          }
        }
      );
    });
  });

  describe('headers configuration', () => {
    it('should configure cluster headers', () => {
      init(mockPlugin, mockStore);

      const clusterHeadersCall = mockDSL.headers.mock.calls.find(
        call => call[0] === 'provisioning.gorizond.io.cluster'
      );

      expect(clusterHeadersCall).toBeDefined();
      expect(clusterHeadersCall[1]).toContainEqual({
        name: 'kubernetesVersion',
        label: 'Kubernetes Version',
        value: 'spec.kubernetesVersion'
      });
    });

    it('should configure billing headers', () => {
      init(mockPlugin, mockStore);

      const billingHeadersCall = mockDSL.headers.mock.calls.find(
        call => call[0] === 'provisioning.gorizond.io.billing'
      );

      expect(billingHeadersCall).toBeDefined();
      expect(billingHeadersCall[1]).toContainEqual({
        name: 'balance',
        label: 'Balance',
        value: 'status.balance'
      });
      expect(billingHeadersCall[1]).toContainEqual({
        name: 'topUp',
        label: 'Top Up Balance',
        formatter: 'BillingTopUpButton'
      });
    });

    it('should configure billing event headers', () => {
      init(mockPlugin, mockStore);

      const billingEventHeadersCall = mockDSL.headers.mock.calls.find(
        call => call[0] === 'provisioning.gorizond.io.billingevent'
      );

      expect(billingEventHeadersCall).toBeDefined();
      expect(billingEventHeadersCall[1]).toContainEqual({
        name: 'amount',
        label: 'Amount',
        value: 'status.amount'
      });
      expect(billingEventHeadersCall[1]).toContainEqual({
        name: 'billing',
        label: 'Billing',
        value: 'status.billingName'
      });
    });
  });

  describe('constants', () => {
    it('should use correct constant values', () => {
      // We can't directly test constants, but we can verify they're used correctly
      // by checking the function calls use the expected values
      init(mockPlugin, mockStore);

      // Verify cluster resource name is used consistently
      const clusterResourceName = 'provisioning.gorizond.io.cluster';
      const billingResourceName = 'provisioning.gorizond.io.billing';
      const billingEventResourceName = 'provisioning.gorizond.io.billingevent';

      expect(mockDSL.basicType).toHaveBeenCalledWith([
        clusterResourceName,
        billingResourceName,
        billingEventResourceName
      ]);

      expect(mockDSL.weightType).toHaveBeenCalledWith(clusterResourceName, 2, true);
      expect(mockDSL.weightType).toHaveBeenCalledWith(billingResourceName, 1, true);
    });
  });
});
