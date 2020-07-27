import React from "react";

export default function Style({ children = "" }) {
  return <style dangerouslySetInnerHTML={{ __html: children }}></style>;
}
