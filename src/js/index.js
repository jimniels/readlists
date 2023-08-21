import { React, ReactDOM, html } from "./deps.js";
import App from "./components/App.js";
import AppError from "./components/AppError.js";
import {
  devLog,
  validateReadlist,
  convertMercuryArticleToReadlistArticle,
  convertOldReadlistToNewReadlist,
  isValidHttpUrl,
  CORS_PROXY,
} from "./utils.js";

main();

async function main() {
  const initialReadlist = await getInitialReadlist();
  ReactDOM.render(
    html`
    <${AppError}>
      <${App} initialReadlist=${initialReadlist} />
    </${AppError}>
  `,
    document.getElementById("root")
  );
}

/**
 * Get the initial readlist or return undefined if there isn't one.
 * @returns {Promise<Readlist | undefined>}
 */
async function getInitialReadlist() {
  // See if there's an import URL first
  const importUrlEncoded = window.location.search.startsWith("?import=")
    ? encodeURIComponent(window.location.search.slice(8))
    : "";

  // Check localstorage to see if there’s a Readlist we should load
  const localReadlist = localStorage.getItem("readlist");

  // If there's a localReadlist, see if it's an old version and convert it.
  // TODO validate that the readlist is good, then render it. Otherwise, clear it and start anew or something...
  if (localReadlist) {
    try {
      const readlist = await validateReadlist(localReadlist);
      return readlist;
    } catch (e) {
      console.error("Somehow the local readlist was corrupted.", e);
    }
  }

  // If there's nothing local, that means we'll start at the zero state page
  // So check the URL for a ?import=<url> query param and try to fetch that
  // and get back some JSON
  if (
    importUrlEncoded &&
    isValidHttpUrl(decodeURIComponent(importUrlEncoded))
  ) {
    try {
      const remoteReadlist = await fetch(CORS_PROXY + importUrlEncoded)
        .then((res) => res.text())
        .then(validateReadlist);

      // Clear the url param
      clearSearchParams();

      return remoteReadlist;
    } catch (e) {
      console.error(
        "Failed to import the remote readlist specified in the URL.",
        e
      );
    }
  }

  return undefined;
}

function clearSearchParams() {
  const newUrlWithoutParams = new URL(window.location.origin);
  window.history.pushState(null, "", newUrlWithoutParams.toString());
}
