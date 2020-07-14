import process from "process";
import fs from "fs";
import { execSync } from "child_process";

const isDev = process.env.NODE_ENV !== "production";

const sha = execSync("git rev-parse HEAD").toString().trim().slice(0, 7);
const version = execSync("git describe --tags --abbrev=0").toString().trim();
// const version = JSON.parse(fs.readFileSync("./package.json").toString())
//   .version;

const config = {
  presets: ["@babel/react"],
  plugins: [
    [
      "search-and-replace",
      {
        rules: isDev
          ? []
          : [
              {
                search: /es-react@16.13.1\/dev/,
                replace: "es-react@16.13.1",
              },
              {
                search: "__VERSION__",
                replace: `${version}@${sha}`,
              },
            ],
      },
    ],
  ],
};

export default config;
