import * as Redux from "https://cdn.pika.dev/redux@^4.0.5";
import { putFile, sync, deleteReadlistArticle } from "./api.js";

const initialState = {
  activeReadlistId: "",
  activeReadlistArticleId: "",
  readlists: [],
  lastActionType: "",
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
// SELECT_READLIST -> ...
// SELET_READLIST_ARTICLE ->

function reducer(state, action) {
  state.lastActionType = action.type;
  state.lastAction = action;

  switch (action.type) {
    case "INIT":
      return {
        ...state,
        readlists: action.readlists.reverse(),
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
    case "DESELECT_READLIST_ARTICLE":
      return {
        ...state,
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
    /**
     * type = ""
     * readlistId = ""
     * updates = {}
     */
    case "UPDATE_READLIST":
      return {
        ...state,
        readlists: state.readlists.map((readlist) => {
          if (readlist.id == action.readlistId) {
            return {
              ...readlist,
              ...action.readlistUpdates,
            };
          } else {
            return readlist;
          }
        }),
      };
    /**
     * @param {string|number} readlistId
     * @param {MercuryArticle} mercuryArticle
     */
    case "CREATE_READLIST_ARTICLE":
      {
        const { readlistId, mercuryArticle } = action;
        const { content, ...article } = mercuryArticle;
        return {
          ...state,
          readlists: state.readlists.map((readlist) => {
            if (readlist.id == readlistId) {
              return {
                ...readlist,
                articles: [
                  { id: Date.now(), ...article },
                  ...readlist.articles,
                ],
              };
            } else {
              return readlist;
            }
          }),
        };
      }
      break;
    /**
     * @param {string} readlistId
     * @param {string} readlistArticleId
     */
    case "DELETE_READLIST_ARTICLE":
      {
        const { readlistId, readlistArticleId } = action;
        return {
          ...state,
          readlists: state.readlists.map((readlist) => {
            if (readlist.id != readlistId) {
              return readlist;
            }

            return {
              ...readlist,
              articles: readlist.articles.filter(
                (article) => article.id != readlistArticleId
              ),
            };
          }),
        };
      }
      break;
    default:
      return state;
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

/**
 * All necssary syncing takes place here based on the events that occur
 */
store.subscribe(() => {
  const state = store.getState();
  switch (state.lastAction.type) {
    case "CREATE_READLIST_ARTICLE":
      {
        const {
          lastAction: {
            readlistId,
            mercuryArticle: { content },
          },
        } = state;
        const readlist = selectReadlistById(state, readlistId);
        const articleId = readlist.articles[0].id;
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
        const {
          lastAction: { readlistId, readlistArticleId },
        } = state;
        sync.enqueue(() =>
          deleteReadlistArticle({ readlistArticleId, readlistId })
        );
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
  selectReadlistById,
};
