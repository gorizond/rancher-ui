/**
 * Test data and helpers for Gorizond UI tests
 */

export const mockClusterData = {
  metadata: {
    name: 'test-cluster',
    namespace: 'test-namespace',
    uid: 'test-uid-123'
  },
  spec: {
    kubernetesVersion: 'v1.25.0',
    billing: 'test-billing-plan'
  },
  status: {
    provisioning: 'active',
    billing: 'test-billing-plan',
    conditions: [
      {
        type: 'Ready',
        status: 'True',
        lastTransitionTime: '2023-01-01T00:00:00Z'
      }
    ]
  }
};

export const mockBillingData = {
  metadata: {
    name: 'test-billing',
    namespace: 'test-namespace',
    uid: 'billing-uid-456'
  },
  spec: {
    plan: 'premium'
  },
  status: {
    balance: 1000,
    currency: 'RUB',
    lastUpdated: '2023-01-01T00:00:00Z'
  }
};

export const mockBillingEventData = {
  metadata: {
    name: 'test-event',
    namespace: 'test-namespace',
    uid: 'event-uid-789'
  },
  spec: {
    amount: 500,
    type: 'topup'
  },
  status: {
    amount: 500,
    billingName: 'test-billing',
    status: 'completed',
    timestamp: '2023-01-01T00:00:00Z'
  }
};

export const mockStore = {
  dispatch: jest.fn(),
  commit: jest.fn(),
  getters: {
    'cluster/schemaFor': jest.fn(),
    'cluster/all': jest.fn()
  },
  state: {
    cluster: {
      current: 'test-cluster'
    }
  }
};

export const mockPlugin = {
  metadata: null,
  addProduct: jest.fn(),
  addRoutes: jest.fn(),
  addTableColumn: jest.fn(),
  DSL: jest.fn().mockReturnValue({
    product: jest.fn(),
    configureType: jest.fn(),
    basicType: jest.fn(),
    weightType: jest.fn(),
    headers: jest.fn()
  })
};

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  currentRoute: {
    params: {},
    query: {},
    path: '/'
  }
};

export const mockRoute = {
  params: {
    cluster: 'test-cluster',
    resource: 'provisioning.gorizond.io.cluster',
    id: 'test-cluster'
  },
  query: {},
  path: '/c/test-cluster/gorizond/provisioning.gorizond.io.cluster/test-cluster'
};

export const createMockRow = (overrides = {}) => ({
  metadata: {
    name: 'test-resource',
    namespace: 'test-namespace',
    uid: 'test-uid'
  },
  spec: {
    kubernetesVersion: 'v1.25.0',
    billing: 'test-billing'
  },
  status: {
    provisioning: 'active',
    billing: 'test-billing'
  },
  ...overrides
});

export const createMockClusterRow = (overrides = {}) => createMockRow({
  metadata: {
    name: 'test-cluster',
    namespace: 'test-namespace'
  },
  spec: {
    kubernetesVersion: 'v1.25.0',
    billing: 'premium-plan'
  },
  status: {
    provisioning: 'active',
    billing: 'premium-plan'
  },
  ...overrides
});

export const createMockBillingRow = (overrides = {}) => createMockRow({
  metadata: {
    name: 'test-billing',
    namespace: 'test-namespace'
  },
  spec: {
    plan: 'premium'
  },
  status: {
    balance: 1000,
    currency: 'RUB'
  },
  ...overrides
});

export const createMockBillingEventRow = (overrides = {}) => createMockRow({
  metadata: {
    name: 'test-event',
    namespace: 'test-namespace'
  },
  spec: {
    amount: 500,
    type: 'topup'
  },
  status: {
    amount: 500,
    billingName: 'test-billing',
    status: 'completed'
  },
  ...overrides
});

export const mockApiResponse = {
  data: {
    items: [mockClusterData],
    metadata: {
      resourceVersion: '12345'
    }
  }
};

export const mockErrorResponse = {
  code: 404,
  message: 'Resource not found',
  status: 404
};

export const mockPaymentUrl = 'https://payment.example.com';

export const mockPaymentFormData = {
  namespace: 'test-namespace',
  name: 'test-billing',
  amount: '100'
};

export const testUtils = {
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  createMockEvent: (type = 'click', target = null) => ({
    type,
    target: target || document.createElement('button'),
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  }),

  createMockFormData: (data = {}) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  },

  mockConsole: () => {
    const originalConsole = { ...console };
    const mockConsole = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    };
    
    Object.assign(console, mockConsole);
    
    return {
      mockConsole,
      restore: () => Object.assign(console, originalConsole)
    };
  },

  mockFetch: (response = mockApiResponse, status = 200) => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: jest.fn().mockResolvedValue(response),
      text: jest.fn().mockResolvedValue(JSON.stringify(response))
    });
    
    global.fetch = mockFetch;
    
    return mockFetch;
  },

  mockLocalStorage: () => {
    const store = {};
    const mockLocalStorage = {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => { store[key] = value; }),
      removeItem: jest.fn(key => { delete store[key]; }),
      clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
      length: Object.keys(store).length,
      key: jest.fn(index => Object.keys(store)[index] || null)
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    return mockLocalStorage;
  }
};

export const testConstants = {
  CLUSTER_RESOURCE: 'provisioning.gorizond.io.cluster',
  BILLING_RESOURCE: 'provisioning.gorizond.io.billing',
  BILLING_EVENT_RESOURCE: 'provisioning.gorizond.io.billingevent',
  PRODUCT_NAME: 'gorizond',
  BLANK_CLUSTER: '_',
  DEFAULT_KUBERNETES_VERSION: 'v1.25.0',
  DEFAULT_BILLING_PLAN: 'free'
};

export default {
  mockClusterData,
  mockBillingData,
  mockBillingEventData,
  mockStore,
  mockPlugin,
  mockRouter,
  mockRoute,
  createMockRow,
  createMockClusterRow,
  createMockBillingRow,
  createMockBillingEventRow,
  mockApiResponse,
  mockErrorResponse,
  mockPaymentUrl,
  mockPaymentFormData,
  testUtils,
  testConstants
};
