import Mercury from "@postlight/mercury-parser";

/**
 * Take a URL and it's HTML contents and parse it with mercury to 1)
 * sanitzie the HTML, and 2) absolutize image links.
 * @param {string} url
 * @param {string} html
 * @returns {MercuryArticle}
 */
export function fetchArticle({ url, html }) {
  return html ? Mercury.parse(url, { html }) : Mercury.parse(url); // handle when you pass HTML too
  return Mercury.parse(url, { html }).then((mercuryArticle) => {
    let dom = new DOMParser().parseFromString(
      mercuryArticle.content,
      "text/html"
    );
    let modified = false;
    // Change all relative paths for <img src> and <a href> to absolute ones
    Array.from(dom.querySelectorAll("img, a")).forEach(($node) => {
      // the DOM node's property, i.e. $img.src, resolves to an absolute URL
      // while .getAttribute() gives you what's in the source HTML (possibly
      // a relative path)
      const nodeType = $node.tagName.toLowerCase();
      const resolvedUrl = nodeType === "img" ? $node.src : $node.href;

      // If the resolved URL has the current window location's host in it, that
      // means it was a relative path, i.e. "../path/to/thing" and therefore
      // the browser resolved it to the current window. We don't want that.
      // We want it to resolve to the source from whence it came.
      if (resolvedUrl.includes(window.location.hostname)) {
        const relativePath =
          nodeType === "img"
            ? $node.getAttribute("src")
            : $node.getAttribute("href");
        const newResolvedUrl = resolveUrl(relativePath, mercuryArticle.url);
        devLog([
          `Changed relative path for <${nodeType}> tag`,
          `From: ${relativePath}`,
          `To: ${newResolvedUrl}`,
        ]);
        $node.setAttribute(nodeType === "img" ? "src" : "href", newResolvedUrl);
        modified = true;
      }
    });

    if (modified) {
      mercuryArticle = {
        ...mercuryArticle,
        content: dom.body.innerHTML,
      };
    }

    devLog(["Created a new Mercurcy article", mercuryArticle]);

    return mercuryArticle;
  });
}
