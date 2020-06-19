// @TODO have the client POST json of the list, so we dont' have to bring
// dropbox auth into here. Then this merely does the conversion to epub and downloads
// https://stackoverflow.com/questions/53297978/amazon-lambda-return-docx-file-node-js

const Epub = require("epub-gen");
const fs = require("fs");

// @TODO where to output the file? to user's dropbox? where, just a temp folder?

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
exports.handler = async (event, context) => {
  // @TODO check for correct query params
  const book = JSON.parse(event.body);

  // if (!listId) {
  //   return {
  //     statusCode: 400,
  //     body:
  //       "Invalid request. URL paramter is required, i.e. `?list-id=123456789...`",
  //   };
  // }

  try {
    // const list = await getList(listId);
    // const listArticleContents = await Promise.all(
    //   list.articles.map((article) => getArticle(article.id))
    // );

    // const options = {
    //   title: list.title,
    //   author: "Readlist", // @TODO user
    //   publisher: "Readlist",
    //   // cover, // @TODO image cover?
    //   content: list.articles.map((article, i) => {
    //     return {
    //       title: article.title,
    //       ...(article.author ? { author: article.author } : {}),
    //       data: listArticleContents[i], // local image paths?
    //     };
    //   }),
    // };

    await new Epub(book, "./readlist.epub").promise;
    const fileBase64 = fs.readFileSync("./readlist.epub", {
      encoding: "base64",
    });

    return {
      statusCode: 200,
      body: fileBase64,
      // // more keys you can return:
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="my-readlist.epub`,
      },
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
