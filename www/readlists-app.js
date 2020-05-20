// @TODO rename list to readlist
import "./readlists-nav.js";
import "./readlist-view.js";
import "./readlist-article.js";
import { store } from "./r.js";
import { dbx, getLists } from "./api.js";

window.__DEV__ = window.location.hostname === "localhost";

class ReadlistsApp extends HTMLElement {
  connectedCallback() {
    this.authenticate();

    store.subscribe(() => {
      const state = store.getState();
      switch (state.lastActionType) {
        case "INIT":
          this.render(state);
          break;
        case "SET_ERROR":
          console.log("firing");
          this.renderError(state);
          break;
      }
    });

    this.addEventListener("submit", (e) => {
      e.preventDefault();

      switch (e.target.dataset.actionKey) {
        case "log-in":
          const user = e.target.elements[0].value;
          const accessToken = e.target.elements[1].value;
          window.sessionStorage.setItem("dbx-token", accessToken);
          this.authenticate();
          break;
      }
    });

    this.addEventListener("click", (e) => {
      if (e.target.href) {
        if (!e.target.classList.contains("link")) {
          e.preventDefault();
        }
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
  }

  authenticate() {
    const state = store.getState();
    const accessToken = sessionStorage.getItem("dbx-token");

    // If there's no accesstoken in local memory, go ahead and render the app
    if (!accessToken) {
      this.render(state);
      return;
    }

    // otherwise, try authenticating with that access token
    dbx.setAccessToken(accessToken);

    // If the login form is on screen
    this.toggleLoginBtn();

    let user = "";
    dbx
      .usersGetCurrentAccount()
      .then((res) => {
        user = res.email;
        if (__DEV__) console.warn("Authenticated", res);
        return getLists();
      })
      .then((readlists) => {
        store.dispatch({ type: "INIT", readlists, user });
      })
      .catch((err) => {
        console.error(err);
        store.dispatch({
          type: "SET_ERROR",
          error: "Failed to authenticate and retrieve your Readlists.",
        });
        window.sessionStorage.setItem("dbx-token", "");
        this.toggleLoginBtn();
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

  toggleLoginBtn() {
    const $btn = this.querySelector("#login");
    if ($btn) {
      $btn.setAttribute("disabled", true);
      $btn.classList.add("loading");
    }
  }

  render(state) {
    const { user } = state;
    this.innerHTML = /*html*/ `
      ${
        user
          ? `
              <readlists-nav></readlists-nav>
              <readlist-view></readlist-view>
              <readlist-article></readlist-article>
            `
          : `<form data-action-key="log-in">
              <input type="text" placeholder="Username" />
              <input type="text" placeholder="Token" />
              <button id="login" class="button" type="submit">
                Log In
              </button>
            </form>`
      }
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

// const dbx = new window.Dropbox.Dropbox({
//   accessToken:
//   fetch: window.fetch,
// });
// dbx
//   .filesSearch({ path: "", mode: "filename", query: "list.json" })
//   .then(console.log, console.error);
