import {
  dbx,
  getArticleHTML,
  getLists,
  updateList,
  sync,
  putList,
} from "./api.js";
import { store, selectActiveReadlistArticle } from "./r.js";

class ReadlistArticle extends HTMLElement {
  connectedCallback() {
    this.render();

    this.addEventListener("click", (e) => {
      // @TODO
      store.dispatch({
        type: "SELECT_READLIST_ARTICLE",
        readlistArticleId: "",
      });
    });

    store.subscribe(() => {
      const state = store.getState();
      const {
        lastActionType,
        activeReadlistId,
        activeReadlistArticleId,
      } = state;
      switch (lastActionType) {
        case "SELECT_READLIST":
          this.render();
          break;
        case "SELECT_READLIST_ARTICLE":
          // @TODO fetch article and render it
          this.setAttribute("loading", true);
          this.render();

          if (!activeReadlistArticleId) {
            return;
          }

          getArticleHTML({
            readlistId: activeReadlistId,
            readlistArticleId: activeReadlistArticleId,
          })
            .then((html) => {
              this.render(state, html);
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
            })
            .then(() => {
              this.removeAttribute("loading");
              // @TODO handle fail by trigger in app?
            });
          break;
      }
    });
  }

  render(state = {}, articleHTML) {
    const { activeReadlistId, activeReadlistArticleId } = state;

    if (activeReadlistId && activeReadlistArticleId) {
      this.removeAttribute("hidden");
    } else {
      this.setAttribute("hidden", true);
    }

    if (articleHTML) {
      const {
        author,
        date_published,
        domain,
        title,
        url,
      } = selectActiveReadlistArticle(state);
      this.innerHTML = /*html*/ `
        <div>
          <header>
            <a href="${url}" class="link" target="__blank">${domain}</a>
            ${date_published ? `<time>${date_published}</time>` : ""}
            <h1>${title}</h1>
            ${author ? `<p>${author}</p>` : ""}
          </header>
        
          ${articleHTML}
        </div>
        
      `;
    }
  }
}
customElements.define("readlist-article", ReadlistArticle);
