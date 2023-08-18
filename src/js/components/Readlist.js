import { html, React } from "../deps.js";
import ReadlistArticleInput from "./ReadlistArticleInput.js";
import ReadlistArticles from "./ReadlistArticles.js";
import Textarea from "./Textarea.js";
import { downloadFile, slugify } from "../utils.js";
const { useState } = React;

/**
 * @callback SetStateReadlist
 * @param {Readlist | ((prevState: Readlist) => Readlist)} newState - The new state value or a function that updates the state.
 */

/**
 * @param {object} props
 * @param {Readlist} props.readlist
 * @param {SetStateReadlist} props.setReadlist
 * @param {(string) => void} props.setError
 * @param {(string) => void} props.setArticlePreviewUrl
 */
export default function Readlist({
  readlist,
  setReadlist,
  setError,
  setArticlePreviewUrl,
}) {
  const [isLoadingEpub, setIsLoadingEpub] = useState(false);
  const handleSaveReadlist = () => {
    downloadFile({
      file: `${slugify(readlist.title)}.json`,
      contents: JSON.stringify(readlist),
    });
  };

  const handleExportEpub = (e) => {
    setIsLoadingEpub(true);

    import("../epub/index.js")
      .then((module) => {
        const exportToEpub = module.default;
        return exportToEpub(readlist);
      })
      .catch((e) => {
        console.error(e);
        setError("There was a problem exporting your epub.");
      })
      .finally(() => {
        setIsLoadingEpub(false);
      });
  };

  const handleExportHtml = (e) => {
    let data = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Readlist: ${readlist.title}</title>
        </head>
        <body>
          <h1>${readlist.title}</h1>
          <hr />
          ${readlist.items
            .map(
              (article) =>
                `<h1>${article.title}</h1>${article.content_html}<hr />`
            )
            .join("")}
          <footer>Generated as a <a href="https://readlists.jim-nielsen.com">Readlist</a></footer>
        </body>
      </html>
    `;
    const blob = new Blob([data], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };

  const handleDeleteReadlist = () => {
    const articlesCount = readlist.items.length;
    let msg = "Please confirm that you want to delete this Readlist";
    // @TODO message about saving
    if (articlesCount > 0) {
      msg +=
        ` and its ${articlesCount} article` + (articlesCount === 1 ? "" : "s");
    }
    msg += ".";

    if (window.confirm(msg)) {
      setReadlist(undefined);
    }
  };

  const handleUpdatePartOfReadlist = (key, value) => {
    setReadlist((prevReadlist) => ({
      ...prevReadlist,
      [key]: value,
    }));
  };

  if (!readlist) {
    return null;
  }

  const disabledButtons = isLoadingEpub || readlist.items.length === 0;

  return html`
    <div class="readlist wrapper">
      <header class="readlist-header">
        <!-- @TODO redo CSS classes here -->
        <div class="readlist-header__actions actions">
          <button class="button button--primary" onClick=${handleSaveReadlist}>
            Save Readlist
          </button>
          <button
            class="button ${isLoadingEpub ? "button--is-loading" : ""}"
            onClick=${handleExportEpub}
            disabled=${disabledButtons}
          >
            Export to .epub
          </button>
          <button
            class="button"
            onClick=${handleExportHtml}
            disabled=${disabledButtons}
          >
            Export to .html
          </button>
          <button class="button button--danger" onClick=${handleDeleteReadlist}>
            Delete
          </button>
        </div>

        <${Textarea}
          class="readlist-header__title"
          placeholder="Readlist title..."
          onBlur=${(e) => {
            handleUpdatePartOfReadlist("title", e.target.value);
          }}
          defaultValue=${readlist.title}
        />

        <${Textarea}
          class="readlist-header__description"
          placeholder="Readlist description..."
          onBlur=${(e) => {
            handleUpdatePartOfReadlist("description", e.target.value);
          }}
          defaultValue=${readlist.description}
        />
      </header>

      <${ReadlistArticles}
        readlist=${readlist}
        setReadlist=${setReadlist}
        setArticlePreviewUrl=${setArticlePreviewUrl}
      />

      <${ReadlistArticleInput}
        readlist=${readlist}
        setReadlist=${setReadlist}
        setError=${setError}
      />
    </div>
  `;
}
