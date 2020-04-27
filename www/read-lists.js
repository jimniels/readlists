import { getLists } from "./api.js";

class ReadLists extends HTMLElement {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      lists: [],
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  connectedCallback() {
    getLists().then((lists) => {
      this.setState({ isLoading: false, lists });
    });
  }

  render() {
    const { isLoading, lists } = this.state;

    if (isLoading) {
      this.innerHTML = /*html*/ `<img src="./loading.svg" width="24" height="24" />`;
      return;
    }

    this.innerHTML = /*html*/ `
      <h1>Lists</h1>

      <ul>
        ${lists
          .map(
            (list) => /*html*/ `
          <li>
            <a href="./?id=${list.id}">${list.title}</a>
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
