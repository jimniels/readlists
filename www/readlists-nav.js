import { store } from "./r.js";
import { putList, sync } from "./api.js";
import { eventHandler, formatDate } from "./utils.js";

class ReadlistsNav extends HTMLElement {
  connectedCallback() {
    this.render(store.getState());

    store.subscribe(() => {
      const state = store.getState();
      switch (state.lastActionType) {
        // it's ok to re-render everything because 1st element in list will be selected
        case "CREATE_READLIST":
        case "DELETE_READLIST":
        case "UPDATE_READLIST":
        case "CREATE_READLIST_ARTICLE": // update count
          this.render(state);
          break;
        case "SELECT_READLIST":
          this.render__selectActiveList(state);
          break;
      }
    });
  }

  handleSelectList(e) {
    e.preventDefault();
    const readlistId = e.target.href.split("readlist-id=")[1];
    const { activeReadlistId } = store.getState();

    store.dispatch({
      type: "SELECT_READLIST",
      readlistId: activeReadlistId == readlistId ? "" : readlistId,
    });
  }

  handleLogOut() {
    window.sessionStorage.setItem("dbx-token", "");
    window.location.reload();
  }

  handleCreateReadlist() {
    store.dispatch({ type: "CREATE_READLIST" });
  }

  render(state) {
    const { activeReadlistId, user, readlists } = state;

    this.innerHTML = /*html*/ `
      <header class="header">
        <h1>
          Readlists
        </h1>
        <button onclick="${eventHandler(
          "readlists-nav",
          "handleCreateReadlist"
        )}">
          <span>+</span>
        </button>
      </header>
      <ul>
        ${readlists
          .map((readlist) => {
            let title = readlist.title;
            if (title.length > 58) {
              title = title.slice(0, 58) + "…";
            }

            return /*html*/ `
              <li id="readlist-${readlist.id}">
                <a
                  href="./?readlist-id=${readlist.id}"
                  class="${activeReadlistId == readlist.id ? "active" : ""}"
                  onclick="${eventHandler("readlists-nav", "handleSelectList")}"
                  data-count="${readlist.articles.length}">
                  ${title ? /*html*/ `<h2>${title}</h2>` : ""}
                  <p>${formatDate(readlist.id)}</p>
                </a>
              </li>
            `;
          })
          .join("")}
      </ul>
      <footer class="header__buttons">
        <p>${user}</p>
        <button
          class="button button--danger"
          onclick="${eventHandler("readlists-nav", "handleLogOut")}">
          Log Out
        </button>
      </footer>
    `;
  }

  render__selectActiveList(state) {
    const { activeReadlistId } = state;
    const active = this.querySelector(".active");
    if (active) {
      active.classList.remove("active");
    }
    const newActive = this.querySelector(`#readlist-${activeReadlistId} a`);
    if (newActive) {
      newActive.classList.add("active");
    }
  }
}

customElements.define("readlists-nav", ReadlistsNav);
