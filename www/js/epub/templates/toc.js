export default function toc(readlist) {
  return `<?xml version='1.0' encoding='UTF-8'?>
    <html xmlns:epub="http://www.idpf.org/2007/ops" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <title>Table of Contents</title>
      <meta charset="UTF-8" />
    </head>
    <body>
      <h1>Table of Contents</h1>
      <nav id="toc" epub:type="toc">
        <ol>
          ${readlist.articles
            .map(
              (article, index) =>
                `<li id="chapter-${article.epubId}">
                  <a epub:type="bodymatter" href="${article.epubId}.xhtml">
                    ${article.title}
                  </a>
                </li>`
            )
            .join("\n")}
        </ol>
      </nav>
    </body>
    </html>
  `;
}
