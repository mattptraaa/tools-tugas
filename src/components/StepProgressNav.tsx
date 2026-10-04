import React from "react";
import { TabId } from "../types";

interface StepProgressNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

interface StepItem {
  id: TabId;
  number: number;
  shortTitle: string;
  fullTitle: string;
  description: string;
}

export const StepProgressNav: React.FC<StepProgressNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const steps: StepItem[] = [
    {
      id: "ai-analyzer",
      number: 1,
      shortTitle: "Bedah Soal",
      fullTitle: "AI Asisten Soal",
      description: "Bedah konsep & kueri jurnal",
    },
    {
      id: "journal-search",
      number: 2,
      shortTitle: "Cari Jurnal",
      fullTitle: "Cari Sumber Jurnal",
      description: "7 Repositori terbuka",
    },
    {
      id: "notebooklm",
      number: 3,
      shortTitle: "NotebookLM",
      fullTitle: "Ringkas di NotebookLM",
      description: "Panduan & prompt",
    },
    {
      id: "templates",
      number: 4,
      shortTitle: "Format UT",
      fullTitle: "Format Jawaban",
      description: "Struktur, poles & draf",
    },
  ];

  // Active step index (0 to 3), or -1 if on history
  const activeIndex = steps.findIndex((s) => s.id === activeTab);
  const progressPercent = activeIndex >= 0 ? ((activeIndex + 1) / steps.length) * 100 : 0;

  return (
    <nav
      aria-label="Tahapan Pengerjaan Tugas"
      className="w-full bg-white dark:bg-[#0E1B38] border border-slate-200 dark:border-[#1E3563] rounded-2xl p-2.5 sm:p-4 shadow-xs transition-colors duration-200"
    >
      {/* Top progress indicator bar in Sky Blue */}
      <div className="relative w-full h-1.5 bg-slate-100 dark:bg-[#132347] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 4-step grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isPassed = activeIndex > index;

          return (
            <button
              key={step.id}
              id={`step-nav-${step.id}`}
              type="button"
              onClick={() => setActiveTab(step.id)}
              className={`group flex flex-col items-center justify-between text-center p-2 sm:p-3 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? "bg-sky-50/70 dark:bg-sky-950/30 ring-2 ring-sky-500 shadow-xs"
                  : isPassed
                  ? "hover:bg-slate-50 dark:hover:bg-[#132347]/70 text-slate-700 dark:text-slate-300"
                  : "hover:bg-slate-50 dark:hover:bg-[#132347]/50 text-slate-500 dark:text-slate-400"
              }`}
            >
              {/* Step Number Circle */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-heading font-black text-xs sm:text-sm transition-all mb-1 ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-500/40 scale-105"
                    : isPassed
                    ? "bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 font-bold"
                    : "bg-slate-100 dark:bg-[#1E3563] text-slate-500 dark:text-slate-400 font-semibold"
                }`}
              >
                {step.number}
              </div>

              {/* Title - responsive short on mobile, full on md+ */}
              <div className="w-full">
                <span
                  className={`block text-[11px] sm:text-xs md:text-sm font-heading font-bold leading-tight truncate ${
                    isActive
                      ? "text-sky-700 dark:text-sky-300"
                      : isPassed
                      ? "text-slate-900 dark:text-slate-200"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className="md:hidden">{step.shortTitle}</span>
                  <span className="hidden md:inline">{step.fullTitle}</span>
                </span>

                {/* Subtitle description on large screens */}
                <span className="hidden lg:block text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 leading-snug line-clamp-1">
                  {step.description}
                </span>
              </div>

              {/* Visual bottom indicator bar for active state */}
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-0.5 bg-sky-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Notice if user is viewing History */}
      {activeTab === "history" && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-[#1E3563] flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Anda sedang membuka <strong>Riwayat Analisis Soal</strong>
          </span>
          <button
            type="button"
            onClick={() => setActiveTab("ai-analyzer")}
            className="text-sky-600 dark:text-sky-400 hover:underline font-bold cursor-pointer"
          >
            Kembali ke Langkah 1
          </button>
        </div>
      )}
    </nav>
  );
};
