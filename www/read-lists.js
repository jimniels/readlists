import { getLists } from "./api.js";

class ReadLists extends HTMLElement {
  constructor() {
    super();
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
    this.innerHTML = `<img src="./loading.svg" width="36" height="36" alt="Loading indicator" />`;
    getLists()
      .then((lists) => {
        this.setState({
          lists,
        });
      })
      .catch((e) => {
        this.setState({ error: e });
      });
  }

  render() {
    const { lists, error } = this.state;

    if (error) {
      this.innerHTML = `<div style="color: red">Something went wrong loading your readlist.</div>`;
    } else {
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
}

customElements.define("read-lists", ReadLists);
