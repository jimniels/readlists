import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div class="wrapper" style={{ padding: 0 }}>
      <div class="ZeroState">
        <div class="ZeroState__container">
          <Link to="/create" class="button button--primary">
            Create Readlist
          </Link>
        </div>

        <div
          class="ZeroState__container"
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
          <label htmlFor="exampleInput" class="button">
            Import Local Readlist...
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

          <span class="ZeroState-small-text">
            or drag and drop a Readlist JSON file here...
          </span>
        </div>

        <form method="get" action="/create" class="ZeroState__container">
          <input
            type="url"
            name="url"
            placeholder="https://domain.com/readlist.json"
            required
          />
          <button
            id="login"
            class={`button ${false ? "button--is-loading" : ""}`}
            type="submit"
          >
            Import Remote Readlist
          </button>
        </form>
      </div>
    </div>
  );
}
