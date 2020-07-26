/**
 * Check if a URL is relative to the current path or not
 * https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
 * @param {string} url
 */
export function isUrlAbsolute(url) {
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

// instead, just check if img.src contains the current URL in it, if it does, it
// it was a relative link. otherwise, it's absolute and you can skip.
export function resolveImgSrc(articleUrl, imgSrc) {
  const url = new URL(imgSrc, articleUrl);
  return url.href ? url.href : imgSrc;
}

/**
 * https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
 * @param {string} string
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
 *
 * @param {Readlist}
 * @param {Object} opts - options to the fun
 * @returns {Readlist|null} if it passes all the checks, you get back
 * a nice, sanitized version of the Readlist. Otherwise, `null`.
 */
export async function validateReadlist(
  readlist = {},
  opts = { verbose: false }
) {
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
      typeof readlist.dateCreated === "string" &&
      isIsoDate(readlist.dateCreated)
    )
  ) {
    reject("expected `dateCreated` to be an ISO8601 string");
  }

  if (
    !(
      typeof readlist.dateModified === "string" &&
      isIsoDate(readlist.dateModified)
    )
  ) {
    reject("expected `dateModified` to be an ISO8601 string");
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
  //     dateModified: (x) => typeof x === "string" && isIsoDate(x),
  //     dateCreated: (x) => typeof x === "string" && isIsoDate(x),
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

  //   if (readlist.dateCreated)
  //     if (!isIsoDate(readlist.dateModified)) {
  //       throw new Error("dateModified");
  //     }

  //   if (!isIsoDate(readlist.dateCreated))
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
 */
function isIsoDate(str) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  var d = new Date(str);
  return d.toISOString() === str;
}

export function devLog(array) {
  if (typeof window !== "undefined" && window.__DEV__) {
    console.log("(__DEV__) " + array.join("\n    "));
    // console.group();
    // array.forEach((i) => console.log(i));
    // console.groupEnd();
  }
}
