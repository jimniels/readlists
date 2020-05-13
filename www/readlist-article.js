import {
  dbx,
  getArticleHTML,
  getLists,
  updateList,
  sync,
  putList,
} from "./api.js";
import { store, selectList } from "./redux.js";
import { store as s } from "./r.js";

class ReadlistArticle extends HTMLElement {
  constructor() {
    super();
    this.articleHTML = "";
    this.loading = false;
  }

  connectedCallback() {
    this.render();

    this.addEventListener("click", (e) => {
      // @TODO
      s.dispatch({ type: "DESELECT_READLIST_ARTICLE" });
    });

    s.subscribe(() => {
      const state = s.getState();
      const {
        lastActionType,
        activeReadlistId,
        activeReadlistArticleId,
      } = state;
      switch (lastActionType) {
        case "DESELECT_READLIST_ARTICLE":
        case "SELECT_READLIST":
          this.render();
          break;
        case "SELECT_READLIST_ARTICLE":
          // @TODO fetch article and render it
          this.setAttribute("loading", true);
          this.render();

          getArticleHTML({
            readlistId: activeReadlistId,
            readlistArticleId: activeReadlistArticleId,
          })
            .then((html) => {
              this.render({ ...state, articleHTML: html });
            })
            .catch((err) => {
              console.error(err);
            })
            .then(() => {
              this.removeAttribute("loading");
              // @TODO handle fail by trigger in app?
            });
          break;
      }
    });
  }

  render(state = {}) {
    const { activeReadlistId, activeReadlistArticleId, articleHTML } = state;

    if (activeReadlistId && activeReadlistArticleId) {
      this.removeAttribute("hidden");
    } else {
      this.setAttribute("hidden", true);
    }

    if (articleHTML) {
      this.innerHTML = articleHTML;
    }
  }
}
customElements.define("readlist-article", ReadlistArticle);
