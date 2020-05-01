import { getList, putList, putArticle, deleteArticle } from "./api.js";
import { autoExpand } from "./utils.js";

const $app = document.querySelector("my-app");

export class ReadList extends HTMLElement {
  constructor(props) {
    super();
    this.state = {
      error: "",
      list: null, // {}
    };
  }

  connectedCallback() {
    getList(this.getAttribute("id")).then((list) => {
      this.state.list = list;
      this.renderInitial();
    });

    /**
     * Event Listeners
     */
    this.addEventListener(
      "focusout",
      (e) => {
        if (
          e.target.id === "title" &&
          e.target.value !== this.state.list.value
        ) {
          this.syncListChange({ title: e.target.value });
        } else if (
          e.target.id === "description" &&
          e.target.value !== this.state.list.description
        ) {
          this.syncListChange({ description: e.target.value });
        } else if (e.target.id === "new-article" && e.target.value) {
          this.toggleLoading();
          putArticle(e.target.value, this.state.list)
            .then((list) => {
              this.state.list = list;
              this.renderList();
              e.target.value = "";
            })
            .catch((e) => {
              console.error(e);
              $app.setAttribute("error", "Failed to add a new article");
              // @TODO
              // this.renderError()
              // this.state.list = newList;
            })
            .then(() => {
              this.toggleLoading();
            });
        }
      },
      false
    );

    this.addEventListener(
      "click",
      (e) => {
        if (e.target.dataset.jsAction === "delete-article") {
          const articleId = e.target.id;
          if (window.__DEV__)
            console.log(
              "Deleting article %s from list %s",
              articleId,
              this.state.list.id
            );
          this.toggleLoading();
          deleteArticle(articleId, this.state.list)
            .then((list) => {
              this.state.list = list;
              this.renderList();
            })
            .catch((e) => {
              console.error(e);
              $app.setAttribute("error", "Deleting the article failed");
            })
            .then(() => {
              this.toggleLoading();
            });
        }
      },
      false
    );

    this.addEventListener(
      "input",
      (e) => {
        if (e.target.dataset.jsAction === "change-article-order") {
          e.target.blur();
          let [articleId, newIndex] = e.target.value.split("--");
          newIndex = Number(newIndex);
          const currentIndex = this.state.list.articles.findIndex(
            (article) => article.id == articleId
          );
          console.log(currentIndex, newIndex);

          // const move = (from, to) => {
          //     this.splice(to, 0, this.splice(from, 1)[0]);
          // };
          let modifiedList = {
            ...this.state.list,
            articles: [...this.state.list.articles],
          };
          modifiedList.articles.splice(
            newIndex,
            0,
            modifiedList.articles.splice(currentIndex, 1)[0]
          );

          console.warn(
            "Switch article %s from index %s to index %s",
            articleId,
            currentIndex,
            newIndex
          );

          this.toggleLoading();
          putList(modifiedList)
            .then(() => {
              this.state.list = modifiedList;
              this.renderList();
            })
            .catch((e) => {
              console.error(e);
              this.renderError("Failed to re-sort article list.");
            })
            .then(() => {
              this.toggleLoading();
            });
        }
      },
      false
    );
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

  syncListChange(listChanges, fn) {
    this.setAttribute("loading", true);
    const newList = {
      ...this.state.list,
      ...listChanges,
    };

    return putList(newList)
      .then(() => {
        this.state.list = { ...newList };
      })
      .catch((e) => {
        // this.setState({ error: "Error saving updates to readlist." });
      })
      .then(() => {
        this.removeAttribute("loading");
      });
  }

  renderInitial() {
    const { list } = this.state;
    this.innerHTML = /*html*/ `
      <header>
        <textarea id="title">${list.title}</textarea>
        <textarea id="description">${list.description}</textarea>
      </header>
      <ul id="list"></ul>
      <footer>
        <textarea id="new-article" placeholder="Add URL..."></textarea>
      </footer>
    `;
    this.$title = this.querySelector("#title");
    this.$description = this.querySelector("#description");
    this.$list = this.querySelector("#list");

    Array.from(this.querySelectorAll("textarea")).forEach(($el) => {
      $el.addEventListener(
        "input",
        () => {
          autoExpand($el);
        },
        false
      );
    });

    this.renderList();
  }

  renderList() {
    const { id, list } = this.state;
    const indexes = [...Array(list.articles.length).keys()];

    this.$list.innerHTML = `
        ${list.articles
          .map(
            (article, articleIndex) => /*html*/ `
            <li>
              <select data-js-action="change-article-order">
                ${indexes.map(
                  (index) =>
                    `<option ${
                      index === articleIndex ? "selected" : ""
                    } value="${article.id}--${index}">${index + 1}</option>`
                )}
              </select>
              <a href="${article.url}">${article.domain}</a>
              <a href="./data/${id}-${article.id}.article.html" target="_blank">
                ${article.title}
              </a>
              <button data-js-action="delete-article" id="${
                article.id
              }">Delete</button>
            </li>`
          )
          .join("")}
    `;
  }
}

customElements.define("read-list", ReadList);
