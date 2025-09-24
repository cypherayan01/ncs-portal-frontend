// ToggleSwitch.tsx
import { useNavigate, useLocation } from "react-router-dom";

export default function ToggleSwitch() {
  const navigate = useNavigate();
  const location = useLocation();

  const showResumeView = location.pathname === "/resume";

  return (
    <div className="flex justify-center mb-4">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={showResumeView}
          onChange={() => navigate(showResumeView ? "/" : "/resume")}
          className="sr-only peer"
        />
        
        {/* Switch background with text */}
        <div className="relative w-64 h-12 bg-gray-200 rounded-full peer-checked:bg-gray-200 transition-colors border-2 border-gray-300">
          {/* Text labels */}
          <span className={`absolute left-6 top-1/2 transform -translate-y-1/2 text-sm font-semibold transition-colors z-10 ${
            !showResumeView ? "text-white" : "text-gray-700"
          }`}>
            App View
          </span>
          <span className={`absolute right-6 top-1/2 transform -translate-y-1/2 text-sm font-semibold transition-colors z-10 ${
            showResumeView ? "text-white" : "text-gray-700"
          }`}>
            Resume View
          </span>
          
          {/* Sliding indicator */}
          <div className={`absolute top-1 w-32 h-10 bg-blue-600 rounded-full shadow-lg transition-transform duration-300 ${
            showResumeView ? "translate-x-[120px]" : "translate-x-1"
          }`}></div>
        </div>
      </label>
    </div>
  );
}