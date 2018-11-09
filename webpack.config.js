const path = require("path");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const HTMLWebpackPlugin = require("html-webpack-plugin");

const ROOT = path.resolve(__dirname, "src");
const DESTINATION = path.resolve(__dirname, "dist");

module.exports = {
  context: ROOT,

  entry: {
    main: "./main.ts"
  },

  output: {
    filename: "[name].bundle.js",
    path: DESTINATION
  },

  resolve: {
    extensions: [".ts", ".js"],
    modules: [ROOT, "node_modules"]
  },

  module: {
    rules: [
      /****************
       * PRE-LOADERS
       *****************/
      {
        enforce: "pre",
        test: /\.js$/,
        use: "source-map-loader"
      },
      {
        enforce: "pre",
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "tslint-loader"
      },

      /****************
       * LOADERS
       *****************/
      {
        test: /\.(ico)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              publicPath: "/",
              outputPath: "/"
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|gif|mp3)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name]-[hash:8].[ext]",
              publicPath: "/assets",
              outputPath: "assets/"
            }
          }
        ]
      },
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: "awesome-typescript-loader"
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      favicon: "favicon.ico"
    })
    // new BundleAnalyzerPlugin()
  ],
  devtool: "cheap-module-source-map",
  devServer: {
    publicPath: "/",
    historyApiFallback: {
      index: "index.html"
    }
  }
};
