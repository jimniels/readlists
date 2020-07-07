import React, {
  useEffect,
  useRef,
} from "https://unpkg.com/es-react@16.13.1/dev/react.js";
import autosize from "https://unpkg.com/autosize@4.0.2/src/autosize.js";

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
