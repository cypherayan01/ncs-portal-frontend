import { useState } from "react";
import App from "./App";
import ResumeView from "./ResumeView";

export default function MainApp() {
  const [showResumeView, setShowResumeView] = useState(false);

  return showResumeView ? <ResumeView /> : <App />;
}
