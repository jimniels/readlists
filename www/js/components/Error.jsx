import React, { useEffect } from "https://unpkg.com/es-react/react.js";
import Style from "./Style.js";

const TIMER = 5; // seconds

export default function Error({ appState: { error }, setAppState }) {
  const classes = ["error", error ? "error--visible" : ""].join(" ");

  useEffect(() => {
    if (error) {
      const id = setTimeout(() => setAppState({ error: "" }), TIMER * 1000);
      return () => clearTimeout(id);
    }
  }, [error]);

  return (
    <>
      <Style css={getStyles()} />
      <div class={classes}>
        <p>{error ? error : ""}</p>
        <button onClick={() => setAppState({ error: "" })}>×</button>
      </div>
    </>
  );
}

function getStyles() {
  return /*css*/ `
.error {
  position: fixed;
  top: 0;
  width: 500px;
  left: 50%;
  margin-left: -250px;
  background: red;
  color: white;
  padding: var(--spacer);
  transition: 0.3s ease transform;
  display: flex;
  justify-content: space-between;
  z-index: 10;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  transform: translateY(-100%);
}

.error--visible {
  transform: translateY(0);
}

.error--visible:before {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.25);
  bottom: 0px;
  animation-duration: ${TIMER}s;
  animation-name: timer;
  animation-timing-function: linear;
}
@keyframes timer {
  from {
    width: 100%;
  }

  to {
    width: 0%;
  }
}

.error button {
  margin-left: var(--spacer);
  background: transparent;
  border: none;
  width: 1em;
  height: 1em;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: calc(var(--spacer / 4));
  
  color: white;
  font-size: 24px;
  opacity: .75;
  outline: none;
}

.error button:hover {
  opacity: 1;
}

.error p {
  margin: 0;
}
`;
}
