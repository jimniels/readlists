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

    fetch(remoteReadlistUrl)
      .then((res) => res.json())
      .then((dangerousReadlist) =>
        validateReadlist(dangerousReadlist, { verbose: true })
      )
      .then((readlist) => {
        if (!readlist) {
          setError(
            "Failed to validate the remote Readlist. Check console for more details."
          );
          return;
        }

        setReadlist(readlist);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to retrieve the remote Readlist file.");
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
          const json = JSON.parse(reader.result);
          // @TODO validate, then set initially
          validateReadlist(json)
            .then((readlist) => {
              console.log("fired", readlist);
              if (readlist) {
                setReadlist(readlist);
              } else {
                throw new Error("Readlist validation failed");
              }
            })
            .catch((e) => {
              console.error(e);
              setError(
                "Could not validate JSON file. Ensure it matches the correct data schema."
              );
            });
        };
      }}
    >
      <button
        class="button button--primary"
        onClick={handleCreateNewReadlist}
        disabled={isLoading}
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
        <button id="login" class="button" type="submit" disabled={isLoading}>
          Import Remote Readlist
        </button>
      </div>

      <span class="login__or">or</span>

      <label for="exampleInput" class="button">
        Select Local Readlist...
        <input
          type="file"
          id="exampleInput"
          onChange={(e) => {
            console.log(e.target.files[0]);
            // parse it
            // then validateReadlist()
            // @TODO
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
