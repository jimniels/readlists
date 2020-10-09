import React, { useState, useRef } from "react";
import Textarea from "./Textarea.js";
import { devLog } from "../utils.js";

export default function ReadlistArticles({
  readlist,
  setReadlist,
  setArticlePreviewUrl,
}) {
  const indexes = [...Array(readlist.articles.length).keys()];

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
              value={articleIndex}
              onChange={(e) => {
                e.target.blur();
                handleArticleOrdering({
                  articleUrl: article.url,
                  currentIndex: articleIndex,
                  newIndex: Number(e.target.value),
                  setReadlist,
                });
              }}
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
              onChange={(e) => {
                handleUpdateReadlistArticle({
                  articleUrl: article.url,
                  articleTitle: e.target.value,
                  setReadlist,
                });
              }}
              value={article.title}
            ></Textarea>
          </div>
          {article.excerpt && <p class="article__excerpt">{article.excerpt}</p>}
          <div class="article__actions actions">
            <button
              class="button"
              onClick={(e) => {
                handleSelectReadlistArticle({
                  setArticlePreviewUrl,
                  articleUrl: article.url,
                });
              }}
              value={article.url}
            >
              Preview
            </button>
            <button class="button" disabled>
              Edit HTML
            </button>
            <button
              class="button button--danger"
              onClick={(e) => {
                handleDeleteReadlist({ setReadlist, articleUrl: article.url });
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

/**
 * @param {string} articleUrl
 * @param {string} articleTitle
 * @param {function} setReadlist
 */
function handleUpdateReadlistArticle({
  articleUrl,
  articleTitle,
  setReadlist,
}) {
  setReadlist((prevReadlist) => ({
    ...prevReadlist,
    dateModified: new Date().toISOString(),
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
 * @param {string} articleUrl
 * @param {function} setArticlePreviewUrl
 */
function handleSelectReadlistArticle({ setArticlePreviewUrl, articleUrl }) {
  setArticlePreviewUrl(articleUrl);
}

/**
 * @param {string} articleUrl
 * @param {function} setReadlist
 */
function handleDeleteReadlist({ setReadlist, articleUrl }) {
  setReadlist((prevReadlist) => ({
    ...prevReadlist,
    dateModified: new Date().toISOString(),
    articles: prevReadlist.articles.filter(
      (prevArticle) => prevArticle.url !== articleUrl
    ),
  }));
}

/**
 * @param {string} articleUrl
 * @param {number} currentIndex
 * @param {number} newIndex
 * @param {function} setReadlist
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
