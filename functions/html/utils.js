const jsdom = require("jsdom");
const { JSDOM } = jsdom;

/**
 * Take some HTML and a URL and resolve all the image paths to absolute,
 * fully-qualified URLs
 * @param {string} html
 * @param {string} url
 * @returns {string}
 */
function resolveImgPathsInHtml({ html, url }) {
  const dom = new JSDOM(html, {
    url,
    contentType: "text/html",
  });

  let modified = false;
  Array.from(dom.window.document.querySelectorAll("img")).forEach((img) => {
    // Get the img src attribute
    // let srcAttribute = img.getAttribute("src");
    // // Check if it starts with the URL
    // if (!srcAttribute.startsWith(url.slice(0, 4))) {
    //   const resolvedSrc = img.src;
    //   img.src = resolvedSrc;
    //   modified = true;
    // }

    // Set the img src for all images to the resolved src
    const resolvedSrc = img.src;
    img.src = resolvedSrc;
    modified = true;
  });

  return modified ? dom.window.document.body.innerHTML : html;
}

module.exports = {
  resolveImgPathsInHtml,
};
