import { store } from "./redux.js";
import { store as s } from "./r.js";

const $app = document.querySelector("my-app");

class ReadLists extends HTMLElement {
  connectedCallback() {
    this.render();

    // let currentState = s.getState();
    // const handleChange = () => {
    //   let previousState = currentState;
    //   currentState = s.getState();

    //   if (previousState.readlists != currentState.readlists) {
    //     console.log("`readlists` changed");
    //   }
    // };
    // s.subscribe(handleChange);

    s.subscribe(() => {
      const { lastActionType } = s.getState();
      switch (lastActionType) {
        case "SELECT_READLIST":
        case "CREATE_READLIST":
          this.render();
          break;
      }
    });
  }

  render() {
    const { lists } = store.getState();
    const { activeReadlistId, user } = s.getState();

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
        ${lists
          .map(
            (list) => /*html*/ `
              <li>
                <a
                  href="./id?${list.id}"
                  class="${activeReadlistId == list.id ? "active" : ""}"
                  data-action-key="select-list"
                  data-action-value="${list.id}"
                  data-count="${list.articles.length}">
                  <h2>${list.title}</h2>
                  ${list.description ? `<p>${list.description}</p>` : ""}
                </a>
              </li>
            `
          )
          .join("")}
      </ul>
      <footer class="header__buttons">
        <p>${user}</p>
        <a href="./" data-action="log-out" class="link">Log Out</button>
      </footer>
    `;
  }
}

customElements.define("read-lists", ReadLists);
