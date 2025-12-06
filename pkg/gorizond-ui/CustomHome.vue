<script lang="ts">
import Home from "@shell/pages/home.vue";
import { getVendor } from "@shell/config/private-label";
import { MANAGEMENT } from "@shell/config/types";

const PRODUCT = "gorizond";
const CLUSTER = "_";
const RESOURCE = "provisioning.gorizond.io.cluster";
const IMPORT_HIDE_STYLE_ID = "gorizond-hide-home-import-btn";
const SUPPORT_HIDE_STYLE_ID = "gorizond-hide-support-link";
const LAYOUT_STYLE_ID = "gorizond-home-layout";
const CLUSTER_LINK_HIDE_STYLE_ID = "gorizond-hide-cluster-link-style";
const MANAGE_HIDE_STYLE_ID = "gorizond-hide-home-manager-btn";

export default {
  extends: Home,
  name: "GorizondHomeWrapper",

  data() {
    // Get the parent data and ensure provClusterSchema is set
    // Use provisioning.cattle.io.cluster schema for table display
    const parentData =
      Home.data?.call(this) || (Home as any).options?.data?.call(this) || {};
    const capiSchema =
      this.$store.getters["management/schemaFor"]?.(
        "provisioning.cattle.io.cluster"
      ) || {};

    return {
      ...parentData,
      // Ensure provClusterSchema is always set so table shows
      provClusterSchema: capiSchema,
    };
  },

  computed: {
    // Always show Create button - all users can create Gorizond clusters
    canCreateCluster() {
      return true;
    },
    // Watch for settings changes to update vendor reactively
    plSetting() {
      return this.$store.getters["management/all"](MANAGEMENT.SETTING)?.find(
        (s: any) => s.id === "ui-pl"
      );
    },
  },

  watch: {
    // Update vendor when Private Label setting changes or loads
    plSetting: {
      handler(setting: any) {
        // Read directly from store setting, fallback to getVendor()
        if (setting?.value) {
          this.vendor = setting.value;
        } else {
          this.vendor = getVendor();
        }
      },
      immediate: true,
    },
  },

  created() {
    // Point the Create action to the Gorizond cluster creation form
    this.createLocation = {
      name: `c-cluster-${PRODUCT}-resource-create`,
      params: {
        product: PRODUCT,
        cluster: CLUSTER,
        resource: RESOURCE,
      },
    };

    // Hide the Import Existing button
    this.$nextTick(() => {
      if (!document.getElementById(IMPORT_HIDE_STYLE_ID)) {
        const style = document.createElement("style");

        style.id = IMPORT_HIDE_STYLE_ID;
        style.textContent =
          '[data-testid="cluster-create-import-button"]{display:none !important;}';
        document.head.appendChild(style);
      }

      if (!document.getElementById(MANAGE_HIDE_STYLE_ID)) {
        const style = document.createElement("style");
        style.id = MANAGE_HIDE_STYLE_ID;
        style.textContent =
          '[data-testid="cluster-management-manage-button"]{display:none !important;}';
        document.head.appendChild(style);
      }

      if (!document.getElementById(SUPPORT_HIDE_STYLE_ID)) {
        const style = document.createElement("style");

        style.id = SUPPORT_HIDE_STYLE_ID;
        style.textContent =
          '.home-page a[href$="/support"]{display:none !important;}';
        document.head.appendChild(style);
      }

      if (!document.getElementById(LAYOUT_STYLE_ID)) {
        const style = document.createElement("style");

        style.id = LAYOUT_STYLE_ID;
        style.textContent = `
          .home-page .home-panels {
            display: flex;
            align-items: stretch;
          }
          .home-page .home-panels .col {
            margin: 0;
          }
          .home-page .home-panels .main-panel {
            flex: 1 1 auto;
            min-width: 0;
          }
          .home-page .home-panels .side-panel {
            margin-left: 1.75%;
            flex: 0 0 300px;
          }
        `;

        document.head.appendChild(style);
      }
    });
  },
};
</script>

<style>
:deep(.indented-panel) {
  /* override shell 90% width */
  width: 100% !important;
  margin-left: 0 !important;
}

/* Re-apply home layout styles (lost when extending) and make main area fill space */
:deep(.home-page .home-panels) {
  display: flex;
  align-items: stretch;
}

:deep(.home-page .home-panels .col) {
  margin: 0;
}

:deep(.home-page .home-panels .main-panel) {
  flex: 1 1 auto !important;
  min-width: 0;
}

:deep(.home-page .home-panels .side-panel) {
  margin-left: 1.75%;
  flex: 0 0 300px !important;
}
</style>
