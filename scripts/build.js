import fs from "fs";
import process from "process";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)));
const INDEX_PATH = path.join(__dirname, "../build/index.html");

const sha = execSync("git rev-parse HEAD").toString().trim().slice(0, 7);
const version = execSync("git describe --tags --abbrev=0").toString().trim();

let index = fs.readFileSync(INDEX_PATH).toString();

index = index.replace("__DEV__", `${version}@${sha}`);
index = index.replace("es-react@16.13.1/dev", "es-react@16.13.1");

fs.writeFileSync(INDEX_PATH, index);
