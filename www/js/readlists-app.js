import { store } from "./redux.js";
import { fetchReadlist } from "./api.js";
import {
  eventHandler,
  html,
  isValidHttpUrl,
  validateReadlist,
} from "./utils.js";

class ReadlistsApp extends HTMLElement {
  connectedCallback() {
    store.subscribe(() => {
      const state = store.getState();
      switch (state.lastAction.type) {
        case "INIT":
          this.render(state);
          break;
        case "IMPORT_READLIST":
        case "CREATE_READLIST":
        case "DELETE_READLIST":
          this.render(state);
          break;
      }
    });

    // Load up initial readlist from a URL, from localstate, or just nothing.
    // const urlParams = new URLSearchParams(window.location.search);
    // if (urlParams.get("url")) {
    //   importReadlistFromURL(urlParams.get("url"))
    //     .catch(() => {
    //       // @TODO this is broken
    //       this.render(store.getState());
    //     })
    //     .then(() => {
    //       window.history.replaceState({}, "", window.location.origin);
    //     });
    // } else
    if (localStorage.getItem("readlist")) {
      try {
        const readlist = JSON.parse(localStorage.getItem("readlist"));
        store.dispatch({
          type: "IMPORT_READLIST",
          readlist,
        });
      } catch (e) {
        console.error("Failed to load Readlist data in localstorage.", e);
        store.dispatch({
          type: "DELETE_READLIST",
          readlist,
        });
      }
    } else {
      this.render(store.getState());

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("url")) {
        this.querySelector("[name='readlist-url']").value = urlParams.get(
          "url"
        );
      }
    }

    // @TODO check and see if there's anything in the URL bar to pre-load one

    // this.render(store.getState());
  }

  handleCreateNewReadlist() {
    store.dispatch({ type: "CREATE_READLIST" });
  }

  handleImportFromUrl(e) {
    console.warn("FIRED");
    e.preventDefault();
    const $input = e.target.elements[0];
    const $btn = e.target.elements[1];
    const url = $input.value;

    // if (!isValidHttpUrl(url)) {
    //   store.dispatch({
    //     type: "SET_ERROR",
    //     error: "Invalid Readlist URL. Must be an http or https url.",
    //   });
    //   return;
    // }

    $input.setAttribute("loading", true);
    $btn.classList.add("loading");
    importReadlistFromURL(url).then(() => {
      $input.removeAttribute("disabled");
      $btn.classList.remove("loading");
    });
  }

  render(state) {
    const { readlist } = state;
    if (window.__DEV__) {
      // @TODO for some reason this doesn't fire first go around
      console.warn("Rendering <readlist-app>", readlist);
    }

    this.innerHTML = html`
      ${readlist
        ? html`
            <readlist-view class="wrapper"></readlist-view>
            <readlist-article hidden></readlist-article>
          `
        : html`
            <div class="login wrapper">
              <button
                class="button button--primary"
                onClick="${eventHandler(
                  "readlists-app",
                  "handleCreateNewReadlist"
                )}"
              >
                Create Readlist
              </button>

              <span>or</span>

              <form
                class="login__form"
                onsubmit="${eventHandler(
                  "readlists-app",
                  "handleImportFromUrl"
                )}"
              >
                <input
                  type="text"
                  name="readlist-url"
                  placeholder="https://domain.com/readlist.json"
                />
                <button id="login" class="button" type="submit">
                  Import from URL
                </button>
              </form>
              <!--
              <button class="button">Choose a Readlist...</button>
              <label for="exampleInput" class="button">
                Choose a Readlist...
                <input
                  type="file"
                  id="exampleInput"
                  style="display: none"
                  accept=".json"
                />
              </label>
                -->
            </div>
          `}
      <readlist-error class="error"></readlist-error>
    `;
  }
}
customElements.define("readlists-app", ReadlistsApp);

/**
 * @TODO this is ugly, but it works for now
 */
// document.body.addEventListener("dragenter", (event) => {
//   // event.preventDefault();
//   document.body.classList.add("dragging");
// });
document.body.addEventListener("dragover", (event) => {
  event.stopPropagation();
  event.preventDefault();

  if (store.getState().readlist) {
    return false;
  }
  // Style the drag-and-drop as a "copy file" operation.
  event.dataTransfer.dropEffect = "copy";
  document.body.classList.add("dragging");
});
// document.body.addEventListener("dragleave", (event) => {
//   document.body.classList.remove("dragging");
// });
// document.body.addEventListener("dragend", (event) => {
//   document.body.classList.remove("dragging");
// });
document.body.addEventListener("drop", (event) => {
  event.stopPropagation();
  event.preventDefault();

  if (store.getState().readlist) {
    return false;
  }

  document.body.classList.remove("dragging");

  const file = event.dataTransfer.files[0];
  let reader = new FileReader();
  reader.readAsText(file);
  reader.onloadend = () => {
    const json = JSON.parse(reader.result);
    // @TODO validate, then set initially
    store.dispatch({ type: "IMPORT_READLIST", readlist: json });
  };

  return false;
});

/* 

draggable="true"
              ondragover="event.preventDefault(); this.classList.add('login--highlight'); return false;"
              ondragleave="event.preventDefault();console.log('fired'); this.classList.remove('login--highlight'); return false;"
              ondrop="window.drop(event); this.classList.remove('login--highlight');"

*/

function importReadlistFromURL(url) {
  if (!isValidHttpUrl(url)) {
    store.dispatch({
      type: "SET_ERROR",
      error: "Failed to validate the remote Readlist. URL is incorrect.",
    });
    return Promise.reject();
  }

  return fetch(url)
    .then((res) => res.json())
    .then((dangerousReadlist) =>
      validateReadlist(dangerousReadlist, { verbose: true })
    )
    .then((readlist) => {
      if (!readlist) {
        store.dispatch({
          type: "SET_ERROR",
          error:
            "Failed to validate the remote Readlist. Check console for more details.",
        });
        return;
      }

      store.dispatch({ type: "IMPORT_READLIST", readlist });
    })
    .catch((e) => {
      console.error(e);
      store.dispatch({
        type: "SET_ERROR",
        // @TODO improve this error message
        error: "Failed to retrieve the remote Readlist file.",
      });
    });
}
