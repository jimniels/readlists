import { store } from "./r.js";

class ReadlistsNav extends HTMLElement {
  connectedCallback() {
    this.render(store.getState());

    store.subscribe(() => {
      const state = store.getState();
      switch (state.lastActionType) {
        case "INIT":
          this.render(state);
        case "SELECT_READLIST":
        case "CREATE_READLIST":
          this.render(state);
          break;
      }
    });

    this.addEventListener("click", (e) => {
      if (e.target.href) {
        e.preventDefault();
      }

      switch (e.target.dataset.actionKey) {
        case "select-list":
          const readlistId = e.target.dataset.actionValue;
          store.dispatch({
            type: "SELECT_READLIST",
            readlistId:
              store.getState().activeReadlistId == readlistId ? "" : readlistId,
          });
          break;
        case "log-out":
          window.sessionStorage.setItem("dbx-token", "");
          window.location.reload();
          break;
      }
    });
  }

  // handleCreateReadlist() {
  //   // Create a new readlist in the app
  //   store.dispatch({ type: "NEW_READLIST" });
  //   const state = store.getState();
  //   const newList = state.lists[state.lists.length - 1];

  //   // Navigate to the new readlist
  //   this.setAttribute("list-id", newList.id);

  //   // Sync it
  //   sync.enqueue(() => putList(newList));
  // }

  render(state) {
    const { activeReadlistId, user, readlists } = state;

    this.innerHTML = /*html*/ `
      <header class="header">
        <h1>
          <a href="./" id="home" data-js-action="navigate-to-home">
            Readlists
          </a>
        </h1>
        <button>+</button>
      </header>
      <ul>
        ${readlists
          .map(
            (readlist) => /*html*/ `
              <li>
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
        <button data-action="log-out">Log Out</button>
      </footer>
    `;
  }
}

customElements.define("readlists-nav", ReadlistsNav);
