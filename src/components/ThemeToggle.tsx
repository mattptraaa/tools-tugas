import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "", showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="btn-toggle-theme"
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      title={theme === "dark" ? "Mode Gelap aktif (Klik untuk Mode Terang)" : "Mode Terang aktif (Klik untuk Mode Gelap)"}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer border ${
        theme === "dark"
          ? "bg-slate-800/80 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-sm"
          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-sm"
      } ${className}`}
    >
      <div className="flex items-center space-x-1.5">
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
        {showLabel && (
          <span className="text-xs font-semibold">
            {theme === "dark" ? "Terang" : "Gelap"}
          </span>
        )}
      </div>
    </button>
  );
};
