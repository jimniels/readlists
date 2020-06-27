import { store } from "./redux.js";
import { resolveImgSrc } from "./utils.js";

// @TODO test with relative URL images somewhere
export function fetchArticle(url) {
  return fetch(`/api/html/?url=${url}`)
    .then((res) => res.text())
    .then((html) => window.Mercury.parse(url, { html }))
    .then((mercuryArticle) => {
      let dom = new DOMParser().parseFromString(
        mercuryArticle.content,
        "text/html"
      );
      let modified = false;
      Array.from(dom.querySelectorAll("img")).forEach((img) => {
        if (img.src.includes(location.hostname)) {
          const oldSrc = img.getAttribute("src");
          const newSrc = resolveImgSrc(mercuryArticle.url, oldSrc);
          if (__DEV__) {
            console.log(["Changed url:", oldSrc, newSrc].join("\n  "));
          }
          img.setAttribute("src", newSrc);
          modified = true;
        }
      });
      if (modified) {
        mercuryArticle = {
          ...mercuryArticle,
          content: dom.body.innerHTML,
        };
      }

      return mercuryArticle;
    });
}

export function fetchEpub(readlist) {
  // @TODO verify that the readlist actually has articles
  let book = {
    title: readlist.title,
    // author: "@TODO", // username?
    content: [],
    // array of objects with title and data
  };
  return Promise.all(
    readlist.articles.map((article) =>
      getArticleHTML({ readlistId: readlist.id, readlistArticleId: article.id })
    )
  ).then((articles) => {
    book.content = readlist.articles.map((article, i) => ({
      title: article.title,
      data: articles[i],
    }));

    return fetch(`/api/epub/`, {
      method: "POST",
      body: JSON.stringify(book),
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Failed to turn into an ebook");
      }
      return res.blob();
    });
  });
}
