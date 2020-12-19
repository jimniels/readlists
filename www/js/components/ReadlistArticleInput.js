import { html, React, PropTypes } from "../deps.js";
import { createMercuryArticle, isValidHttpUrl } from "../utils.js";
import { fetchArticle } from "../api.js";
import { readlistArticlePropTypes } from "../prop-types.js";
const { useState } = React;

ReadlistArticleInput.propTypes = {
  readlist: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    date_modified: PropTypes.string.isRequired,
    date_created: PropTypes.string.isRequired,
    articles: PropTypes.arrayOf(readlistArticlePropTypes).isRequired,
  }),

  setReadlist: PropTypes.func,
  setError: PropTypes.func,
};

export default function ReadlistArticleInput({
  readlist,
  setReadlist,
  setError,
}) {
  const [articleInput, setArticleInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasArticleHtml, setHasArticleHtml] = useState(false);
  const [articleHtml, setArticleHtml] = useState("");

  const disabled = hasArticleHtml
    ? !(articleInput && articleHtml)
    : !articleInput;

  const handleCreateReadlistArticle = (e) => {
    e.preventDefault();

    const articleUrl = articleInput;

    // Check if the input is a valid URL first
    if (!isValidHttpUrl(articleUrl)) {
      setError("Invalid article URL. Must be an http or https url.");
      return;
    }

    // Check if we don't already have that URL
    const duplicateArticle = readlist.articles.find(
      (article) => article.url === articleUrl
    );
    if (duplicateArticle) {
      window.alert(
        [
          "You already have an article for that URL:\n",
          duplicateArticle.title,
          duplicateArticle.url,
          "\nIf you want add it anew, delete the exisiting article then add it.",
        ].join("\n")
      );
      return;
    }

    // See if there's custom HTML
    // @TODO validate everything that's happening here
    if (hasArticleHtml) {
      setIsLoading(true);
      createMercuryArticle(articleUrl, articleHtml)
        .then((mercuryArticle) => {
          setReadlist((prevReadlist) => ({
            ...prevReadlist,
            date_modified: new Date().toISOString(),
            articles: prevReadlist.articles.concat(mercuryArticle),
          }));
          setArticleInput("");
          setArticleHtml("");
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to parse the provided HTML.");
        })
        .then(() => {
          setIsLoading(false);
        });

      return;
    }

    // No custom HTML? Go get it
    setIsLoading(true);
    fetchArticle(articleUrl)
      .then((mercuryArticle) => {
        setReadlist((prevReadlist) => ({
          ...prevReadlist,
          date_modified: new Date().toISOString(),
          articles: prevReadlist.articles.concat(mercuryArticle),
        }));
        setArticleInput("");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not retrieve and parse the specified URL.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return html`
    <form
      class="article article--create"
      onSubmit=${handleCreateReadlistArticle}
    >
      <div class="article__main">
        <select disabled>
          <option value=${readlist.articles.length}>
            ${readlist.articles.length + 1}
          </option>
        </select>

        <input
          onClick=${(e) => e.target.select()}
          name="article-url"
          type="text"
          value=${articleInput}
          onChange=${(e) => {
            setArticleInput(e.target.value);
          }}
          placeholder="http://your-article-url.com/goes/here"
        />
      </div>
      <div class="article__new">
        ${hasArticleHtml &&
        html`
          <textarea
            rows="5"
            value=${articleHtml}
            onChange=${(e) => {
              setArticleHtml(e.target.value);
            }}
            placeholder="<!DOCTYPE html><html><head><title>Title of Webpage</title>..."
          ></textarea>
        `}
        <label
          title="Provide the article’s HTML yourself. Useful for things like webpages behind authentication."
        >
          <input
            type="checkbox"
            value=${hasArticleHtml}
            onChange=${() => setHasArticleHtml(!hasArticleHtml)}
          />
          Custom HTML
        </label>

        <button
          class="button ${isLoading ? "button--is-loading" : ""}"
          type="submit"
          disabled=${disabled}
        >
          Add
        </button>
      </div>
    </form>
  `;
}
