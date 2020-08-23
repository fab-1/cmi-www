const webpack = require("webpack");
//const etp = require("extract-text-webpack-plugin");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  devtool: "source-map",
  stats: {
    colors: true
  },

  resolve: {
    alias: {
      "jquery": "jquery/src/jquery",
      "semantic": "../vendor/semantic",
      "me-plugin": path.resolve(__dirname, "../cmi-audio/dist"),
      "acim": path.resolve(__dirname, "../cmi-acim/src/js"),
      "oe": path.resolve(__dirname, "../cmi-oe/src/js"),
      "acol": path.resolve(__dirname, "../cmi-acol/src/js"),
      "jsb": path.resolve(__dirname, "../cmi-jsb/src/js"),
      "raj": path.resolve(__dirname, "../cmi-raj/src/js"),
      "pwom": path.resolve(__dirname, "../cmi-pwom/src/js"),
      "wom": path.resolve(__dirname, "../cmi-wom/src/js")
    }
  },

  entry: {
    transcript: ["./src/js/transcript.js"],
    profile: ["./src/js/profile.js"],
    page: ["./src/js/page.js"]
  },
  output: {
    path: path.join(__dirname, "public/js"),
    publicPath: "/public/js",
    filename: "[name].js"
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    }
  },
  module: {
    rules: [
      {
        test: /\.((png)|(eot)|(woff)|(woff2)|(ttf)|(svg)|(gif))(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader?name=/[hash].[ext]"
      },
      {
        test: /\.js?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {cacheDirectory: true}
      },
      {
        test: /\.css$/,
        use: [ "style-loader", MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({filename: 'me-styles.css'}),
    //new CleanWebpackPlugin(),
    //new BundleAnalyzerPlugin({analyzerPort: 8899}),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
};
