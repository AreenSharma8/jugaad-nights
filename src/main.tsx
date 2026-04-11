import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress harmless DevTools extension warnings
const originalError = console.error;
console.error = function(...args: any[]) {
  if (args[0]?.includes?.('message channel closed') || args[0]?.includes?.('listener indicated an asynchronous')) {
    return; // Suppress DevTools warning
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
