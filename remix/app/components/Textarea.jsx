// import { autosize, html, React } from "../deps.js";
import { useEffect, useRef } from "react";

export default function Textarea(props) {
  const { children, ...rest } = props;
  const ref = useRef(null);
  useEffect(() => {
    console.log("Autosize this baby");
    // autosize(ref.current);
  }, []);

  return (
    <textarea
      {...rest}
      ref={ref}
      onKeyDown={(e) => {
        console.log("Autosize this baby on key down");
        // autosize(e.target);
      }}
    ></textarea>
  );
}
