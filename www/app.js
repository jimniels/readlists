import { dbx, createList } from "./api.js";

window.__DEV__ = window.location.hostname === "localhost";

const URL_PARAMS = new URLSearchParams(location.search);

class MyApp extends HTMLElement {
  constructor() {
    super();
    this.state = {
      isAuthenticated: false,
    };
  }

  connectedCallback() {
    this.innerHTML = /*html*/ `
      <header id="header">
        <h1><a href="./" id="home">Readlists</a></h1>
        <div>
          <button data-js-action="create-readlist">New Readlist</button>
          <button data-js-action="log-out">Log Out</button>
        </div>
      </header>
      <main id="main"></main>
      
      <div id="error" class="error" data-js-action="dismiss-error"></div>
    `;
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

    this.addEventListener("click", (e) => {
      if (e.target.dataset.jsAction === "create-readlist") {
        this.setAttribute("loading", true);
        createList()
          .then((id) => {
            let s = new URLSearchParams();
            s.set("id", id);
            window.location.search = s.toString();
          })
          .catch(() => {
            this.removeAttribute("loading");
            window.alert("Failed to create a new Readlist.");
          });
      } else if (e.target.dataset.jsAction === "dismiss-error") {
        this.removeAttribute("error");
      } else if (e.target.dataset.jsAction === "log-out") {
        window.sessionStorage.setItem("dbx-token", "");
        window.location.reload();
      }
    });

    this.authenticate();
  }

  static get observedAttributes() {
    return ["error"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "error") {
      if (newValue) {
        this.$error.innerHTML = newValue;
        this.$error.classList.add("error--visible");
      } else {
        this.$error.classList.remove("error--visible");
      }
    }
  }

  authenticate() {
    this.setAttribute("loading", true);

    const accessToken = sessionStorage.getItem("dbx-token");

    if (!accessToken) {
      this.removeAttribute("loading");
      this.renderMain();
      return;
    }

    // verify the token works, then set it.
    dbx.setAccessToken(accessToken);

    dbx
      .usersGetCurrentAccount()
      .then((res) => {
        if (__DEV__) console.log("Authenticated", res);
        this.state.isAuthenticated = true;
        this.renderMain();
        this.removeAttribute("error");
        // save token in local storage
      })
      .catch((err) => {
        console.error(err);
        this.setAttribute("error", "Failed to authenticate to Dropbox.");
        window.sessionStorage.setItem("dbx-token", "");
      })
      .then(() => {
        this.removeAttribute("loading", true);
      });
  }

  renderMain() {
    const { isAuthenticated } = this.state;

    if (!isAuthenticated) {
      this.$main.innerHTML = /*html*/ `
        <h2>Login Required</h2>
        <form data-js-action="submit-token">
          <label>Dropbox Token</label>
          <input type="text" />
          <button type="submit">Submit</button>
        </form>
      `;
      return;
    }

    const id = URL_PARAMS.get("id");

    if (id) {
      import("./read-list.js").then(() => {
        this.$main.innerHTML = `<read-list id="${id}""></read-list>`;
      });
    } else {
      import("./read-lists.js").then(() => {
        this.$main.innerHTML = `<read-lists></read-lists>`;
      });
    }
  }
}
customElements.define("my-app", MyApp);

// const dbx = new window.Dropbox.Dropbox({
//   accessToken:
//     "aWXTfAmKg0wAAAAAAAClNsQGZmJvXH4gYmrIbMZacBcDKVVTEyYtQ4DF0Axob2Ly",
//   fetch: window.fetch,
// });
// dbx
//   .filesSearch({ path: "", mode: "filename", query: "list.json" })
//   .then(console.log, console.error);
