import { config } from '@vue/test-utils';

// Mock global Vue properties
config.global.mocks = {
  $store: {
    dispatch: jest.fn(),
    commit: jest.fn(),
    getters: {},
    state: {}
  },
  $router: {
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    back: jest.fn()
  },
  $route: {
    params: {},
    query: {},
    path: '/'
  },
  $t: (key) => key,
  $emit: jest.fn()
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
};

// Mock window methods
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost',
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
});

// Mock document methods
document.createElement = jest.fn((tag) => ({
  tagName: tag.toUpperCase(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  submit: jest.fn(),
  method: '',
  action: '',
  target: '',
  innerHTML: '',
  id: '',
  style: {
    innerHTML: ''
  }
}));

// Mock document.body methods without replacing the entire object
Object.defineProperty(document, 'body', {
  value: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  writable: true
});

// Mock document.head methods
Object.defineProperty(document, 'head', {
  value: {
    appendChild: jest.fn()
  },
  writable: true
});
