import { useNavigate, useLocation } from "react-router-dom";

export default function ToggleSwitch() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex justify-center mb-4">
      <div className="relative inline-flex items-center">
        {/* Background container */}
        <div className="relative w-96 h-12 bg-gray-200 rounded-full border-2 border-gray-300">
          {/* Labels as clickable navigation buttons */}
          <button
            onClick={() => navigate("/")}
            className={`absolute left-6 top-1/2 transform -translate-y-1/2 text-sm font-semibold z-10 
            ${currentPath === "/" ? "text-white" : "text-gray-700"}`}
          >
            App View
          </button>

          <button
            onClick={() => navigate("/resume")}
            className={`absolute left-1/2 top-1/2 transform -translate-y-1/2 -ml-10 text-sm font-semibold z-10 
            ${currentPath === "/resume" ? "text-white" : "text-gray-700"}`}
          >
            Resume View
          </button>

          <button
            onClick={() => navigate("/chat")}
            className={`absolute right-6 top-1/2 transform -translate-y-1/2 text-sm font-semibold z-10 
            ${currentPath === "/chat" ? "text-white" : "text-gray-700"}`}
          >
            Chat View
          </button>

          {/* Sliding indicator */}
          <div
            className={`absolute top-1 w-32 h-10 bg-blue-600 rounded-full shadow-lg transition-transform duration-300
            ${
              currentPath === "/"
                ? "translate-x-1"
                : currentPath === "/resume"
                ? "translate-x-[128px]"
                : "translate-x-[256px]"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}
