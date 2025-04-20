const path = require("path");
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
};
