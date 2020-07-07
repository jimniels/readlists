import React, {
  useState,
} from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import ReactDOM from "https://unpkg.com/es-react@16.13.1/dev/react-dom.js";
import Header from "./Header.js";
import ZeroState from "./ZeroState.js";
import Readlist from "./Readlist.js";
import Error from "./Error.js";

export default function App({ initialReadlist }) {
  const [readlist, setReadlist] = useState(initialReadlist);
  const [error, setError] = useState("");
  const [article, setArticle] = useState("");

  React.useEffect(() => {
    if (__DEV__) console.warn("Update readlist in localStorage", readlist);
    localStorage.setItem("readlist", readlist ? JSON.stringify(readlist) : "");
  }, [readlist]);

  return (
    <>
      <Header />

      <ZeroState
        readlist={readlist}
        setReadlist={setReadlist}
        setError={setError}
      />

      <Readlist
        readlist={readlist}
        setReadlist={setReadlist}
        setError={setError}
      />

      <Error error={error} setError={setError} />
    </>
  );
}
