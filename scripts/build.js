import fs from "fs";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)));

const { version } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"))
);
const sha = execSync("git rev-parse HEAD").toString().trim().slice(0, 7);

console.log(`${version}@${sha}`);

const indexPath = path.join(__dirname, "../build/index.html");
let index = fs.readFileSync(indexPath).toString();
index = index.replace("__VERSION__", `${version}@${sha}`);
fs.writeFileSync(indexPath, index);
// use the production versions of this dep by stripping the `/dev` path
// find `es-react@____/dev` and replace with `es-react@____`
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
const depsPath = path.join(__dirname, "../build/js/deps.js");
let deps = fs.readFileSync(depsPath).toString();
deps = deps.replace(/(es-react@.*)\/dev/g, "$1");
fs.writeFileSync(depsPath, deps);
