import "./read-lists.js";
import "./read-list.js";
import { createList } from "./api.js";

const urlParams = new URLSearchParams(location.search);
const id = urlParams.get("id");

document.querySelector("main").innerHTML = id
  ? `<read-list id="${id}""></read-list>`
  : "<read-lists></read-lists>";

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
