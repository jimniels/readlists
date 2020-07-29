const fetch = require("node-fetch");
const Epub = require("epub-gen");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Take a readlist, turn it into an ebook, upload to file.io, and return the response
 * @param {Readlist} event.body
 */
// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  try {
    const readlist = JSON.parse(event.body);

    // @TODO verify that readlist data is right
    if (
      !(
        readlist.title &&
        readlist.description &&
        readlist.articles &&
        readlist.dateCreated &&
        readlist.dateModified &&
        Array.isArray(readlist.articles)
      )
    ) {
      throw new Error("Readlist request data is malformed");
    }

    const FILE = path.join(os.tmpdir(), `${slugify(readlist.title)}.epub`);

    // Create book JSON data
    const book = {
      title: readlist.title,
      // author: "@TODO", // username?
      content: readlist.articles.map((article, i) => ({
        title: article.title,
        data:
          `<p><a href="${article.url}">${article.url}</a></p>` +
          article.content,
      })),
    };

    // Create the ebook
    await new Epub({ ...book, tempDir: os.tmpdir() }, FILE).promise;

    // Upload the ebook
    const body = new FormData();
    body.append("file", fs.createReadStream(FILE));
    const fileIORes = await fetch("https://file.io", {
      method: "POST",
      body,
    }).then((res) => res.json());

    // Return link to ebook
    return {
      statusCode: 200,
      body: JSON.stringify(fileIORes),
      // more keys you can return:
      headers: {
        "Content-Type": "application/json",
      },
      // isBase64Encoded: true,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: `Failed to generated Readlist epub. Error:\n` + err,
    };
  }
};

function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, ""); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes

  return str;
}
