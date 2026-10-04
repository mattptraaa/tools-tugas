import React, { useState } from "react";
import { BookOpen, ExternalLink, Copy, Check, FileText, ShieldCheck } from "lucide-react";
import { NOTEBOOK_LM_PROMPTS } from "../data/sources";

interface NotebookLMTabProps {
  initialJournalTitle?: string;
  initialJournalAbstract?: string;
}

export const NotebookLMTab: React.FC<NotebookLMTabProps> = ({
  initialJournalTitle = "",
  initialJournalAbstract = "",
}) => {
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedContext, setCopiedContext] = useState(false);

  const currentJournalText = initialJournalTitle
    ? `JUDUL JURNAL: ${initialJournalTitle}\n\nABSTRAK / RINGKASAN:\n${initialJournalAbstract || "(Teks jurnal lengkap diunggah ke NotebookLM)"}`
    : "";

  const handleCopyPrompt = (promptText: string) => {
    let textToCopy = promptText;
    if (initialJournalTitle) {
      textToCopy = `Konteks Jurnal: "${initialJournalTitle}"\n\n${promptText}`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyContext = () => {
    navigator.clipboard.writeText(currentJournalText);
    setCopiedContext(true);
    setTimeout(() => setCopiedContext(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Selected Journal Context (if user passed data from Step 2) */}
      {initialJournalTitle && (
        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                Jurnal Terpilih dari Langkah 2
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {initialJournalTitle}
              </h3>
              {initialJournalAbstract && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                  {initialJournalAbstract}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyContext}
              className="px-3 py-1.5 bg-white dark:bg-[#0E1B38] hover:bg-slate-50 dark:hover:bg-[#132347] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-[#1E3563] rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedContext ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedContext ? "Tersalin" : "Salin Data Jurnal"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Step by Step Workflow Guide */}
      <section className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-xs transition-colors">
        <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-1">
          Panduan 4 Langkah Meringkas Jurnal di NotebookLM
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Ikuti alur praktis ini untuk menghasilkan ringkasan komprehensif atau audio podcast dari dokumen jurnal Anda:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E3563] bg-slate-50/70 dark:bg-[#132347] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-heading font-black flex items-center justify-center text-sm mb-2.5">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Unduh PDF Jurnal</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Gunakan artikel dari Langkah 2 (Garuda, Neliti, Google Scholar) dan simpan berkas PDF ke perangkat Anda.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E3563] bg-slate-50/70 dark:bg-[#132347] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-heading font-black flex items-center justify-center text-sm mb-2.5">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Unggah Sumber PDF</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Buka notebooklm.google.com, klik Tambah Catatan Baru, lalu unggah dokumen PDF artikel yang ingin diringkas.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E3563] bg-slate-50/70 dark:bg-[#132347] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-heading font-black flex items-center justify-center text-sm mb-2.5">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Salin Prompt Akademik</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Pilih salah satu instruksi template akademik di bawah ini, klik "Salin Prompt", lalu tempelkan ke kolom obrolan NotebookLM.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E3563] bg-slate-50/70 dark:bg-[#132347] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-heading font-black flex items-center justify-center text-sm mb-2.5">
                4
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Dapatkan Ringkasan</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Gunakan hasil ringkasan terperinci bersitasi untuk menyusun draf jawaban tugas pada Langkah 4 berikutnya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready-to-Use NotebookLM Academic Prompts */}
      <section className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-[#1E3563]">
          <div>
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Kumpulan Prompt Akademik Khusus NotebookLM</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih jenis ringkasan yang sesuai kebutuhan tugas Anda, lalu salin dan tempelkan ke NotebookLM:
            </p>
          </div>

          <button
            id="btn-copy-notebook-prompt"
            type="button"
            onClick={() => handleCopyPrompt(NOTEBOOK_LM_PROMPTS[activePromptIndex].prompt)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-heading font-bold transition-colors cursor-pointer shadow-xs shrink-0"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPrompt ? "Prompt Tersalin" : "Salin Prompt Ini"}</span>
          </button>
        </div>

        {/* Prompt Selector Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {NOTEBOOK_LM_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePromptIndex(idx)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activePromptIndex === idx
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-[#132347] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1E3563]"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Prompt Text Viewer */}
        <div className="bg-[#070F1E] text-slate-100 p-4 rounded-xl border border-slate-800 dark:border-[#1E3563] text-xs font-mono leading-relaxed whitespace-pre-wrap">
          {NOTEBOOK_LM_PROMPTS[activePromptIndex].prompt}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E3563] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Kelebihan NotebookLM: Mengutip langsung dari nomor halaman dokumen tanpa karangan palsu.</span>
          </span>
          <a
            href="https://notebooklm.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>Buka notebooklm.google.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>
    </div>
  );
};
