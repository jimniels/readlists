import { html, React } from "../deps.js";
import ReadlistArticleInput from "./ReadlistArticleInput.js";
import ReadlistArticles from "./ReadlistArticles.js";
import Textarea from "./Textarea.js";
import { downloadFile, slugify } from "../utils.js";
const { useState } = React;

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
          ${readlist.articles
            .map(
              (article) => `<h1>${article.title}</h1>${article.content}<hr />`
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
    const articlesCount = readlist.articles.length;
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
      date_modified: new Date().toISOString(),
    }));
  };

  if (!readlist) {
    return null;
  }

  const date_modified = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    minute: "numeric",
    hour: "numeric",
  }).format(new Date(readlist.date_modified));
  const date_created = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(readlist.date_created));

  const disabledButtons = isLoadingEpub || readlist.articles.length === 0;

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

        <dl class="readlist-header__meta">
          <dt>Created</dt>
          <dd>${date_created}</dd>
          <dt>Last modified</dt>
          <dd>${date_modified}</dd>
        </dl>
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
