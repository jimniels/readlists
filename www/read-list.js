import {
  putList,
  updateList,
  createArticle,
  deleteArticle,
  deleteReadlist,
  sync,
} from "./api.js";
import { store, selectList } from "./redux.js";
import { store as s } from "./r.js";

const $app = document.querySelector("my-app");

export class ReadList extends HTMLElement {
  connectedCallback() {
    const state = store.getState();
    const list = selectList(this.getAttribute("list-id"));

    s.subscribe(() => {
      const { lastActionType } = s.getState();
      console.log(lastActionType);
      switch (lastActionType) {
        case "SELECT_READLIST":
          this.renderInitial();
          break;
      }
    });

    if (!list) {
      this.innerHTML = /*html*/ `
          <p>The specificed list cannot be found.</p>
          <p><a href="/" data-js-action="navigate-to-home">View all Readlists</a></p>
        `;
      return;
    }

    this.renderInitial();

    /**
     * Event Listeners
     */
    this.addEventListener("focusout", (e) => {
      if (e.target.id === "title" && e.target.textContent !== list.title) {
        this.handleUpdatePartOfReadlist({ title: e.target.textContent });
      } else if (
        e.target.id === "description" &&
        e.target.textContent !== list.description
      ) {
        this.handleUpdatePartOfReadlist({ description: e.target.textContent });
      }
    });

    this.addEventListener(
      "click",
      (e) => {
        switch (e.target.dataset.jsAction) {
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
  handleDeleteReadlist() {
    const readlist = selectList(this.getAttribute("list-id"));
    const articlesCount = readlist.articles.length;
    let msg = "Please confirm that you want to delete this Readlist";
    if (articlesCount.length > 0) {
      msg +=
        ` and its ${articlesCount} article` + (articlesCount === 1 ? "" : "s");
    }
    msg += ".";

    if (window.confirm(msg)) {
      console.warn("Deleting readlist %s", readlist.id);
      // Update app state
      store.dispatch({ type: "DELETE_READLIST", readlistId: readlist.id });
      $app.removeAttribute("list-id");

      // Sync app state
      sync.enqueue(() => deleteReadlist(readlist.id));
    }
  }

  /**
   * Sync a given a set of changes to a readlist.
   * @param {Object} readlistChanges - Partial Readlist object
   */
  handleUpdatePartOfReadlist(readlistChanges) {
    let readlist = selectList(this.getAttribute("list-id"));
    let newReadlist = {
      ...readlist,
      ...readlistChanges,
    };

    store.dispatch({ type: "UPDATE_READLIST" });
    this.toggleLoading();
    return updateList(newReadlist)
      .then(() => {
        this.renderList();
      })
      .catch((err) => {
        console.error(err);
        store.dispatch({ type: "REVERT" });
        this.renderList();
        $app.setAttribute("error", "Failed to sync changes.");
      })
      .then(() => {
        this.toggleLoading();
      });
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
    const { activeReadlistId } = s.getState();
    const list = selectList(activeReadlistId);

    this.innerHTML = /*html*/ `
      <header>
        <div>
          <button data-js-action="delete-readlist">Delete</button>
          <button data-js-action="export-epub">Export as Epub</button>
        </div>
        <h1 id="title" contenteditable>${list.title}</h1>
        <h2 id="description" contenteditable>${list.description}</h2>
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

    // Array.from(this.querySelectorAll("textarea")).forEach(($el) => {
    //   $el.addEventListener(
    //     "input",
    //     () => {
    //       autoExpand($el);
    //     },
    //     false
    //   );
    // });

    this.renderList();
  }

  renderList() {
    const { activeReadlistId } = s.getState();
    const list = selectList(activeReadlistId);

    if (list.articles.length === 0) {
      this.$list.innerHTML = `<li>No articles</li>`;
      return;
    }

    const indexes = [...Array(list.articles.length).keys()];
    this.$list.innerHTML = `
        ${list.articles
          .map(
            (article, articleIndex) => /*html*/ `
            <li>
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

customElements.define("read-list", ReadList);
