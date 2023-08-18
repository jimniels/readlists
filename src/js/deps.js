import React from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import ReactDOM from "https://unpkg.com/es-react@16.13.1/dev/react-dom.js";
import htm from "https://unpkg.com/htm@3.0.4?module";
import autosize from "https://unpkg.com/autosize@4.0.2/src/autosize.js";

const html = htm.bind(React.createElement);

export { React, ReactDOM, html, autosize };
