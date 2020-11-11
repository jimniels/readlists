import fetch from "node-fetch";
import Epub from "epub-gen";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import os from "os";

fetch("https://cdn.jim-nielsen.com/readlists/paul-miller-offline.json")
  .then((res) => res.json())
  .then((readlist) => {
    const FILE = `./${slugify(readlist.title)}.epub`;

    // Create book JSON data
    const book = {
      version: 3,
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
    return new Epub({ ...book, tempDir: os.tmpdir() }, FILE).promise;
  })
  .then((t) => {
    console.log("done", t);
  });

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
