window.__DEV__ = window.location.hostname === "localhost";

import "https://unpkg.com/@github/time-elements@3.1.1/dist/time-elements.js";
import React from "https://unpkg.com/es-react/react.js";
import ReactDOM from "https://unpkg.com/es-react/react-dom.js";
import App from "./components/App.js";

ReactDOM.render(React.createElement(App), document.getElementById("root"));
