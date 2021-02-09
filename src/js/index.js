import { React, ReactDOM, html } from "./deps.js";
import App from "./components/App.js";
import AppError from "./components/AppError.js";
import { devLog, validateReadlist } from "./utils.js";

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
 * @returns {undefined|Readlist}
 */
async function getInitialReadlist() {
  // First check localstorage to see if there’s one we should load
  // @TODO validate that the readlist is good, then render it. Otherwise, clear
  // it and start anew or something...
  const localReadlist = localStorage.getItem("readlist");
  if (localReadlist) {
    try {
      return JSON.parse(localReadlist);
    } catch (e) {
      console.error("Somehow the local readlist was corrupted.", e);
    }
  }

  // If there's nothing local, that means we'll start at the zero state page
  // So check the URL for a ?url= query param and try to fetch that
  // and get back some JSON
  const params = new URLSearchParams(window.location.search);
  const url = params.get("url");
  if (url) {
    try {
      const remoteReadlist = await fetch(url)
        .then((res) => res.json())
        .then(validateReadlist);
      return remoteReadlist;
    } catch (e) {
      console.error(
        "Failed to retrieve and parse the remote readlist specified in the URL.",
        e
      );
    }
  }

  return undefined;
}
