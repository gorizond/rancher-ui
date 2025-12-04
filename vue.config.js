const config = require("@rancher/shell/vue.config"); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = (env, argv) => {
  const base = config(__dirname, {
    excludes: [],
    // excludes: ['fleet', 'example']
  });

  const origChain = base.chainWebpack;

  base.chainWebpack = (webpackConfig) => {
    if (typeof origChain === "function") {
      origChain(webpackConfig);
    }

    const disableTypecheck = (ruleName) => {
      const rule = webpackConfig.module.rule(ruleName);

      if (rule.uses.has("ts-loader")) {
        rule.use("ts-loader").tap((opts = {}) => ({
          ...opts,
          transpileOnly: true,
          happyPackMode: true,
        }));
      }
    };

    disableTypecheck("ts");
    disableTypecheck("tsx");

    if (webpackConfig.plugins.has("fork-ts-checker")) {
      webpackConfig.plugins.delete("fork-ts-checker");
    }
  };

  const origConfigure = base.configureWebpack;

  base.configureWebpack = (webpackConfig = {}) => {
    if (typeof origConfigure === "function") {
      origConfigure(webpackConfig);
    } else if (origConfigure && typeof origConfigure === "object") {
      Object.assign(webpackConfig, origConfigure);
    }

    webpackConfig.resolve = webpackConfig.resolve || {};
    webpackConfig.resolve.alias = webpackConfig.resolve.alias || {};
    webpackConfig.resolve.alias["diff_match_patch"] =
      require.resolve("diff-match-patch");
  };

  return base;
};
