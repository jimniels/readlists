import React, { useState } from "https://unpkg.com/es-react/react.js";

export default function ZeroState({ appState, setAppState }) {
  const handleCreateNewReadlist = () => {
    const d = new Date().toISOString();
    const readlist = {
      dateCreated: d,
      dateModified: d,
      title: "Untitled Readlist",
      description: "",
      articles: [],
    };
    setAppState({ readlist });
  };

  const handleImportFromUrl = () => {};

  return (
    <div class="login wrapper">
      <button class="button button--primary" onClick={handleCreateNewReadlist}>
        Create Readlist
      </button>

      <span>or</span>

      <form class="login__form" onsubmit={handleImportFromUrl}>
        <input
          type="text"
          name="readlist-url"
          placeholder="https://domain.com/readlist.json"
        />
        <button id="login" class="button" type="submit">
          Import from URL
        </button>
      </form>
      {/*
              <button class="button">Choose a Readlist...</button>
              <label for="exampleInput" class="button">
                Choose a Readlist...
                <input
                  type="file"
                  id="exampleInput"
                  style="display: none"
                  accept=".json"
                />
              </label>
              */}
    </div>
  );
}
