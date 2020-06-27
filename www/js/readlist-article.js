import { store } from "./redux.js";
import { html, formatDate } from "./utils.js";

class ReadlistArticle extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = html`<div id="container"></div>`;
    this.$container = this.querySelector("#container");

    this.addEventListener("click", (e) => {
      // @TODO
      store.dispatch({
        type: "SELECT_READLIST_ARTICLE",
        readlistArticleUrl: "",
      });
    });

    store.subscribe(() => {
      const state = store.getState();

      switch (state.lastAction.type) {
        case "SELECT_READLIST_ARTICLE":
          this.render(state);
          break;
      }
    });
  }

  render(state = {}) {
    const { readlist, readlistArticleUrl } = state;

    if (!readlistArticleUrl) {
      this.setAttribute("hidden", true);
      document.body.style.overflow = "auto";
      return;
    }

    const {
      author,
      content,
      date_published,
      domain,
      title,
      url,
    } = readlist.articles.find((article) => article.url == readlistArticleUrl);

    this.$container.innerHTML = html`
      <header>
        <a href="${url}" class="link" target="__blank">
          ${url}
        </a>
        ${date_published && html`<time>${date_published}</time>`}
        <h1>${title}</h1>
        ${author && html`<p>${author}</p>`}
      </header>

      ${content}
    `;

    document.body.style.overflow = "scroll";
    this.removeAttribute("hidden");
  }
}
customElements.define("readlist-article", ReadlistArticle);
