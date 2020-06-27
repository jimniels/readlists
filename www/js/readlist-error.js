import { store } from "./redux.js";
import { eventHandler, html } from "./utils.js";

class ReadlistError extends HTMLElement {
  connectedCallback() {
    store.subscribe(() => {
      const state = store.getState();
      switch (state.lastAction.type) {
        case "SET_ERROR":
          this.render(state);
          break;
      }
    });
  }

  render(state) {
    const { error } = state;

    if (error) {
      this.innerHTML = error;
      this.classList.add("error--visible");
      setTimeout(() => {
        store.dispatch({ type: "SET_ERROR", error: "" });
      }, 5000); // matches 5s in css animation
    } else {
      this.classList.remove("error--visible");
    }
  }
}
customElements.define("readlist-error", ReadlistError);
