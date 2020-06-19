import * as Redux from "https://cdn.pika.dev/redux@^4.0.5";
import {
  putFile,
  sync,
  deleteReadlist,
  deleteReadlistArticle,
  putList,
} from "./api.js";

const initialState = {
  activeReadlistId: "",
  activeReadlistArticleId: "",
  readlists: [],
  lastAction: {},
  user: "",
  error: "",
};

// CREATE_READLIST -> create new readlist, change view
// UPDATE_READLIST -> update meta on readlist
// DELETE_READLIST ->
// REORDER_READLIST_ARTICLES -> reorder articles in a particular readlist
// CREATE_READLIST_ARTICLE -> ...
// UPDATE_READLIST_ARTICLE -> ...
// DELETE_READLIST_ARTICLE -> ..., change article view
// SELECT_READLIST -> ... {
// SELET_READLIST_ARTICLE ->

function reducer(state, action) {
  state.lastAction = action;

  switch (action.type) {
    case "INIT":
      return {
        ...state,
        readlists: action.readlists.reverse(),
      };
    case "AUTHENTICATE":
      return {
        ...state,
        user: action.user,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      };
    case "SELECT_READLIST":
      return {
        ...state,
        activeReadlistId: action.readlistId,
        activeReadlistArticleId: "",
      };
    case "SELECT_READLIST_ARTICLE":
      return {
        ...state,
        activeReadlistArticleId: action.readlistArticleId,
      };
    case "CREATE_READLIST":
      const newReadlist = {
        id: Date.now(),
        title: "Untitled Readlist",
        description: "",
        articles: [],
      };
      return {
        ...state,
        readlists: [newReadlist, ...state.readlists],
        activeReadlistId: newReadlist.id,
        activeReadlistArticleId: "",
      };
    case "DELETE_READLIST":
      return {
        ...state,
        readlists: state.readlists.filter(
          (readlist) => readlist.id != action.readlistId
        ),
        activeReadlistId: "",
        activeReadlistArticleId: "",
      };
    case "UPDATE_READLIST":
    case "CREATE_READLIST_ARTICLE":
    case "UPDATE_READLIST_ARTICLE":
    case "UPDATE_READLIST_ARTICLE_ORDER":
    case "DELETE_READLIST_ARTICLE":
      return {
        ...state,
        readlists: readlistsReducer(state, action),
      };
    default:
      return state;
  }
}

function readlistsReducer(state = [], action) {
  switch (action.type) {
    case "UPDATE_READLIST": {
      const { readlistId, readlistUpdates } = action;
      return state.readlists.map((readlist) =>
        readlist.id == readlistId
          ? {
              ...readlist,
              ...readlistUpdates,
            }
          : readlist
      );
    }
    /**
     * @param {string|number} readlistId
     * @param {MercuryArticle} mercuryArticle
     */
    case "CREATE_READLIST_ARTICLE":
      const {
        readlistId,
        mercuryArticle: { content, ...article },
      } = action;
      return state.readlists.map((readlist) =>
        readlist.id == readlistId
          ? {
              ...readlist,
              articles: readlist.articles.concat({
                id: Date.now(),
                ...article,
              }),
            }
          : readlist
      );
    /**
     * @param {string} readlistId
     * @param {string} readlistArticleId
     * @param {Object} readlistArticleUpdates
     */
    case "UPDATE_READLIST_ARTICLE": {
      const { readlistId, readlistArticleId, readlistArticleUpdates } = action;
      return state.readlists.map((readlist) =>
        readlist.id == readlistId
          ? {
              ...readlist,
              articles: readlist.articles.map((article) =>
                article.id == readlistArticleId
                  ? {
                      ...article,
                      ...readlistArticleUpdates,
                    }
                  : article
              ),
            }
          : readlist
      );
    }
    /**
     *
     */
    case "UPDATE_READLIST_ARTICLE_ORDER": {
      const { readlistId, readlistArticleId, currentIndex, newIndex } = action;
      return state.readlists.map((readlist) => {
        console.warn(readlist.id, readlistId);
        if (readlist.id == readlistId) {
          let newReadlist = {
            ...readlist,
            articles: readlist.articles.map((article) => ({ ...article })),
          };
          newReadlist.articles.splice(
            newIndex,
            0,
            newReadlist.articles.splice(currentIndex, 1)[0]
          );

          return newReadlist;
        } else {
          return readlist;
        }
      });
    }
    /**
     * @param {string} readlistId
     * @param {string} readlistArticleId
     */
    case "DELETE_READLIST_ARTICLE": {
      const { readlistId, readlistArticleId } = action;
      return state.readlists.map((readlist) =>
        readlist.id == readlistId
          ? {
              ...readlist,
              articles: readlist.articles.filter(
                (article) => article.id != readlistArticleId
              ),
            }
          : readlist
      );
    }
    default:
      state;
  }
}

let store = Redux.createStore(
  reducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const selectReadlistById = (state, id) => {
  return state.readlists.find((readlist) => readlist.id == id);
};

const selectReadlistArticleById = (state, readlistId, readlistArticleId) => {
  return selectReadlistById(state, readlistId).articles.find(
    (article) => article.id == readlistArticleId
  );
};

const selectActiveReadlist = (state) => {
  return state.readlists.find(
    (readlist) => readlist.id == state.activeReadlistId
  );
};

const selectActiveReadlistArticle = (state) => {
  const readlist = selectActiveReadlist(state);
  return readlist.articles.find(
    (article) => article.id == state.activeReadlistArticleId
  );
};

const selectUser = (state) => state.user;

/**
 * All necssary syncing takes place here based on the events that occur
 */
store.subscribe(() => {
  const state = store.getState();

  switch (state.lastAction.type) {
    case "SELECT_READLIST":
      {
        // window.location TODO set query params in
        // TODO load up a specific readlist if query param is present on load
      }
      break;
    case "CREATE_READLIST":
      {
        // Active readlist will be the one just created
        const newReadlist = selectActiveReadlist(state);
        sync.enqueue(() => putList(newReadlist));
      }
      break;
    case "UPDATE_READLIST":
      {
        const { readlistId } = state.lastAction;
        const readlist = selectReadlistById(state, readlistId);
        sync.enqueue(() => putList(readlist));
      }
      break;
    case "DELETE_READLIST":
      {
        const { readlistId } = state.lastAction;
        sync.enqueue(() => deleteReadlist(readlistId));
      }
      break;
    case "CREATE_READLIST_ARTICLE":
      {
        const {
          readlistId,
          mercuryArticle: { content },
        } = state.lastAction;
        const readlist = selectReadlistById(state, readlistId);
        // It will be the last one by default
        const articleId = readlist.articles[readlist.articles.length - 1].id;
        sync.enqueue(() =>
          Promise.all([
            putFile(
              `/test/${readlistId}/list.json`,
              JSON.stringify(readlist, null, 2)
            ),
            putFile(`/test/${readlistId}/${articleId}.article.html`, content),
          ])
        );
      }
      break;
    case "DELETE_READLIST_ARTICLE":
      {
        const { readlistId, readlistArticleId } = state.lastAction;
        sync.enqueue(() =>
          deleteReadlistArticle({ readlistId, readlistArticleId })
        );
      }
      break;
    case "UPDATE_READLIST_ARTICLE":
    case "UPDATE_READLIST_ARTICLE_ORDER":
      {
        const { readlistId } = state.lastAction;
        sync.enqueue(() => putList(selectReadlistById(state, readlistId)));
      }
      break;
  }
});

// let previousState = store.getState();
// store.subscribe((unsubscribe) => {
//   console.log("fired subscribe");
//   const newState = store.getState();

//   if (previousState.readlists === newState.readlists) {
//     console.warn("readlists changed", previousState, newState);
//   }

//   if (previousState.activeReadlistId === newState.activeReadlistId) {
//     console.warn("activeReadlistId changed");
//   }
// });

// store.dispatch({ type: "UPDATE_ACTIVE_READLIST" });

export {
  store,
  selectActiveReadlist,
  selectActiveReadlistArticle,
  selectReadlistArticleById,
  selectReadlistById,
  selectUser,
};
