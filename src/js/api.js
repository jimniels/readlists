import { createMercuryArticle, CORS_PROXY } from "./utils.js";

/**
 * TODO test with relative URL images somewhere
 * @param {string} url
 * @returns {Promise<MercuryArticle>}
 */
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
