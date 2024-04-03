const path = require("path");
const webpack = require("webpack");
const fs = require("node:fs/promises");

module.exports = async () => {
  try {
    const indrURL = await fs.readFile("./indr.url", {encoding: "utf-8"});
    return {
      entry: "./src/pal.js",
      output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
      },
      plugins: [
        new webpack.DefinePlugin({
          INDR_URL: JSON.stringify(indrURL)
        }),
      ],
      mode: "production"
    };
  } catch (err) {
    console.error(err);
  }
};
