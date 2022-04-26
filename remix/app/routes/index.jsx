import { useActionData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import Readlist from "../components/Readlist.jsx";

export async function action({ request }) {
  const form = await request.formData();
  const readlist = {
    title: form.get("title"),
    description: form.get("description"),
  };
  console.log(readlist);
  return json({ title: "Test", _action: form.get("_action") || "" });
}

export default function Index() {
  const actionData = useActionData();
  console.log(actionData);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <Header />

      {actionData?._action === "save-readlist" ? (
        <Readlist
          readlist={{
            title: "Readlist title",
            date_modified: "2022-04-25",
            date_created: "2022-04-25",
            articles: [],
          }}
        />
      ) : (
        <ZeroState />
      )}
    </div>
  );
}

function Header() {
  const learnMoreIsVisible = false;

  const btnClasses = [
    "button",
    "button--circle",
    learnMoreIsVisible ? "button--primary button--is-active" : "",
  ].join(" ");

  return (
    <>
      <header class="Header wrapper">
        <h1 class="Header__title">Readlists</h1>
        <button
          class={btnClasses}
          title={`${learnMoreIsVisible ? "Hide" : "Show"} more info`}
        >
          ?
        </button>
      </header>
      {learnMoreIsVisible && (
        <div class="Header__learn-more">
          <p>
            What’s a Readlist? It’s like a mixtape, but for reading. Collect
            information across the web and package it up into a nice little
            ebook for reading on your favorite device.
          </p>
          <p>
            Readlists are saved locally in your browser (using${" "}
            <code>localStorage</code>). You can save the data of a Readlist to a
            JSON file, host it at a URL, and then allow others to import it
            themselves. It falls to you to save and distribute (the URLs for)
            your Readlists. Yeah it’s more work for you, but hey, on the flip
            side the data is all yours. Do whatever you want with it.
          </p>
          <p>
            Want to know more technical details? Check out${" "}
            <a href="https://github.com/jimniels/readlists">
              the project on Github.
            </a>
            .
          </p>

          <p>
            Made by <a href="https://www.jim-nielsen.com">Jim Nielsen</a> (
            <a href="https://twitter.com/jimniels">@jimniels</a> on twitter).
            Readlists version <code>${window.VERSION}</code>
          </p>
        </div>
      )}
    </>
  );
}

function ZeroState({ readlist, setReadlist, setError }) {
  return (
    <div class="wrapper" style={{ padding: 0 }}>
      <div class="ZeroState">
        <form method="POST" class="ZeroState__container" action="/?index">
          <input type="hidden" name="_action" value="save-readlist" />
          <button class="button button--primary" type="submit">
            Create Readlist
          </button>
        </form>

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
          <label for="exampleInput" class="button">
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

        <div class="ZeroState__container">
          <input
            type="text"
            placeholder="https://domain.com/readlist.json"
            onChange={(e) => {
              setRemoteReadlistUrl(e.target.value);
            }}
          />
          <button
            id="login"
            class={`button ${false ? "button--is-loading" : ""}`}
            type="submit"
          >
            Import Remote Readlist
          </button>
        </div>
      </div>
    </div>
  );
}
