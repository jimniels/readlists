/*import { h, render } from "https://unpkg.com/preact@latest?module";
import { useState, useEffect } from "https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module";
import htm from "https://unpkg.com/htm?module";
import autosize from "https://unpkg.com/autosize@4.0.2/src/autosize.js";
const html = htm.bind(h);

export {
    render,
    html,
    autosize,
    useState,
    useEffect
};
*/

import React from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import ReactDOM from "https://unpkg.com/es-react@16.13.1/dev/react-dom.js";
import htm from "https://unpkg.com/htm@3.0.4?module";
import PropTypes from "https://unpkg.com/es-react@16.13.1/dev/prop-types.js";
import autosize from "https://unpkg.com/autosize@4.0.2/src/autosize.js";

const html = htm.bind(React.createElement);

export {
    React,
    ReactDOM,
    html, 
    PropTypes,
    autosize    
}