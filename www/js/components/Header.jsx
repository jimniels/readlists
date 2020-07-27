import React, { useState } from "react";
import Style from "./Style.js";

export default function Header() {
  const [learnMoreIsVisible, setLearnMoreIsVisible] = useState(false);

  return (
    <>
      <header class="Header wrapper">
        <div>
          <h1 class="Header__title">Readlists</h1>
          <p class="Header__description">
            Collect, curate, and bundle individual web pages into an ebook.
          </p>
        </div>
        <button
          class={`button button--circle ${
            learnMoreIsVisible ? "button--is-active button--primary" : ""
          }`}
          onClick={(e) => {
            setLearnMoreIsVisible(!learnMoreIsVisible);
          }}
          title={`${learnMoreIsVisible ? "Hide" : "Show"} more info`}
        >
          ?
        </button>
      </header>
      {learnMoreIsVisible && (
        <div class="Header__learn-more">
          <p>
            What’s a Readlist? It’s like a readable mixtape. You can collect
            information across the web and package it up into a nice little
            ebook for reading on your favorite reading device.
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
            Readlists version <code>{window.VERSION}</code>
          </p>
        </div>
      )}
      <Style>{getStyles()}</Style>
    </>
  );
}

function getStyles() {
  return /*css*/ `
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
    margin: 0 auto calc(var(--spacer) * 2);
    background: var(--color-border);
    border-top: 1px solid #ccc;
    color: var(--color-text);
    border: 1px solid var(--color-border);
    padding: calc(var(--spacer) * 2);
    border-radius: var(--border-radius);
  }
  `;
}
