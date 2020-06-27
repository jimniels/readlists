import { fetchEpub, fetchArticle } from "./api.js";
import { store } from "./redux.js";
import {
  html,
  eventHandler,
  autoExpand,
  downloadFile,
  slugify,
  isValidHttpUrl,
} from "./utils.js";

export class ReadListView extends HTMLElement {
  connectedCallback() {
    this.renderView();

    store.subscribe(() => {
      const { lastAction, readlist } = store.getState();

      switch (lastAction.type) {
        case "UPDATE_READLIST":
          this.querySelector("time-ago").setAttribute(
            "datetime",
            new Date(readlist.modified).toISOString
          );
          break;
        case "DELETE_READLIST":
        case "SELECT_READLIST":
        case "CREATE_READLIST":
          this.renderView();
          break;
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
    const readlistArticleUrl = e.target.dataset.readlistArticleUrl;
    const readlistArticle = state.readlist.articles.find(
      (article) => article.url == readlistArticleUrl
    );
    const value = e.target.value;
    if (readlistArticle.title !== value) {
      store.dispatch({
        type: "UPDATE_READLIST_ARTICLE",
        readlistArticleUrl,
        readlistArticleUpdates: { title: value },
      });
    }
  }

  handleSelectReadlistArticle(e) {
    const { readlistArticleUrl } = store.getState();
    const newReadlistArticleUrl = e.target.value;

    if (readlistArticleUrl !== newReadlistArticleUrl) {
      store.dispatch({
        type: "SELECT_READLIST_ARTICLE",
        readlistArticleUrl: newReadlistArticleUrl,
      });
    }
  }

  /**
   * Delete the active readlist
   */
  handleDeleteActiveReadlist() {
    const { readlist } = store.getState();

    const articlesCount = readlist.articles.length;
    console.log(articlesCount);
    let msg = "Please confirm that you want to delete this Readlist";
    // @TODO message about saving
    if (articlesCount > 0) {
      msg +=
        ` and its ${articlesCount} article` + (articlesCount === 1 ? "" : "s");
    }
    msg += ".";

    if (window.confirm(msg)) {
      store.dispatch({ type: "DELETE_READLIST" });
    }
  }

  /**
   * Sync a given a set of changes to a readlist.
   */
  handleUpdatePartOfReadlist(e) {
    const changeKey = e.target.dataset.actionValue;
    const value = e.target.value;
    const { readlist } = store.getState();

    if (readlist[changeKey] != value) {
      store.dispatch({
        type: "UPDATE_READLIST",
        readlistUpdates: { [changeKey]: value },
      });
    }
  }

  /**
   * Handle when user changes order of readlist articles
   */
  handleChangeArticleOrder(e) {
    e.target.blur();
    const { readlistArticleUrl } = e.target.dataset;
    const currentIndex = Number(e.target.dataset.currentIndex);
    const newIndex = Number(e.target.value);

    if (__DEV__) {
      console.warn(
        "Switch article %s from index %s to index %s",
        readlistArticleUrl,
        currentIndex,
        newIndex
      );
    }

    store.dispatch({
      type: "UPDATE_READLIST_ARTICLE_ORDER",
      readlistArticleUrl,
      currentIndex,
      newIndex,
    });
  }

  /**
   * Handle when user creates a new article for a readlist
   * @param {*} e
   */
  handleCreateReadlistArticle(e) {
    e.preventDefault();
    const $input = e.target.elements[1];
    const $btn = e.target.elements[0];
    const url = $input.value;

    // Check if the input is a valid URL first
    if (!isValidHttpUrl(url)) {
      store.dispatch({
        type: "SET_ERROR",
        error: "Invalid article URL. Must be an http or https url.",
      });
      return;
    }

    // Check if we don't already have that URL
    const { readlist } = store.getState();
    const duplicateArticle = readlist.articles.find(
      (article) => article.url === url
    );
    if (duplicateArticle) {
      window.alert(
        [
          "You already have an article for that URL:\n",
          duplicateArticle.title,
          duplicateArticle.url,
          "\nIf you want add it anew, delete the exisiting article then add it.",
        ].join("\n")
      );
      return;
    }

    // Go get it
    $input.setAttribute("disabled", true);
    $btn.classList.add("loading");

    fetchArticle(url)
      .then((mercuryArticle) => {
        store.dispatch({
          type: "CREATE_READLIST_ARTICLE",
          mercuryArticle,
        });
        $input.value = "";
      })
      .catch((err) => {
        console.error(err);
        store.dispatch({
          type: "SET_ERROR",
          error: "Could not retrieve and parse the specified URL.",
        });
      })
      .then(() => {
        $input.removeAttribute("disabled", true);
        $btn.classList.remove("loading");
      });
  }

  handleDeleteReadlistArticle(e) {
    store.dispatch({
      type: "DELETE_READLIST_ARTICLE",
      readlistArticleUrl: e.target.value,
    });
  }

  handleExportEpub(e) {
    const state = store.getState();
    const { readlist } = state;
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
        a.download = "file.epub"; // @TODO slugify-the-title-2018-08-11T01:03z.readlist
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

  handleSaveReadlist() {
    const { readlist } = store.getState();
    downloadFile({
      file: `${slugify(readlist.title)}.${readlist.dateModified}.json`,
      contents: JSON.stringify(readlist),
    });
  }

  renderView() {
    const state = store.getState();
    const { readlist } = state;

    // no active readlist selected!
    if (!readlist) {
      this.innerHTML = "";
      return;
    }

    this.innerHTML = /*html*/ `
      <header class="readlist-header">
        <!-- @TODO redo CSS classes here -->
        <div class="readlist-header__actions actions">
          <button class="button button--primary" onclick="${eventHandler(
            "readlist-view",
            "handleSaveReadlist"
          )}">
            Save Readlist
          </button> 
          <button class="button" onclick="${eventHandler(
            "readlist-view",
            "handleExportEpub"
          )}">
            Export as .epub
          </button> 
          <button class="button" disabled>
            Export as .mobi
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

        <p class="readlist-header__meta">
          <!-- <time datetime="">
            Created 
          </time> -->
          <span>
            Created
            <local-time
              month="short"
              day="numeric"
              year="numeric"
              datetime="${readlist.dateCreated}">
            </local-time>
          </span> · <span>Last modified <time-ago datetime="${
            readlist.dateModified
          }"></time-ago></span>
        </p>
      </header>

      <ul class="articles"></ul>

      <form
        class="article article--create"
        onsubmit="${eventHandler(
          "readlist-view",
          "handleCreateReadlistArticle"
        )}">
        <div class="article__main">
          <div>
            <button class="button" type="submit">
              Add
            </button>
          </div>
          <input
            onclick="this.select()"
            name="article-url"
            type="text"
            placeholder="http://your-article-url.com/goes/here"
          />
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
    const { readlist } = state;
    const indexes = [...Array(readlist.articles.length).keys()];

    this.$articles.innerHTML = html`
      ${readlist.articles.map(
        (article, articleIndex) => html` <li class="article">
          <div class="article__meta">
            <p class="article__meta__domain">
              <a href="${article.url}" class="" target="__blank">
                ${article.domain}
              </a>
            </p>
            ${article.author &&
            html`<p class="article__meta__author">${article.author}</p>`}
          </div>
          <div class="article__main">
            <select
              onchange="${eventHandler(
                "readlist-view",
                "handleChangeArticleOrder"
              )}"
              data-readlist-article-url="${article.url}"
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
            <textarea
              rows="1"
              class="article__title"
              placeholder="Article title..."
              onblur="${eventHandler(
                "readlist-view",
                "handleUpdateReadlistArticle"
              )}"
              data-readlist-article-url="${article.url}"
            >
${article.title}</textarea
            >
          </div>
          <p class="article__excerpt">${article.excerpt}</p>
          <div class="article__actions actions">
            <button
              class="button"
              onclick="${eventHandler(
                "readlist-view",
                "handleSelectReadlistArticle"
              )}"
              value="${article.url}"
            >
              Preview
            </button>
            <button class="button" disabled>
              Edit HTML
            </button>
            <button
              class="button button--danger"
              onclick="${eventHandler(
                "readlist-view",
                "handleDeleteReadlistArticle"
              )}"
              value="${article.url}"
            >
              Delete
            </button>
          </div>
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
