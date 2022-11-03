// node --experimental-vm-modules node_modules/.bin/jest
import { fetchArticle } from "./fetch-article.server.js";
// import { expect } from "expect";

test("add", async () => {
  return fetchArticle(
    "https://blog.jim-nielsen.com/2022/the-message-and-medium-of-the-personal-blog/",
    {
      html: `<!doctype html><body><article><h1>Hello World</h1></article></body></html>`,
    }
  ).then((article) => {
    expect(article).toHaveProperty("url");
    expect(article).toHaveProperty("content");
    console.log(article.content);
  });

  // fetchArticle("https://basecamp.com/shapeup/1.1-chapter-02").then(
  //   (article) => {
  //     // console.log(article.content);
  //   }
  // );
});
