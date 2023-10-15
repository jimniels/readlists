import { React, html } from "../deps.js";
const { useState } = React;

export default function Header() {
  const [learnMoreIsVisible, setLearnMoreIsVisible] = useState(false);
  const btnClasses = [
    "button",
    "button--circle",
    learnMoreIsVisible ? "button--primary button--is-active" : "",
  ].join(" ");

  // @ts-expect-error
  const version = window.VERSION;

  return html`
  <${React.Fragment}>
    <header class="Header wrapper">
      <h1 class="Header__title">Readlists</h1>
      <button
        class=${btnClasses}
        onClick=${() => {
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
            A Readlist is like a mixtape, but for reading. Collect information
            across the web and package it into a little ebook for reading on
            your favorite device. Or, since Readlists are just JSON feeds, put
            it into your favorite RSS reader app.
          </p>
          <p>
            Read more on${" "}
            <a href="https://github.com/jimniels/readlists">
              the GitHub project</a
            >.
          </p>

          <p>
            Made by <a href="https://www.jim-nielsen.com">Jim Nielsen</a>.
            Readlists version <code>${version}</code>
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
