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

  }
}

customElements.define("readlist-view", ReadListView);
