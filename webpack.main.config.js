const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./main.js",
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, use: "babel-loader" }],
  },
  resolve: { extensions: [".js"] },
  target: "electron-main",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, ".webpack/main"),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "preload.js"),
          to: path.resolve(__dirname, ".webpack/main/preload.js"),
        },
      ],
    }),
  ],
};
