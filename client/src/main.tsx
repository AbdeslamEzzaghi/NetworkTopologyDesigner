import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Konva from "konva";

// Initialize Konva
Konva.pixelRatio = 1; // Disable pixel ratio scaling for better performance when handling many objects

createRoot(document.getElementById("root")!).render(<App />);
