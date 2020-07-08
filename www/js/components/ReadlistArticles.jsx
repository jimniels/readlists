import React, {
  useState,
  useRef,
} from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import Textarea from "./Textarea.js";

export default function ReadlistArticles({ readlist, setReadlist }) {
  const indexes = [...Array(readlist.articles.length).keys()];

  const handleChangeArticleOrder = () => {};
  const handleUpdateReadlistArticle = (e) => {
    setReadlist((prevReadlist) => ({
      ...prevReadlist,
      dateModified: new Date().toISOString(),
      articles: prevReadlist.articles.map((article) =>
        article.url == e.target.dataset.url
          ? {
              ...article,
              title: e.target.value,
            }
          : article
      ),
    }));
  };
  const handleSelectReadlistArticle = () => {};
  const handleDeleteReadlistArticle = () => {};

  return (
    <ul class="articles">
      {readlist.articles.map((article, articleIndex) => (
        <li class="article" key={articleIndex}>
          <div class="article__meta">
            <p class="article__meta__domain">
              <a href={article.url} target="__blank">
                {article.domain}
              </a>
            </p>
            {article.author && (
              <p class="article__meta__author">{article.author}</p>
            )}
          </div>
          <div class="article__main">
            <select
              onChange={handleChangeArticleOrder}
              data-readlist-article-url={article.url}
              data-current-index={articleIndex}
              value={articleIndex}
            >
              {indexes.map((index) => (
                <option key={index} value={index}>
                  {index + 1}
                </option>
              ))}
            </select>
            <Textarea
              rows="1"
              class="article__title"
              placeholder="Article title..."
              onChange={handleUpdateReadlistArticle}
              data-url={article.url}
              value={article.title}
            ></Textarea>
          </div>
          <p class="article__excerpt">{article.excerpt}</p>
          <div class="article__actions actions">
            <button
              class="button"
              onClick={handleSelectReadlistArticle}
              value={article.url}
            >
              Preview
            </button>
            <button class="button" disabled>
              Edit HTML
            </button>
            <button
              class="button button--danger"
              onClick={() => {
                setReadlist((prevReadlist) => ({
                  ...prevReadlist,
                  dateModified: new Date().toISOString(),
                  articles: prevReadlist.articles.filter(
                    (prevArticle) => prevArticle.url !== article.url
                  ),
                }));
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
