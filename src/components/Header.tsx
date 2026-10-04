import React from "react";
import { History, Key } from "lucide-react";
import { TabId, isValidGeminiApiKey } from "../types";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { userApiKey, setIsApiKeyModalOpen } = useAuth();
  const hasValidToken = isValidGeminiApiKey(userApiKey);

  return (
    <header className="bg-white/95 dark:bg-[#070F1E]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E3563] sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 space-y-2">
        {/* Baris 1: Nama Aplikasi */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="font-heading font-black text-lg sm:text-2xl tracking-tight text-slate-900 dark:text-white leading-tight">
              Tools Tugas
            </h1>
          </div>

          {/* Subtitle status text */}
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="hidden xs:inline">Tools Mahasiswa UT</span>
          </div>
        </div>

        {/* Baris 2: Baris Aksi (Token Mandiri, Riwayat, Dark/Light Mode) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-[#132347]">
          {/* Kelompok Aksi Kiri: Token Gemini & Riwayat */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Token Gemini Mandiri Button */}
            <button
              id="btn-open-token-modal"
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer border ${
                hasValidToken
                  ? "bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 shadow-2xs"
                  : "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse"
              }`}
              title={
                hasValidToken
                  ? "Token Gemini pribadi aktif. Klik untuk melihat atau mengganti token."
                  : "Wajib: Masukkan Token Gemini pribadi Anda"
              }
            >
              <Key className="w-3.5 h-3.5 shrink-0" />
              <span>
                {hasValidToken ? (
                  <>
                    <span className="hidden sm:inline">Token Mandiri Aktif</span>
                    <span className="sm:hidden">Token Aktif</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Setel Token Mandiri</span>
                    <span className="sm:hidden">Setel Token</span>
                  </>
                )}
              </span>
            </button>

            {/* Tombol Riwayat Analisis */}
            <button
              id="btn-view-history"
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === "history"
                  ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-[#132347] dark:hover:bg-[#1E3563] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3563]"
              }`}
              title="Buka riwayat analisis soal tersimpan"
            >
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Riwayat Analisis</span>
              <span className="sm:hidden">Riwayat</span>
            </button>
          </div>

          {/* Kelompok Aksi Kanan: Theme Toggle */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
