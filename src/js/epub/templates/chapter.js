export default function chapter(chapter) {
  const { title, url, content } = chapter;
  return `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
      <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      </head>
    <body>
      <h1>${title}</h1>
      <p><a href="${url}">${url}</a></p>
      ${content}
    </body>
    </html>
  `;
}
