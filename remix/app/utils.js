/**
 * https://stackoverflow.com/a/27979933/1339693
 * @param {string} unsafe
 * @returns {string}
 */
export function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}

export function parseReadlistFromFormData(formData) {
  let readlist = {
    title: formData.get("readlist.title") || "",
    description: formData.get("readlist.description") || "",
    date_created:
      formData.get("readlist.date_created") || new Date().toISOString(),
    date_modified: formData.get("readlist.date_modified"),
    articles: [],
  };

  // Keys for each readlist article
  const articleKeys = [
    "title",
    "domain",
    "author",
    "url",
    "excerpt",
    "content",
  ];
  // {
  //   title: ["First article title", "Second article title", ...]
  //   domain: ["https://theverge.com/first/article", "https://example.com/second/article", ...]
  // }
  const articleValuesByKey = articleKeys.reduce((acc, key) => {
    acc[key] = formData.getAll(`readlist.articles[].${key}`);
    return acc;
  }, {});

  // Now build an array of articles cross-referencing the formData we got
  articleValuesByKey[articleKeys[0]].forEach((_, i) => {
    readlist.articles[i] = {};
    articleKeys.forEach((key) => {
      readlist.articles[i][key] = articleValuesByKey[key][i];
    });
  });

  // console.log("formData => readlist", readlist);
  return readlist;
}
