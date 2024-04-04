const path = require("path");
const webpack = require("webpack");
const fs = require("fs");

module.exports = () => {
  const env = process.env["ENV"];
  const options = {encoding: "utf-8"};
  const data = fs.readFileSync("./settings.json", options);
  const settings = JSON.parse(data);
  const { indrURL } = settings[env];
  console.log("indr URL: ", indrURL, "\n");
  return {
    entry: "./src/pal.js",
    output: {
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
    },
    plugins: [
      new webpack.DefinePlugin({
        $INDR_URL: JSON.stringify(indrURL)
      }),
    ],
    mode: settings[env]["mode"]
  };
};
