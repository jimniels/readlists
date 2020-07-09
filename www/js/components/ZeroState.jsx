import React, {
  useState,
} from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import { isValidHttpUrl, validateReadlist } from "../utils.js";

export default function ZeroState({ readlist, setReadlist, setError }) {
  const [remoteReadlistUrl, setRemoteReadlistUrl] = useState(
    getRemoteReadlistUrl()
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNewReadlist = () => {
    const d = new Date().toISOString();
    const newReadlist = {
      dateCreated: d,
      dateModified: d,
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

  const classes = ["wrapper", "login", readlist ? "" : "login--visible"].join(
    " "
  );

  return (
    <form
      onSubmit={handleImportFromUrl}
      class={classes}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (readlist) {
          return false;
        }
        // Style the drag-and-drop as a "copy file" operation.
        e.dataTransfer.dropEffect = "copy";
        e.target.classList.add("dragging");
      }}
      onDragLeave={(e) => {
        e.target.classList.remove("dragging");
      }}
      onDrop={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (readlist) {
          return false;
        }

        e.target.classList.remove("dragging");

        const file = event.dataTransfer.files[0];
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
      <button
        class="button button--primary"
        onClick={handleCreateNewReadlist}
        disabled={isLoading}
        type="button"
      >
        Create New Readlist
      </button>

      <span class="login__or">or</span>

      <div class="login__form">
        <input
          type="text"
          placeholder="https://domain.com/readlist.json"
          value={remoteReadlistUrl}
          onChange={(e) => {
            setRemoteReadlistUrl(e.target.value);
          }}
        />
        <button
          id="login"
          class={`button ${isLoading ? "button--is-loading" : ""}`}
          type="submit"
          disabled={isLoading}
        >
          Import Remote Readlist
        </button>
      </div>

      <span class="login__or">or</span>

      <label for="exampleInput" class="button" disabled={isLoading}>
        Select Local Readlist...
        <input
          type="file"
          id="exampleInput"
          onChange={(e) => {
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
          style={{ display: "none" }}
          accept=".json"
        />
      </label>

      <span class="login__or">
        or drag and drop a Readlist JSON file here...
      </span>
    </form>
  );
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
