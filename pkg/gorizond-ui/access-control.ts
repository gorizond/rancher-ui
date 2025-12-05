import { MANAGEMENT } from "@shell/config/types";
import { IPlugin } from "@shell/core/types";
import { isAdminUser } from "@shell/store/type-map";

// Vuex watchers to clean up when the plugin unloads
const watchers: Array<() => void> = [];

function hideClusterManagementForNonAdmins(store: any) {
  // Leave Cluster Management visible for admins
  if (isAdminUser(store.getters)) {
    return;
  }

  // Mark the built-in Cluster Management product as non-public so it disappears from navigation
  store.commit("type-map/product", { name: "manager", public: false });
}

export function registerAccessControl(plugin: IPlugin) {
  // addStore expects a function that returns a register fn; applyPlugin will call register() first, then call the returned function with the store
  plugin.addStore(
    "gorizond-access-control",
    () => (store: any) => {
      const unwatch = store.watch(
        () => {
          const schemaFor = store.getters["management/schemaFor"];

          // Wait until management schemas are available before checking admin status
          return schemaFor ? schemaFor(MANAGEMENT.SETTING) : null;
        },
        () => {
          hideClusterManagementForNonAdmins(store);
        },
        { immediate: true }
      );

      watchers.push(unwatch);
    },
    (store: any) => {
      // Clean up all watchers on unload
      while (watchers.length) {
        const unwatch = watchers.pop();

        if (typeof unwatch === "function") {
          unwatch();
        }
      }
    }
  );
}
