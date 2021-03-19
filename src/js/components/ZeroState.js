import { React, html } from "../deps.js";
import { isValidHttpUrl, validateReadlist } from "../utils.js";
const { useState } = React;

export default function ZeroState({ readlist, setReadlist, setError }) {
  const [remoteReadlistUrl, setRemoteReadlistUrl] = useState(
    getRemoteReadlistUrl()
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNewReadlist = () => {
    const d = new Date().toISOString();
    const newReadlist = {
      date_created: d,
      date_modified: d,
      title: "Untitled Readlist",
      description: "",
      articles: [],
    };
    setReadlist(newReadlist);
  };

  const handleImportFromUrl = (e) => {
    e.preventDefault();

    if (!isValidHttpUrl(remoteReadlistUrl)) {
      setError("Please specify a valid HTTP(S) URL.");
      return;
    }

    setIsLoading(true);
    fetch(remoteReadlistUrl)
      .then((res) => res.json())
      .then((dangerousReadlist) =>
        validateReadlist(dangerousReadlist, { verbose: true })
      )
      .then((readlist) => {
        setReadlist(readlist);
      })
      .catch((e) => {
        console.error(e);
        setError(
          "Failed to retrieve, parse, and validate the remote Readlist file. Check the console for more details."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return html`
    <div class="wrapper" style=${{ padding: 0 }}>
      <form onSubmit=${handleImportFromUrl} class="ZeroState">
        <div class="ZeroState__container">
          <button
            class="button button--primary"
            onClick=${handleCreateNewReadlist}
            disabled=${isLoading}
            type="button"
          >
            Create Readlist
          </button>
        </div>

        <div
          class="ZeroState__container"
          onDragOver=${(e) => {
            e.stopPropagation();
            e.preventDefault();

            if (readlist) {
              return false;
            }
            // Style the drag-and-drop as a "copy file" operation.
            e.dataTransfer.dropEffect = "copy";
            e.target.classList.add("dragging");
          }}
          onDragLeave=${(e) => {
            e.target.classList.remove("dragging");
          }}
          onDrop=${(e) => {
            e.stopPropagation();
            e.preventDefault();

            if (readlist) {
              return false;
            }

            e.target.classList.remove("dragging");

            const file = e.dataTransfer.files[0];
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = () => {
              try {
                const json = JSON.parse(reader.result);
                validateReadlist(json, { verbose: true })
                  .then((readlist) => {
                    setReadlist(readlist);
                  })
                  .catch((e) => {
                    console.error(e);
                    setError(
                      "Could not validate JSON file. Ensure it matches the correct data schema."
                    );
                  });
              } catch (e) {
                console.error(e);
                setError("Failed to parse the JSON file.");
              }
            };
          }}
        >
          <label for="exampleInput" class="button" disabled=${isLoading}>
            Import Local Readlist...
            <input
              type="file"
              id="exampleInput"
              onChange=${(e) => {
                const file = e.target.files[0];
                if (!file) {
                  return;
                }

                // @TODO abstract into a promise?
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                  const json = JSON.parse(evt.target.result);
                  const readlist = validateReadlist(json)
                    .then((readlist) => {
                      setReadlist(readlist);
                    })
                    .catch((e) => {
                      console.error(e);
                      setError("Invalid Readlist JSON file.");
                    });
                };
                reader.onerror = function (evt) {
                  console.error("error reading local file");
                };
              }}
              style=${{ display: "none" }}
              accept=".json"
            />
          </label>

          <span class="ZeroState-small-text">
            or drag and drop a Readlist JSON file here...
          </span>
        </div>

        <div class="ZeroState__container">
          <input
            type="text"
            placeholder="https://domain.com/readlist.json"
            value=${remoteReadlistUrl}
            onChange=${(e) => {
              setRemoteReadlistUrl(e.target.value);
            }}
          />
          <button
            id="login"
            class="button ${isLoading ? "button--is-loading" : ""}"
            type="submit"
            disabled=${isLoading}
          >
            Import Remote Readlist
          </button>
        </div>
      </form>
      <style>
        .ZeroState {
          display: flex;
          flex-direction: column;
          width: 90%;
          justify-content: space-around;
          margin: 0 auto;
        }
        @media screen and (min-width: 700px) {
          .ZeroState {
            display: grid;
            grid-template-columns: 33% calc(67% - var(--spacer));
            grid-template-rows: 100px 100px;
            grid-gap: var(--spacer);
            width: 100%;
          }
          .ZerState__container {
            min-height: none;
            margin-bottom: 0%;
          }
        }
        .ZeroState__container {
          border-radius: var(--border-radius);
          background: var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          min-height: 100px;
          margin-bottom: var(--spacer);
        }
        .ZeroState__container:last-child {
          grid-column-start: 1;
          grid-column-end: 3;
        }
        .ZeroState__container:nth-child(2) {
          border: 3px dashed hsla(var(--color-text-light-hsl), 0.25);
        }
        .ZeroState input[type="text"] {
          width: 90%;
          margin-bottom: calc(var(--spacer) / 2);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          padding: calc(var(--spacer) / 2);
        }
        .ZeroState-small-text {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
          margin-top: calc(var(--spacer) / 4);
        }

        /* @TODO clean this up */
        .dragging {
          position: relative;
          border: none !important;
        }
        .dragging:hover {
          cursor: copy;
        }
        .dragging:after {
          content: "Drop Readlist JSON File Here...";
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: hsla(var(--color-bg-primary-hsl), 0.95);
          border: 4px dashed var(--color-accent);
          border-radius: var(--border-radius);
          font-size: var(--font-size-lg);
        }

        @supports (backdrop-filter: blur(10px)) {
          .dragging:after {
            backdrop-filter: blur(10px);
            background: hsla(var(--color-bg-primary-hsl), 0.75);
          }
        }
      </style>
    </div>
  `;
}

/**
 * Read in the `url` query param if it exists (and ensure it's a URL)
 * @returns {string}
 */
function getRemoteReadlistUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const readlistUrl = urlParams.get("url");
  return isValidHttpUrl(readlistUrl) ? readlistUrl : "";
}
