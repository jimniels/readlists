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
