import { STATE, NAME as NAME_COL, AGE } from '@shell/config/table-headers';
// this is the definition of a "blank cluster" for Rancher Dashboard
// definition of a "blank cluster" in Rancher Dashboard
const BLANK_CLUSTER = '_';
export function init($plugin:any, store:any) {
    const YOUR_PRODUCT_NAME = 'gorizond';
    const YOUR_K8S_RESOURCE_NAME = 'provisioning.gorizond.io.cluster';

    const {
        product,
        configureType,
        basicType,
        headers,
    } = $plugin.DSL(store, YOUR_PRODUCT_NAME);


    basicType([
        YOUR_K8S_RESOURCE_NAME,
    ]);
    // registering a top-level product
    product({
        icon:    'cluster-management',
        inStore: 'management',
        weight:  1,
        to:  {
            name:      `c-cluster-${ YOUR_PRODUCT_NAME }-resource`,
            params: {
                product:  YOUR_PRODUCT_NAME,
                cluster:  BLANK_CLUSTER,
                resource: YOUR_K8S_RESOURCE_NAME
            },
            meta: {
                product: YOUR_PRODUCT_NAME
            }
        }
    });

    // defining a k8s resource as page
    configureType(YOUR_K8S_RESOURCE_NAME, {
        displayName: 'Gorizond Cluster',
        isCreatable: true,
        isEditable:  true,
        isRemovable: true,
        showAge:     true,
        showState:   true,
        canYaml:     true,
        customRoute: {
            name: `c-cluster-${ YOUR_PRODUCT_NAME }-resource`,
            params: {
                product:  YOUR_PRODUCT_NAME,
                cluster:  BLANK_CLUSTER,
                resource: YOUR_K8S_RESOURCE_NAME
            },
            meta: {
                product: YOUR_PRODUCT_NAME
            }
        }
    });

    headers(YOUR_K8S_RESOURCE_NAME, [
        STATE,
        NAME_COL,
        {
            name:     'kubernetesVersion',
            label:    'Kubernetes Version',
            value:    'spec.kubernetesVersion',
        },
        AGE,
    ]);
}