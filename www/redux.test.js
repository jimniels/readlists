import { reducer, store } from "./redux.js";
import chai from "chai";
const expect = chai.expect;

const LIST_1 = {
  id: 1587793390100,
  title: "List 1",
  description: "List 1 description.",
  articles: [
    {
      id: 1587793390101,
      title: "List 1, Article 1",
    },
    {
      id: 1587793390102,
      title: "List 1, Article 2",
    },
    {
      id: 1587793390103,
      title: "List 1, Article 3",
    },
  ],
};
const LIST_2 = {
  id: 1587793390200,
  title: "List 2",
  description: "List 2 description.",
  articles: [
    {
      id: 1587793390201,
      title: "List 2, Article 1",
    },
  ],
};

const state = { lists: [LIST_1, LIST_2] };

const action1 = { type: "INIT", lists: state.lists };
expect(reducer({}, action1)).to.deep.equal(state);

const action2 = { type: "DELETE_LIST", listId: LIST_1.id };
expect(reducer(state, action2)).to.deep.equal({
  lists: state.lists.filter((list) => list.id != LIST_1.id),
});

const action3 = {
  type: "DELETE_ARTICLE",
  listId: LIST_1.id,
  articleId: LIST_1.articles[0].id,
};
expect(reducer(state, action3)).to.deep.equal({
  lists: state.lists.map((list) => ({
    ...list,
    articles: list.articles.filter(
      (article) => article.id != action3.articleId
    ),
  })),
});
