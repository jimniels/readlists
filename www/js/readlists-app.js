import { store } from "./redux.js";
import { eventHandler, html } from "./utils.js";

class ReadlistsApp extends HTMLElement {
  connectedCallback() {
    // @TODO check and see if there's anything in the URL bar to pre-load one
    let readlist = localStorage.getItem("readlist");

    if (readlist) {
      store.dispatch({
        type: "IMPORT_READLIST",
        readlist: JSON.parse(readlist),
      });
    }
    this.render(store.getState());

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
        case "SET_ERROR":
          this.renderError(state);
          break;
      }
    });
  }

  handleCreateNewReadlist() {
    store.dispatch({ type: "CREATE_READLIST" });
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
                Create New Readlist
              </button>
              <!--
              <form
                class="login__form"
                onsubmit="${eventHandler("readlists-app", "handleLogIn")}"
              >
                <input type="text" name="user" placeholder="User ID" />
                <button id="login" class="button button--block" type="submit">
                  Log In
                </button>
              </form>
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
      <div id="error" class="error"></div>
    `;
    this.$error = this.querySelector("#error");
  }

  renderError(state) {
    const { error } = state;

    if (error) {
      this.$error.innerHTML = error;
      this.$error.classList.add("error--visible");
      setTimeout(() => {
        store.dispatch({ type: "SET_ERROR", error: "" });
      }, 5000); // matches 5s in css animation
    } else {
      this.$error.classList.remove("error--visible");
    }
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
