import { store } from "./r.js";
import { putList, sync } from "./api.js";

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

    this.addEventListener("click", (e) => {
      if (e.target.href) {
        e.preventDefault();
      }

      switch (e.target.dataset.actionKey) {
        case "select-list":
          this.handleSelectList(e.target.dataset.actionValue);
          break;
        case "create-readlist":
          this.handleCreateReadlist();
          break;
        case "log-out":
          this.handleLogOut();
          break;
      }
    });
  }

  handleSelectList(readlistId) {
    store.dispatch({
      type: "SELECT_READLIST",
      readlistId:
        store.getState().activeReadlistId == readlistId ? "" : readlistId,
    });
  }

  handleLogOut() {
    window.sessionStorage.setItem("dbx-token", "");
    window.location.reload();
  }

  handleCreateReadlist() {
    // Create a new readlist in the app
    store.dispatch({ type: "CREATE_READLIST" });
    const state = store.getState();
    const newReadlist = state.readlists[0];

    // Sync things
    sync.enqueue(() => putList(newReadlist));
  }

  render(state) {
    const { activeReadlistId, user, readlists } = state;

    this.innerHTML = /*html*/ `
      <header class="header">
        <h1>
          Readlists
        </h1>
        <button data-action-key="create-readlist"><span>+</span></button>
      </header>
      <ul>
        ${readlists
          .map(
            (readlist) => /*html*/ `
              <li id="readlist-${readlist.id}">
                <a
                  href="./id?${readlist.id}"
                  class="${activeReadlistId == readlist.id ? "active" : ""}"
                  data-action-key="select-list"
                  data-action-value="${readlist.id}"
                  data-count="${readlist.articles.length}">
                  <h2>${readlist.title}</h2>
                  ${
                    readlist.description ? `<p>${readlist.description}</p>` : ""
                  }
                </a>
              </li>
            `
          )
          .join("")}
      </ul>
      <footer class="header__buttons">
        <p>${user}</p>
        <button data-action="log-out" class="button button--danger">
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
