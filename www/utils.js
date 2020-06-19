export function autoExpand(field) {
  field.style.height = ""; /* Reset the height*/
  field.style.height = Math.min(field.scrollHeight, 200) + "px";
  return;

  // Reset field height
  field.style.height = "inherit";

  // Get the computed styles for the element
  var computed = window.getComputedStyle(field);

  // Calculate the height
  var height =
    parseInt(computed.getPropertyValue("border-top-width"), 10) +
    parseInt(computed.getPropertyValue("padding-top"), 10) +
    field.scrollHeight +
    parseInt(computed.getPropertyValue("padding-bottom"), 10) +
    parseInt(computed.getPropertyValue("border-bottom-width"), 10);

  field.style.height = height + "px";
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US").format(date);
}

/**
 * Take a given node and a method for that node and give back the global
 * event handler that will call that method.
 *
 * eventHandler('readlist-nav', 'handleButtonClick') calls the `handleButtonClick`
 * method for the `readlist-nav` element, which is a parent element somewhere
 * in the DOM of the given event.target.
 *
 * @param {string} node
 * @param {string} method
 * @returns {string}
 */
export function eventHandler(node, method) {
  return `window.handleAppEvent(event, '${node}', '${method}')`;
}
window.handleAppEvent = function (event, elName, elFnName) {
  event.composedPath().forEach((node) => {
    if (
      node.tagName &&
      node.tagName.toLowerCase() === elName &&
      node[elFnName]
    ) {
      console.warn(`Firing event handler: <${elName}>.${elFnName}`);
      node[elFnName](event);
    }
  });
};

/**
 * Tagged template literal function for coercing certain values to what
 * we would expcted for a more JSX-like syntax.
 *
 * For values that we don't want to coerce, we just skip outputing them
 * Example:
 *   `class="${variable}"`
 * If the value of my variable was one of these types I don't want
 * JavaScript to coerce, then I'd get this:
 *   'class=""'
 */
export function html(strings, ...values) {
  let out = "";
  strings.forEach((string, i) => {
    const value = values[i];

    // Array - Join to string and output with value
    if (Array.isArray(value)) {
      out += string + value.join("");
    }
    // String - Output with value
    else if (typeof value === "string") {
      out += string + value;
    }
    // Number - Coerce to string and output with value
    // This would happen anyway, but for clarity's sake on what's happening here
    else if (typeof value === "number") {
      out += string + String(value);
    }
    // object, undefined, null, boolean - Don't output a value.
    else {
      out += string;
    }
  });
  return out;
}
