import {
  devLog,
  resolveImgSrc,
  validateReadlist,
  isValidHttpUrl,
  slugify,
} from "./utils.js";

// @TODO test with relative URL images somewhere
export function fetchArticle(url) {
  return fetch(`/api/html/?url=${url}`)
    .then((res) => res.text())
    .then((html) => window.Mercury.parse(url, { html }))
    .then((mercuryArticle) => {
      let dom = new DOMParser().parseFromString(
        mercuryArticle.content,
        "text/html"
      );
      let modified = false;
      Array.from(dom.querySelectorAll("img")).forEach((img) => {
        if (img.src.includes(location.hostname)) {
          const oldSrc = img.getAttribute("src");
          const newSrc = resolveImgSrc(mercuryArticle.url, oldSrc);
          devLog([
            "Changed image src path in new article",
            `From: ${oldSrc}`,
            `To: ${newSrc}`,
          ]);
          img.setAttribute("src", newSrc);
          modified = true;
        }
      });
      if (modified) {
        mercuryArticle = {
          ...mercuryArticle,
          content: dom.body.innerHTML,
        };
      }

      return mercuryArticle;
    });
}

/**
 * Take a readlist, upload it, get back the download link and download the file
 * @param {Readlist} readlist
 */
export function downloadEpub(readlist) {
  // @TODO verify that the readlist actually has articles
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
