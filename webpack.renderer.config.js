const path = require("path");
module.exports = {
  entry: "./src/renderer.jsx",
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, use: "babel-loader" },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  resolve: { extensions: [".js", ".jsx"] },
  target: "electron-renderer",
  output: {
    filename: "renderer.js",
    path: path.resolve(__dirname, ".webpack/renderer"),
  },
};
