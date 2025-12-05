<script lang="ts">
import Home from "@shell/pages/home.vue";

const PRODUCT = "gorizond";
const CLUSTER = "_";
const RESOURCE = "provisioning.gorizond.io.cluster";
const IMPORT_HIDE_STYLE_ID = "gorizond-hide-home-import-btn";
const SUPPORT_HIDE_STYLE_ID = "gorizond-hide-support-link";
const LAYOUT_STYLE_ID = "gorizond-home-layout";
const CLUSTER_LINK_HIDE_STYLE_ID = "gorizond-hide-cluster-link-style";

export default {
  extends: Home,
  name: "GorizondHomeWrapper",

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

      if (!document.getElementById(SUPPORT_HIDE_STYLE_ID)) {
        const style = document.createElement("style");

        style.id = SUPPORT_HIDE_STYLE_ID;
        style.textContent =
          '.home-page a[href="/support"]{display:none !important;}';
        document.head.appendChild(style);
      }

      if (!document.getElementById(CLUSTER_LINK_HIDE_STYLE_ID)) {
        const style = document.createElement("style");

        style.id = CLUSTER_LINK_HIDE_STYLE_ID;
        style.textContent = `
          a[href="/c/_/manager/provisioning.cattle.io.cluster"] {
            display: none !important;
          }
        `;

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

      // Stretch home content to full width (the panel wraps the outlet above this component)
      const panel = this.$el?.closest(".indented-panel");

      if (panel) {
        panel.setAttribute("style", "width:100%;margin-left:0;");
        panel.classList.remove("pt-20");
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
