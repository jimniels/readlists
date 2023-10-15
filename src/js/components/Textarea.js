import { autosize, html, React } from "../deps.js";
const { useEffect, useRef } = React;

/** @param {any} props */
export default function Textarea(props) {
  const ref = useRef(null);
  useEffect(() => {
    autosize(ref.current);
  }, []);

  /** @param {KeyboardEvent} e */
  const onKeyDown = (e) => {
    autosize(e.target);
  };

  return html`
    <textarea ...${props} ref=${ref} onKeyDown=${onKeyDown}></textarea>
  `;
}
