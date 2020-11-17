import { html, React } from "../deps.js";
const { useState, useRef, useEffect } = React;

let prevArticle = {};

export default function ArticlePreview({
  articlePreviewUrl,
  setArticlePreviewUrl,
  readlist,
}) {
  const div = useRef(null);
  let article;

  // referencing the previous article gets me the animation i want.
  // hacky but it works.
  if (!articlePreviewUrl) {
    article = {};
    readlist = {};
    document.body.style.overflow = "auto";
  } else {
    article = readlist.articles.find(
      (article) => article.url === articlePreviewUrl
    );
    prevArticle = article;
    document.body.style.overflow = "hidden";
  }

  // useEffect(() => {
  //   // div.current.attachShadow({ mode: "closed" });
  // }, []);

  const { url, date_published, title, author, content } = prevArticle;
  return html`
    <div
      ref=${div}
      class="article-preview"
      hidden=${!articlePreviewUrl}
      onClick=${(e) => {
        div.current.scrollTop = 0;
        setArticlePreviewUrl("");
      }}
    >
      <div>
        <header>
          <h1>${title}</h1>
          <p>
            <a href=${url} class="link" target="__blank"> ${url} </a>
          </p>
        </header>

        <div
          class="article-preview__content"
          dangerouslySetInnerHTML=${{ __html: content }}
        />
      </div>
    </div>
  `;
}
