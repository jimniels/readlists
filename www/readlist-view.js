import {
  putList,
  putArticle,
  updateList,
  deleteReadlistArticle,
  deleteReadlist,
  getArticleHTML,
  getMercuryArticle,
  createReadlistArticle,
  fetchEpub,
} from "./api.js";
import {
  store,
  selectActiveReadlist,
  selectReadlistArticleById,
} from "./redux.js";
import { html, eventHandler, autoExpand } from "./utils.js";

export class ReadListView extends HTMLElement {
  connectedCallback() {
    this.renderView();

    store.subscribe(() => {
      const { lastAction } = store.getState();

      switch (lastAction.type) {
        case "DELETE_READLIST":
        case "SELECT_READLIST":
        case "CREATE_READLIST":
          this.renderView();
          break;
        // case "SELECT_READLIST_ARTICLE":
        case "UPDATE_READLIST_ARTICLE_ORDER":
        case "CREATE_READLIST_ARTICLE":
        case "DELETE_READLIST_ARTICLE":
          this.renderList();
          break;
      }
    });

    /**
     * Event listeners
     */
    this.addEventListener("input", (e) => {
      if (e.target.tagName === "TEXTAREA") {
        autoExpand(e.target);
      }
    });
  }

  handleUpdateReadlistArticle(e) {
    const state = store.getState();
    const readlistId = state.activeReadlistId;
    const readlistArticleId = e.target.dataset.readlistArticleId;
    const readlistArticle = selectReadlistArticleById(
      state,
      readlistId,
      readlistArticleId
    );
    const value = e.target.value;
    if (readlistArticle.title != value) {
      store.dispatch({
        type: "UPDATE_READLIST_ARTICLE",
        readlistId,
        readlistArticleId,
        readlistArticleUpdates: { title: value },
      });
    }
  }

  handleSelectReadlistArticle(e) {
    const { activeReadlistArticleId } = store.getState();
    const readlistArticleId = e.target.value;
    store.dispatch({
      type: "SELECT_READLIST_ARTICLE",
      readlistArticleId:
        readlistArticleId == activeReadlistArticleId
          ? "" // deselect the current one
          : readlistArticleId, // select a new one
    });
  }

  /**
   * Delete the active readlist
   */
  handleDeleteActiveReadlist() {
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
   */
  handleChangeArticleOrder(e) {
    e.target.blur();
    const { readlistArticleId } = e.target.dataset;
    const currentIndex = Number(e.target.dataset.currentIndex);
    const newIndex = Number(e.target.value);

    console.warn(
      "Switch article %s from index %s to index %s",
      readlistArticleId,
      currentIndex,
      newIndex
    );

    store.dispatch({
      type: "UPDATE_READLIST_ARTICLE_ORDER",
      readlistId: store.getState().activeReadlistId,
      readlistArticleId,
      currentIndex,
      newIndex,
    });
  }

  /**
   * Handlw when user creates a new article for a readlist
   * @param {*} e
   */
  handleCreateReadlistArticle(e) {
    e.preventDefault();
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
      readlistArticleId: e.target.value,
    });
  }

  handleExportEpub(e) {
    const state = store.getState();
    const readlist = selectActiveReadlist(state);
    e.target.setAttribute("disabled", true);
    e.target.classList.add("loading");

    // @TODO rename to downloadEpub and put all this in the API part?
    fetchEpub(readlist)
      .then((blob) => {
        // https://stackoverflow.com/questions/4545311/download-a-file-by-jquery-ajax
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        // the filename you want
        a.download = "file.epub";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((e) => {
        store.dispatch({
          type: "SET_ERROR",
          error: "There was a problem expoorting your epub.",
        });
      })
      .then(() => {
        e.target.removeAttribute("disabled");
        e.target.classList.remove("loading");
      });
  }

  renderView() {
    const state = store.getState();
    const readlist = selectActiveReadlist(state);

    // no active readlist selected!
    if (!readlist) {
      this.innerHTML = "";
      return;
    }

    const d = new Date(readlist.id);
    const dFormatted = new Intl.DateTimeFormat("en-US").format(d);

    this.innerHTML = /*html*/ `
      <header class="readlist-header">
        <div class="readlist-header__meta">
          <time datetime="${d.toISOString()}" class="readlist-header__meta__time">
            Created ${dFormatted}
          </time>

          <div class="readlist-header__meta__actions">
            <button class="button" onclick="${eventHandler(
              "readlist-view",
              "handleExportEpub"
            )}">
              Export as Epub
            </button>          
            <button
              class="button button--danger"
              onclick="${eventHandler(
                "readlist-view",
                "handleDeleteActiveReadlist"
              )}">
              Delete
            </button>
          </div>
        </div>
        
        <textarea
          class="readlist-header__title"
          placeholder="Readlist title..."
          onblur="${eventHandler(
            "readlist-view",
            "handleUpdatePartOfReadlist"
          )}"
          data-action-value="title">${readlist.title}</textarea>
        
        <textarea
          class="readlist-header__description"
          placeholder="Readlist description..."
          onblur="${eventHandler(
            "readlist-view",
            "handleUpdatePartOfReadlist"
          )}"
          data-action-value="description">${readlist.description}</textarea>
      </header>

      <ul class="articles"></ul>

      <form
        class="article article--create"
        onsubmit="${eventHandler(
          "readlist-view",
          "handleCreateReadlistArticle"
        )}">
        <div class="article__main">
          <input
            name="article-url"
            type="text"
            placeholder="http://your-article-url.com/goes/here"
          />
          <div class="article__actions">
            <button class="button" type="submit">
              Add
            </button>
          </div>
        </div>
      </form>
    `;
    this.$articles = this.querySelector(".articles");
    Array.from(this.querySelectorAll("textarea")).forEach(($el) => {
      autoExpand($el);
    });
    this.renderList();
  }

  renderList() {
    const state = store.getState();
    const { activeReadlistId, activeReadlistArticleId } = state;
    const readlist = selectActiveReadlist(state);
    const indexes = [...Array(readlist.articles.length).keys()];

    this.$articles.innerHTML = html`
      ${readlist.articles.map(
        (article, articleIndex) => html` <li class="article">
          <div class="article__meta">
            <select
              class="article__order"
              onchange="${eventHandler(
                "readlist-view",
                "handleChangeArticleOrder"
              )}"
              data-readlist-article-id="${article.id}"
              data-current-index="${articleIndex}"
            >
              ${indexes.map(
                (index) =>
                  html`<option
                    value="${index}"
                    ${index === articleIndex ? "selected" : ""}
                  >
                    ${index + 1}
                  </option>`
              )}
            </select>
            <p class="article__domain">
              <a href="${article.url}" class="link" target="__blank">
                ${article.domain}
              </a>
            </p>
            <div class="article__actions">
              <button
                class="button"
                onclick="${eventHandler(
                  "readlist-view",
                  "handleSelectReadlistArticle"
                )}"
                value="${article.id}"
              >
                Preview
              </button>
              <button
                class="button button--danger"
                onclick="${eventHandler(
                  "readlist-view",
                  "handleDeleteReadlistArticle"
                )}"
                value="${article.id}"
              >
                Delete
              </button>
            </div>
          </div>
          <div class="article__main">
            <textarea
              rows="1"
              class="article__title"
              placeholder="Article title..."
              onblur="${eventHandler(
                "readlist-view",
                "handleUpdateReadlistArticle"
              )}"
              data-readlist-article-id="${article.id}"
            >
${article.title}</textarea
            >
          </div>
          <p class="article__excerpt">${article.excerpt}</p>
        </li>`
      )}
    `;

    // Auto-expand all the textarea(s)
    Array.from(this.$articles.querySelectorAll("textarea")).forEach(($el) => {
      autoExpand($el);
    });
  }
}

customElements.define("readlist-view", ReadListView);
