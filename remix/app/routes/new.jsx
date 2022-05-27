import { useActionData, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { fetchArticle } from "../utils/fetch-article.server.js";
import Textarea from "../components/Textarea.jsx";

/*

GET /
  Application zero state
GET /new
  Creates a new readlist (in UI)
GET /new?importReadlistUrl=<string:url>
  Creates a new readlist from a url
GET /new?importWebUrls=<Array.string>
  Creates a new readlist from 1 or more of the specified web article urls
  Example: /new?webUrls=https://theverge.com/path/to/aticle&[...]&[...]
GET /new?download=[html,epub]
  Add this param to any route and get the readlist back in the specified format
POST /new <Readlist> JSON
  Creates a new readlist from JSON
POST /new <Readlist> formData
  Creates a new readlist from formData
*/
export async function loader({ request }) {
  const { searchParams } = new URL(request.url);

  // Passed in URL? We'll import that, validate it, parse it, and return it if relevant
  const url = searchParams.get("url");

  // Otherwise, create it as a new Readlist
  return json({
    readlist: {
      title: "Readlist title",
      description: "",
      date_modified: new Date().toISOString(),
      date_created: new Date().toISOString(),
      articles: [],
    },
  });
}

export async function action({ request }) {
  const formData = await request.formData();
  const action = formData.get("__action");
  console.log("POST", Object.fromEntries(formData.entries()));

  if (action === "add-article") {
    try {
      const readlist = parseReadlistFromFormData(formData);
      const url = formData.get("new-article-url");
      const html = formData.get("new-article-html");
      if (!url) {
        // @TODO field validation...
        throw new Error("A URL is required.");
      }
      let article = await fetchArticle({
        url: formData.get("new-article-url"),
        html: formData.get("new-article-html"),
      });
      readlist.articles.push(article);
      // console.log("RETURN", {
      //   ...readlist,
      //   articles: readlist.articles.map(({ content, ...props }) => props),
      // });
      readlist.date_modified = new Date().toISOString();
      return json({ readlist });
    } catch (e) {
      console.error(e);
      return json({
        error:
          "Failed to retrieve online article. Try again or enter the HTML for that URL yourself. " +
          e.toString(),
        readlist: { articles: [] },
      });
      throw new Error("Failed to fetch article from URL");
      // @TODO error boundary
    }
  }

  if (action.startsWith("delete-article-by-index-")) {
    const index = Number(action.split("delete-article-by-index-")[1]);
    console.log("DELETE readlist article: ", index + 1);
    const readlist = parseReadlistFromFormData(formData);
    readlist.articles.splice(index, 1);
    readlist.date_modified = new Date().toISOString();
    return json({ readlist });
  }

  // Otherwise, there was no action that we know of
  console.log("specified `__action`: `%s`. Returning a new readlist.", action);
  return null;
  // otherwise do what?
  //return json(`/projects/${project.id}`);
}

export default function New() {
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const { error, readlist } = actionData ? actionData : loaderData;

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <form method="POST" action="/new" class="readlist wrapper">
        <fieldset class="readlist-header">
          <div class="readlist-header__actions actions">
            <button class="button button--primary" onClick={() => {}}>
              Save Readlist
            </button>
            <button
              class={`button isLoadingEpub ? "button--is-loading" : ""`}
              onClick={() => {}}
            >
              Export to .epub
            </button>
            <button class="button">Export to .html</button>

            {/* clear local state, then onClick={handleDeleteReadlist} */}
            <a href="/" class="button button--danger">
              Delete
            </a>
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
                <p class="article__meta__domain">
                  <a href={article.url} target="__blank">
                    {" "}
                    {article.domain}{" "}
                  </a>
                </p>
                {article.author && (
                  <p class="article__meta__author">{article.author}</p>
                )}
              </div>
              <div class="article__main">
                <select disabled>
                  <option value={articleIndex}>{articleIndex + 1}</option>
                </select>

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
                {["domain", "author", "url", "excerpt", "content"].map(
                  (key) => (
                    <input
                      type="hidden"
                      name={`readlist.articles[].${key}`}
                      value={article[key]}
                    />
                  )
                )}
              </div>

              {article.excerpt && (
                <p class="article__excerpt">{article.excerpt}</p>
              )}

              <div class="article__actions actions">
                <button
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
                </button>
                {/*<button class="button" disabled>Edit HTML</button>*/ ""}
                <button
                  class="button button--danger"
                  name="__action"
                  value={`delete-article-by-index-${articleIndex}`}
                  type="submit"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        <fieldset class="article article--create">
          <div class="article__main">
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

            <input
              type="url"
              name="new-article-url"
              placeholder="http://your-article-url.com/goes/here"
            />
          </div>
          <div class="article__new">
            <input
              type="checkbox"
              id="new-article-html-checkbox"
              name="new-article-html-checkbox"
            />
            <label
              for="new-article-html-checkbox"
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
              class="button button--is-loadingz"
              type="submit"
            >
              Add
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

function parseReadlistFromFormData(formData) {
  let readlist = {
    title: formData.get("readlist.title"),
    description: formData.get("readlist.description"),
    date_created: formData.get("readlist.date_created"),
    date_modified: formData.get("readlist.date_modified"),
    articles: [],
  };

  // Keys for each readlist article
  const articleKeys = [
    "title",
    "domain",
    "author",
    "url",
    "excerpt" /*"content"*/,
  ];
  // {
  //   title: ["First article title", "Second article title", ...]
  //   domain: ["https://theverge.com/first/article", "https://example.com/second/article", ...]
  // }
  const articleValuesByKey = articleKeys.reduce((acc, key) => {
    acc[key] = formData.getAll(`readlist.articles[].${key}`);
    return acc;
  }, {});

  // Now build an array of articles cross-referencing the formData we got
  articleValuesByKey[articleKeys[0]].forEach((_, i) => {
    readlist.articles[i] = {};
    articleKeys.forEach((key) => {
      readlist.articles[i][key] = articleValuesByKey[key][i];
    });
  });

  // console.log("formData => readlist", readlist);
  return readlist;
}
