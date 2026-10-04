import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Copy, 
  Check, 
  BookOpen, 
  Loader2, 
  AlertCircle,
  Award,
  Zap,
  ShieldCheck,
  Languages,
  FolderDown,
  ExternalLink,
  Trash2,
  Save,
} from "lucide-react";
import { DISCUSSION_TEMPLATES, UT_ASSIGNMENT_COVER_DRIVE_URL } from "../data/sources";
import { PolishedAnswerResult, TranslationResult, isValidGeminiApiKey } from "../types";
import { useAuth } from "../context/AuthContext";

interface AcademicTemplateTabProps {
  initialDraft?: string;
}

const LOCAL_DRAFT_KEY = "tools_tugas_academic_draft";

export const AcademicTemplateTab: React.FC<AcademicTemplateTabProps> = ({
  initialDraft = "",
}) => {
  const { userApiKey, setIsApiKeyModalOpen } = useAuth();
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(-1);

  // Initialize draft from localStorage or fallback to default template
  const [draftInput, setDraftInput] = useState<string>(() => {
    if (initialDraft && initialDraft.trim()) return initialDraft;
    const saved = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (saved !== null && saved.trim()) return saved;
    return DISCUSSION_TEMPLATES[0].content;
  });

  const [taskType, setTaskType] = useState("Tanggapan Forum Diskusi LMS");
  const [citationFormat, setCitationFormat] = useState("APA 7th Edition");

  // Fixed model: Gemini 3.8 Flash as requested
  const fixedModel = "gemini-3.8-flash";

  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polishResult, setPolishResult] = useState<PolishedAnswerResult | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"indonesian" | "english">("indonesian");
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedPolished, setCopiedPolished] = useState(false);
  const [copiedEnglish, setCopiedEnglish] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>("Tersimpan");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Auto-save draft to localStorage whenever draftInput changes
  useEffect(() => {
    localStorage.setItem(LOCAL_DRAFT_KEY, draftInput);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setLastSavedTime(`Tersimpan pk ${timeStr}`);
  }, [draftInput]);

  useEffect(() => {
    if (initialDraft && initialDraft.trim()) {
      setDraftInput(initialDraft);
      setSelectedTemplateIndex(-1);
    }
  }, [initialDraft]);

  // Format checklist inspection
  const hasGreetingOrHeader = /jawaban yang baik|yth|halo|selamat|assalamu|salam|rekan|judul tugas|identitas/i.test(draftInput);
  const hasTheoryRef = /teori|modul|bmp|menurut|pustaka|studi|jurnal|\([12][90][0-9]{2}\)/i.test(draftInput);
  const hasAnalysis = /analisis|faktor|karena|pembahasan|argumen|dampak|hal ini|poin analisis/i.test(draftInput);
  const hasOpinionOrSolution = /opini|solusi|hemat saya|gagasan|orisinal|alternatif|kesimpulan|disimpulkan|rekomendasi/i.test(draftInput);
  const hasReference = /referensi|daftar pustaka|rujukan|penulisan sumber|penerbit|pengarang|doi/i.test(draftInput);

  const formatScore = [hasGreetingOrHeader, hasTheoryRef, hasAnalysis, hasOpinionOrSolution, hasReference].filter(Boolean).length;

  const handleSelectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    const newContent = DISCUSSION_TEMPLATES[index].content;
    setDraftInput(newContent);
    setPolishResult(null);
    setTranslationResult(null);
    setActiveResultTab("indonesian");
    if (index === 0) setTaskType("Tanggapan Forum Diskusi LMS");
    else if (index === 1) setTaskType("Tugas Esai Akademik Analitis");
    else if (index === 2) setTaskType("Jawaban Studi Kasus");
  };

  const handleClearDraft = () => {
    setDraftInput("");
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    setPolishResult(null);
    setTranslationResult(null);
    setShowClearConfirm(false);
  };

  const handlePolishDraft = async () => {
    if (!draftInput.trim()) {
      setError("Silakan masukkan teks draf jawaban terlebih dahulu.");
      return;
    }

    if (!isValidGeminiApiKey(userApiKey)) {
      setError("Token Gemini pribadi wajib diisi! Kode token harus diawali dengan 'AIzaSy' atau 'AQ' (gratis dari Google AI Studio) tanpa menumpang token server.");
      setIsApiKeyModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/polish-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: draftInput.trim(),
          type: taskType,
          format: citationFormat,
          userApiKey: userApiKey.trim() || undefined,
          model: fixedModel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menghubungi AI pemoles bahasa.");
      }

      const data: PolishedAnswerResult = await res.json();
      setPolishResult(data);
      setActiveResultTab("indonesian");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memproses draf bahasa akademik.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateToEnglish = async () => {
    const sourceText = polishResult?.polishedText?.trim() || draftInput.trim();

    if (!sourceText) {
      setError("Silakan masukkan teks draf terlebih dahulu untuk diterjemahkan.");
      return;
    }

    if (!isValidGeminiApiKey(userApiKey)) {
      setError("Token Gemini pribadi wajib diisi! Kode token harus diawali dengan 'AIzaSy' atau 'AQ' (gratis dari Google AI Studio) tanpa menumpang token server.");
      setIsApiKeyModalOpen(true);
      return;
    }

    setTranslating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/translate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          userApiKey: userApiKey.trim() || undefined,
          model: fixedModel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Gagal menerjemahkan teks ke Bahasa Inggris.");
      }

      const data: TranslationResult = await res.json();
      setTranslationResult(data);
      setActiveResultTab("english");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menerjemahkan teks ke Bahasa Inggris.");
    } finally {
      setTranslating(false);
    }
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftInput);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleCopyPolished = () => {
    if (!polishResult) return;
    navigator.clipboard.writeText(polishResult.polishedText);
    setCopiedPolished(true);
    setTimeout(() => setCopiedPolished(false), 2000);
  };

  const handleCopyEnglish = () => {
    if (!translationResult) return;
    navigator.clipboard.writeText(translationResult.translatedText);
    setCopiedEnglish(true);
    setTimeout(() => setCopiedEnglish(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <section className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-xs space-y-5 transition-colors">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-[#1E3563]">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold shrink-0 border border-sky-200 dark:border-sky-800">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                Langkah 4: Format Jawaban yang Baik &amp; Poles Bahasa
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Struktur jawaban standar UT: Analisis terstruktur, opini kritis, sitasi baku, AI pemoles gaya bahasa alami, serta penerjemahan Bahasa Inggris akademik.
            </p>
          </div>
        </div>

        {/* Cover Tugas Mahasiswa UT (Google Drive) Banner */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50/70 dark:from-[#0E2042] dark:to-[#10254D] border border-sky-200/80 dark:border-[#1E3E75] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/30">
              <FolderDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-heading font-bold text-slate-900 dark:text-white">
                  Template Cover Tugas Mahasiswa Universitas Terbuka
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  Folder Google Drive Resmi
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Unduh format cover lembar kerja resmi untuk Tugas 1, 2, dan 3 (format Word / Dokumen) agar pengerjaan tugas rapi sesuai standar tuton UT.
              </p>
            </div>
          </div>

          <a
            id="link-cover-tugas-ut-gdrive"
            href={UT_ASSIGNMENT_COVER_DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-heading font-bold transition-all shrink-0 cursor-pointer shadow-sm shadow-sky-600/30"
          >
            <span>Download Cover Tugas (Google Drive)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Fixed AI Model Info: Gemini 3.8 Flash */}
        <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-heading">
              Model AI Pemoles Bahasa &amp; Penerjemah:
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Menghaluskan diksi kalimat menjadi mengalir alami manusiawi serta menerjemahkan jawaban ke Bahasa Inggris akademik formal.
            </p>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-2xs self-start md:self-auto shrink-0">
            <Zap className="w-3.5 h-3.5 text-sky-200" />
            <span>Gemini 3.8 Flash</span>
          </div>
        </div>

        {/* 5 Kaidah Format Jawaban Standar UT */}
        <div className="bg-slate-50 dark:bg-[#132347] rounded-xl p-4 border border-slate-200 dark:border-[#1E3563]">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2.5 font-heading">
            5 Kaidah Format Jawaban yang Baik Standar UT:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2 bg-white dark:bg-[#0E1B38] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E3563]">
              <span className="font-bold text-sky-600 shrink-0">1.</span>
              <span><strong>Landasan Konsep/Teori:</strong> Menautkan teori modul BMP atau literatur ilmiah pada topik.</span>
            </div>
            <div className="flex items-start gap-2 bg-white dark:bg-[#0E1B38] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E3563]">
              <span className="font-bold text-sky-600 shrink-0">2.</span>
              <span><strong>Analisis &amp; Pembahasan:</strong> Menelaah poin permasalahan secara sistematis berbasis pengamatan ilmiah.</span>
            </div>
            <div className="flex items-start gap-2 bg-white dark:bg-[#0E1B38] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E3563]">
              <span className="font-bold text-sky-600 shrink-0">3.</span>
              <span><strong>Tantangan &amp; Antisipasi:</strong> Mengidentifikasi kendala kontekstual dan pendekatan ideal mengatasinya.</span>
            </div>
            <div className="flex items-start gap-2 bg-white dark:bg-[#0E1B38] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E3563]">
              <span className="font-bold text-sky-600 shrink-0">4.</span>
              <span><strong>Opini Kritis &amp; Solusi Alternatif:</strong> Uraian gagasan orisinal logis dan aplikatif untuk Indonesia.</span>
            </div>
            <div className="flex items-start gap-2 bg-white dark:bg-[#0E1B38] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E3563] sm:col-span-2">
              <span className="font-bold text-sky-600 shrink-0">5.</span>
              <span><strong>Penulisan Sumber yang Benar:</strong> <code>Nama Pengarang. Tahun Terbit. Judul Buku/Artikel. Penerbit/Jurnal.</code></span>
            </div>
          </div>
        </div>

        {/* Format Template Selector Cards */}
        <div>
          <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 font-heading">
            Pilih Kerangka Format Jawaban yang Baik:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DISCUSSION_TEMPLATES.map((tmpl, idx) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(idx)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTemplateIndex === idx
                    ? "bg-sky-50 dark:bg-sky-950/40 border-sky-500 ring-1 ring-sky-500"
                    : "bg-slate-50 dark:bg-[#132347] hover:bg-slate-100 dark:hover:bg-[#1E3563] border-slate-200 dark:border-[#1E3563]"
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-[#0E1B38] text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-[#1E3563] inline-block mb-1.5">
                    {tmpl.category}
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug mb-1">
                    {tmpl.title}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
                <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-3 block">
                  Gunakan Format Ini
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Editor & AI Polish Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Draft Input with Auto-Save and Clear Draft */}
        <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 border border-slate-200 dark:border-[#1E3563] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            {/* Top Toolbar of Left Editor */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                  Kotak Penulisan Format Jawaban
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <Save className="w-3 h-3" />
                  <span>{lastSavedTime}</span>
                </span>
              </div>

              {/* Action Buttons: Copy & Bersihkan Jawaban */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 dark:bg-[#132347] hover:bg-slate-200 dark:hover:bg-[#1E3563] text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  title="Salin isi draf"
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDraft ? "Tersalin" : "Salin"}</span>
                </button>

                {/* Bersihkan Jawaban Button */}
                {!showClearConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                    title="Kosongkan isi kotak jawaban"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Bersihkan Jawaban</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-lg border border-rose-200 dark:border-rose-800 animate-in fade-in">
                    <span className="text-[11px] text-rose-700 dark:text-rose-300 font-semibold px-1">
                      Yakin hapus?
                    </span>
                    <button
                      type="button"
                      onClick={handleClearDraft}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                    >
                      Ya, Bersihkan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      className="px-1.5 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#132347] rounded text-[11px] cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Checklist Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${hasGreetingOrHeader ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" : "bg-slate-100 dark:bg-[#132347] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#1E3563]"}`}>
                  {hasGreetingOrHeader ? "✓" : "○"} Pembuka
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${hasTheoryRef ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" : "bg-slate-100 dark:bg-[#132347] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#1E3563]"}`}>
                  {hasTheoryRef ? "✓" : "○"} Teori / Jurnal
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${hasAnalysis ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" : "bg-slate-100 dark:bg-[#132347] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#1E3563]"}`}>
                  {hasAnalysis ? "✓" : "○"} Analisis
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${hasOpinionOrSolution ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" : "bg-slate-100 dark:bg-[#132347] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#1E3563]"}`}>
                  {hasOpinionOrSolution ? "✓" : "○"} Opini &amp; Solusi
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${hasReference ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" : "bg-slate-100 dark:bg-[#132347] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#1E3563]"}`}>
                  {hasReference ? "✓" : "○"} Sumber Pustaka
                </span>
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Kelengkapan:{" "}
                <strong className={formatScore >= 4 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>
                  {formatScore}/5 Komponen
                </strong>
              </span>
            </div>

            <textarea
              rows={13}
              value={draftInput}
              onChange={(e) => setDraftInput(e.target.value)}
              placeholder="Ketik atau sesuaikan jawaban tugas kuliah Anda dengan format yang baik di sini... (Draf otomatis tersimpan dan tidak akan hilang jika tidak sengaja tertutup)"
              className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-xl focus:bg-white dark:focus:bg-[#0E1B38] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-900 dark:text-white leading-relaxed resize-y"
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#1E3563]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Penugasan:
                </label>
                <select
                  value={taskType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTaskType(val);
                    if (val === "Tanggapan Forum Diskusi LMS") {
                      setSelectedTemplateIndex(0);
                      setDraftInput(DISCUSSION_TEMPLATES[0].content);
                    } else if (val === "Tugas Esai Akademik Analitis") {
                      setSelectedTemplateIndex(1);
                      setDraftInput(DISCUSSION_TEMPLATES[1].content);
                    } else if (val === "Jawaban Studi Kasus") {
                      setSelectedTemplateIndex(2);
                      setDraftInput(DISCUSSION_TEMPLATES[2].content);
                    }
                  }}
                  className="w-full text-xs p-2 bg-white dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Tanggapan Forum Diskusi LMS">Tanggapan Diskusi Tuton / LMS</option>
                  <option value="Tugas Esai Akademik Analitis">Tugas Esai / Makalah Kuliah</option>
                  <option value="Jawaban Studi Kasus">Pemecahan Studi Kasus</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Format Sitasi Daftar Pustaka:
                </label>
                <select
                  value={citationFormat}
                  onChange={(e) => setCitationFormat(e.target.value)}
                  className="w-full text-xs p-2 bg-white dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="APA 7th Edition">APA Style Edisi 7 (Standar UT)</option>
                  <option value="IEEE Format">IEEE (Teknik &amp; Komputer)</option>
                  <option value="Harvard Style">Harvard Referencing</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-lg text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons: Poles Bahasa (Gemini 3.8) & Translate ke Inggris */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                id="btn-polish-academic-draft"
                type="button"
                onClick={handlePolishDraft}
                disabled={loading || translating}
                className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-heading font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shadow-sm shadow-sky-600/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memoles dengan Gemini 3.8...</span>
                  </>
                ) : (
                  <span>Poles Bahasa &amp; Struktur</span>
                )}
              </button>

              <button
                id="btn-translate-to-english"
                type="button"
                onClick={handleTranslateToEnglish}
                disabled={translating || loading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-heading font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm shadow-indigo-600/25"
                title="Terjemahkan jawaban ke Bahasa Inggris Akademik formal"
              >
                {translating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menerjemahkan...</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4" />
                    <span>Translate ke Inggris</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Polish Result & English Translation */}
        <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 border border-slate-200 dark:border-[#1E3563] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            {/* Header with Bilingual View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-[#1E3563]">
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-[#132347] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveResultTab("indonesian")}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                    activeResultTab === "indonesian"
                      ? "bg-white dark:bg-[#0E1B38] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Bahasa Indonesia {polishResult ? "(Hasil Poles)" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab("english")}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                    activeResultTab === "english"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Languages className="w-3 h-3" />
                  <span>Bahasa Inggris {translationResult ? "(Translated)" : ""}</span>
                </button>
              </div>

              {/* Action Buttons for active view */}
              <div className="flex items-center space-x-2 shrink-0">
                {activeResultTab === "indonesian" && polishResult && (
                  <button
                    id="btn-copy-polished-text"
                    type="button"
                    onClick={handleCopyPolished}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-md text-xs font-bold transition-colors cursor-pointer border border-sky-200 dark:border-sky-800"
                  >
                    {copiedPolished ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPolished ? "Tersalin" : "Salin Indonesia"}</span>
                  </button>
                )}

                {activeResultTab === "english" && translationResult && (
                  <button
                    id="btn-copy-english-text"
                    type="button"
                    onClick={handleCopyEnglish}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                  >
                    {copiedEnglish ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEnglish ? "Tersalin" : "Salin English"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB CONTENT: INDONESIAN POLISHED RESULT */}
            {activeResultTab === "indonesian" && (
              polishResult ? (
                <div className="space-y-3">
                  {/* Badges: Human-Like Style & Structure Score */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Estimasi Risiko AI:</span>
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-[#0E1B38] px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px]">
                        {polishResult.aiDetectorRisk || "Rendah (< 5%)"}
                      </span>
                    </div>

                    <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-sky-600" />
                        <span>Struktur Akademik:</span>
                      </span>
                      <span className="font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-[#0E1B38] px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 text-[11px]">
                        {polishResult.structureScore || "Lengkap"}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm p-3.5 bg-slate-50 dark:bg-[#132347] border border-slate-200 dark:border-[#1E3563] rounded-xl text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {polishResult.polishedText}
                  </div>

                  {/* Translate Banner Option inside result */}
                  {!translationResult && (
                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-center justify-between gap-3">
                      <div className="text-xs text-indigo-900 dark:text-indigo-200">
                        Ingin menerjemahkan hasil polesan ini ke Bahasa Inggris untuk tugas bilingual?
                      </div>
                      <button
                        type="button"
                        onClick={handleTranslateToEnglish}
                        disabled={translating}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                        <span>Translate Sekarang</span>
                      </button>
                    </div>
                  )}

                  {polishResult.humanizationAdvice && (
                    <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 block">
                        Tips Gaya Bahasa Alami Tambahan:
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {polishResult.humanizationAdvice}
                      </p>
                    </div>
                  )}

                  {polishResult.improvements && polishResult.improvements.length > 0 && (
                    <div className="p-3 bg-slate-50 dark:bg-[#132347] border border-slate-200 dark:border-[#1E3563] rounded-xl space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                        Poin Perbaikan Tata Bahasa &amp; Variasi Kalimat:
                      </span>
                      <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 pl-4 list-disc">
                        {polishResult.improvements.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {polishResult.suggestedCitationTemplate && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-200 block mb-1">
                        Format Contoh Sitasi yang Direkomendasikan:
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-mono">
                        {polishResult.suggestedCitationTemplate}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-[#1E3563] rounded-xl text-slate-400 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs max-w-sm text-slate-500 dark:text-slate-400">
                    Susun draf jawaban Anda di sebelah kiri, lalu klik <strong>"Poles Bahasa &amp; Struktur"</strong> untuk merevisi kalimat menjadi bergaya alami manusiawi, runtut, dan siap dikumpulkan.
                  </p>
                </div>
              )
            )}

            {/* TAB CONTENT: ENGLISH TRANSLATED RESULT */}
            {activeResultTab === "english" && (
              translationResult ? (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Terjemahan Akademik (Academic English):</span>
                    </span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-[#0E1B38] px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 text-[11px]">
                      CEFR C1/C2 Formal
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm p-3.5 bg-slate-50 dark:bg-[#132347] border border-slate-200 dark:border-[#1E3563] rounded-xl text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {translationResult.translatedText}
                  </div>

                  {translationResult.academicNotes && (
                    <div className="p-3 bg-slate-50 dark:bg-[#132347] border border-slate-200 dark:border-[#1E3563] rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                        Catatan Istilah &amp; Register Akademik:
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {translationResult.academicNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyEnglish}
                      className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedEnglish ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEnglish ? "Teks Inggris Tersalin" : "Salin Teks Bahasa Inggris"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-[#1E3563] rounded-xl text-slate-400 space-y-3">
                  <Languages className="w-8 h-8 text-indigo-400 dark:text-indigo-500" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Belum Ada Terjemahan Bahasa Inggris
                    </h4>
                    <p className="text-xs max-w-sm text-slate-500 dark:text-slate-400">
                      Klik tombol <strong>"Translate ke Inggris"</strong> untuk menerjemahkan draf atau hasil polesan bahasa Anda ke dalam Bahasa Inggris akademik formal tingkat tinggi (CEFR C1/C2).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTranslateToEnglish}
                    disabled={translating}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />}
                    <span>Terjemahkan Sekarang</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
