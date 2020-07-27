const Epub = require("epub-gen");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  // https://stackoverflow.com/questions/53297978/amazon-lambda-return-docx-file-node-js
  try {
    const book = JSON.parse(event.body);

    await new Epub({ ...book, tempDir: os.tmpdir() }, "readlist.epub").promise;
    const fileBase64 = fs.readFileSync(
      path.join(os.tmpdir(), "readlist.epub"),
      {
        encoding: "base64",
      }
    );

    return {
      statusCode: 200,
      body: fileBase64,
      // // more keys you can return:
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="my-readlist.epub`,
      },
      isBase64Encoded: true,
    };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: err.toString() };
  }
};
