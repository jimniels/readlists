export default function content(readlist) {
  const author = "anonymous";
  const publisher = "anonymous";
  const { description, title } = readlist;
  const modified = new Date().toISOString().split(".")[0] + "Z";

  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var stringDate = "" + year + "-" + month + "-" + day;

  return `<?xml version="1.0" encoding="UTF-8"?>
<package
  xmlns="http://www.idpf.org/2007/opf"
  xmlns:opf="http://www.idpf.org/2007/opf"
  version="3.0"
  unique-identifier="BookId"
  >
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    ${/* @TODO figure out the ID stuff */ ""}
    <dc:identifier id="BookId">${Date.now()}</dc:identifier>
      <meta refines="#BookId" property="identifier-type" scheme="onix:codelist5">22</meta>
      <meta property="dcterms:identifier" id="meta-identifier">BookId</meta>
    
    <dc:title>${title}</dc:title>
    <dc:language>en</dc:language>
    ${description ? `<dc:description>${description}</dc:description>` : ""}
    <dc:creator id="creator">${author}</dc:creator>
    <dc:publisher>${publisher}</dc:publisher>
    
    <meta name="generator" content="readlists.jim-nielsen.com" />    
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>

    <manifest>
      <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
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

      ${readlist.articles
        .map(
          (article, index) =>
            `<item
              id="chapter-${article.epubId}"
              href="${article.epubId}.xhtml"
              media-type="application/xhtml+xml"
            />`
        )
        .join("\n")}
        
    </manifest>
    <spine>
      ${readlist.articles
        .map(
          (article, index) => `<itemref idref="chapter-${article.epubId}" />`
        )
        .join("\n")}
    </spine>
    <guide>
      <reference title="Table of content" type="toc" href="toc.xhtml"/>
    </guide>
</package>
  `;
}
