import { React, ReactDOM, html } from "./deps.js";
import App from "./components/App.js";
import AppError from "./components/AppError.js";

let initialReadlist = undefined;
if (localStorage.getItem("readlist")) {
  // @TODO validate that the readlist is good, then render it. Otherwise, clear
  // it and start anew or something...
  initialReadlist = JSON.parse(localStorage.getItem("readlist"));
}

ReactDOM.render(
  html`
    <${AppError}>
      <${App} initialReadlist=${initialReadlist} />
    </${AppError}>
  `,
  document.getElementById("root")
);
