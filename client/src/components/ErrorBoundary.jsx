import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5" style={{ fontFamily: "'Syne', sans-serif" }}>
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-5">⚠️</div>
            <h1 className="text-2xl font-black text-white mb-2">Something went wrong</h1>
            <p className="text-zinc-500 text-sm mb-2">
              {this.props.name || "This page"} encountered an unexpected error.
            </p>
            {this.state.error && (
              <p className="text-zinc-700 text-xs mb-6 font-mono truncate max-w-xs mx-auto">
                {this.state.error.message}
              </p>
            )}
            <button onClick={function() { this.setState({ hasError: false, error: null }) }.bind(this)}
              className="bg-amber-400 text-zinc-950 px-6 py-3 rounded-xl text-sm font-black hover:bg-amber-300 transition-all inline-block">
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
