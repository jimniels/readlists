import {
  devLog,
  validateReadlist,
  isValidHttpUrl,
  slugify,
  createMercuryArticle,
  CORS_PROXY,
} from "./utils.js";

// @TODO test with relative URL images somewhere
export function fetchArticle(url) {
  return fetch(CORS_PROXY + url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch article. Server returned ${res.status}: ${res.statusText}`
        );
      }
      return res.text();
    })
    .then((html) => createMercuryArticle(url, html));
}

/**
 * Take a readlist, upload it, get back the download link and download the file
 * @param {Readlist} readlist
 * @returns {Promise} - Doesn't resolve to anything, just downloads the thing
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
