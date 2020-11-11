export default async function epub(readlist) {
  // Import our UMD deps
  await Promise.all([
    importUMD("https://unpkg.com/jszip@3.5.0/dist/jszip.min.js"), // window.JSZip
    importUMD("https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js"), // window.saveAs
  ]);

  let zip = new JSZip();
  zip.file("Hello.txt", "Hello World\n");
  zip.file("mimetype", "application/epub+zip");
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8" ?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`
  );
  zip.file("OEBPS/content.opf", getContent(readlist));
  readlist.articles.forEach((article, index) => {
    zip.file(`OEBPS/${index}.xhtml`, getChapter(article));
  });

  // var img = zip.folder("images");
  // img.file("smile.gif", imgData, { base64: true });
  return zip.generateAsync({ type: "blob" }).then((content) => {
    // see FileSaver.js
    console.log(content);
    saveAs(content, "example.zip");
  });
}

function importUMD(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      reject(err);
    };
    script.src = url;

    document.head.appendChild(script);
  });
}

function getChapter(article) {
  const { title, url, content } = article;
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
  ${content}
</body>
</html>
`;
}

function getContent(readlist) {
  const author = "anonymous";
  const publisher = "anonymous";
  const title = readlist.title;

  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var stringDate = "" + year + "-" + month + "-" + day;

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf"
    version="3.0"
    unique-identifier="BookId"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:dcterms="http://purl.org/dc/terms/"
    xml:lang="en"
    xmlns:media="http://www.idpf.org/epub/vocab/overlays/#"
    prefix="ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/">

    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/"
              xmlns:opf="http://www.idpf.org/2007/opf">

        <dc:identifier id="BookId">${Date.now()}</dc:identifier>
        <meta refines="#BookId" property="identifier-type" scheme="onix:codelist5">22</meta>
        <meta property="dcterms:identifier" id="meta-identifier">BookId</meta>
        <dc:title>${title}</dc:title>
        <meta property="dcterms:title" id="meta-title">${title}</meta>
        <dc:language>en</dc:language>
        <meta property="dcterms:language" id="meta-language">en</meta>
        <meta property="dcterms:modified">${
          new Date().toISOString().split(".")[0] + "Z"
        }</meta>
        <dc:creator id="creator">${author}</dc:creator>
        <meta refines="#creator" property="file-as">${author}</meta>
        <meta property="dcterms:publisher">${publisher}</meta>
        <dc:publisher>${publisher}</dc:publisher>
        <meta property="dcterms:date">${stringDate}</meta>
        <dc:date>${stringDate}</dc:date>
        <meta property="dcterms:rights">All rights reserved</meta>
        <dc:rights>Copyright &#x00A9; ${new Date().getFullYear()} by ${publisher}</dc:rights>
        <meta name="cover" content="image_cover"/>
        <meta name="generator" content="epub-gen" />
        <meta property="ibooks:specified-fonts">true</meta>

    </metadata>

    <manifest>
        <!--
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
        <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
        <item id="css" href="style.css" media-type="text/css" />
        -->

        <!--
        <% if(locals.cover) { %>
        <item id="image_cover" href="cover.<%= _coverExtension %>" media-type="<%= _coverMediaType %>" />
        <% } %>
        
        
        <% images.forEach(function(image, index){ %>
        <item id="image_<%= index %>" href="images/<%= image.id %>.<%= image.extension %>" media-type="<%= image.mediaType %>" />
        <% }) %>
        -->
        
        <!-- id="content_<%= index %>_<%= content.id %>" -->
        ${readlist.articles
          .map(
            (content, index) =>
              `<item id="content_${index}" href="${index}.xhtml" media-type="application/xhtml+xml" />`
          )
          .join("\n")}
        
    </manifest>
</package>
  `;
}
