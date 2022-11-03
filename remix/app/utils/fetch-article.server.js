import Mercury from "@postlight/mercury-parser";
import { JSDOM } from "jsdom";

/**
 * Take a URL and it's HTML contents and parse it with mercury to 1)
 * sanitzie the HTML, and 2) absolutize image links.
 * @param {string} url
 * @param {string} html
 * @returns {MercuryArticle}
 */
export async function fetchArticle(url, { html } = { html: "" }) {
  let mercuryArticle = await (html
    ? Mercury.parse(url, { html })
    : Mercury.parse(url));

  let dom = new JSDOM(mercuryArticle.content);
  let modified = false;

  // Change all relative paths for <img src> and <a href> to absolute ones
  Array.from(dom.window.document.querySelectorAll("img, a")).forEach(
    ($node) => {
      // the DOM node's property, i.e. $img.src, resolves to an absolute URL
      // while .getAttribute() gives you what's in the source HTML (possibly
      // a relative path)
      const nodeType = $node.tagName.toLowerCase();
      const url = $node.getAttribute(nodeType === "img" ? "src" : "href");

      // If the URL is not an absolute URL, i.e. "../path/to/thing"
      // We want it to resolve to the source from whence it came.
      if (!isAbsoluteUrl(url)) {
        const resolvedUrl = resolveUrl(url, mercuryArticle.url);
        devLog([
          `Changed relative path for <${nodeType}> tag`,
          `From: ${url}`,
          `To: ${resolvedUrl}`,
        ]);
        $node.setAttribute(nodeType === "img" ? "src" : "href", resolvedUrl);
        modified = true;
      }
    }
  );

  if (modified) {
    mercuryArticle = {
      ...mercuryArticle,
      content: dom.window.document.body.innerHTML,
    };
  }

  devLog(["Fetched a new Mercurcy article: ", mercuryArticle.url]);
  return mercuryArticle;
}

export function devLog(array) {
  // if (typeof window !== "undefined" && window.IS_DEV) {
  // console.log("(__DEV__) " + array.join("\n    "));
  // console.group();
  array.forEach((item, i) => {
    if (i === 0) {
      console.log("__DEV__ ", item);
    } else {
      console.log("            ", item);
    }
  });
  // console.groupEnd();
  // }
}

/**
 * Take a relative path, resolve it within a base path, and return it
 * @param {string} relativeUrl
 * @param {string} baseUrl
 * @return {string}
 */
export function resolveUrl(relativeUrl, baseUrl) {
  const url = new URL(relativeUrl, baseUrl);
  return url.href ? url.href : relativeUrl;
}

/**
 * Check if a URL is relative to the current path or not
 * https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
 * @param {string} url
 * @returns {boolean}
 */
export function isAbsoluteUrl(url) {
  if (url.indexOf("//") === 0) {
    return true;
  } // URL is protocol-relative (= absolute)
  if (url.indexOf("://") === -1) {
    return false;
  } // URL has no protocol (= relative)
  if (url.indexOf(".") === -1) {
    return false;
  } // URL does not contain a dot, i.e. no TLD (= relative, possibly REST)
  if (url.indexOf("/") === -1) {
    return false;
  } // URL does not contain a single slash (= relative)
  if (url.indexOf(":") > url.indexOf("/")) {
    return false;
  } // The first colon comes after the first slash (= relative)
  if (url.indexOf("://") < url.indexOf(".")) {
    return true;
  } // Protocol is defined before first dot (= absolute)
  return false; // Anything else must be relative
}
