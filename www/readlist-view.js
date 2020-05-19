import {
  putList,
  putArticle,
  updateList,
  deleteReadlistArticle,
  deleteReadlist,
  sync,
  getArticleHTML,
  getMercuryArticle,
  createReadlistArticle,
} from "./api.js";
import { store, selectActiveReadlist, selectReadlistArticleById } from "./r.js";
import { autoExpand } from "./utils.js";

export class ReadListView extends HTMLElement {
  connectedCallback() {
    const state = store.getState();
    const list = selectActiveReadlist(state);

    store.subscribe(() => {
      const { lastActionType } = store.getState();

      switch (lastActionType) {
        case "DELETE_READLIST":
        case "SELECT_READLIST":
        case "CREATE_READLIST":
          this.renderInitial();
          break;
        case "SELECT_READLIST_ARTICLE":
        case "CREATE_READLIST_ARTICLE":
        case "DELETE_READLIST_ARTICLE":
          this.renderList();
          break;
      }
    });

    this.renderInitial();

    /**
     * Event Listeners
     */
    this.addEventListener("focusout", (e) => {
      switch (e.target.dataset.actionKey) {
        case "update-readlist":
          this.handleUpdatePartOfReadlist(e);
          break;
        case "update-readlist-article":
          console.log(e.target.value);
          const state = store.getState();
          const readlistArticle = selectReadlistArticleById(
            state,
            state.activeReadlistId,
            e.target.dataset.actionValue
          );
          if (readlistArticle.title != e.target.value) {
            store.dispatch({
              type: "UPDATE_READLIST_ARTICLE",
              readlistId: store.getState().activeReadlistId,
              readlistArticleId: e.target.dataset.actionValue,
              readlistArticleUpdates: { title: e.target.value },
            });
          }
          break;
      }
    });

    this.addEventListener("input", (e) => {
      if (e.target.tagName === "TEXTAREA") {
        autoExpand(e.target);
      }
    });

    this.addEventListener("click", (e) => {
      // console.log(e, e.target.closest("li"));
      switch (e.target.dataset.actionKey) {
        case "delete-article":
          this.handleDeleteReadlistArticle(e);
          break;
        case "delete-readlist":
          this.handleDeleteReadlist();
          break;
        case "select-article":
          this.handleSelectReadlistArticle(e);
          break;
      }
    });

    this.addEventListener("input", (e) => {
      if (e.target.dataset.jsAction === "change-article-order") {
        this.handleChangeArticleOrder(e);
      }
    });

    this.addEventListener("submit", (e) => {
      e.preventDefault();
      if (e.target.dataset.actionKey === "create-article") {
        this.handleCreateReadlistArticle(e);
      }
    });
  }

  handleSelectReadlistArticle(e) {
    const state = store.getState();
    const readlistArticleId = e.target.dataset.actionValue;
    store.dispatch({
      type: "SELECT_READLIST_ARTICLE",
      readlistArticleId:
        readlistArticleId == state.activeReadlistArticleId
          ? "" // deselect the current one
          : readlistArticleId, // select a new one
    });
  }

  /**
   * Delete the given readlist
   */
  handleDeleteReadlist(readlistId) {
    const readlist = selectActiveReadlist(store.getState());
    const articlesCount = readlist.articles.length;
    let msg = "Please confirm that you want to delete this Readlist";
    if (articlesCount.length > 0) {
      msg +=
        ` and its ${articlesCount} article` + (articlesCount === 1 ? "" : "s");
    }
    msg += ".";

    if (window.confirm(msg)) {
      store.dispatch({ type: "DELETE_READLIST", readlistId: readlist.id });
    }
  }

  /**
   * Sync a given a set of changes to a readlist.
   * @param {Object} readlistChanges - Partial Readlist object
   */
  handleUpdatePartOfReadlist(e) {
    const changeKey = e.target.dataset.actionValue;
    const value = e.target.value;
    const readlist = selectActiveReadlist(store.getState());

    if (readlist[changeKey] != value) {
      store.dispatch({
        type: "UPDATE_READLIST",
        readlistId: readlist.id,
        readlistUpdates: { [changeKey]: value },
      });
    }
  }

  /**
   * Handle when user changes order of readlist articles
   * @param {*} e
   */
  handleChangeArticleOrder(e) {
    e.target.blur();
    const articleId = e.target.dataset.articleId;
    const currentIndex = Number(e.target.dataset.currentIndex);
    const newIndex = Number(e.target.value);

    console.warn(
      "Switch article %s from index %s to index %s",
      articleId,
      currentIndex,
      newIndex
    );

    const readlist = selectList(this.getAttribute("list-id"));
    let newReadlist = {
      ...readlist,
      articles: readlist.articles.map((article) => ({ ...article })),
    };
    newReadlist.articles.splice(
      newIndex,
      0,
      newReadlist.articles.splice(currentIndex, 1)[0]
    );

    this.toggleLoading();
    updateList(newReadlist)
      .then(() => {
        this.renderList();
      })
      .catch((e) => {
        console.error(e);
        $app.setAttribute("error", "Failed to re-sort article list.");
      })
      .then(() => {
        this.toggleLoading();
      });
  }

  /**
   * Handlw when user creates a new article for a readlist
   * @param {*} e
   */
  handleCreateReadlistArticle(e) {
    const $input = e.target.elements[0];
    const $btn = e.target.elements[1];

    $btn.classList.add("loading");
    getMercuryArticle($input.value)
      .then((mercuryArticle) => {
        $input.value = "";
        store.dispatch({
          type: "CREATE_READLIST_ARTICLE",
          readlistId: store.getState().activeReadlistId,
          mercuryArticle,
        });
      })
      .catch((err) => {
        console.error(err);
        store.dispatch({
          type: "SET_ERROR",
          error: "There was a problem adding this URL as an article.",
        });
      })
      .then(() => {
        $btn.classList.remove("loading");
      });
  }

  handleDeleteReadlistArticle(e) {
    store.dispatch({
      type: "DELETE_READLIST_ARTICLE",
      readlistId: store.getState().activeReadlistId,
      readlistArticleId: e.target.dataset.actionValue,
    });
  }

  renderInitial() {
    const state = store.getState();
    const readlist = selectActiveReadlist(state);
    this.setAttribute("hidden", true);
    // no active readlist selected!
    if (!readlist) {
      return;
    }

    // conditionally set timeout? might not want to do this, idk
    setTimeout(() => {
      const d = new Date(readlist.id);
      const dFormatted = new Intl.DateTimeFormat("en-US").format(d);

      this.innerHTML = /*html*/ `
      <header>
        <time datetime="${d.toISOString()}">
          Created ${dFormatted}
        </time>
        <textarea
          class="title"
          placeholder="Title..."
          data-action-key="update-readlist"
          data-action-value="title">${readlist.title}</textarea>
        
        <textarea
          class="description"
          placeholder="Description..."
          data-action-key="update-readlist"
          data-action-value="description">${readlist.description}</textarea>
        
        <button class="button" data-js-action="export-epub">
          Export as Epub
        </button>          
        <button class="button button--danger" data-action-key="delete-readlist">
          Delete
        </button>
      </header>
      <ul class="articles"></ul>
      <form class="article article--create" data-action-key="create-article">
        <div>
          <input
            name="article-url"
            type="text"
            placeholder="http://your-article-url.com/goes/here"
          />
        </div>
        <button class="button" type="submit">
          Add
        </button>
      </form>
    `;
      this.$title = this.querySelector("#title");
      this.$description = this.querySelector("#description");
      this.$articles = this.querySelector(".articles");
      // this.querySelectorAll("textarea").forEach(($el) => {
      //   autoExpand($el);
      // });
      this.renderList();
      this.removeAttribute("hidden");
    }, 300);
  }

  renderList() {
    const state = store.getState();
    const { activeReadlistId, activeReadlistArticleId } = state;
    const list = selectActiveReadlist(state);

    const indexes = [...Array(list.articles.length).keys()];
    this.$articles.innerHTML = /*html*/ `
        ${list.articles
          .map(
            (article, articleIndex) => /*html*/ `
            <li
              data-action-key="select-article"
              data-action-value="${article.id}"
              class="article ${
                article.id == activeReadlistArticleId ? "article--active" : ""
              }">
              <select
                data-js-action="change-article-order"
                data-current-index="${articleIndex}"
                data-article-id="${article.id}">
                ${indexes.map(
                  (index) =>
                    `<option
                      value="${index}"
                      ${index === articleIndex ? "selected" : ""}>
                      ${index + 1}
                    </option>`
                )}
              </select>
              <div>
                <p class="article__domain">${article.domain}</p>
                <textarea
                  class="article__title"
                  placeholder="Article Name..."
                  data-action-key="update-readlist-article"
                  data-action-value="${article.id}"
                >${article.title}</textarea>    
                <p class="article__excerpt">${article.excerpt}</p>
              </div>
              <button
                class="button button--danger"
                data-action-key="delete-article"
                data-action-value="${article.id}">
                Delete
              </button>
              <button
                class="button"
                data-action-key="view-article"
                data-action-value="${article.id}">
                View
              </button>
            </li>`
          )
          .join("")}
    `;

    // Auto-expand all the textarea(s)
    Array.from(this.$articles.querySelectorAll("textarea")).forEach(($el) => {
      autoExpand($el);
    });
  }
}

customElements.define("readlist-view", ReadListView);
