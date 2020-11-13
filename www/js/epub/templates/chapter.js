export default function chapter(article) {
  const { title, url, content } = article;
  const html = new DOMParser().parseFromString(
    "<div>" + content + "</div>",
    "text/html"
  );
  const xhtml = new XMLSerializer().serializeToString(
    // @TODO remove xmlns
    html.querySelector("body > div")
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
      <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <!-- <link rel="stylesheet" type="text/css" href="style.css" /> -->
      </head>
    <body>
      <h1>${title}</h1>
      <p><a href="${url}">${url}</a></p>
      ${xhtml}
    </body>
    </html>
  `;
}
