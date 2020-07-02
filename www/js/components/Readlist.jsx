import React, { useState } from "https://unpkg.com/es-react/react.js";

export default function Readlist({ appState: { readlist }, setAppState }) {
  const handleSaveReadlist = () => {};
  const handleExportEpub = () => {};
  const handleDeleteActiveReadlist = () => {
    setAppState({ readlist: null });
  };
  const handleUpdatePartOfReadlist = () => {};

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
          <button
            class="button button--danger"
            onClick={handleDeleteActiveReadlist}
          >
            Delete
          </button>
        </div>

        <textarea
          class="readlist-header__title"
          placeholder="Readlist title..."
          onblur={handleUpdatePartOfReadlist}
          data-action-value="title"
        >
          {readlist.title}
        </textarea>

        <textarea
          class="readlist-header__description"
          placeholder="Readlist description..."
          onblur={handleUpdatePartOfReadlist}
          data-action-value="description"
        >
          {readlist.description}
        </textarea>

        <p class="readlist-header__meta">
          <span>
            Created
            <local-time
              month="short"
              day="numeric"
              year="numeric"
              datetime="${readlist.dateCreated}"
            ></local-time>
          </span>{" "}
          ·{" "}
          <span>
            Last modified <time-ago datetime={readlist.dateModified}></time-ago>
          </span>
        </p>
      </header>
    </div>
  );
}
