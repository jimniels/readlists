import { html, React } from "../deps.js";
import Textarea from "./Textarea.js";
import { devLog } from "../utils.js";
const { useState, useRef } = React;

/** @typedef {import("./App.js").SetStateReadlist} SetStateReadlist */

/**
 * @param {object} props
 * @param {Readlist} props.readlist
 * @param {SetStateReadlist} props.setReadlist
 * @param {(string) => void} props.setArticlePreviewUrl
 */
export default function ReadlistArticles({
  readlist,
  setReadlist,
  setArticlePreviewUrl,
}) {
  const indexes = [...Array(readlist.items.length).keys()];

  return html`
    <ul class="articles">
      ${readlist.items.map((article, articleIndex) => {
        const { hostname } = new URL(article.url);
        return html`
          <li class="article" key=${articleIndex}>
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

            <div class="article__meta">
              <ul>
                <li>
                  <a href=${article.url} target="__blank">${hostname}</a>
                </li>
                ${article.authors &&
                html`<li>
                  By: ${article.authors.map((author) => author.name).join(", ")}
                </li>`}
                ${article.summary && html`<li>${article.summary}</li>`}
              </ul>
            </div>

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
        `;
      })}
    </ul>
  `;
}

/**
 * @param {object} args
 * @param {string} args.articleUrl
 * @param {string} args.articleTitle
 * @param {SetStateReadlist} args.setReadlist
 */
function handleUpdateReadlistArticle({
  articleUrl,
  articleTitle,
  setReadlist,
}) {
  setReadlist((prevReadlist) => {
    /** @type {Readlist} */
    const newReadlist = {
      ...prevReadlist,
      items: prevReadlist.items.map((article) =>
        article.url == articleUrl
          ? {
              ...article,
              title: articleTitle,
            }
          : article
      ),
    };
    return newReadlist;
  });
}

/**
 * @param {object} args
 * @param {string} args.articleUrl
 * @param {(string) => void} args.setArticlePreviewUrl
 */
function handleSelectReadlistArticle({ setArticlePreviewUrl, articleUrl }) {
  setArticlePreviewUrl(articleUrl);
}

/**
 * @param {object} args
 * @param {string} args.articleUrl
 * @param {SetStateReadlist} args.setReadlist
 */
function handleDeleteReadlist({ setReadlist, articleUrl }) {
  setReadlist((prevReadlist) => {
    /** @type {Readlist} */
    const newReadlist = {
      ...prevReadlist,
      items: prevReadlist.items.filter(
        (prevArticle) => prevArticle.url !== articleUrl
      ),
    };
    return newReadlist;
  });
}

/**
 * @param {object} args
 * @param {string} args.articleUrl
 * @param {number} args.currentIndex
 * @param {number} args.newIndex
 * @param {SetStateReadlist} args.setReadlist
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
    /** @type {Readlist} */
    let newReadlist = {
      ...prevReadlist,
      items: prevReadlist.items.map((article) => ({
        ...article,
      })),
    };
    newReadlist.items.splice(
      newIndex,
      0,
      newReadlist.items.splice(currentIndex, 1)[0]
    );

    return newReadlist;
  });
}
