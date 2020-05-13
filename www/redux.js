const initialState = {
  lists: [],
};

let states = [initialState];

// CREATE_LIST
// DELETE_LIST
// EDIT_LIST_DETAILS => update title, description
// ADD_ARTICLE
// SORT_ARTICLES
// EDIT_ARTICLE => update title
//
// LOG_OUT => clear state

export const store = {
  dispatch: (action) => {
    console.warn(action);
    if (action.type === "REVERT") {
      states.pop();
    } else {
      const prevState = states[states.length - 1];
      const nextState = reducer(prevState, action);
      states.push(nextState);
    }

    // if (__DEV__)
    //   console.warn("Action dispatched", action, prevState, nextState);
  },
  getState: () => states[states.length - 1],
  getStates: () => states,
};

export const selectList = (listId) => {
  return store.getState().lists.find((list) => list.id == listId);
};

// window.states = states;
// window.store = store;

// store.dispatch({ type: "INIT" });

export function reducer(state, action) {
  const { listId, articleId } = action;

  switch (action.type) {
    case "INIT":
      return {
        ...state,
        lists: action.lists,
      };
    case "DELETE_LIST":
      return {
        ...state,
        lists: state.lists.filter((list) => list.id != listId),
      };
    case "DELETE_ARTICLE":
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id == listId) {
            return {
              ...list,
              articles: list.articles.filter(
                (article) => article.id != articleId
              ),
            };
          } else {
            return list;
          }
        }),
      };
    case "UPDATE_LIST":
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id != action.list.id) {
            return list;
          }

          return {
            ...action.list,
            articles: action.list.articles.map((article) => ({ ...article })),
          };
        }),
      };
      break;
    case "NEW_READLIST":
      return {
        ...state,
        lists: state.lists.concat({
          id: Date.now(),
          title: "Untitled Readlist",
          description: "",
          articles: [],
        }),
      };
    case "DELETE_READLIST":
      return {
        ...state,
        lists: state.lists.filter(
          (readlist) => readlist.id != action.readlistId
        ),
      };
      break;
    case "EDIT_ARTICLE":
      // change is object with info for an article
      // i.e. { title: "my title" }
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id != listId) {
            return list;
          }

          return {
            ...list,
            article: list.articles.map((article) => {
              return {
                ...article,
                ...(article.id === articleId ? changes : {}),
              };
            }),
          };
        }),
      };
    default:
      return state;
  }
}
