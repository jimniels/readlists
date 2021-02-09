import { React, html } from "../deps.js";

// In the case that the readlist gets corrupted in memory, allow the user
// the ability to clear it and start anew.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return html`<div style=${{ textAlign: "center" }}>
        <p>
          Something went wrong. You can try to${" "}
          <a
            href="/"
            onClick=${(e) => {
              localStorage.setItem("readlist", undefined);
            }}
            >reset and refresh the page</a
          >.
        </p>
        <p>
          If this error continues to arise, please contact
          <a href="https://twitter.com/jimniels">@jimniels</a>.
        </p>
      </div>`;
    }

    return this.props.children;
  }
}
