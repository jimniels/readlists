import React, {
  useState,
} from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import ReaddlistArticleInput from "./ReadlistArticleInput.js";
import ReadlistArticles from "./ReadlistArticles.js";
import Textarea from "./Textarea.js";
import { downloadFile, slugify } from "../utils.js";

export default function Readlist({ readlist, setReadlist, setError }) {
  const handleSaveReadlist = () => {
    downloadFile({
      file: `${slugify(readlist.title)}.${readlist.dateModified}.json`,
      contents: JSON.stringify(readlist),
    });
  };

  const handleExportEpub = () => {};
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

  const handleCreateReadlistArticle = () => {};

  if (!readlist) {
    return null;
  }

  return (
    <div class="readlist wrapper">
      <header class="readlist-header">
        {/* @TODO redo CSS classes here */}
        <div class="readlist-header__actions actions">
          <button class="button button--primary" onClick={handleSaveReadlist}>
            Save Readlist
          </button>
          <button class="button" onClick={handleExportEpub}>
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
          onChange={(e) => {
            handleUpdatePartOfReadlist("title", e.target.value);
          }}
          value={readlist.title}
        />

        <Textarea
          class="readlist-header__description"
          placeholder="Readlist description..."
          onChange={(e) => {
            handleUpdatePartOfReadlist("description", e.target.value);
          }}
          value={readlist.description}
        />

        <dl class="readlist-header__meta">
          <dt>Created</dt>
          <dd>
            <local-time
              month="short"
              day="numeric"
              year="numeric"
              datetime={readlist.dateCreated}
            ></local-time>
          </dd>
          <dt>Last modified</dt>
          <dd>
            <time-ago datetime={readlist.dateModified}></time-ago>
          </dd>
        </dl>
      </header>

      <ReadlistArticles readlist={readlist} setReadlist={setReadlist} />

      <ReaddlistArticleInput
        readlist={readlist}
        setReadlist={setReadlist}
        setError={setError}
      />
    </div>
  );
}
