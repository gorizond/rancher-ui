import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import extensionRouting from './routing/extension-routing';

// Init the package
export default function(plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  // Load a product
  plugin.addProduct(require('./product'));

  // Add Vue Routes
  plugin.addRoutes(extensionRouting);

  // remove cluster management icon
  const style = document.createElement('style');
  style.innerHTML = `
    a[href="/c/_/manager/provisioning.cattle.io.cluster"] {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  // redirect from cluster management to home
  plugin.addRoutes([
    {
      path: '/c/_/manager/provisioning.cattle.io.cluster',
      redirect: '/home'
    }
  ]);
}
