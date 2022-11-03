import Mercury from "@postlight/mercury-parser";

/**
 * Because we fetch things client side, like the HTML of articles at a URL or
 * the images at a URL when generating an epub, we have to proxy all these
 * requests or we'll likely get CORS issues.
 *
 * ROOT/.netlify/functions/proxy?url=
 */
export const CORS_PROXY = "/.netlify/functions/proxy?url=";

/**
 * https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
 * @param {string} string
 * @returns {boolean}
 */
export function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
 * @param {string} file
 * @param {string} contents
 */
export function downloadFile({ file, contents }) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(contents)
  );
  element.setAttribute("download", file);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/**
 * https://gist.github.com/codeguy/6684588
 * @param {string} str
 * @returns {string}
 */
export function slugify(str) {
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

/**
 * Validate a readlist by checking its contents.
 * @param {Readlist} [readlist={}]
 * @returns {?Readlist} if it passes all the checks, you get back
 * a nice, sanitized version of the Readlist. Otherwise, `null`.
 */
export async function validateReadlist(readlist = {}) {
  const reject = (str) => {
    throw new Error(`Readlist validation failed: ${str}.`);
  };

  if (typeof readlist.title === "string") {
    readlist.title = stripHtml(readlist.title);
  } else {
    reject("expected `title` to be a string");
  }

  if (typeof readlist.description === "string") {
    readlist.description = stripHtml(readlist.description);
  } else {
    reject("expected `description` to be a string");
  }

  if (
    !(
      typeof readlist.date_created === "string" &&
      isIsoDate(readlist.date_created)
    )
  ) {
    reject("expected `date_created` to be an ISO8601 string");
  }

  if (
    !(
      typeof readlist.date_modified === "string" &&
      isIsoDate(readlist.date_modified)
    )
  ) {
    reject("expected `date_modified` to be an ISO8601 string");
  }

  if (!Array.isArray(readlist.articles)) {
    reject("expected `readlist.articles` to be an array");
  }

  for (const [i, article] of readlist.articles.entries()) {
    if (!(typeof article.url === "string" && isValidHttpUrl(article.url))) {
      reject("expected `readlist.article.url` to be an HTTP(S) URL string");
    }

    if (
      typeof article.domain === "string" &&
      article.url.includes(article.domain)
    ) {
      article.domain = stripHtml(article.domain);
    } else {
      reject(
        "expected `readlist.article.domain` to be a string and contained in the `readlist.article.url` value"
      );
    }

    if (typeof article.title === "string") {
      readlist.articles[i].title = stripHtml(article.title);
    } else {
      reject("expected `readlist.article.title` to be a string.");
    }

    if (
      typeof article.word_count === "number" ||
      typeof article.word_count === "string"
    ) {
      readlist.articles[i].word_count = stripHtml(article.word_count);
    } else {
      reject("expected `readlist.article.word_count` to be a number.");
    }

    if (typeof article.excerpt === "string") {
      readlist.articles[i].excerpt = stripHtml(article.excerpt);
    } else {
      reject("expected `readlist.article.excerpt` to be a string.");
    }

    if (article.author !== null) {
      if (typeof article.author === "string") {
        readlist.articles[i].author = stripHtml(article.author);
      } else {
        reject("expected `readlist.article.author` to be a string.");
      }
    }

    if (article.content !== null) {
      if (typeof article.content === "string") {
        try {
          // Note: Mercury doesn't let you do parallel async stuff, like sticking
          // this inside a Promise.all()
          readlist.articles[i].content = await Mercury.parse(article.url, {
            html: article.content,
          }).then((res) => res.content);
        } catch (e) {
          reject(`failed to parse content of article ${article.url}.`);
        }
      } else {
        reject(
          `expected \`readlist.article.content\` to be a string for article ${article.url}.`
        );
      }
    }

    // Others? Do full check of mercury type
  }

  return readlist;

  // try {
  //   // Basic type checking first
  //   const types = {
  //     title: (x) => typeof x === "string",
  //     description: (x) => typeof x === "string",
  //     date_modified: (x) => typeof x === "string" && isIsoDate(x),
  //     date_created: (x) => typeof x === "string" && isIsoDate(x),
  //     articles: (x) => Array.isArray(x),
  //     "articles.url": (url) => typeof url === "string" && ,
  //     "articles.domain": (domain) => typeof domain === "string",
  //     "articles.title": "string",
  //     "articles.word_count": "number",
  //     "articles.excerpt": "string",
  //     "articles.author": "string",
  //     "articles.content": "string",
  //   };
  //   Object.keys(types).forEach((key) => {
  //     const expectedType = types[key];
  //     let actualType = key.includes("articles.")
  //       ? typeof readlist.articles[key]
  //       : typeof readlist[key];

  //     if (expectedType !== actualType) {
  //       throw new Error(
  //         `expected "${key}" to be of type "${expected}", got "${actualType}".`
  //       );
  //     }
  //   });

  //   if (!Array.isArray(readlist.articles)) {
  //     throw new Error(
  //       `"articles" was "${typeof readlist.articles}", expected an array.`
  //     );
  //   }

  //   if (readlist.date_created)
  //     if (!isIsoDate(readlist.date_modified)) {
  //       throw new Error("date_modified");
  //     }

  //   if (!isIsoDate(readlist.date_created))
  //     const articleTypes = {
  //       domain: "string",
  //       url: "string",
  //       title: "string",
  //       word_count: "number",
  //       excerpt: "string",
  //       author: "string",
  //       content: "string",
  //     };
  //   readlist.articles.forEach((article) => {
  //     Object.keys(articleTypes).forEach((key) => {
  //       if (!(article[key] && typeof article[key] === articleTypes[key])) {
  //         throw new Error(
  //           `"article.${key}" is not of type "${readlistTypes[key]}".`
  //         );
  //       }
  //     });
  //   });

  //   return true;
  // } catch (e) {
  //   console.error("Readlist validation failed.", e);
  //   return false;
  // }
}

function stripHtml(html) {
  if (typeof window !== "undefined") {
    var doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  } else {
    return html;
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }

  return true;
}

/**
 * Check if a string is ISO8601 format, specifically: `YYYY-MM-DDTHH:MN:SS.MSSZ`
 * https://stackoverflow.com/questions/52869695/check-if-a-date-string-is-in-iso-and-utc-format
 * @param {string} str
 * @returns {boolean}
 */
function isIsoDate(str) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  var d = new Date(str);
  return d.toISOString() === str;
}

export function devLog(array) {
  if (typeof window !== "undefined" && window.IS_DEV) {
    // console.log("(__DEV__) " + array.join("\n    "));
    // console.group();
    array.forEach((item, i) => {
      if (i === 0) {
        console.log("__DEV__ ", item);
      } else {
        console.log("        ", item);
      }
    });
    // console.groupEnd();
  }
}

/**
 * Take a URL and it's HTML contents and parse it with mercury to 1)
 * sanitzie the HTML, and 2) absolutize image links.
 * @param {string} url
 * @param {string} html
 * @returns {MercuryArticle}
 */
export function createMercuryArticle(url, html) {
  return window.Mercury.parse(url, { html }).then((mercuryArticle) => {
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

/**
 * https://stackoverflow.com/a/27979933/1339693
 */
export function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}

/**
 * Given an image's mimetype, return the extension. If there's no extension
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
 * @param {{
 *   mimeType: string,
 *   fileUrl: string
 * }}
 * @returns {string}
 */
export function getImgExt({ mimeType, fileUrl }) {
  switch (mimeType) {
    case "image/apng":
      return "apng";
    case "image/bmp":
      return "bmp";
    case "image/gif":
      return "gif";
    case "image/x-icon":
      return "ico";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/svg+xml":
      return "svg";
    case "image/tiff":
      return "tiff";
    case "image/webp":
      return "webp";
    default:
      // Pull it from the filename if we can't get it
      // https://stackoverflow.com/questions/6997262/how-to-pull-url-file-extension-out-of-url-string-using-javascript
      const ext = fileUrl.split(/[#?]/)[0].split(".").pop().trim();
      return ext;
  }
}

/**
 * Import a UMD file using a promise
 * @param {string} url
 */
export function importUMD(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      reject(err);
    };
    script.src = url;

    document.head.appendChild(script);
  });
}

/**
 * https://gist.github.com/SimonHoiberg/ad2710c8626c5a74cddd8f6385795cc0
 * @returns {string}
 */
export function getUid() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
