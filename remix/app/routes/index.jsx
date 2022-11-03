import { Link, useActionData, useLoaderData } from "@remix-run/react";
import {
  json,
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
} from "@remix-run/server-runtime";
import { fetchArticle } from "../utils/fetch-article.server.js";
import { validateReadlist } from "../utils/client-side-utils.js";
import Textarea from "../components/Textarea.jsx";
import ZeroState from "../components/ZeroState.jsx";
import { isValidUrl, parseReadlistFromFormData } from "../utils.js";

/*

GET / - App zero state
      - GET /?readlist=new
      - GET /?readlist=<string:url>
      - POST / <readlist-file-data>
GET /?readlist=new - New, empty readlist
GET /?readlist=<url> - Import a readlist from a URL
GET /?readlist=new&article=<string:url>[&article=<string:url>] - Create a new readlist with x URLs

POST /<readlist:formData> - Anytime there's a change. This should come with an action
POST /<readlist:file> - .json file upload of a readlist

*/

/**
 * @returns {Readlist}
 */
export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  const readlist = searchParams.get("readlist");
  if (readlist) {
    if (readlist === "new") {
      return json({
        readlist: {
          title: "Untitled Readlist",
          description: "",
          date_modified: new Date().toISOString(),
          date_created: new Date().toISOString(),
          articles: [],
        },
      });
    }

    // Passed in URL? We'll import that, validate it, parse it, and return it if relevant
    if (isValidUrl(readlist)) {
      let potentialReadlist = await fetch(readlist)
        .then((res) => res.json())
        .catch((err) => {
          console.error(
            `Failed to fetch & validate a valid readlist at URL: ${readlist}`,
            err
          );
          return {};
        });
      if (potentialReadlist.title && potentialReadlist.articles) {
        return json({ readlist: potentialReadlist });
      }
    }

    return json({
      readlist: undefined,
      error:
        "Invalid Readlist requested. Please modify your request and try again.",
    });
  }

  return { readlist: undefined, error: undefined };
}

export async function action({ request }) {
  const reqType = request.headers.get("Content-Type");
  console.log(reqType);

  /**
   * File Upload
   * For file uploads, validate it as a readlist, then return it. Otherwise
   * throw a generic error.
   * @TODO better, more specific error handling
   */
  if (reqType.startsWith("multipart/form-data")) {
    try {
      const uploadHandler = unstable_createMemoryUploadHandler({
        maxPartSize: 3000000,
        filter: ({ filename, contentType, name }) => {
          if (contentType && contentType !== "application/json") {
            throw new Error("A JSON file is required");
          }
          return true;
        },
      });
      const formData = await unstable_parseMultipartFormData(
        request,
        uploadHandler
      );
      const unsafeJSON = JSON.parse(await formData.get("readlist").text());
      const readlist = await validateReadlist(unsafeJSON);
      return json({ readlist, error: undefined });
    } catch (e) {
      return json({
        readlist: undefined,
        error:
          "Readlist upload failed. Ensure you upload a .json file with the correct Readlist structure.",
      });
    }
  }

  // @TODO handle POST of application/json from outside sources?
  // e.g. a raw Readlist with like a query param to get something back
  // POST / [form-data] Desired-Content-Type: epub?

  /**
   * POST from the GUI
   * Handle changes from the user done via the GUI, then return the new Readlist
   */
  const formData = await request.formData();
  const action = formData.get("__action") || "";

  if (action === "add-article") {
    // @TODO validate data?
    let readlist = parseReadlistFromFormData(formData);

    // @TODO validate URL as string and URL
    const newArticleUrl = formData.get("new-article-url");

    // @TODO validate HTML and sanitze it
    const html = formData.get("new-article-html");

    const index = readlist.articles.length; // Number(formData.get("new-article-index"));

    // @TODO catch error if fetching article fails
    // Failed to fetch article. Server returned ${res.status}: ${res.statusText}
    let article = await fetchArticle(newArticleUrl, { html });
    readlist.articles.splice(index, 0, article);
    // readlist.articles.push(article);
    readlist.date_modified = new Date().toISOString();

    return json({ readlist });
  }

  if (action.startsWith("delete-article-by-index-")) {
    const index = Number(action.split("delete-article-by-index-")[1]);
    console.log("DELETE readlist article: ", index + 1);
    const readlist = parseReadlistFromFormData(formData);
    readlist.articles.splice(index, 1);
    readlist.date_modified = new Date().toISOString();
    return json({ readlist });
  }

  if (action === "save-readlist") {
    // @TODO how to do this as a non-resource route
    const readlist = parseReadlistFromFormData(formData);
    readlist.date_modified = new Date().toISOString();
    return new Response(JSON.stringify(readlist, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename='MyFileName.ext'",
      },
    });
  }

  if (action.startsWith("reorder-article-")) {
    const readlist = parseReadlistFromFormData(formData);
    readlist.date_modified = new Date().toISOString();
    const oldIndex = Number(action.split("reorder-article-")[1]);
    const newIndex = Number(formData.get(`article-order-${oldIndex}`));
    console.log("Moving article %s to %s", oldIndex, newIndex);
    moveItemInArray(readlist.articles, oldIndex, newIndex);
    return json({ readlist });
  }

  // Otherwise, there was no action that we know of.
  // @TODO maybe just redirect to home?

  console.log(
    "Unknown or upecified `__action`: `%s`. Returning a new readlist.",
    action
  );
  throw json(
    {
      readlist: undefined,
      error: "Unknwon intent. Ensure you’re making the right server call.",
    },
    400
  );
}

function ErrorMsg(msg) {
  return (
    <p
      style={{
        backgroundColor: "red",
        color: "white",
        padding: "var(--spacer)",
        borderRadius: "var(--border-radius)",
      }}
    >
      {msg}
    </p>
  );
}

export default function Create() {
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const { error, readlist } = actionData ? actionData : loaderData;

  if (!readlist) {
    return (
      <>
        {error && ErrorMsg(error)}
        <ZeroState />
      </>
    );
  }

  return (
    <>
      {error && ErrorMsg(error)}
      <form action="/?index" method="POST" class="readlist">
        {/* This makes it so hitting "ENTER" submits like there's a new article
          URL since it's the first submit thing in the form */}
        <input type="submit" name="__action" value="add-article" hidden />

        <fieldset class="readlist-header">
          <div class="readlist-header__actions actions">
            <button
              class="button"
              formAction="/export?format=json"
              type="submit"
              formnovalidate="true"
            >
              Save Readlist
            </button>
            <button
              class="button isLoadingEpub button--is-loadingz"
              formAction="/export?format=epub"
              formnovalidate="true"
              type="submit"
            >
              Export EPUB
            </button>
            <button
              class="button"
              formAction="/export?format=html"
              formtarget="_blank"
              formnovalidate="true"
              type="submit"
            >
              Export HTML
            </button>

            {/* clear local state, then onClick={handleDeleteReadlist} */}
            <Link to="/" class="button button--danger">
              Delete
            </Link>
          </div>

          <Textarea
            class="readlist-header__title"
            placeholder="Readlist title..."
            onBlur={(e) => {
              handleUpdatePartOfReadlist("title", e.target.value);
            }}
            name="readlist.title"
            defaultValue={readlist.title}
          />

          <Textarea
            class="readlist-header__description"
            placeholder="Readlist description..."
            onBlur={(e) => {
              handleUpdatePartOfReadlist("description", e.target.value);
            }}
            name="readlist.description"
            defaultValue={readlist.description}
          />

          <dl class="readlist-header__meta">
            <dt>Created</dt>
            <dd>
              {new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                minute: "numeric",
                hour: "numeric",
              }).format(new Date(readlist.date_created))}
            </dd>
            <dt>Last modified</dt>
            <dd>
              {new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                minute: "numeric",
                hour: "numeric",
              }).format(new Date(readlist.date_modified))}
            </dd>
          </dl>
          <input
            type="hidden"
            name="readlist.date_created"
            value={readlist.date_created}
          />
          <input
            type="hidden"
            name="readlist.date_modified"
            value={readlist.date_modified}
          />
        </fieldset>

        <ul class="articles">
          {readlist.articles.map((article, articleIndex) => (
            <li class="article" key={articleIndex}>
              <div class="article__meta">
                <div
                  style={{ display: "flex", gap: "4px", alignItems: "center" }}
                >
                  <select
                    name={`article-order-${articleIndex}`}
                    defaultValue={articleIndex}
                  >
                    {/* <option value="" disabled selected>
                    Move to…
                  </option> */}
                    {[...Array(readlist.articles.length)].map(
                      (_undef, index) => (
                        <option
                          key={index}
                          value={index}
                          disabled={index === articleIndex}
                        >
                          {index + 1}
                        </option>
                      )
                    )}
                  </select>
                  <button
                    class="button"
                    name="__action"
                    value={`reorder-article-${articleIndex}`}
                    title="Reorder"
                    formnovalidate="true"
                  >
                    Reorder
                  </button>
                </div>
                <button
                  class="button button--danger"
                  name="__action"
                  value={`delete-article-by-index-${articleIndex}`}
                  type="submit"
                  formnovalidate="true"
                >
                  Delete
                </button>
              </div>

              <div class="article__main">
                <div>
                  {/* <input
                  type="number"
                  name="article-"
                  value={articleIndex + 1}
                  max={readlist.articles.length}
                  min="1"
                  required
                  style={{ width: "100%" }}
                /> */}
                  {/* <select defaultValue={articleIndex}>
                  {[...Array(readlist.articles.length + 1)].map(
                    (_undef, index) => (
                      <option
                        key={index}
                        value={index}
                        disabled={index === articleIndex}
                      >
                        {index + 1}
                      </option>
                    )
                  )}
                </select>
                <button
                  class="button"
                  name="__action"
                  value="reorder-article"
                  title="Reorder"
                >
                  Move
                </button> */}
                </div>

                <Textarea
                  name="readlist.articles[].title"
                  rows="2"
                  class="article__title"
                  placeholder="Article title..."
                  onChange={(e) => {
                    handleUpdateReadlistArticle({
                      articleUrl: article.url,
                      articleTitle: e.target.value,
                      setReadlist,
                    });
                  }}
                  defaultValue={article.title}
                />
                {["domain", "url", "excerpt", "content"].map((key) => (
                  <input
                    type="hidden"
                    name={`readlist.articles[].${key}`}
                    value={article[key]}
                  />
                ))}
              </div>

              {/* This is setInnerHtml because sometimes Mercury puts a &hellip; for articles it truncates */}

              <div class="article__excerpt">
                <a href={article.url} target="__blank">
                  {article.domain}
                </a>
                {" - "}
                {article.excerpt && (
                  <span dangerouslySetInnerHTML={{ __html: article.excerpt }} />
                )}
              </div>

              <div class="article__actions actions">
                {/* <button
                class="button"
                onClick={(e) => {
                  handleSelectReadlistArticle({
                    setArticlePreviewUrl,
                    articleUrl: article.url,
                  });
                }}
                value={article.url}
              >
                Preview
              </button> */}
                {/*<button class="button" disabled>Edit HTML</button>*/ ""}
              </div>
            </li>
          ))}
        </ul>

        <fieldset class="article article--create">
          {/* <div>
          <select
            name="new-article-index"
            defaultValue={readlist.articles.length}
            disabled={readlist.articles.length === 0}
          >
            {[...Array(readlist.articles.length + 1)].map((_undef, index) => (
              <option key={index} value={index}>
                {index + 1}
              </option>
            ))}
          </select>
          <button
            name="__action"
            value="add-article"
            class="button button--is-loadingz"
            type="submit"
          >
            Add
          </button>
        </div> */}

          <input
            type="url"
            name="new-article-url"
            required
            placeholder="http://your-article-url.com/goes/here"
          />

          <div class="article__new">
            <input
              type="checkbox"
              id="new-article-html-checkbox"
              name="new-article-html-checkbox"
            />
            <label
              htmlFor="new-article-html-checkbox"
              title="Provide the article’s HTML yourself. Useful for things like webpages behind authentication."
            >
              Custom HTML
            </label>
            {/* required IF checkbox is checked */}
            <textarea
              rows="5"
              name="new-article-html"
              placeholder="<!DOCTYPE html><html><head><title>Title of Webpage</title>..."
            ></textarea>
            <button
              name="__action"
              value="add-article"
              class="button button--primary"
              type="submit"
            >
              Add
            </button>
          </div>
        </fieldset>
      </form>
    </>
  );
}

export function ErrorBoundary({ error }) {
  console.log(error);
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <p>The stack trace is:</p>
      <pre>{error.stack}</pre>
    </div>
  );
}

// https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
function moveItemInArray(arr, old_index, new_index) {
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  // return arr; // for testing purposes
}
