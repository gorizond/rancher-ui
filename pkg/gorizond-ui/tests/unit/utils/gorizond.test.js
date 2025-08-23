import { createOrUpgradeGorizondCluster } from '../../../utils/gorizond';

describe('gorizond utils', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = {
      dispatch: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrUpgradeGorizondCluster', () => {
    let baseParams;

    beforeEach(() => {
      baseParams = {
        name: 'test-cluster',
        namespace: 'test-namespace',
        kubernetesVersion: 'v1.25.0',
        billing: 'test-billing',
        store: mockStore
      };
    });

    it('should update existing cluster when GET succeeds', async () => {
      // Mock successful GET request
      mockStore.dispatch.mockResolvedValueOnce({ data: { spec: {} } });

      await createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      );

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      
      // Check GET call
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(1, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters/test-cluster',
        method: 'GET'
      });

      // Check PATCH call
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(2, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters/test-cluster',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json'
        },
        data: {
          spec: {
            kubernetesVersion: 'v1.25.0',
            billing: 'test-billing'
          }
        }
      });
    });

    it('should create new cluster when GET returns 404', async () => {
      const error404 = new Error('Not Found');
      error404.code = 404;
      
      mockStore.dispatch.mockRejectedValueOnce(error404);

      await createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      );

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      
      // Check GET call
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(1, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters/test-cluster',
        method: 'GET'
      });

      // Check POST call for creation
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(2, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters',
        method: 'POST',
        data: {
          apiVersion: 'provisioning.gorizond.io/v1',
          kind: 'Cluster',
          metadata: {
            name: 'test-cluster',
            namespace: 'test-namespace'
          },
          spec: {
            kubernetesVersion: 'v1.25.0',
            billing: 'test-billing'
          }
        }
      });
    });

    it('should handle free tier billing correctly for update', async () => {
      const paramsWithFree = { ...baseParams, billing: '-free' };
      mockStore.dispatch.mockResolvedValueOnce({ data: { spec: {} } });

      await createOrUpgradeGorizondCluster(
        paramsWithFree.name,
        paramsWithFree.namespace,
        paramsWithFree.kubernetesVersion,
        paramsWithFree.billing,
        paramsWithFree.store
      );

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(2, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters/test-cluster',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json'
        },
        data: {
          spec: {
            kubernetesVersion: 'v1.25.0',
            billing: ''
          }
        }
      });
    });

    it('should handle free tier billing correctly for creation', async () => {
      const paramsWithFree = { ...baseParams, billing: '' };
      const error404 = new Error('Not Found');
      error404.code = 404;
      
      mockStore.dispatch.mockRejectedValueOnce(error404);

      await createOrUpgradeGorizondCluster(
        paramsWithFree.name,
        paramsWithFree.namespace,
        paramsWithFree.kubernetesVersion,
        paramsWithFree.billing,
        paramsWithFree.store
      );

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(2, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters',
        method: 'POST',
        data: {
          apiVersion: 'provisioning.gorizond.io/v1',
          kind: 'Cluster',
          metadata: {
            name: 'test-cluster',
            namespace: 'test-namespace'
          },
          spec: {
            kubernetesVersion: 'v1.25.0',
            billing: ''
          }
        }
      });
    });

    it('should handle null/undefined billing values', async () => {
      const paramsWithNull = { ...baseParams, billing: null };
      mockStore.dispatch.mockResolvedValueOnce({ data: { spec: {} } });

      await createOrUpgradeGorizondCluster(
        paramsWithNull.name,
        paramsWithNull.namespace,
        paramsWithNull.kubernetesVersion,
        paramsWithNull.billing,
        paramsWithNull.store
      );

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(2, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters/test-cluster',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json'
        },
        data: {
          spec: {
            kubernetesVersion: 'v1.25.0',
            billing: ''
          }
        }
      });
    });

    it('should throw error for non-404 errors', async () => {
      const error500 = new Error('Internal Server Error');
      error500.code = 500;
      
      mockStore.dispatch.mockRejectedValueOnce(error500);

      await expect(createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      )).rejects.toThrow('Internal Server Error');
    });

    // Новые тесты для расширенной функциональности
    it('should handle empty string billing for update', async () => {
      const paramsWithEmpty = { ...baseParams, billing: '' };
      mockStore.dispatch.mockResolvedValueOnce({ data: { spec: {} } });

      await createOrUpgradeGorizondCluster(
        paramsWithEmpty.name,
        paramsWithEmpty.namespace,
        paramsWithEmpty.kubernetesVersion,
        paramsWithEmpty.billing,
        paramsWithEmpty.store
      );

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(2, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters/test-cluster',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json'
        },
        data: {
          spec: {
            kubernetesVersion: 'v1.25.0',
            billing: ''
          }
        }
      });
    });

    it('should handle undefined billing for creation', async () => {
      const paramsWithUndefined = { ...baseParams, billing: undefined };
      const error404 = new Error('Not Found');
      error404.code = 404;
      
      mockStore.dispatch.mockRejectedValueOnce(error404);

      await createOrUpgradeGorizondCluster(
        paramsWithUndefined.name,
        paramsWithUndefined.namespace,
        paramsWithUndefined.kubernetesVersion,
        paramsWithUndefined.billing,
        paramsWithUndefined.store
      );

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(2, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters',
        method: 'POST',
        data: {
          apiVersion: 'provisioning.gorizond.io/v1',
          kind: 'Cluster',
          metadata: {
            name: 'test-cluster',
            namespace: 'test-namespace'
          },
          spec: {
            kubernetesVersion: 'v1.25.0',
            billing: ''
          }
        }
      });
    });

    it('should handle special characters in cluster name', async () => {
      const paramsWithSpecialChars = { 
        ...baseParams, 
        name: 'test-cluster-with-special-chars-123' 
      };
      mockStore.dispatch.mockResolvedValueOnce({ data: { spec: {} } });

      await createOrUpgradeGorizondCluster(
        paramsWithSpecialChars.name,
        paramsWithSpecialChars.namespace,
        paramsWithSpecialChars.kubernetesVersion,
        paramsWithSpecialChars.billing,
        paramsWithSpecialChars.store
      );

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(1, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters/test-cluster-with-special-chars-123',
        method: 'GET'
      });
    });

    it('should handle special characters in namespace', async () => {
      const paramsWithSpecialNamespace = { 
        ...baseParams, 
        namespace: 'test-namespace-with-dashes' 
      };
      mockStore.dispatch.mockResolvedValueOnce({ data: { spec: {} } });

      await createOrUpgradeGorizondCluster(
        paramsWithSpecialNamespace.name,
        paramsWithSpecialNamespace.namespace,
        paramsWithSpecialNamespace.kubernetesVersion,
        paramsWithSpecialNamespace.billing,
        paramsWithSpecialNamespace.store
      );

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      expect(mockStore.dispatch).toHaveBeenNthCalledWith(1, 'cluster/request', {
        url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace-with-dashes/clusters/test-cluster',
        method: 'GET'
      });
    });

    it('should handle different kubernetes versions', async () => {
      const versions = ['v1.24.0', 'v1.25.0', 'v1.26.0', 'v1.27.0'];
      
      for (const version of versions) {
        jest.clearAllMocks();
        const paramsWithVersion = { ...baseParams, kubernetesVersion: version };
        mockStore.dispatch.mockResolvedValueOnce({ data: { spec: {} } });

        await createOrUpgradeGorizondCluster(
          paramsWithVersion.name,
          paramsWithVersion.namespace,
          paramsWithVersion.kubernetesVersion,
          paramsWithVersion.billing,
          paramsWithVersion.store
        );

        expect(mockStore.dispatch).toHaveBeenNthCalledWith(2, 'cluster/request', {
          url: '/apis/provisioning.gorizond.io/v1/namespaces/test-namespace/clusters/test-cluster',
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/merge-patch+json'
          },
          data: {
            spec: {
              kubernetesVersion: version,
              billing: 'test-billing'
            }
          }
        });
      }
    });

    it('should handle network errors during GET', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';
      
      mockStore.dispatch.mockRejectedValueOnce(networkError);

      await expect(createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      )).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors during GET', async () => {
      const timeoutError = new Error('Request Timeout');
      timeoutError.code = 'TIMEOUT';
      
      mockStore.dispatch.mockRejectedValueOnce(timeoutError);

      await expect(createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      )).rejects.toThrow('Request Timeout');
    });

    it('should handle authorization errors during GET', async () => {
      const authError = new Error('Unauthorized');
      authError.code = 401;
      
      mockStore.dispatch.mockRejectedValueOnce(authError);

      await expect(createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      )).rejects.toThrow('Unauthorized');
    });

    it('should handle forbidden errors during GET', async () => {
      const forbiddenError = new Error('Forbidden');
      forbiddenError.code = 403;
      
      mockStore.dispatch.mockRejectedValueOnce(forbiddenError);

      await expect(createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      )).rejects.toThrow('Forbidden');
    });

    it('should handle errors during PATCH operation', async () => {
      mockStore.dispatch
        .mockResolvedValueOnce({ data: { spec: {} } }) // GET succeeds
        .mockRejectedValueOnce(new Error('PATCH failed')); // PATCH fails

      await expect(createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      )).rejects.toThrow('PATCH failed');
    });

    it('should handle errors during POST operation', async () => {
      const error404 = new Error('Not Found');
      error404.code = 404;
      
      mockStore.dispatch
        .mockRejectedValueOnce(error404) // GET fails with 404
        .mockRejectedValueOnce(new Error('POST failed')); // POST fails

      await expect(createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      )).rejects.toThrow('POST failed');
    });

    it('should handle malformed error objects', async () => {
      const malformedError = { message: 'Malformed error' };
      
      mockStore.dispatch.mockRejectedValueOnce(malformedError);

      await expect(createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      )).rejects.toEqual(malformedError);
    });

    it('should handle error without code property', async () => {
      const errorWithoutCode = new Error('Error without code');
      
      mockStore.dispatch.mockRejectedValueOnce(errorWithoutCode);

      await expect(createOrUpgradeGorizondCluster(
        baseParams.name,
        baseParams.namespace,
        baseParams.kubernetesVersion,
        baseParams.billing,
        baseParams.store
      )).rejects.toThrow('Error without code');
    });
  });
});
