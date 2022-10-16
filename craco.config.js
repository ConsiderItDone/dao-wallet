const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.optimization.minimizer[0].options.minimizer.options.keep_fnames = true;
      webpackConfig.optimization.minimizer[0].options.minimizer.options.keep_classnames = true;
      return {
        ...webpackConfig,
        entry: {
          main: [
            env === "development" &&
              require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs,
          ].filter(Boolean),
          contentscript: "./src/scripts/contentscript.ts",
          inpage: "./src/scripts/inpage.ts",
          background: "./src/scripts/background.ts",
        },
        output: {
          ...webpackConfig.output,
          filename: "static/js/[name].js",
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
        },
        resolve: {
          ...webpackConfig.resolve,
          fallback: {
            ...webpackConfig.resolve.fallback,
            fs: false,
            util: false,
            path: require.resolve("path-browserify"),
            stream: require.resolve("stream-browserify"),
            crypto: require.resolve("crypto-browserify"),
            assert: require.resolve("assert"),
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            os: require.resolve("os-browserify"),
            url: require.resolve("url"),
            buffer: require.resolve("buffer/"),
          },
        },
        plugins: [
          ...webpackConfig.plugins,
          new webpack.ProvidePlugin({
            process: "process/browser.js",
          }),
          new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
          }),
          new webpack.ContextReplacementPlugin(/@polywrap/),
        ],
        ignoreWarnings: [/Failed to parse source map/],
      };
    },
  },
};
