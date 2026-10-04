import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles, HelpCircle, ShieldCheck, ExternalLink } from "lucide-react";

export const FreeStatusBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Jawaban: Ya, Sangat Bisa &amp; 100% Memungkinkan dalam Versi Gratis!
              </h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                Solusi Mahasiswa
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
              Semua 5 langkah yang Anda minta telah berhasil diintegrasikan dengan infrastruktur dan sumber data terbuka (open-access) resmi yang tidak membebankan biaya kepada mahasiswa.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white/80 hover:bg-white border border-emerald-200 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors cursor-pointer"
        >
          <span>{isOpen ? "Tutup Rincian" : "Lihat Penjelasan"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-emerald-200/70 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-700">
          <div className="bg-white/90 p-3 rounded-xl border border-emerald-100/80">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900 mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">1</span>
              <span>AI Asisten Soal</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Memakai model <strong>Gemini 3.1 Flash Lite</strong> dengan kuota hemat hingga <strong>500 RPD</strong> (Requests Per Day) di Free Tier. Membedah soal tugas, merumuskan kata kunci jurnal (ID &amp; EN), dan menyusun kerangka analisis.
            </p>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-emerald-100/80">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900 mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">2</span>
              <span>Link &amp; Pencarian Jurnal</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Mengambil data langsung dari <strong>OpenAlex API</strong> (katalog jutaan riset bebas biaya) serta direct search link ke <strong>Garuda Kemdikbud, Neliti, dan Google Scholar</strong>.
            </p>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-emerald-100/80">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900 mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">3</span>
              <span>Ringkas via NotebookLM</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Google NotebookLM</strong> adalah alat 100% gratis resmi dari Google. Mahasiswa bisa mengunggah hingga 50 dokumen PDF jurnal lalu meringkas atau membuat podcast audio secara cuma-cuma.
            </p>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-emerald-100/80">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900 mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">4</span>
              <span>Template &amp; Tata Bahasa</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Menyediakan template siap pakai untuk diskusi LMS/Tuton, esai tugas, dan kaidah sitasi APA/Harvard. Dilengkapi AI pemoles PUEBI dan KBBI untuk menjamin mutu tulisan.
            </p>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-emerald-100/80">
            <div className="flex items-center space-x-1.5 font-bold text-slate-900 mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">5</span>
              <span>Cek AI ZeroGPT &amp; Humanizer</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Terhubung langsung dengan web <strong>ZeroGPT gratis</strong> (tanpa login akun), disertai langkah 1-klik salin teks dan teknik parafrase agar tulisan terdengar alami dan lolos cek orisinalitas.
            </p>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-emerald-100/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 font-bold text-slate-900 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Etika &amp; Nilai Akademik</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Platform ini dirancang sebagai <em>scaffolding</em> (pembimbing riset), sehingga mahasiswa tetap memiliki pemikiran kritis dan integritas ilmiah yang tinggi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
