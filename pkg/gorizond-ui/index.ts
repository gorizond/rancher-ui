import { importTypes } from "@rancher/auto-import";
import { IPlugin } from "@shell/core/types";
import routes from "./routes";
import CustomHome from "./CustomHome.vue";
import { registerAccessControl } from "./access-control";

// Init the package
export default function (plugin: IPlugin): void {
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require("./package.json");

  // Load a product
  plugin.addProduct(require("./product"));
  // => => => Add Vue Routes
  plugin.addRoutes(routes);

  // Override the Rancher home page but keep the standard layout (parent: plain)
  plugin.addRoute("plain", {
    name: "home",
    path: "/home",
    component: CustomHome,
  });

  registerAccessControl(plugin);
}
