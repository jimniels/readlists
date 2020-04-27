import { getList } from "./api.js";
import { autoExpand } from "./utils.js";

class ReadList extends HTMLElement {
  constructor() {
    super();
    this.state = {
      id: Number(this.getAttribute("id")),
      isLoading: true,
      list: {},
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  connectedCallback() {
    this.innerHTML = `
      <header>
        <textarea id="title"></textarea>
        <textarea id="description"></textarea>
      </header>
      <section></section>
      <footer>
        <textarea id="new-article" placeholder="Add URL..."></textarea>
      </footer>
    `;
    this.$title = this.querySelector("#title");
    this.$description = this.querySelector("#description");

    Array.from(this.querySelectorAll("textarea")).forEach(($el) => {
      $el.addEventListener(
        "input",
        () => {
          autoExpand($el);
        },
        false
      );
    });

    this.$section = this.querySelector("section");
    this.$footer = this.querySelector("footer");

    getList(this.state.id).then((list) => {
      this.setState({ isLoading: false, list });
    });
  }

  render() {
    const { id, isLoading, list } = this.state;

    // if (isLoading) {
    //   // this.innerHTML = /*html*/ `<img src="./loading.svg" width="24" height="24" />`;
    //   return;
    // }

    this.$title.value = list.title;
    this.$description.value = list.description;

    this.$section.innerHTML = `
      <ul class="read-list">
        ${list.articles
          .map(
            (article) =>
              `<li><a href="./data/${id}-${article.id}.article.html" target="_blank">${article.title}</a></li>`
          )
          .join("")}
      </ul> 
    `;

    // this.renderList();
  }
}

customElements.define("read-list", ReadList);
