import { promisify } from "util";
import { exec } from "child_process";

const ex = promisify(exec);

let commit = "";
let version = "";

ex("git rev-parse HEAD")
  .then(({ stdout }) => {
    commit = stdout.slice(0, 7);
    return ex("git describe --tags");
  })
  .then(({ stdout }) => {
    version = stdout.trim();

    console.log(`version: ${commit}` + (version ? ` (${version})` : ""));
  });
// require("child_process").exec("git rev-parse HEAD", function (err, stdout) {
//   console.log("Last commit hash on this branch is:", stdout);
// });
