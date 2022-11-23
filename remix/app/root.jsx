import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "~/styles/global.css";

export const meta = () => ({
  charset: "utf-8",
  title: "Readlists",
  viewport: "width=device-width,initial-scale=1",
});

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body class="wrapper">
        <Header />
        <Outlet />
        {/* <ScrollRestoration /> */}
        {/* <Scripts /> */}
        <LiveReload />
      </body>
    </html>
  );
}

function Header() {
  const learnMoreIsVisible = false;

  const btnClasses = [
    "button",
    "button--circle",
    learnMoreIsVisible ? "button--primary button--is-active" : "",
  ].join(" ");

  return (
    <>
      <header class="Header">
        <h1 class="Header__title">
          <a href="/">Readlists</a>
        </h1>
        <button
          class={btnClasses}
          title={`${learnMoreIsVisible ? "Hide" : "Show"} more info`}
        >
          ?
        </button>
      </header>
      {learnMoreIsVisible && (
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
            <a href="https://github.com/jimniels/readlists">
              the project on Github.
            </a>
            .
          </p>

          <p>
            Made by <a href="https://www.jim-nielsen.com">Jim Nielsen</a> (
            <a href="https://twitter.com/jimniels">@jimniels</a> on twitter).
            Readlists version <code>${window.VERSION}</code>
          </p>
        </div>
      )}
    </>
  );
}
