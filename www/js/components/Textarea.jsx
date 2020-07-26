import React, { useEffect, useRef } from "react";
import autosize from "autosize";

export default function Textarea(props) {
  const { children, ...rest } = props;
  const ref = useRef(null);
  useEffect(() => {
    autosize(ref.current);
  }, []);

  return (
    <textarea
      {...rest}
      ref={ref}
      onKeyDown={(e) => {
        autosize(e.target);
      }}
    ></textarea>
  );
}
