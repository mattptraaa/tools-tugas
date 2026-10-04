import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Lightbulb, 
  FileText, 
  CheckCircle2,
} from "lucide-react";
import { 
  AI_DETECTOR_OPTIONS, 
  AiDetectorOption, 
  QUILLBOT_HUMANIZING_TIPS 
} from "../data/sources";

interface QuillBotCheckerTabProps {
  initialText?: string;
}

export const QuillBotCheckerTab: React.FC<QuillBotCheckerTabProps> = ({
  initialText = "",
}) => {
  const [textToCheck, setTextToCheck] = useState(initialText);
  const [selectedDetectorId, setSelectedDetectorId] = useState<"quillbot" | "zerogpt" | "gptzero" | "scribbr">("quillbot");
  const [copied, setCopied] = useState(false);
  const [copiedForTool, setCopiedForTool] = useState<string | null>(null);

  useEffect(() => {
    if (initialText) {
      setTextToCheck(initialText);
    }
  }, [initialText]);

  const activeDetector: AiDetectorOption = 
    AI_DETECTOR_OPTIONS.find((d) => d.id === selectedDetectorId) || AI_DETECTOR_OPTIONS[0];

  const wordCount = textToCheck.trim() ? textToCheck.trim().split(/\s+/).length : 0;
  const charCount = textToCheck.length;

  const handleCopyOnly = () => {
    if (textToCheck.trim()) {
      navigator.clipboard.writeText(textToCheck.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAndOpenDetector = (detector: AiDetectorOption) => {
    if (textToCheck.trim()) {
      navigator.clipboard.writeText(textToCheck.trim());
      setCopied(true);
      setCopiedForTool(detector.id);
      setTimeout(() => {
        setCopied(false);
        setCopiedForTool(null);
      }, 2500);
    }
    window.open(detector.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
     
      {/* Text Preparation & Word Counter Box */}
      <section className="bg-white dark:bg-[#0E1B38] rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-[#1E3563] shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E3563]">
          <div>
            <h3 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#06B6D4] shrink-0" />
              <span>Kotak Penyiapan Teks ({activeDetector.name})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tempel draf jawaban Anda. Sistem menghitung kata &amp; karakter untuk memastikan teks memenuhi standar analisis {activeDetector.name}.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
            <button
              id="btn-copy-draft-checker"
              type="button"
              onClick={handleCopyOnly}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-[#132347] hover:bg-slate-200 dark:hover:bg-[#1E3563] text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-[#1E3563]"
            >
              {copied && !copiedForTool ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied && !copiedForTool ? "Tersalin" : "Salin Teks"}</span>
            </button>

            <a
              id="link-detector-direct"
              href={activeDetector.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-slate-900 dark:bg-[#1E3563] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Buka {activeDetector.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <textarea
          rows={8}
          value={textToCheck}
          onChange={(e) => setTextToCheck(e.target.value)}
          placeholder={`Tempelkan draf jawaban tugas, esai, atau uraian diskusi Anda di sini untuk disalin ke ${activeDetector.name}...`}
          className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-xl focus:bg-white dark:focus:bg-[#0E1B38] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/30 focus:border-[#06B6D4] transition-all text-slate-900 dark:text-white leading-relaxed resize-y"
        />

        {/* Pemilihan Detektor AI Sama Seperti Pemilihan Format Sitasi pada Tab 4 */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#1E3563]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="select-ai-detector" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilihan Alat Detektor AI:
              </label>
              <select
                id="select-ai-detector"
                value={selectedDetectorId}
                onChange={(e) => setSelectedDetectorId(e.target.value as any)}
                className="w-full text-xs p-2 bg-white dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#06B6D4] font-medium"
              >
                {AI_DETECTOR_OPTIONS.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name} — {tool.tagline} (Min. {tool.minChars} karakter)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Karakteristik &amp; Keunggulan {activeDetector.name}:
              </label>
              <div className="p-2 bg-slate-50 dark:bg-[#132347] rounded-lg border border-slate-200 dark:border-[#1E3563] text-xs flex items-center justify-between min-h-[38px]">
                <span className="text-slate-600 dark:text-slate-300 truncate mr-2 text-[11px]">
                  {activeDetector.highlightAdvantage}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${activeDetector.badgeColor}`}>
                  {activeDetector.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Counter & Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
              <span>
                Kata: <strong className="text-slate-900 dark:text-white">{wordCount}</strong>
              </span>
              <span>•</span>
              <span>
                Karakter: <strong className="text-slate-900 dark:text-white">{charCount}</strong>
              </span>
              <span>•</span>
              <span className={charCount >= activeDetector.minChars ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-[#F59E0B] font-medium"}>
                {charCount >= activeDetector.minChars
                  ? `Panjang memadai untuk ${activeDetector.name}`
                  : `Disarankan min. ${activeDetector.minChars} karakter`}
              </span>
            </div>

            <button
              id="btn-copy-and-open-selected-detector"
              type="button"
              onClick={() => handleCopyAndOpenDetector(activeDetector)}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#E0247A] hover:bg-[#C21865] text-white rounded-xl text-xs sm:text-sm font-heading font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#E0247A]/25"
            >
              {copied && copiedForTool === activeDetector.id ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>Salin &amp; Buka {activeDetector.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick 1-Click Access for All 4 Detectors */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#1E3563]">
          <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 font-heading">
            Atau Salin Teks &amp; Buka Langsung Alat Deteksi Pembanding:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {AI_DETECTOR_OPTIONS.map((tool) => (
              <button
                key={tool.id}
                id={`btn-direct-copy-open-${tool.id}`}
                type="button"
                onClick={() => handleCopyAndOpenDetector(tool)}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                  tool.id === selectedDetectorId
                    ? "bg-[#06B6D4]/10 border-[#06B6D4] text-slate-900 dark:text-white"
                    : "bg-slate-50/70 dark:bg-[#132347] border-slate-200 dark:border-[#1E3563] hover:border-[#06B6D4]"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#06B6D4] transition-colors truncate">
                      {tool.name}
                    </span>
                    {copied && copiedForTool === tool.id && (
                      <span className="text-[10px] text-emerald-600 font-bold shrink-0">Tersalin!</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {tool.tagline}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#06B6D4] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Humanizing & Academic Integrity Tips */}
      <section className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-xs space-y-4 transition-colors">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-[#1E3563]">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 text-[#B45309] dark:text-[#FBBF24] flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-white">
              Tips Menjaga Orisinalitas &amp; Lolos Deteksi AI Secara Beretika
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Panduan menyusun tulisan ilmiah orisinal dengan gaya personal mahasiswa tanpa terindikasi teks generator mesin:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {QUILLBOT_HUMANIZING_TIPS.map((tip, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-[#1E3563] bg-slate-50/60 dark:bg-[#132347] transition-colors"
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tip.title}</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Alat Tambahan Lainnya (QuillBot Paraphraser, dll.) */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#1E3563]">
          <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2.5 font-heading">
            Alat Latihan Variasi Kalimat &amp; Parafrase:
          </span>
          <div>
            <a
              href="https://quillbot.com/paraphrasing-tool"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1E3563] hover:border-[#06B6D4] bg-slate-50/70 dark:bg-[#132347] text-xs transition-all flex items-center justify-between group max-w-md"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block group-hover:text-[#06B6D4]">
                  QuillBot Paraphrasing Tool
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Latih variasi sintaksis dan sinonim kalimat ilmiah secara mandiri
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#06B6D4]" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
