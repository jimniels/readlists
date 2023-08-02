/** @typedef {import("./prop-types.js").Readlist} Readlist */
/** @typedef {import("./prop-types.js").ReadlistArticle} ReadlistArticle */
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
 * @returns {Promise<undefined|Readlist>}
 */
async function getInitialReadlist() {
  // Check localstorage to see if there’s a Readlist we should load
  // If there is, see if it's an old version and convert it.
  //
  // @TODO validate that the readlist is good, then render it. Otherwise, clear
  // it and start anew or something...
  const localReadlist = localStorage.getItem("readlist");
  if (localReadlist) {
    try {
      let readlist = JSON.parse(localReadlist);

      const isOldReadlist = readlist.articles;
      if (isOldReadlist) {
        readlist = convertOldReadlistToJsonFeedReadlist(readlist);
      }
      return readlist;
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

/**
 * Takes an old readlist and converts it to the new format
 * @returns {Readlist}
 */
function convertOldReadlistToJsonFeedReadlist(oldReadlist) {
  let newReadlist = {
    version: "https://jsonfeed.org/version/1.1",
    title: oldReadlist.title,
    description: oldReadlist.description,
    // TODO
    home_page_url: "https://readlists.jim-nielsen.com",
    feed_url: "https://readlists.jim-nielsen.com/feedgen?",
    _readlist: {
      date_published: oldReadlist.date_created,
      date_modified: oldReadlist.date_modified,
    },

    items: oldReadlist.articles.map((oldArticle) => {
      const {
        url,
        content,
        date_published,
        title,
        author,
        excerpt,
        lead_image_url,
        ...rest
      } = oldArticle;

      /** @type {ReadlistArticle} */
      const newReadlist = {
        id: url,
        url,
        ...(content && { content_html: content }),
        ...(date_published && { date_published }),
        ...(title && { title }),
        ...(author && { authors: { name: author } }),
        ...(excerpt && { summary: excerpt }),
        ...(lead_image_url && { image: lead_image_url }),
      };
      return newReadlist;
    }),
  };
  return newReadlist;
}
