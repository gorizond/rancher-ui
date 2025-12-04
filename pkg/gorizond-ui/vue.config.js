const baseFactory = require("./.shell/pkg/vue.config");

module.exports = () => {
  const dir = __dirname;
  const base = baseFactory(dir);
  const origChain = base.chainWebpack;

  base.chainWebpack = (config) => {
    if (typeof origChain === "function") {
      origChain(config);
    }

    const disableTypecheck = (ruleName) => {
      const rule = config.module.rule(ruleName);

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

    // ForkTsCheckerWebpackPlugin is added by Vue CLI when TypeScript is present.
    if (config.plugins.has("fork-ts-checker")) {
      config.plugins.delete("fork-ts-checker");
    }
  };

  return base;
};
