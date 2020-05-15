import {
  putList,
  updateList,
  createArticle,
  deleteArticle,
  deleteReadlist,
  sync,
} from "./api.js";
import { store, selectActiveReadlist } from "./r.js";

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
          this.renderList();
          break;
      }
    });

    this.renderInitial();

    /**
     * Event Listeners
     */
    this.addEventListener("focusout", (e) => {
      const readlist = selectActiveReadlist(store.getState());
      if (e.target.id === "title" && e.target.textContent !== readlist.title) {
        this.handleUpdatePartOfReadlist({ title: e.target.textContent });
      } else if (
        e.target.id === "description" &&
        e.target.textContent !== readlist.description
      ) {
        this.handleUpdatePartOfReadlist({ description: e.target.textContent });
      }
    });

    this.addEventListener(
      "click",
      (e) => {
        const state = store.getState();

        switch (e.target.dataset.actionKey) {
          case "delete-article":
            const articleId = e.target.id;
            if (window.__DEV__)
              console.log(
                "Deleting article %s from list %s",
                articleId,
                list.id
              );

            //   const oldList = selectList(this.getAttribute("list-id"));
            // const newList = {
            //   ...oldList,
            //   articles: oldList.articles.filter(article => article.id != articleId)
            // };
            // dispatch({ })
            // this.syncList({ list, syncArticles: true });

            // putList(list).then(syncArticles).then()

            this.toggleLoading();
            deleteArticle(articleId, list.id)
              .then(() => {
                this.renderList();
              })
              .catch((err) => {
                console.error(err);
                $app.setAttribute("error", "Deleting the article failed");
              })
              .then(() => {
                this.toggleLoading();
              });
            break;
          case "delete-readlist":
            this.handleDeleteReadlist();
            break;
          case "select-article":
            const readlistArticleId = e.target.dataset.actionValue;
            store.dispatch({
              type: "SELECT_READLIST_ARTICLE",
              readlistArticleId:
                readlistArticleId == state.activeReadlistArticleId
                  ? ""
                  : readlistArticleId,
            });
            break;
        }
      },
      false
    );

    this.addEventListener("input", (e) => {
      if (e.target.dataset.jsAction === "change-article-order") {
        this.handleChangeArticleOrder(e);
      }
    });

    this.addEventListener("submit", (e) => {
      if (e.target.dataset.jsAction === "create-article") {
        this.handleCreateArticle(e);
      }
    });
  }

  /**
   * Loading indicator to show that a network event is happening
   */
  toggleLoading() {
    if ($app.hasAttribute("loading")) {
      $app.removeAttribute("loading");
    } else {
      $app.setAttribute("loading", true);
    }
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
      // Update app state
      store.dispatch({ type: "DELETE_READLIST", readlistId: readlist.id });

      // Sync app state
      sync.enqueue(() => deleteReadlist(readlist.id));
    }
  }

  /**
   * Sync a given a set of changes to a readlist.
   * @param {Object} readlistChanges - Partial Readlist object
   */
  handleUpdatePartOfReadlist(readlistUpdates) {
    const { activeReadlistId } = store.getState();
    store.dispatch({
      type: "UPDATE_READLIST",
      readlistId: activeReadlistId,
      readlistUpdates,
    });

    const newReadlist = selectActiveReadlist(store.getState());
    sync.enqueue(() => putList(newReadlist));
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
  handleCreateArticle(e) {
    e.preventDefault();
    const $input = e.target[0];
    that.toggleLoading();
    createArticle($input.value, that.getAttribute("list-id"))
      .then(() => {
        $input.value = "";
        that.renderList();
      })
      .catch((err) => {
        console.error(err);
        $app.setAttribute("error", "Failed to add a new article");
      })
      .then(() => {
        that.toggleLoading();
      });

    // postArticle().then(article => {
    //   store.dispatch({})
    //   sync() // sync should have posting an article as optional
    //   postArticle()
    // })
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
        <h1 id="title" contenteditable>${readlist.title}</h1>
        <br />
        <h2 id="description" contenteditable class="${
          readlist.description ? "" : "empty"
        }">${readlist.description ? readlist.description : "[Description]"}</h2>
        <br />
        <button data-action-key="delete-readlist">Delete</button>
        <button data-js-action="export-epub">Export as Epub</button>
        
      </header>
      <ul id="list"></ul>
      <form id="article-form" data-js-action="create-article">
        <input type="text" id="create-article" placeholder="Add URL...">
        <button type="submit">Add Article</button>
      </form>
    `;
      this.$title = this.querySelector("#title");
      this.$description = this.querySelector("#description");
      this.$list = this.querySelector("#list");

      this.renderList();
      this.removeAttribute("hidden");
    }, 300);
  }

  renderList() {
    const state = store.getState();
    const { activeReadlistId, activeReadlistArticleId } = state;
    const list = selectActiveReadlist(state);

    if (list.articles.length === 0) {
      this.$list.innerHTML = `<li>No articles</li>`;
      return;
    }

    const indexes = [...Array(list.articles.length).keys()];
    this.$list.innerHTML = /*html*/ `
        ${list.articles
          .map(
            (article, articleIndex) => /*html*/ `
            <li class="${
              article.id == activeReadlistArticleId ? "active" : ""
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
                <a href="${article.url}">${article.domain}</a>
                <h3>
                  <a
                    href="./data/${list.id}-${article.id}.article.html"
                    data-action-key="select-article"
                    data-action-value="${article.id}"
                    target="_blank">
                    ${article.title}
                  </a>
                </h3>
                <p>${article.excerpt}</p>
              </div>
              <button
                data-js-action="delete-article"
                id="${article.id}">
                Delete
              </button>
            </li>`
          )
          .join("")}
    `;
  }
}

customElements.define("readlist-view", ReadListView);
