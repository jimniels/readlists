import { html, React } from "../deps.js";
import Textarea from "./Textarea.js";
import { devLog } from "../utils.js";
const { useState, useRef } = React;

export default function ReadlistArticles({
  readlist,
  setReadlist,
  setArticlePreviewUrl,
}) {
  const indexes = [...Array(readlist.articles.length).keys()];

  return html`
    <ul class="articles">
      ${readlist.articles.map(
        (article, articleIndex) => html`
          <li class="article" key=${articleIndex}>
            <div class="article__meta">
              <p class="article__meta__domain">
                <a href=${article.url} target="__blank"> ${article.domain} </a>
              </p>
              ${article.author &&
              html`<p class="article__meta__author">${article.author}</p>`}
            </div>
            <div class="article__main">
              <select
                value=${articleIndex}
                onChange=${(e) => {
                  e.target.blur();
                  handleArticleOrdering({
                    articleUrl: article.url,
                    currentIndex: articleIndex,
                    newIndex: Number(e.target.value),
                    setReadlist,
                  });
                }}
              >
                ${indexes.map(
                  (index) =>
                    // prettier-ignore
                    html`<option key=${index} value=${index}>${index + 1}</option>`
                )}
              </select>
              <${Textarea}
                rows="1"
                class="article__title"
                placeholder="Article title..."
                onChange=${(e) => {
                  handleUpdateReadlistArticle({
                    articleUrl: article.url,
                    articleTitle: e.target.value,
                    setReadlist,
                  });
                }}
                value=${article.title}
              />
            </div>

            ${article.excerpt &&
            html`<p class="article__excerpt">${article.excerpt}</p>`}

            <div class="article__actions actions">
              <button
                class="button"
                onClick=${(e) => {
                  handleSelectReadlistArticle({
                    setArticlePreviewUrl,
                    articleUrl: article.url,
                  });
                }}
                value=${article.url}
              >
                Preview
              </button>
              ${/*<button class="button" disabled>Edit HTML</button>*/ ""}
              <button
                class="button button--danger"
                onClick=${(e) => {
                  handleDeleteReadlist({
                    setReadlist,
                    articleUrl: article.url,
                  });
                }}
              >
                Delete
              </button>
            </div>
          </li>
        `
      )}
    </ul>
  `;
}

/**
 * @param {{
 *   articleUrl: string,
 *   articleTitle: string,
 *   setReadlist: Function
 * }}
 */
function handleUpdateReadlistArticle({
  articleUrl,
  articleTitle,
  setReadlist,
}) {
  setReadlist((prevReadlist) => ({
    ...prevReadlist,
    date_modified: new Date().toISOString(),
    articles: prevReadlist.articles.map((article) =>
      article.url == articleUrl
        ? {
            ...article,
            title: articleTitle,
          }
        : article
    ),
  }));
}

/**
 * @param {{
 *   articleUrl: string,
 *   setArticlePreviewUrl: Function
 * }}
 */
function handleSelectReadlistArticle({ setArticlePreviewUrl, articleUrl }) {
  setArticlePreviewUrl(articleUrl);
}

/**
 * @param {{
 *   articleUrl: string,
 *   setReadlist: Function
 * }}
 */
function handleDeleteReadlist({ setReadlist, articleUrl }) {
  setReadlist((prevReadlist) => ({
    ...prevReadlist,
    date_modified: new Date().toISOString(),
    articles: prevReadlist.articles.filter(
      (prevArticle) => prevArticle.url !== articleUrl
    ),
  }));
}

/**
 * @param {{
 *   articleUrl: string,
 *   currentIndex: number,
 *   newIndex: number,
 *   setReadlist: Function
 * }}
 */
function handleArticleOrdering({
  articleUrl,
  currentIndex,
  newIndex,
  setReadlist,
}) {
  devLog([
    "Change readlist article order",
    `From: ${currentIndex}`,
    `To: ${newIndex}`,
    `For: ${articleUrl}`,
  ]);

  setReadlist((prevReadlist) => {
    let newReadlist = {
      ...prevReadlist,
      articles: prevReadlist.articles.map((article) => ({
        ...article,
      })),
    };
    newReadlist.articles.splice(
      newIndex,
      0,
      newReadlist.articles.splice(currentIndex, 1)[0]
    );

    return newReadlist;
  });
}
