window.__DEV__ = window.location.hostname === "localhost";

import { React, ReactDOM, html } from "./deps.js";
import App from "./components/App.js";

let initialReadlist = undefined;
if (localStorage.getItem("readlist")) {
  initialReadlist = JSON.parse(localStorage.getItem("readlist"));
}

ReactDOM.render(
  React.createElement(App, { initialReadlist }),
  document.getElementById("root")
);
