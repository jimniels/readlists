import getContent from "./templates/content.js";
import getChapter from "./templates/chapter.js";
import getContainer from "./templates/container.js";
import getToc from "./templates/toc.js";
import generateUUID from "https://unpkg.com/uuid@8.3.1/dist/esm-browser/v4.js?module";

// @TODO dynamically import this file upon click

export default async function exportToEpub(readlist) {
  // Import our UMD deps (since there's no official ESM build)
  await Promise.all([
    importUMD("https://unpkg.com/jszip@3.5.0/dist/jszip.min.js"), // window.JSZip
    importUMD("https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js"), // window.saveAs
  ]);

  /**
   * @typedef Epub
   * @property {string} title
   * @property {string} description
   * @property {Object} chapters
   * @property {string} chapters.id
   * @property {string} chapters.title
   * @property {string} chapters.content
   * @property {string} chapters.url
   * @property {Array} chapters.images
   */
  let epub = {
    title: readlist.title || "[Untitled]",
    description: readlist.description || "",
    chapters: await Promise.all(
      readlist.articles.map(async (article, index) => {
        const $html = new DOMParser().parseFromString(
          `<div>${article.content}</div>`,
          "text/html"
        );

        const images = await Promise.all(
          Array.from($html.querySelectorAll("img")).map(async ($img) => {
            const src = $img.getAttribute("src");

            try {
              const imgBlob = await fetch(
                "https://cors-anywhere.herokuapp.com/" + src
              ).then((res) => res.blob());
              console.log("Fetched", src);
              // console.log(imgBlob.type); this will give you the media-type you want

              const uuid = generateUUID();
              // https://stackoverflow.com/questions/6997262/how-to-pull-url-file-extension-out-of-url-string-using-javascript

              const ext = src.split(/[#?]/)[0].split(".").pop().trim();
              const id = `${uuid}.${ext}`;

              $img.setAttribute("src", `images/${id}`);
              return [id, imgBlob.type, imgBlob];
            } catch (e) {
              console.error("Failed to fetch %s. Removing from book.", src);
              $img.remove();
              return null;
              // @TODO consider maybe a placeholder instead, like "this was supposed
              // to be image at https://... but it couldn't be found"
            }
          })
        );

        // @TODO remove all SVGs
        // console.log($html);
        Array.from($html.querySelectorAll("template, svg")).forEach(($node) => {
          $node.remove();
        });

        return {
          // id for the file name, i.e. 001
          id: String(index).padStart(3, "0"),
          title: article.title || "[Untitled]",
          url: article.url,
          // xhtml content
          content: new XMLSerializer().serializeToString(
            // @TODO remove xmlns
            // results in <div xmlns="http://www.w3.org/1999/xhtml">content</div>"
            $html.querySelector("body > div")
          ),
          images: images.filter((v) => v),
        };
      })
    ),
    // [[id, mimetype], []]
    // images: [],
  };

  console.log(
    "Fetched %s images total.",
    epub.chapters
      .map((chapter) => chapter.images.length)
      .reduce((a, b) => a + b, 0)
  );

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
  zip.file("OEBPS/content.opf", getContent(epub));
  zip.file("OEBPS/toc.xhtml", getToc(epub));
  epub.chapters.forEach((chapter) => {
    zip.file(`OEBPS/${chapter.id}.xhtml`, getChapter(chapter));

    chapter.images.forEach(([id, type, blob]) => {
      zip.file(`OEBPS/images/${id}`, blob);
    });
  });

  // var img = zip.folder("images");
  // img.file("smile.gif", imgData, { base64: true });
  return zip
    .generateAsync({ type: "blob", mimeType: "application/epub+zip" })
    .then((content) => {
      // see FileSaver.js
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
