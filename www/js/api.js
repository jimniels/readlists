import {
  devLog,
  resolveImgSrc,
  validateReadlist,
  isValidHttpUrl,
  slugify,
  createMercuryArticle,
} from "./utils.js";

// @TODO test with relative URL images somewhere
export function fetchArticle(url) {
  return fetch(`https://cors-anywhere.herokuapp.com/${url}`)
    .then((res) => res.text())
    .then((html) => createMercuryArticle(url, html));
}

/**
 * Take a readlist, upload it, get back the download link and download the file
 * @param {Readlist} readlist
 */
export function downloadEpub(readlist) {
  return fetch(`/api/epub/`, {
    method: "POST",
    body: JSON.stringify(readlist),
  })
    .then((res) => res.text())
    .then((downloadLink) => {
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadLink;
      a.download = `${slugify(readlist.title)}.epub`;
      // a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
}
