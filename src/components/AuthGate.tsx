import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  MessageCircle,
  ExternalLink,
  Loader2,
  BookOpen,
  Search,
  FileText,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const AuthGate: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoggingIn(true);
      setErrorMessage(null);
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err?.code === "auth/popup-closed-by-user") {
        setErrorMessage("Jendela masuk ditutup sebelum proses selesai. Silakan coba lagi.");
      } else if (err?.code === "auth/cancelled-popup-request") {
        // Ignored
      } else {
        setErrorMessage("Gagal masuk dengan Google. Pastikan koneksi internet stabil.");
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const workflowSteps = [
    {
      step: "1",
      title: "AI Asisten Soal",
      desc: "Tempelkan pertanyaan tugas atau diskusi LMS. AI membedah konsep inti masalah dan merekomendasikan kata kunci jurnal.",
      icon: <Compass className="w-4 h-4 text-[#E0247A]" />,
      tag: "Langkah 1",
    },
    {
      step: "2",
      title: "Cari Sumber Jurnal",
      desc: "Pencarian artikel ilmiah open access dan tautan langsung ke Garuda, Neliti, Google Scholar, DOAJ, Semantic Scholar, Perpusnas, dan PubMed.",
      icon: <Search className="w-4 h-4 text-[#06B6D4]" />,
      tag: "Langkah 2",
    },
    {
      step: "3",
      title: "Ringkas di NotebookLM",
      desc: "Panduan praktis menggunakan Google NotebookLM dan kumpulan prompt akademik untuk merangkum PDF jurnal tanpa halusinasi.",
      icon: <BookOpen className="w-4 h-4 text-[#F59E0B]" />,
      tag: "Langkah 3",
    },
    {
      step: "4",
      title: "Format Jawaban yang Baik",
      desc: "Sistematika jawaban standar UT (Pembuka, Landasan Teori, Analisis, Opini Kritis, dan Penulisan Sumber yang Benar) serta AI pemoles bahasa.",
      icon: <FileText className="w-4 h-4 text-[#E0247A]" />,
      tag: "Langkah 4",
    },
    {
      step: "5",
      title: "Cek Skor AI",
      desc: "Verifikasi draf tulisan menggunakan QuillBot AI Detector dan terapkan panduan orisinalitas agar tulisan aman dari indikasi AI.",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      tag: "Langkah 5",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#E0247A] selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-[#1E3563] bg-white/95 dark:bg-[#070F1E]/95 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-heading font-black text-xl sm:text-2xl lg:text-3xl tracking-tight text-[#0A192F] dark:text-white leading-tight">
              UT FAMILY CARE
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />

            <a
              id="gate-link-wa-saluran"
              href="https://whatsapp.com/channel/0029VbBvzaKADTOCNeLa4X2S"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saluran WA</span>
              <ExternalLink className="w-3 h-3 text-emerald-200" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Purpose & 5 Steps */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#0E1B38] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-md space-y-3 transition-colors">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#06B6D4]/10 text-[#0891B2] dark:text-[#22D3EE] border border-[#06B6D4]/30 text-xs font-bold">
                <span>No one, we are family</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-[#0A192F] dark:text-white tracking-tight leading-tight">
                Web Tools Bantu Mahasiswa Universitas Terbuka Ngerjain Tugas
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Platform terpadu untuk menyelesaikan diskusi forum LMS Tuton, tugas wajib TMK, dan artikel ilmiah secara terarah, terstruktur, dan beretika.
              </p>
            </div>

            {/* 5 Sequential Workflow Steps */}
            <div className="bg-white dark:bg-[#0E1B38] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-md space-y-4 transition-colors">
              <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                5 Langkah Sistematis Pengerjaan Tugas:
              </h2>

              <div className="space-y-2.5">
                {workflowSteps.map((item) => (
                  <div
                    key={item.step}
                    className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#132347] border border-slate-200 dark:border-[#1E3563] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/20 text-[#0891B2] dark:text-[#22D3EE] flex items-center justify-center shrink-0 font-heading font-black text-xs mt-0.5">
                      {item.step}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-heading">
                          {item.icon}
                          <span>{item.title}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E3563] font-semibold shrink-0">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Google Sign In */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-[#0E1B38] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-xl space-y-5 transition-colors text-center">
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-heading font-black text-[#0A192F] dark:text-white tracking-tight">
                  Masuk dengan Akun Google
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Masuk satu kali untuk menyimpan riwayat analisis soal secara otomatis di cloud database.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-[#E0247A]/10 border border-[#E0247A]/30 text-xs text-[#E0247A] dark:text-[#F43F5E] font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                id="btn-login-with-google"
                type="button"
                onClick={handleLogin}
                disabled={loggingIn}
                className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-[#0A192F] hover:bg-[#132347] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#0A192F] font-heading font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#06B6D4]" />
                    <span>Menghubungkan ke Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0 bg-white p-0.5 rounded-full" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Lanjutkan dengan Akun Google</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                Aman via Firebase Authentication. Sedia token Gemini pribadi Anda setelah masuk.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#1E3563] py-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0E1B38] transition-colors">
        <p>
          UT FAMILY CARE &bull; No one, we are family
        </p>
      </footer>
    </div>
  );
};
