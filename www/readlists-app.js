import "./readlists-nav.js";
import "./readlist-view.js";
import "./readlist-article.js";
import { store } from "./redux.js";
import { dbx, getLists } from "./api.js";
import { eventHandler, html } from "./utils.js";

window.__DEV__ = window.location.hostname === "localhost";

class ReadlistsApp extends HTMLElement {
  connectedCallback() {
    this.authenticate();

    store.subscribe(() => {
      const state = store.getState();
      switch (state.lastAction.type) {
        case "INIT":
          this.render(state);
          break;
        case "SET_ERROR":
          this.renderError(state);
          break;
      }
    });
  }

  handleLogIn(e) {
    e.preventDefault();
    const user = e.target.elements[0].value;
    const accessToken = e.target.elements[1].value;
    window.sessionStorage.setItem("dbx-token", accessToken);
    window.sessionStorage.setItem("user", user);
    this.authenticate();
  }

  authenticate() {
    const state = store.getState();
    const accessToken = sessionStorage.getItem("dbx-token");
    const user = sessionStorage.getItem("user");

    // If there's no accesstoken in local memory, go ahead and render the app
    if (!accessToken || !user) {
      this.render(state);
      return;
    }

    // otherwise, try authenticating with that access token
    dbx.setAccessToken(accessToken);

    // If the login form is on screen
    this.toggleLoginBtn();

    dbx
      .usersGetCurrentAccount()
      .then((res) => {
        store.dispatch({ type: "AUTHENTICATE", user });
        if (__DEV__) console.warn("Authenticated", res);
        return getLists();
      })
      .then((readlists) => {
        store.dispatch({ type: "INIT", readlists });
      })
      .catch((err) => {
        console.error(err);
        store.dispatch({
          type: "SET_ERROR",
          error: "Failed to authenticate and retrieve your Readlists.",
        });
        window.sessionStorage.setItem("dbx-token", "");
        window.sessionStorage.setItem("user", "");
        this.toggleLoginBtn();
      });
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
    this.innerHTML = html`
      ${user
        ? html`
            <readlists-nav></readlists-nav>
            <readlist-view></readlist-view>
            <readlist-article></readlist-article>
          `
        : html`
            <form
              class="login"
              onsubmit="${eventHandler("readlists-app", "handleLogIn")}"
            >
              <input type="text" name="user" placeholder="User ID" />
              <input type="text" name="token" placeholder="Token" />
              <button id="login" class="button button--block" type="submit">
                Log In
              </button>
            </form>
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

// const dbx = new window.Dropbox.Dropbox({
//   accessToken:
//   fetch: window.fetch,
// });
// dbx
//   .filesSearch({ path: "", mode: "filename", query: "list.json" })
//   .then(console.log, console.error);
