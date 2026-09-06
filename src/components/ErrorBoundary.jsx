import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="flex min-h-screen items-center justify-center p-6 text-center"><div><h1 className="text-xl font-bold">Something went wrong</h1><p className="mt-2 text-gray-500">Reload the page to try again.</p><button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white" onClick={() => window.location.reload()}>Reload</button></div></div>;
    }
    return this.props.children;
  }
}