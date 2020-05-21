import {
  dbx,
  getArticleHTML,
  getLists,
  updateList,
  sync,
  putList,
} from "./api.js";
import { store, selectActiveReadlistArticle } from "./r.js";
import { formatDate } from "./utils.js";

class ReadlistArticle extends HTMLElement {
  constructor() {
    super();
    this.setAttribute("hidden", true);
  }

  connectedCallback() {
    this.innerHTML = `<div id="container"></div>`;
    this.$container = this.querySelector("#container");

    this.addEventListener("click", (e) => {
      // @TODO
      store.dispatch({
        type: "SELECT_READLIST_ARTICLE",
        readlistArticleId: "",
      });
    });

    store.subscribe(() => {
      const state = store.getState();
      const { lastAction, activeReadlistId, activeReadlistArticleId } = state;
      switch (lastAction.type) {
        case "SELECT_READLIST_ARTICLE":
          if (!activeReadlistArticleId) {
            this.setAttribute("hidden", true);
            return;
          }

          this.setAttribute("data-is-loading", true);
          this.removeAttribute("hidden");
          getArticleHTML({
            readlistId: activeReadlistId,
            readlistArticleId: activeReadlistArticleId,
          })
            .then((html) => {
              this.renderHTML(state, html);
              this.removeAttribute("data-is-loading", true);
            })
            .catch((err) => {
              console.error(err);
              store.dispatch({
                type: "SET_ERROR",
                error:
                  "Failed to load the target article. It may be missing from the server. Try loading it again or try deleting it and re-adding it.",
              });
              store.dispatch({
                type: "SELECT_READLIST_ARTICLE",
                activeReadlistArticleId: "",
              });
            });
          break;
      }
    });
  }

  renderLoading(state) {
    const { activeReadlistArticleId } = state;
    const html = /*html*/ `
      <div>
        <img src="./loading.svg" />
      </div>
    `;

    if (activeReadlistArticleId) {
      this.innerHTML = html;
      this.removeAttribute("hidden");
    } else {
      this.setAttribute("hidden", true);
      this.innerHTML = html;
    }
  }

  renderHTML(state = {}, articleHTML) {
    const { activeReadlistId, activeReadlistArticleId } = state;

    const {
      author,
      date_published,
      domain,
      title,
      url,
    } = selectActiveReadlistArticle(state);
    this.$container.innerHTML = /*html*/ `
        
          <header>
            <a href="${url}" class="link" target="__blank">
              ${domain}
            </a>
            ${
              date_published ? `<time>${formatDate(date_published)}</time>` : ""
            }
            <h1>${title}</h1>
            ${author ? `<p>${author}</p>` : ""}
          </header>
        
          ${articleHTML}
        
        
      `;
  }
}
customElements.define("readlist-article", ReadlistArticle);
