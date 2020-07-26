window.__DEV__ = window.location.hostname === "localhost";

import React from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import ReactDOM from "https://unpkg.com/es-react@16.13.1/dev/react-dom.js";
import App from "./components/App.js";

let initialReadlist = undefined;
if (localStorage.getItem("readlist")) {
  initialReadlist = JSON.parse(localStorage.getItem("readlist"));
}

ReactDOM.render(
  React.createElement(App, { initialReadlist }),
  document.getElementById("root")
);
