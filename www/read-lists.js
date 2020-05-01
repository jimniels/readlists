import { getLists } from "./api.js";

const $app = document.querySelector("my-app");

class ReadLists extends HTMLElement {
  constructor() {
    super();
    $app.setAttribute("loading", true);

    this.state = {
      error: "",
      lists: [],
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  connectedCallback() {
    getLists()
      .then((lists) => {
        this.state.lists = lists;
        this.render();
      })
      .catch((err) => {
        console.error(err);
        $app.setAttribute("error", "Failed to load readlists from server.");
      })
      .then(() => {
        $app.removeAttribute("loading");
      });
  }

  render() {
    const { lists } = this.state;

    this.innerHTML = /*html*/ `
        <ul>
          ${lists
            .map(
              (list) => /*html*/ `
                <li>
                  <a href="./?id=${list.id}" id="${list.id}">${
                list.title
              }</a> <small>${list.articles.length} reads</small>
                  
                  <ul>
                    ${list.articles
                      .map((article) => `<li>${article.title}</li>`)
                      .join("")}
                  </ul>
                </li>
              `
            )
            .join("")}
        </ul>
      `;
  }
}

customElements.define("read-lists", ReadLists);
