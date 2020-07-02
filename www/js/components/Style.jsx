import React from "https://unpkg.com/es-react/react.js";

export default function Style({ css }) {
  return <style dangerouslySetInnerHTML={{ __html: css }}></style>;
}
