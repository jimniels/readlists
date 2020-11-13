import getContent from "./templates/content.js";
import getChapter from "./templates/chapter.js";
import getContainer from "./templates/container.js";
import getToc from "./templates/toc.js";

export default async function exportToEpub(readlist) {
  // Import our UMD deps
  await Promise.all([
    importUMD("https://unpkg.com/jszip@3.5.0/dist/jszip.min.js"), // window.JSZip
    importUMD("https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js"), // window.saveAs
  ]);

  // `title` fallback and an `epubId` just for our bookmaking
  readlist.articles = readlist.articles.map((article, index) => ({
    ...article,
    title: article.title || "[Untitled]",
    epubId: String(index).padStart(3, "0"),
  }));

  // Things for each image: add an `alt` if it doesn't

  /*
  https://www.edrlab.org/open-standards/anatomy-of-an-epub-3-file/

  mimetype
  META-INF/
    container.xml
  OEBPS/
    content.opf
    html/
      0.xhtml
      1.xhtml
      img src=../images/
    images/

  */

  let zip = new JSZip();
  zip.file("mimetype", "application/epub+zip");
  zip.file("META-INF/container.xml", getContainer());
  zip.file("OEBPS/content.opf", getContent(readlist));
  zip.file("OEBPS/toc.xhtml", getToc(readlist));
  readlist.articles.forEach((article, index) => {
    zip.file(`OEBPS/${article.epubId}.xhtml`, getChapter(article));
  });

  // var img = zip.folder("images");
  // img.file("smile.gif", imgData, { base64: true });
  return zip
    .generateAsync({ type: "blob", mimeType: "application/epub+zip" })
    .then((content) => {
      // see FileSaver.js
      console.log(content);
      saveAs(content, "example.epub");
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
