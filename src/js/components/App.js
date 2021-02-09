import { React, html } from "../deps.js";
import Header from "./Header.js";
import ZeroState from "./ZeroState.js";
import Readlist from "./Readlist.js";
import ArticlePreview from "./ArticlePreview.js";
import Error from "./Error.js";
import { devLog } from "../utils.js";
const { useState, useEffect } = React;

export default function App({ initialReadlist }) {
  const [readlist, setReadlist] = useState(initialReadlist);
  const [error, setError] = useState("");
  const [articlePreviewUrl, setArticlePreviewUrl] = useState("");

  useEffect(() => {
    devLog(["Update readlist in localStorage"]);
    localStorage.setItem("readlist", readlist ? JSON.stringify(readlist) : "");
  }, [readlist]);

  return html`
  <${React.Fragment}>
    <${Header} />

    ${
      !readlist &&
      html`
        <${ZeroState}
          readlist=${readlist}
          setReadlist=${setReadlist}
          setError=${setError}
        />
      `
    }

    <${Readlist}
      readlist=${readlist}
      setReadlist=${setReadlist}
      setError=${setError}
      setArticlePreviewUrl=${setArticlePreviewUrl}
    />

    <${ArticlePreview}
      readlist=${readlist}
      articlePreviewUrl=${articlePreviewUrl}
      setArticlePreviewUrl=${setArticlePreviewUrl}
    />

    <${Error} error=${error} setError=${setError} />
  </${React.Fragment}>`;
}
