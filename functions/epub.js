const fetch = require("node-fetch");
const Epub = require("epub-gen");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const os = require("os");

const FILE = path.join(os.tmpdir(), "readlist.epub");
console.log(FILE);

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  // https://stackoverflow.com/questions/53297978/amazon-lambda-return-docx-file-node-js
  try {
    const book = JSON.parse(event.body);

    await new Epub({ ...book, tempDir: os.tmpdir() }, FILE).promise;
    // const fileBase64 = fs.readFileSync(FILE, {
    //   encoding: "base64",
    // });

    const body = new FormData();
    body.append("file", fs.createReadStream(FILE));
    const json = await fetch("https://file.io", {
      method: "POST",
      body,
    }).then((res) => res.json());

    return {
      statusCode: 200,
      body: JSON.stringify(json),
      // more keys you can return:
      headers: {
        "Content-Type": "application/json",
      },
      // isBase64Encoded: true,
    };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: err.toString() };
  }
};
