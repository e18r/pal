import path from "path";
import webpack from "webpack";
import fs from "fs";

export default () => {
  const env = process.env["ENV"];
  const options = {encoding: "utf-8"};
  const data = fs.readFileSync("./settings.json", options);
  const settings = JSON.parse(data);
  const { indrURL } = settings[env];
  const __dirname = import.meta.dirname;
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
    mode: settings[env]["mode"],
    devServer: {
      static: "./dist",
      client: {
        overlay: false
      }
    },
    context: process.cwd(),
    // devtool: "eval-cheap-source-map"
    // disable for production
  };
};
