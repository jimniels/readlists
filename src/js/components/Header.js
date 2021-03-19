import { React, html } from "../deps.js";
const { useState } = React;

export default function Header() {
  const [learnMoreIsVisible, setLearnMoreIsVisible] = useState(false);
  const btnClasses = [
    "button",
    "button--circle",
    learnMoreIsVisible ? "button--primary button--is-active" : "",
  ].join(" ");

  return html`
  <${React.Fragment}>
    <header class="Header wrapper">
      <h1 class="Header__title">Readlists</h1>
      <button
        class=${btnClasses}
        onClick=${(e) => {
          setLearnMoreIsVisible(!learnMoreIsVisible);
        }}
        title="${learnMoreIsVisible ? "Hide" : "Show"} more info"
      >
        ?
      </button>
    </header>
    ${
      learnMoreIsVisible &&
      html`
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
            <a href="https://github.com/jimniels/readlists"
              >the project on Github.</a
            >.
          </p>

          <p>
            Made by <a href="https://www.jim-nielsen.com">Jim Nielsen</a> (
            <a href="https://twitter.com/jimniels">@jimniels</a> on twitter).
            Readlists version <code>${window.VERSION}</code>
          </p>
        </div>
      `
    }
    <style>
      .Header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .Header__title {
        font-size: var(--font-size-xxl);
        font-weight: 900;
        margin: 0;
      }
      .Header__title a {
        color: inherit;
        text-decoration: none;
      }
      .Header__description {
        font-size: var(--font-size-sm);
        color: var(--color-text-light);
        margin: 0;
      }
      .Header__learn-more {
        max-width: 700px;
        margin: 0 auto var(--spacer);
        background: var(--color-border);
        color: var(--color-text);
        padding: var(--spacer);
      }
      @media screen and (min-width: 700px) {
        .Header__learn-more {
          border-radius: var(--border-radius);
          padding: var(--spacer) calc(var(--spacer) * 2);
        }
      }
    </style>
  </${React.Fragment}>`;
}
