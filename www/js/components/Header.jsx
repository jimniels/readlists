import React, {
  useState,
} from "https://unpkg.com/es-react@16.13.1/dev/react.js";

export default function Header() {
  const [learnMoreIsVisible, setLearnMoreIsVisible] = useState(false);

  return (
    <>
      <header class="app-header wrapper">
        <h1 class="app-header__title">Readlists</h1>
        <p class="app-header__description">
          Collect, curate, and bundle individual web pages into ebooks. Think
          mixtapes, but for online content.{" "}
          <a
            href="./about.html"
            class="link"
            onClick={(e) => {
              e.preventDefault();
              setLearnMoreIsVisible(!learnMoreIsVisible);
            }}
          >
            {learnMoreIsVisible ? "Less" : "More"}.
          </a>
        </p>
      </header>
      {learnMoreIsVisible && (
        <div id="learn-more">
          <p>
            What’s a Readlist? Collect, curate, and bundle individual web pages
            into ebooks. Think mixtapes, but for online content.
          </p>
          <p>
            Readlists are saved locally to your browser (using{" "}
            <code>localStorage</code>). You can save the data of a Readlist to a
            JSON file, host it at a URL, and then allow others to import it
            themselves. It falls to you to save and distribute (the URLs for)
            your Readlists. Yeah it’s more work for you, but hey, on the flip
            side the data is all yours. Do whatever you want with it.
          </p>
          <p>
            I really should explain more about what this thing is here and the
            data structure for a Readlist. If you really want to know, create
            one and inspect it.
          </p>

          <hr />
          <p>
            Made by <a href="https://www.jim-nielsen.com">Jim Nielsen</a> (
            <a href="https://twitter.com/jimniels">@jimniels</a> on twitter).
            Readlists version <code>__VERSION__</code>
          </p>
        </div>
      )}
    </>
  );
}
