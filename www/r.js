import * as Redux from "https://cdn.pika.dev/redux@^4.0.5";

const initialState = {
  activeReadlistId: "",
  activeReadlistArticleId: "",
  readlists: [],
  lastActionType: "",
  user: "",
  error: "",
};

const createReadlist = () => ({
  type: "CREATE_READLIST",
});

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

  switch (action.type) {
    case "INIT":
      return {
        ...state,
        readlists: action.readlists,
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
        readlists: state.readlists.concat(newReadlist),
        activeReadlistId: newReadlist.id,
        activeReadlistArticleId: "",
      };
    case "UPDATE_READLIST":
      return {
        ...state,
        readlists: state.readlists.map((readlist) => {
          if (readlist.id === action.readlistId) {
            return {
              ...readlist,
              ...action.updates,
            };
          } else {
            return readlist;
          }
        }),
      };
    default:
      return state;
  }
}

let store = Redux.createStore(
  reducer,
  initialState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

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

export { store, selectActiveReadlist, selectActiveReadlistArticle };
