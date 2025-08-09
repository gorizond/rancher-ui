import {IPlugin} from '@shell/core/types';
import {STATE, NAME as NAME_COL, AGE} from '@shell/config/table-headers';

export function init($plugin: IPlugin, store: any) {
    const YOUR_PRODUCT_NAME = 'gorizond';
    const BLANK_CLUSTER = '_';
    const YOUR_K8S_RESOURCE_NAME = 'provisioning.gorizond.io.cluster';
    const BILLING_K8S_RESOURCE_NAME = 'provisioning.gorizond.io.billing';
    const BILLING_EVENT_K8S_RESOURCE_NAME = 'provisioning.gorizond.io.billingevent';

    const {product, configureType, basicType, weightType, headers} = $plugin.DSL(store, YOUR_PRODUCT_NAME);


    basicType([YOUR_K8S_RESOURCE_NAME, BILLING_K8S_RESOURCE_NAME, BILLING_EVENT_K8S_RESOURCE_NAME]);
    weightType(YOUR_K8S_RESOURCE_NAME, 2, true);
    weightType(BILLING_K8S_RESOURCE_NAME, 1, true);
    product({
        icon: 'flask',
        inStore: 'management',
        weight: -100,
        showClusterSwitcher: false,
        to: {
            name: `c-cluster-${YOUR_PRODUCT_NAME}-resource`,
            params: {
                product: YOUR_PRODUCT_NAME,
                cluster: BLANK_CLUSTER,
                resource: YOUR_K8S_RESOURCE_NAME
            },
            meta: {
                product: YOUR_PRODUCT_NAME
            }
        }
    });


    // defining a k8s resource as page
    configureType(YOUR_K8S_RESOURCE_NAME, {
        displayName: YOUR_PRODUCT_NAME,
        isCreatable: true,
        isEditable: true,
        isRemovable: true,
        showAge: true,
        showState: true,
        canYaml: true,
        customRoute: {
            name: `c-cluster-${YOUR_PRODUCT_NAME}-resource`,
            params: {
                product: YOUR_PRODUCT_NAME,
                cluster: BLANK_CLUSTER,
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
            name: 'kubernetesVersion',
            label: 'Kubernetes Version',
            value: 'spec.kubernetesVersion',
        },
        AGE,
    ]);

    headers(BILLING_K8S_RESOURCE_NAME, [
        STATE,
        NAME_COL,
        {
            name: 'balance',
            label: 'Balance',
            value: 'status.balance',
        },
        {
            name: 'topUp',
            label: 'Top Up Balance',
            formatter: 'BillingTopUpButton',
        },
        AGE,
    ]);

    headers(BILLING_EVENT_K8S_RESOURCE_NAME, [
        STATE,
        NAME_COL,
        {
            name: 'amount',
            label: 'Amount',
            value: 'status.amount',
        },
        {
            name: 'billing',
            label: 'Billing',
            value: 'status.billingName',
        },
        AGE,
    ]);
}
