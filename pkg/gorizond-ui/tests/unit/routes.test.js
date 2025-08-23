import routes from '../../routes';

// Mock Vue components
jest.mock('@shell/pages/c/_cluster/_product/_resource/index.vue', () => ({
  default: { name: 'ListResource' }
}));

jest.mock('@shell/pages/c/_cluster/_product/_resource/create.vue', () => ({
  default: { name: 'CreateResource' }
}));

jest.mock('@shell/pages/c/_cluster/_product/_resource/_id.vue', () => ({
  default: { name: 'ViewResource' }
}));

jest.mock('@shell/pages/c/_cluster/_product/_resource/_namespace/_id.vue', () => ({
  default: { name: 'ViewNamespacedResource' }
}));

describe('Routes Configuration', () => {
  describe('routes array', () => {
    it('should export an array of routes', () => {
      expect(Array.isArray(routes)).toBe(true);
      expect(routes).toHaveLength(4);
    });

    it('should have correct route structure', () => {
      routes.forEach(route => {
        expect(route).toHaveProperty('name');
        expect(route).toHaveProperty('path');
        expect(route).toHaveProperty('component');
        expect(route).toHaveProperty('meta');
      });
    });
  });

  describe('list resource route', () => {
    const listRoute = routes[0];

    it('should have correct name', () => {
      expect(listRoute.name).toBe('c-cluster-gorizond-resource');
    });

    it('should have correct path', () => {
      expect(listRoute.path).toBe('/c/:cluster/gorizond/:resource');
    });

    it('should use ListResource component', () => {
      expect(listRoute.component).toBeDefined();
    });

    it('should have correct meta information', () => {
      expect(listRoute.meta).toEqual({
        product: 'gorizond',
        cluster: '_'
      });
    });
  });

  describe('create resource route', () => {
    const createRoute = routes[1];

    it('should have correct name', () => {
      expect(createRoute.name).toBe('c-cluster-gorizond-resource-create');
    });

    it('should have correct path', () => {
      expect(createRoute.path).toBe('/c/:cluster/gorizond/:resource/create');
    });

    it('should use CreateResource component', () => {
      expect(createRoute.component).toBeDefined();
    });

    it('should have correct meta information', () => {
      expect(createRoute.meta).toEqual({
        product: 'gorizond',
        cluster: '_'
      });
    });
  });

  describe('view resource route', () => {
    const viewRoute = routes[2];

    it('should have correct name', () => {
      expect(viewRoute.name).toBe('c-cluster-gorizond-resource-id');
    });

    it('should have correct path', () => {
      expect(viewRoute.path).toBe('/c/:cluster/gorizond/:resource/:id');
    });

    it('should use ViewResource component', () => {
      expect(viewRoute.component).toBeDefined();
    });

    it('should have correct meta information', () => {
      expect(viewRoute.meta).toEqual({
        product: 'gorizond',
        cluster: '_'
      });
    });
  });

  describe('view namespaced resource route', () => {
    const namespacedRoute = routes[3];

    it('should have correct name', () => {
      expect(namespacedRoute.name).toBe('c-cluster-gorizond-resource-namespace-id');
    });

    it('should have correct path', () => {
      expect(namespacedRoute.path).toBe('/c/:cluster/gorizond/:resource/:namespace/:id');
    });

    it('should use ViewNamespacedResource component', () => {
      expect(namespacedRoute.component).toBeDefined();
    });

    it('should have correct meta information', () => {
      expect(namespacedRoute.meta).toEqual({
        product: 'gorizond',
        cluster: '_'
      });
    });
  });

  describe('route naming consistency', () => {
    it('should use consistent product name across all routes', () => {
      routes.forEach(route => {
        expect(route.name).toContain('gorizond');
        expect(route.meta.product).toBe('gorizond');
      });
    });

    it('should use consistent cluster value across all routes', () => {
      routes.forEach(route => {
        expect(route.meta.cluster).toBe('_');
      });
    });

    it('should follow consistent naming pattern', () => {
      const expectedNames = [
        'c-cluster-gorizond-resource',
        'c-cluster-gorizond-resource-create',
        'c-cluster-gorizond-resource-id',
        'c-cluster-gorizond-resource-namespace-id'
      ];

      routes.forEach((route, index) => {
        expect(route.name).toBe(expectedNames[index]);
      });
    });
  });

  describe('path parameters', () => {
    it('should have correct path parameters for list route', () => {
      const listRoute = routes[0];
      expect(listRoute.path).toContain(':cluster');
      expect(listRoute.path).toContain(':resource');
    });

    it('should have correct path parameters for create route', () => {
      const createRoute = routes[1];
      expect(createRoute.path).toContain(':cluster');
      expect(createRoute.path).toContain(':resource');
    });

    it('should have correct path parameters for view route', () => {
      const viewRoute = routes[2];
      expect(viewRoute.path).toContain(':cluster');
      expect(viewRoute.path).toContain(':resource');
      expect(viewRoute.path).toContain(':id');
    });

    it('should have correct path parameters for namespaced route', () => {
      const namespacedRoute = routes[3];
      expect(namespacedRoute.path).toContain(':cluster');
      expect(namespacedRoute.path).toContain(':resource');
      expect(namespacedRoute.path).toContain(':namespace');
      expect(namespacedRoute.path).toContain(':id');
    });
  });
});
