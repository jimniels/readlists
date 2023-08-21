import { React, html } from "../deps.js";

export default function ExisitingReadlistMsg({ readlist }) {
  const url = new URL(window.location.href);
  const parmas = new URLSearchParams(url.search);
  const importUrl = parmas.get("import");

  if (!importUrl || !readlist) {
    return null;
  }

  return html`
    <div class="wrapper">
      <div class="ImportMsg">
        <p>
          You tried to import a a Readlist via the URL but you already have one
          open. Please save and/or delete the exisiting Readlist then reload the
          page.
        </p>
      </div>
      <style>
        .ImportMsg.wrapper {
          margin-top: 0;
          margin-bottom: 0;
        }
        .ImportMsg p {
          background-color: var(--color-text);
          color: white;
          border-radius: var(--border-radius);
          padding: calc(var(--spacer)) calc(var(--spacer) * 2);
          margin: 0;
        }
      </style>
    </div>
  `;
}
