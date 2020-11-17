import getContent from "./templates/content.js";
import getChapter from "./templates/chapter.js";
import getContainer from "./templates/container.js";
import getToc from "./templates/toc.js";
import { getImgExt, importUMD, slugify } from "../utils.js";
import generateUUID from "https://unpkg.com/uuid@8.3.1/dist/esm-browser/v4.js?module";

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
   * @property {Array} chapters.images [["1830-1923.png", "image/png", blob], [...]]
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

        // @TODO check for dups, either by the img url or by fingerprinting
        // the file itself. If there are doubles, don't create a nother image
        // for the epub file. Just use the one you already have.
        const images = await Promise.all(
          Array.from($html.querySelectorAll("img")).map(async ($img) => {
            const src = $img.getAttribute("src");

            if ($img.hasAttribute("srcset")) {
              $img.removeAttribute("srcset");
            }

            const res = await fetch(
              "https://cors-anywhere.herokuapp.com/" + src
            );

            // If you can't find the image, get a placeholder
            if (!res.ok) {
              console.log("Failed to fetch (will use placeholder):", src);
              $img.setAttribute("src", "images/img-placeholder.jpg");
              return null;
            }

            // Otherwise we got our image
            const imgBlob = await res.blob();
            console.log("Fetched", src);

            const uuid = generateUUID();
            const ext = getImgExt({ mimeType: imgBlob.type, fileUrl: src });
            const id = `${uuid}.${ext}`;

            $img.setAttribute("src", `images/${id}`);
            return [id, imgBlob.type, imgBlob];
          })
        ).then((imgs) => imgs.filter((img) => img)); // don't keep anything returned as null

        // Remove things that throw errors and that you wouldn't expect to have
        // in an epub file.
        // @TODO SVGs should probably be included as images
        Array.from(
          $html.querySelectorAll("template, picture > source")
        ).forEach(($node) => {
          $node.remove();
        });

        return {
          // id for the file name, i.e. 001
          id: String(index).padStart(3, "0"),
          title: article.title || "[Untitled]",
          url: article.url,
          // Turn HTML into xhtml
          content: new XMLSerializer().serializeToString(
            // @TODO remove xmlns?
            // results in <div xmlns="http://www.w3.org/1999/xhtml">content</div>"
            $html.querySelector("body > div")
          ),
          images,
        };
      })
    ),
  };

  console.log(
    "Fetched %s images total.",
    epub.chapters
      .map((chapter) => chapter.images.length)
      .reduce((a, b) => a + b, 0)
  );

  /*
    https://www.edrlab.org/open-standards/anatomy-of-an-epub-3-file/

    mimetype
    META-INF/
      container.xml
    OEBPS/
      content.opf
      0.xhtml
      1.xhtml
      ...
      images/
        ...
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

  // Placeholder image
  const placeholderImg = await fetch(
    "/assets/img-placeholder.jpg"
  ).then((res) => res.blob());
  zip.file("OEBPS/images/img-placeholder.jpg", placeholderImg);

  return zip
    .generateAsync({ type: "blob", mimeType: "application/epub+zip" })
    .then((content) => {
      // see FileSaver.js
      saveAs(content, `${slugify(epub.title)}.epub`);
    });
}
