window.__DEV__ = window.location.hostname === "localhost";

import "https://unpkg.com/@github/time-elements@3.1.1/dist/time-elements.js";
import React from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import ReactDOM from "https://unpkg.com/es-react@16.13.1/dev/react-dom.js";
import App from "./components/App.js";

let readlist = undefined;
if (localStorage.getItem("readlist")) {
  readlist = JSON.parse(localStorage.getItem("readlist"));
}

ReactDOM.render(
  React.createElement(App, { initialReadlist: readlist }),
  document.getElementById("root")
);
