/**
 * Creates or updates a Gorizond Cluster (CRD provisioning.gorizond.io.Cluster)
 *
 * @param {string} name - cluster name (metadata.name)
 * @param {string} namespace - namespace (Fleet workspace)
 * @param {string} kubernetesVersion - K3s version
 * @param {object} store - this.$store from the component
 */
export async function createOrUpgradeGorizondCluster(
  name,
  namespace,
  kubernetesVersion,
  billing,
  store
) {
  const baseUrl = `/apis/provisioning.gorizond.io/v1/namespaces/${namespace}/clusters/${name}`;

  try {
    // Try to get the current object
    await store.dispatch("cluster/request", {
      url: baseUrl,
      method: "GET",
    });

    // If GET succeeds — object exists → PATCH

    const billingForApi =
      billing === "-free" ||
      billing === "" ||
      billing === null ||
      billing === undefined
        ? ""
        : billing;
    const patch = {
      spec: {
        kubernetesVersion,
        billing: billingForApi,
      },
    };

    await store.dispatch("cluster/request", {
      url: baseUrl,
      method: "PATCH",
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
      data: patch,
    });
    await store.dispatch("management/find", {
      type: "provisioning.gorizond.io.cluster",
      id: `${namespace}/${name}`,
      opt: { force: true },
    });
  } catch (err) {
    if (err?.code === 404) {
      // Object not found → create
      const billingForApiCreate =
        billing === "-free" ||
        billing === "" ||
        billing === null ||
        billing === undefined
          ? ""
          : billing;
      const body = {
        apiVersion: "provisioning.gorizond.io/v1",
        kind: "Cluster",
        metadata: {
          name,
          namespace,
        },
        spec: {
          kubernetesVersion,
          billing: billingForApiCreate,
        },
      };

      await store.dispatch("cluster/request", {
        url: `/apis/provisioning.gorizond.io/v1/namespaces/${namespace}/clusters`,
        method: "POST",
        data: body,
      });

      await store.dispatch("management/find", {
        type: "provisioning.gorizond.io.cluster",
        id: `${namespace}/${name}`,
        opt: { force: true },
      });
    } else {
      throw err;
    }
  }
}
