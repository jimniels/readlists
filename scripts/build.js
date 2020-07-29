import fs from "fs";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)));
const INDEX_PATH = path.join(__dirname, "../build/index.html");

const { version } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"))
);
const sha = execSync("git rev-parse HEAD").toString().trim().slice(0, 7);

console.log(`${version}@${sha}`);

let index = fs.readFileSync(INDEX_PATH).toString();
index = index.replace("__VERSION__", `${version}@${sha}`);
// use the production versions of this dep by stripping the `/dev` path
// find `es-react@____/dev` and replace with `es-react@____`
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
index = index.replace(/(es-react@.*)\/dev/g, "$1");

fs.writeFileSync(INDEX_PATH, index);
