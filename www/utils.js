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
