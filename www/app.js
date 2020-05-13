// @TODO rename list to readlist

import { store as s } from "./r.js";

import { dbx, getLists, updateList, sync, putList } from "./api.js";
import { store, selectList } from "./redux.js";
import "./read-lists.js";
import "./read-list.js";
import "./readlist-article.js";

window.__DEV__ = window.location.hostname === "localhost";
if (__DEV__) window.store = store;

class MyApp extends HTMLElement {
  constructor() {
    super();
    // const urlParams = new URLSearchParams(location.search);
    // const listId = urlParams.get("list-id");
    // if (listId) {
    //   this.setAttribute("list-id", listId);
    // }
    this.state = {
      isAuthenticated: false,
      auth: "PRELOAD", // PRELOAD, LOADING, LOADED, LOAD_ERROR
    };
  }

  connectedCallback() {
    this.innerHTML = /*html*/ `
      <!-- <header id="header">
        <h1>
          <a href="./" id="home" data-js-action="navigate-to-home">
            Readlists
          </a>
        </h1>
        <div id="header__buttons" hidden>
          <button data-js-action="create-readlist">New Readlist</button>
          <button data-js-action="log-out">Log Out</button>
        </div>
      </header> -->
      <main id="main"></main>
      
      <div id="error" class="error" data-js-action="dismiss-error"></div>
    `;
    // this.$headerBtns = this.querySelector("#header__buttons");
    this.$main = this.querySelector("#main");
    this.$error = this.querySelector("#error");

    this.addEventListener("submit", (e) => {
      if (e.target.dataset.jsAction === "submit-token") {
        e.preventDefault();
        const accessToken = e.target.elements[0].value;
        window.sessionStorage.setItem("dbx-token", accessToken);
        this.authenticate();
      }
    });

    // this.addEventListener("click", (e) => {
    //   switch (e.target.dataset.jsAction) {
    //     case "create-readlist":
    //       this.handleCreateReadlist();
    //       break;
    //     case "dismiss-error":
    //       this.removeAttribute("error");
    //       break;
    //     case "log-out":
    //       window.sessionStorage.setItem("dbx-token", "");
    //       window.location.reload();
    //       break;
    //     case "navigate-to-home":
    //       e.preventDefault();
    //       this.removeAttribute("list-id");
    //       break;
    //   }
    // });

    this.authenticate();
  }

  handleCreateReadlist() {
    // Create a new readlist in the app
    store.dispatch({ type: "NEW_READLIST" });
    const state = store.getState();
    const newList = state.lists[state.lists.length - 1];

    // Navigate to the new readlist
    this.setAttribute("list-id", newList.id);

    // Sync it
    sync.enqueue(() => putList(newList));
  }

  static get observedAttributes() {
    return ["error"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "error") {
      if (newValue) {
        this.$error.innerHTML = newValue;
        this.$error.classList.add("error--visible");
        setTimeout(() => {
          this.$error.classList.remove("error--visible");
        }, 5000); // matches 5s in css animation
      } else {
        this.$error.classList.remove("error--visible");
      }
    }
    // if (name === "list-id") {
    //   if (__DEV__)
    //     console.warn(
    //       "changed `readlist` attr from %s to %s",
    //       oldValue,
    //       newValue
    //     );
    //   let newurl =
    //     window.location.protocol +
    //     "//" +
    //     window.location.host +
    //     window.location.pathname +
    //     (newValue ? `?list-id=${newValue}` : "");
    //   window.history.pushState({ path: newurl }, "", newurl);
    //   this.render();
    // }
  }

  authenticate() {
    const accessToken = sessionStorage.getItem("dbx-token");
    if (!accessToken) {
      this.render();
      return;
    }

    this.state.auth = "LOADING";
    this.render();

    // verify the token works, then set it.
    dbx.setAccessToken(accessToken);

    let user = "";
    dbx
      .usersGetCurrentAccount()
      .then((res) => {
        user = res.email;
        return getLists();
      })
      .then((lists) => {
        if (__DEV__) console.warn("Authenticated");
        this.state.auth = "LOADED";
        s.dispatch({ type: "INIT", readlists: lists, user });
        store.dispatch({ type: "INIT", lists });
      })
      .catch((err) => {
        console.error(err);
        this.setAttribute(
          "error",
          "Failed to authenticate and retrieve Readlists."
        );
        this.state.auth = "LOAD_ERROR";
        window.sessionStorage.setItem("dbx-token", "");
      })
      .then(() => {
        this.render();
      });

    // dbx
    //   .usersGetCurrentAccount()
    //   .then((res) => {

    //     this.state.isAuthenticated = true;
    //     this.render();
    //     this.removeAttribute("error");
    //     // save token in local storage
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     this.setAttribute("error", "Failed to authenticate to Dropbox.");
    //     window.sessionStorage.setItem("dbx-token", "");
    //   })
    //   .then(() => {
    //     this.removeAttribute("loading", true);
    //   });
  }

  render() {
    const { auth, isAuthenticated } = this.state;

    if (auth !== "LOADED") {
      this.$main.innerHTML = /*html*/ `
        <form data-js-action="submit-token">
          <label>Dropbox Token</label>
          <input type="text" />
          <button class="${auth === "LOADING" ? "loading" : ""}" type="submit">
            Submit
          </button>
        </form>
      `;
      return;
    }

    // this.$headerBtns.removeAttribute("hidden");
    this.$main.innerHTML = `<readlists-app></readlists-app>`;
    return;

    // const listId = this.getAttribute("list-id");
    // if (listId) {
    //   this.$main.innerHTML = `<read-list id="${listId}""></read-list>`;
    // } else {
    //   this.$main.innerHTML = `<read-lists></read-lists>`;
    // }
  }
}
customElements.define("my-app", MyApp);

class ReadlistsApp extends HTMLElement {
  constructor() {
    super();
    const urlParams = new URLSearchParams(location.search);
    const listId = urlParams.get("list-id");
    if (listId) {
      this.setAttribute("list-id", listId);
    }
  }

  static get observedAttributes() {
    return ["list-id", "article-id"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "list-id") {
      if (__DEV__)
        console.warn(
          "changed `readlist` attr from %s to %s",
          oldValue,
          newValue
        );
      let newurl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        (newValue ? `?list-id=${newValue}` : "");
      window.history.pushState({ path: newurl }, "", newurl);
      // this.renderReadlist();
      // this.renderArticle();
      this.$readlists.setAttribute("list-id", newValue);
      this.$readlist.setAttribute("list-id", newValue);
      this.$readlistArticle.setAttribute("list-id", newValue);
      this.$readlistArticle.removeAttribute("article-id");
    } else if (name === "article-id") {
      console.log("test");
      this.$readlistArticle.setAttribute("article-id", newValue);
      this.$readlistArticle.setAttribute(
        "list-id",
        this.getAttribute("list-id")
      );
    }
  }

  connectedCallback() {
    this.innerHTML = `
      <read-lists></read-lists>
      <read-list></read-list>
      <readlist-article></readlist-article>
    `;
    this.$readlists = this.querySelector("read-lists");
    this.$readlist = this.querySelector("read-list");
    this.$readlistArticle = this.querySelector("readlist-article");

    this.addEventListener("click", (e) => {
      console.log(e.target);
      if (e.target.href) {
        e.preventDefault();
      }

      switch (e.target.dataset.actionKey) {
        case "select-list":
          s.dispatch({
            type: "SELECT_READLIST",
            readlistId: e.target.dataset.actionValue,
          });
          // this.setAttribute("list-id", e.target.dataset.actionValue);
          break;
        case "select-article":
          s.dispatch({
            type: "SELECT_READLIST_ARTICLE",
            readlistArticleId: e.target.dataset.actionValue,
          });
          // this.setAttribute("article-id", e.target.dataset.actionValue);
          break;
        case "log-out":
          window.sessionStorage.setItem("dbx-token", "");
          window.location.reload();
          break;
      }
      switch (e.target.dataset.jsAction) {
        case "create-readlist":
          this.handleCreateReadlist();
          break;
        case "dismiss-error":
          this.removeAttribute("error");
          break;
        case "navigate-to-home":
          e.preventDefault();
          this.removeAttribute("list-id");
          break;
        case "navigate-to-list":
          e.preventDefault();
          this.setAttribute("list-id", e.target.id);
          break;
      }
    });
  }
}
customElements.define("readlists-app", ReadlistsApp);

// const dbx = new window.Dropbox.Dropbox({
//   accessToken:
//     "aWXTfAmKg0wAAAAAAAClNsQGZmJvXH4gYmrIbMZacBcDKVVTEyYtQ4DF0Axob2Ly",
//   fetch: window.fetch,
// });
// dbx
//   .filesSearch({ path: "", mode: "filename", query: "list.json" })
//   .then(console.log, console.error);
