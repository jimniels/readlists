import React, { useState } from "react";
import ReaddlistArticleInput from "./ReadlistArticleInput.js";
import ReadlistArticles from "./ReadlistArticles.js";
import Textarea from "./Textarea.js";
import { downloadFile, slugify } from "../utils.js";
import { fetchEpub } from "../api.js";

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
    // @TODO rename to downloadEpub and put all this in the API part?
    setIsLoadingEpub(true);
    fetchEpub(readlist)
      .then(({ link }) => {
        // https://stackoverflow.com/questions/4545311/download-a-file-by-jquery-ajax
        // const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = link;
        // the filename you want
        a.download = `${slugify(readlist.title)}.epub`;
        document.body.appendChild(a);
        a.click();
        // window.URL.revokeObjectURL(url);
      })
      .catch((e) => {
        console.error(e);
        setError("There was a problem exporting your epub.");
      })
      .finally(() => {
        setIsLoadingEpub(false);
      });
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
      dateModified: new Date().toISOString(),
    }));
  };

  if (!readlist) {
    return null;
  }

  const dateModified = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    minute: "numeric",
    hour: "numeric",
  }).format(new Date(readlist.dateModified));
  const dateCreated = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(readlist.dateCreated));

  return (
    <div class="readlist wrapper">
      <header class="readlist-header">
        {/* @TODO redo CSS classes here */}
        <div class="readlist-header__actions actions">
          <button class="button button--primary" onClick={handleSaveReadlist}>
            Save Readlist
          </button>
          <button
            class={`button ${isLoadingEpub ? "button--is-loading" : ""}`}
            onClick={handleExportEpub}
            disabled={isLoadingEpub}
          >
            Export as .epub
          </button>
          <button class="button" disabled>
            Export as .mobi
          </button>
          <button class="button button--danger" onClick={handleDeleteReadlist}>
            Delete
          </button>
        </div>

        <Textarea
          class="readlist-header__title"
          placeholder="Readlist title..."
          onBlur={(e) => {
            handleUpdatePartOfReadlist("title", e.target.value);
          }}
          defaultValue={readlist.title}
        />

        <Textarea
          class="readlist-header__description"
          placeholder="Readlist description..."
          onBlur={(e) => {
            handleUpdatePartOfReadlist("description", e.target.value);
          }}
          defaultValue={readlist.description}
        />

        <dl class="readlist-header__meta">
          <dt>Created</dt>
          <dd>{dateCreated}</dd>
          <dt>Last modified</dt>
          <dd>{dateModified}</dd>
        </dl>
      </header>

      <ReadlistArticles
        readlist={readlist}
        setReadlist={setReadlist}
        setArticlePreviewUrl={setArticlePreviewUrl}
      />

      <ReaddlistArticleInput
        readlist={readlist}
        setReadlist={setReadlist}
        setError={setError}
      />
    </div>
  );
}
