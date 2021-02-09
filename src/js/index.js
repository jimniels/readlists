import { React, ReactDOM, html } from "./deps.js";
import App from "./components/App.js";
import AppError from "./components/AppError.js";
import { devLog } from "./utils.js";

let initialReadlist = undefined;
// @TODO validate that the readlist is good, then render it. Otherwise, clear
// it and start anew or something...
try {
  initialReadlist = JSON.parse(localStorage.getItem("readlist"));
} catch (e) {}

ReactDOM.render(
  html`
    <${AppError}>
      <${App} initialReadlist=${initialReadlist} />
    </${AppError}>
  `,
  document.getElementById("root")
);
