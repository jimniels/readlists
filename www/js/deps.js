import React from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import ReactDOM from "https://unpkg.com/es-react@16.13.1/dev/react-dom.js";
import PropTypes from "https://unpkg.com/es-react@16.13.1/dev/prop-types.js";
import htm from "https://unpkg.com/htm@3.0.4?module";
import autosize from "https://unpkg.com/autosize@4.0.2/src/autosize.js";

const html = htm.bind(React.createElement);

export { React, ReactDOM, html, PropTypes, autosize };

/* Preact
import { h, render } from "https://unpkg.com/preact@latest?module";
import {
  useState,
  useEffect,
  useRef,
} from "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module";
import htm from "https://unpkg.com/htm?module";
import PreactCompat from "https://cdn.skypack.dev/preact/compat";
import autosize from "https://unpkg.com/autosize@4.0.2/src/autosize.js";
import PropTypes from "https://unpkg.com/es-react@16.13.1/dev/prop-types.js";
const html = htm.bind(h);
const React = {
  createElement: render,
  useState,
  useEffect,
  useRef,
};
const ReactDOM = { render };

export { React, ReactDOM, render, html, autosize, PropTypes };
*/
