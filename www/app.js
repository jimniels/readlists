import { createList } from "./api.js";

window.__DEV__ = window.location.hostname === "localhost";

const $main = document.querySelector("main");
const urlParams = new URLSearchParams(location.search);
const id = urlParams.get("id");

if (id) {
  import("./read-list.js").then(() => {
    $main.innerHTML = `<read-list id="${id}""></read-list>`;
  });
} else {
  import("./read-lists.js").then(() => {
    $main.innerHTML = `<read-lists></read-lists>`;
  });
}

document
  .querySelector("#create-readlist")
  .addEventListener("click", function () {
    this.setAttribute("disabled", true);
    createList()
      .then((id) => {
        let s = new URLSearchParams();
        s.set("id", id);
        window.location.search = s.toString();
      })
      .catch(() => {
        this.removeAttribute("disabled");
        window.alert("Failed to create a new Readlist.");
      });
  });

// const dbx = new window.Dropbox.Dropbox({
//   accessToken:
//     "aWXTfAmKg0wAAAAAAAClNsQGZmJvXH4gYmrIbMZacBcDKVVTEyYtQ4DF0Axob2Ly",
//   fetch: window.fetch,
// });
// dbx
//   .filesSearch({ path: "", mode: "filename", query: "list.json" })
//   .then(console.log, console.error);
