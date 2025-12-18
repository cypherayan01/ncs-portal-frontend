// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import EnhancedApp from "./EnhancedApp";
import ResumeView from "./ResumeView";
import ChatPage from "./ChatPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EnhancedApp />} />
        <Route path="/original" element={<App />} />
        <Route path="/resume" element={<ResumeView />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
