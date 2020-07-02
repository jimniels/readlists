import React, { useState } from "https://unpkg.com/es-react/react.js";
import ReactDOM from "https://unpkg.com/es-react/react-dom.js";
import Header from "./Header.js";
import ZeroState from "./ZeroState.js";
import Readlist from "./Readlist.js";
import Error from "./Error.js";
import { autoExpand } from "../utils.js";

export default function App() {
  // Declare a new state variable, which we'll call "count"
  const [appState, setAppState] = useState({
    error: "",
    readlist: null,
    readlistArticleUrl: "",
  });
  React.useEffect(() => {
    console.log("fired because readlist app state changed");
  }, [appState.readlist]);

  return (
    <>
      <Header />
      <ZeroState appState={appState} setAppState={setAppState} />
      <Readlist appState={appState} setAppState={setAppState} />
      <button onClick={() => setAppState({ error: "This is an error" })}>
        Toggle Error
      </button>

      <Error appState={appState} setAppState={setAppState} />
    </>
  );
}
