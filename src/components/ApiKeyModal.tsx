import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Key, Eye, EyeOff, CheckCircle2, AlertTriangle, ExternalLink, X, Loader2, Zap, ShieldCheck } from "lucide-react";
import { isValidGeminiApiKey } from "../types";

export const ApiKeyModal: React.FC = () => {
  const {
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    userApiKey,
    saveApiKey,
  } = useAuth();

  const [inputKey, setInputKey] = useState(userApiKey);
  const [showKey, setShowKey] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  React.useEffect(() => {
    if (isApiKeyModalOpen) {
      setInputKey(userApiKey);
      setFeedback(null);
    }
  }, [isApiKeyModalOpen, userApiKey]);

  if (!isApiKeyModalOpen) return null;

  const handleVerifyAndSave = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setFeedback({ type: "error", message: "Silakan masukkan Token API Gemini Anda." });
      return;
    }

    if (!isValidGeminiApiKey(trimmed)) {
      setFeedback({
        type: "error",
        message: "Format API Key tidak valid! Kode token wajib diawali dengan 'AIzaSy' atau 'AQ' (gratis dari Google AI Studio di aistudio.google.com).",
      });
      return;
    }

    setVerifying(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/ai/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || "API Key tidak valid atau kuota habis.");
      }

      await saveApiKey(trimmed);
      setFeedback({
        type: "success",
        message: "API Key Gemini berhasil diverifikasi dan tersimpan! Kuota Anda aktif.",
      });

      setTimeout(() => {
        setIsApiKeyModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Verifikasi gagal. Pastikan API Key benar dan internet terhubung.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleClearKey = async () => {
    await saveApiKey("");
    setInputKey("");
    setFeedback({ type: "success", message: "API Key telah dihapus." });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E1B38] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-[#1E3563] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1E3563] flex items-center justify-between bg-slate-50/70 dark:bg-[#132347]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                Token AI Mandiri (Google Gemini)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wajib token pribadi (awalan AIzaSy atau AQ)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#1E3563] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Guide Banner */}
          <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sky-800 dark:text-sky-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-sky-600" />
                <span>Cara Dapatkan API Key Gratis:</span>
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-sky-600 dark:text-sky-300 hover:underline flex items-center gap-1 bg-white dark:bg-[#0E1B38] px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 shadow-2xs"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside text-slate-700 dark:text-slate-300 space-y-1 text-xs leading-relaxed">
              <li>Buka <strong>aistudio.google.com/app/apikey</strong> dengan akun Google Anda.</li>
              <li>Klik tombol <strong>&quot;Create API key&quot;</strong>.</li>
              <li>Salin token yang berawalan <code>AIzaSy...</code> atau <code>AQ...</code>.</li>
              <li>Tempelkan ke isian di bawah ini lalu klik <strong>Uji &amp; Simpan Token</strong>.</li>
            </ol>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Kuota gratis resmi dari Google AI Studio tanpa biaya langganan.
            </p>
          </div>

          {/* Model Allocation Info */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#132347] rounded-xl border border-slate-200 dark:border-[#1E3563] space-y-2">
            <span className="font-heading font-bold text-xs text-slate-900 dark:text-white block">
              Alokasi Model AI Otomatis di Tools Tugas:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#0E1B38] border border-slate-200 dark:border-[#1E3563]">
                <div className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 mb-0.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Gemini 3.1</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Digunakan otomatis untuk Bedah Soal &amp; Rekomendasi Jurnal (Langkah 1).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#0E1B38] border border-slate-200 dark:border-[#1E3563]">
                <div className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 mb-0.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Gemini 3.1</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Digunakan otomatis untuk Pemolesan Bahasa &amp; Terjemahan (Langkah 4).
                </p>
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label htmlFor="input-gemini-key" className="block text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
              API Key Gemini Anda (Awalan AIzaSy atau AQ)
            </label>
            <div className="relative">
              <input
                id="input-gemini-key"
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy... atau AQ..."
                className="w-full text-xs font-mono pr-10 pl-3.5 py-2.5 bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-xl focus:bg-white dark:focus:bg-[#0E1B38] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Kunci API disimpan secara privat di browser Anda dan tidak disebarluaskan.
            </p>
          </div>

          {/* Feedback messages */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#132347] border-t border-slate-100 dark:border-[#1E3563] flex items-center justify-between gap-3">
          {userApiKey ? (
            <button
              type="button"
              onClick={handleClearKey}
              className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
            >
              Hapus Token
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Privat &amp; Aman</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              id="btn-verify-save-token"
              type="button"
              onClick={handleVerifyAndSave}
              disabled={verifying}
              className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-heading font-bold rounded-xl transition-all shadow-sm shadow-sky-600/30 disabled:opacity-50 cursor-pointer"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Uji &amp; Simpan Token</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
