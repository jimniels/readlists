import React, {
  useState,
} from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import PropTypes from "https://unpkg.com/es-react@16.13.1/dev/prop-types.js";
import { isValidHttpUrl } from "../utils.js";
import { fetchArticle } from "../api.js";
import { readlistArticlePropTypes } from "../prop-types.js";

ReadlistArticleInput.propTypes = {
  readlist: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    dateModified: PropTypes.string.isRequired,
    dateCreated: PropTypes.string.isRequired,
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
  const [articleUrl, setArticleUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateReadlistArticle = (e) => {
    e.preventDefault();

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

    // Go get it
    setIsLoading(true);
    fetchArticle(articleUrl)
      .then((mercuryArticle) => {
        setReadlist((prevReadlist) => ({
          ...prevReadlist,
          dateModified: new Date().toISOString(),
          articles: prevReadlist.articles.concat(mercuryArticle),
        }));
        setArticleUrl("");
      })
      .catch((err) => {
        console.error(err);
        setError("Could not retrieve and parse the specified URL.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form
      class="article article--create"
      onSubmit={handleCreateReadlistArticle}
    >
      <div class="article__main">
        <div>
          <button
            class={`button ${isLoading ? "button--is-loading" : ""}`}
            type="submit"
            disabled={!articleUrl}
          >
            Add
          </button>
        </div>
        <input
          onClick={(e) => e.target.select()}
          name="article-url"
          type="text"
          value={articleUrl}
          onChange={(e) => {
            setArticleUrl(e.target.value);
          }}
          placeholder="http://your-article-url.com/goes/here"
        />
      </div>
    </form>
  );
}
