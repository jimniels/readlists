import React from "https://unpkg.com/es-react@16.13.1/dev/react.js";

export default function Style({ children = "" }) {
  return <style dangerouslySetInnerHTML={{ __html: children }}></style>;
}
