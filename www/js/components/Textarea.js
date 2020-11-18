import { autosize, html, React } from "../deps.js";
const { useEffect, useRef } = React;

export default function Textarea(props) {
  const { children, ...rest } = props;
  const ref = useRef(null);
  useEffect(() => {
    autosize(ref.current);
  }, []);

  return html`
    <textarea
      ...${rest}
      ref=${ref}
      onKeyDown=${(e) => {
        autosize(e.target);
      }}
    ></textarea>
  `;
}
