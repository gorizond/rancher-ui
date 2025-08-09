import { importTypes } from '@rancher/auto-import';
import { IPlugin, TableColumnLocation } from '@shell/core/types';
import routes from "./routes";

// Init the package
export default function (plugin: IPlugin): void {
    importTypes(plugin);

    // Provide plugin metadata from package.json
    plugin.metadata = require('./package.json');

    // Load a product
    plugin.addProduct(require('./product'));
    // => => => Add Vue Routes
    plugin.addRoutes(routes);

    plugin.addTableColumn(
        TableColumnLocation.RESOURCE,
        {resource: ['provisioning.gorizond.io.cluster']},
        {
            name: 'provisioning',
            labelKey: 'gorizond.status',
            getValue: (row: any) => {
                return row.status.provisioning;
            },
            width: 100,
            sort: ['stateSort', 'nameSort'],
            search: ['stateSort', 'nameSort'],
        }
    );

    plugin.addTableColumn(
        TableColumnLocation.RESOURCE,
        { resource: ['provisioning.gorizond.io.cluster'] },
        {
            name:      'billing',
            label:     'Billing',
            value:     'status.billing',
            sort:      ['status.billing', 'spec.billing'],
            formatter: 'GorizondBillingFormatter',
        }
    );

    // remove cluster management icon
    const style = document.createElement('style');
    style.id = 'gorizond-hide-cluster-link-style';
    style.innerHTML = `
    a[href="/c/_/manager/provisioning.cattle.io.cluster"] {
      display: none !important;
    }`;
    document.head.appendChild(style);
}

