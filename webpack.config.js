/*********************************
 *       import webpack plugins
 ********************************/
const path = require("path");
const webpack = require("webpack");
const ADDON_VERSION = require("./package.json").version;

const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const GasPlugin = require("gas-webpack-plugin");
const WebpackCleanPlugin = require("webpack-clean");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const DynamicCdnWebpackPlugin = require("dynamic-cdn-webpack-plugin");

/*********************************
 *       define file paths
 ********************************/
const destination = "dist";
const htmlTemplate = "./src/client/template.html";

/*********************************
 *    client entry point paths
 ********************************/
const clientEntrypoints = [
  {
    name: "main.jsx",
    entry: "./src/client/main.jsx",
    filename: "main.html",
  },
];

/*********************************
 *       Declare settings
 ********************************/

// any shared client & server settings
const sharedConfigSettings = {
  performance: {
    hints: "warning",
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};

// eslint settings, to check during build if desired
const eslintConfig = {
  enforce: "pre",
  test: /\.jsx?$/,
  exclude: /node_modules/,
  loader: "eslint-loader",
  options: {
    cache: false,
    failOnError: false,
    fix: true,
  },
};

const cleanConfig = {
  name: "CLEAN ./dist",
  plugins: [new CleanWebpackPlugin([destination])],
};
const appsscriptConfig = {
  name: "COPY appscript.json",
  entry: "./appsscript.json",
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "./appsscript.json",
      },
    ]),
  ],
};

// config shared for all client settings
const clientConfig = {
  ...sharedConfigSettings,
  output: {
    path: path.resolve(__dirname, destination),
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  module: {
    rules: [
      eslintConfig,
      {
        test: /\.[j|t]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};

// config for EACH client entrypoint
const clientConfigs = clientEntrypoints.map(clientEntrypoint => {
  return {
    ...clientConfig,
    name: clientEntrypoint.name,
    entry: clientEntrypoint.entry,
    plugins: [
      new HtmlWebpackPlugin({
        template: htmlTemplate,
        filename: clientEntrypoint.filename,
        inlineSource: "^[^(//)]+.(js|css)$", // embed all js and css inline, exclude packages with '//' for dynamic cdn insertion
      }),
      new HtmlWebpackInlineSourcePlugin(),
      new WebpackCleanPlugin([path.join(destination, "main.js")]),
      new DynamicCdnWebpackPlugin(),
      new webpack.DefinePlugin({
        ADDON_VERSION: JSON.stringify(ADDON_VERSION),
      }),
    ],
  };
});

const serverConfig = {
  name: "code.js",
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "./src/server/code.js",
        transform(content) {
          return content
            .toString()
            .replace("ADDON_VERSION", JSON.stringify(ADDON_VERSION));
        },
      },
    ]),
  ],
};

module.exports = [
  // 0. clean
  cleanConfig,
  // 1. Copy the appscript file.
  appsscriptConfig,
  // 2. One client bundle for each client entrypoint.
  ...clientConfigs,
  // 3. Bundle the server
  serverConfig,
];
