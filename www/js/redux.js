import * as Redux from "https://cdn.pika.dev/redux@^4.0.5";

const initialState = {
  lastAction: {},
  error: "",
  readlist: null,
  readlistArticleUrl: "",
};

function reducer(state, action) {
  state.lastAction = action;

  switch (action.type) {
    /**
     * Action
     * @param {Readlist} readlist
     */
    case "IMPORT_READLIST":
      return {
        ...state,
        readlist: action.readlist,
      };
    /**
     * Action
     * @param {string} error
     */
    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      };
    /**
     * Action
     * @param {string} readlistArticleUrl
     */
    case "SELECT_READLIST_ARTICLE":
      return {
        ...state,
        readlistArticleUrl: action.readlistArticleUrl,
      };
    case "CREATE_READLIST": {
      const d = new Date().toISOString();
      const readlist = {
        dateCreated: d,
        dateModified: d,
        title: "Untitled Readlist",
        description: "",
        articles: [],
      };
      return {
        ...state,
        readlist,
      };
    }
    case "DELETE_READLIST":
      return {
        ...state,
        readlist: null,
      };
    /**
     * Action
     * @param {Object} readlistUpdates - part of a Readlist object
     */
    case "UPDATE_READLIST":
      return {
        ...state,
        readlist: {
          ...state.readlist,
          ...action.readlistUpdates,
          dateModified: new Date().toISOString(),
        },
      };
    /**
     * Action
     * @param {MercuryArticle} mercuryArticle
     */
    case "CREATE_READLIST_ARTICLE":
      return {
        ...state,
        readlist: {
          ...state.readlist,
          dateModified: new Date().toISOString(),
          articles: state.readlist.articles.concat(action.mercuryArticle),
        },
      };
    /**
     * @param {string} readlistArticleUrl
     * @param {Object} readlistArticleUpdates
     */
    case "UPDATE_READLIST_ARTICLE": {
      return {
        ...state,
        readlist: {
          ...state.readlist,
          dateModified: new Date().toISOString(),
          articles: state.readlist.articles.map((article) =>
            article.url == action.readlistArticleUrl
              ? {
                  ...article,
                  ...action.readlistArticleUpdates,
                }
              : article
          ),
        },
      };
    }
    /**
     * @param {string} readlistArticleUrl
     */
    case "DELETE_READLIST_ARTICLE": {
      return {
        ...state,
        readlist: {
          ...state.readlist,
          dateModified: new Date().toISOString(),
          articles: state.readlist.articles.filter(
            (article) => article.url != action.readlistArticleUrl
          ),
        },
      };
    }

    // case "UPDATE_READLIST":
    case "CREATE_READLIST_ARTICLE":
    // case "UPDATE_READLIST_ARTICLE":

    case "DELETE_READLIST_ARTICLE":
    // return {
    //   ...state,
    //   readlists: readlistsReducer(state, action),
    // };

    /**
     * Action
     * @param {string} readlistArticleUrl
     * @param {} currentIndex
     * @param {} newIndex
     */
    case "UPDATE_READLIST_ARTICLE_ORDER": {
      const { readlistArticleUrl, currentIndex, newIndex } = action;
      let newReadlist = {
        ...state.readlist,
        articles: state.readlist.articles.map((article) => ({ ...article })),
      };
      newReadlist.articles.splice(
        newIndex,
        0,
        newReadlist.articles.splice(currentIndex, 1)[0]
      );

      return {
        ...state,
        readlist: newReadlist,
      };
    }

    default:
      return state;
  }
}

let store = Redux.createStore(
  reducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

store.subscribe(() => {
  const state = store.getState();

  switch (state.lastAction.type) {
    case "IMPORT_READLIST":
    case "CREATE_READLIST":
    case "CREATE_READLIST_ARTICLE":
    case "UPDATE_READLIST":
    case "UPDATE_READLIST_ARTICLE":
    case "UPDATE_READLIST_ARTICLE_ORDER":
    case "DELETE_READLIST_ARTICLE":
      localStorage.setItem("readlist", JSON.stringify(state.readlist));
      break;
    case "DELETE_READLIST":
      localStorage.setItem("readlist", "");
      break;
  }
});

export { store };

/**
 * @typedef Readlist
 * @param {string} title
 * @param {description} description
 * @param {string} dateCreated - ISO8601 date
 * @param {string} dateModified - ISO8601 date
 * @param {Array.<MercuryArticle>}
 */

/**
 * FYI: If mercury can't find a field, it returns null.
 * @typedef MercuryArticle
 * @param {string} author
 * @param {string} content - HTML string
 * @param {string} date_published - ISO8601 string
 * @param {} dek
 * @param {string} direction - "ltr"
 * @param {string} domain - "trackchanges.postlight.com",
 * @param {string} excerpt
 * @param {string} lead_image_url
 * @param {string} next_page_url - optional
 * @param {number} rendered_pages
 * @param {string} title
 * @param {number} total_pages
 * @param {string} url
 * @param {number} word_count
 */
