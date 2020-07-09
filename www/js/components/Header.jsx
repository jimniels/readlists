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
            <a href="/" class="link">
              Try it out.
            </a>
          </p>
          <p>
            Readlists are saved locally to your browser (using
            <code>localStorage</code>). You can save the data of a Readlist to a
            JSON file, host it at a URL, and then allow others to import it
            themselves. You are responsible for saving them, not the site. You
            make the video games, Readlists is simply the console that plays
            them out.
          </p>
          <p>
            In other words, you are responsible for saving/storing/keeping track
            of your own Readlists. You can import them into this tool via a URL
            or by drag n' dropping them. But when you're done, you're
            responsible to save the readlist as a JSON file and keep track of it
            yourself. Capiche?
          </p>
          <p>I really should explain more about what this thing is here.</p>
          <p>
            Made by <a href="https://www.jim-nielsen.com">Jim Nielsen</a>.
          </p>
        </div>
      )}
    </>
  );
}
