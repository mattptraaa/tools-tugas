import React, { useState, useEffect } from "react";
import {
  Search,
  Copy,
  Check,
  BookOpen,
  Layers,
  Lightbulb,
  Loader2,
  Zap,
  History,
} from "lucide-react";
import { QuestionAnalysisResult, isValidGeminiApiKey, AnalysisHistoryItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface QuestionAnalyzerTabProps {
  onSearchInJournalTab: (keyword: string) => void;
  onOpenNotebookLMWithPrompt: (topic: string) => void;
  onOpenHistory?: () => void;
  initialQuestion?: string;
  initialCourseSubject?: string;
  initialAnalysis?: QuestionAnalysisResult | null;
}

const SAMPLE_QUESTIONS = [
  {
    label: "Manajemen & Bisnis",
    subject: "Manajemen Sumber Daya Manusia",
    question: "Bagaimana pengaruh kepemimpinan transformasional dan fleksibilitas kerja terhadap retensi generasi Z di perusahaan rintisan (startup)?",
  },
  {
    label: "Hukum & Kebijakan",
    subject: "Hukum Siber & Perlindungan Data",
    question: "Bagaimana efektivitas Undang-Undang Perlindungan Data Pribadi (UU PDP) di Indonesia dalam menindak kebocoran data pada sektor publik dan privat?",
  },
  {
    label: "Pendidikan & Teknologi",
    subject: "Teknologi Pembelajaran",
    question: "Bagaimana integrasi kecerdasan buatan generatif dalam pembelajaran perguruan tinggi memengaruhi kemampuan berpikir kritis dan orisinalitas karya mahasiswa?",
  },
];

const LOCAL_HISTORY_KEY = "tools_tugas_analysis_history";

export const QuestionAnalyzerTab: React.FC<QuestionAnalyzerTabProps> = ({
  onSearchInJournalTab,
  onOpenNotebookLMWithPrompt,
  onOpenHistory,
  initialQuestion,
  initialCourseSubject,
  initialAnalysis,
}) => {
  const { currentUser, userApiKey, setIsApiKeyModalOpen } = useAuth();
  const [question, setQuestion] = useState(initialQuestion || "");
  const [courseSubject, setCourseSubject] = useState(initialCourseSubject || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<QuestionAnalysisResult | null>(initialAnalysis || null);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

  // Model is fixed to Gemini 3.1 as requested
  const fixedModel = "gemini-3.1-flash-lite";

  useEffect(() => {
    if (initialQuestion !== undefined) setQuestion(initialQuestion);
    if (initialCourseSubject !== undefined) setCourseSubject(initialCourseSubject);
    if (initialAnalysis !== undefined) setAnalysis(initialAnalysis);
  }, [initialQuestion, initialCourseSubject, initialAnalysis]);

  const saveToLocalHistory = (item: AnalysisHistoryItem) => {
    try {
      const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
      const list: AnalysisHistoryItem[] = raw ? JSON.parse(raw) : [];
      list.unshift(item);
      // Keep up to 30 items
      const trimmed = list.slice(0, 30);
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn("Failed to save history to localStorage:", e);
    }
  };

  const handleAnalyze = async () => {
    if (!question.trim()) {
      setError("Silakan masukkan soal tugas atau topik diskusi terlebih dahulu.");
      return;
    }

    if (!isValidGeminiApiKey(userApiKey)) {
      setError("Token Gemini pribadi wajib diisi!");
      setIsApiKeyModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setHistorySaved(false);

    try {
      const res = await fetch("/api/ai/analyze-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          courseSubject: courseSubject.trim(),
          userApiKey: userApiKey.trim() || undefined,
          model: fixedModel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Terjadi kendala saat menghubungi server AI.");
      }

      const data: QuestionAnalysisResult = await res.json();
      setAnalysis(data);

      const historyItem: AnalysisHistoryItem = {
        id: "local_" + Date.now(),
        userId: currentUser ? currentUser.uid : "local_user",
        question: question.trim(),
        courseSubject: courseSubject.trim(),
        modelUsed: fixedModel,
        result: data,
        createdAt: Date.now(),
      };

      // Always save to localStorage so history works without login
      saveToLocalHistory(historyItem);
      setHistorySaved(true);

      // Also sync to firestore if logged in
      if (currentUser) {
        try {
          await addDoc(collection(db, "users", currentUser.uid, "history"), {
            userId: currentUser.uid,
            question: question.trim(),
            courseSubject: courseSubject.trim(),
            modelUsed: fixedModel,
            result: data,
            createdAt: Date.now(),
          });
        } catch (saveErr) {
          console.warn("Gagal sinkron riwayat ke Firestore:", saveErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menganalisis soal. Mohon periksa kembali koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuery = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Step Introduction & Input Panel */}
      <section className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-xs transition-colors">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-[#1E3563]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                Langkah 1: AI Asisten Soal
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Bedah konsep inti pertanyaan tugas, rumuskan kata kunci, dan temukan rekomendasi topik jurnal ilmiah yang tepat sasaran.
            </p>
          </div>

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#132347] dark:hover:bg-[#1E3563] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-[#1E3563]"
            >
              <History className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Lihat Riwayat Analisis</span>
            </button>
          )}
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          {/* Static AI Model Info (Gemini 3.1 - Fixed, No Selector) */}
          <div className="p-3 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white font-heading">
                Model AI Pencari Jurnal:
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Otomatis dioptimalkan untuk riset dan kurasi literatur ilmiah
              </span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-xs shadow-2xs self-start sm:self-auto">
              <Zap className="w-3.5 h-3.5 text-sky-200" />
              <span>Gemini 3.1</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label htmlFor="course-subject" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Mata Kuliah / Bidang Studi (Opsional)
              </label>
              <input
                id="course-subject"
                type="text"
                value={courseSubject}
                onChange={(e) => setCourseSubject(e.target.value)}
                placeholder="Contoh: Metodologi Penelitian..."
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-xl focus:bg-white dark:focus:bg-[#0E1B38] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Contoh Cepat Soal Tugas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_QUESTIONS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestion(sample.question);
                      setCourseSubject(sample.subject);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-[#132347] dark:hover:bg-[#1E3563] text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E3563] transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="task-question" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Pertanyaan Soal / Topik Diskusi Tugas UT <span className="text-sky-600">*</span>
            </label>
            <textarea
              id="task-question"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ketik atau tempel soal tugas kuliah, instruksi tutor, atau pertanyaan diskusi forum di sini..."
              className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-xl focus:bg-white dark:focus:bg-[#0E1B38] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-900 dark:text-white resize-y"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-800 dark:text-amber-200 font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Model aktif: <strong className="text-sky-600 dark:text-sky-400">Gemini 3.1</strong></span>
              {historySaved && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersimpan di Riwayat</span>
                </span>
              )}
            </div>

            <button
              id="btn-analyze-question"
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-heading font-bold rounded-xl transition-all shadow-md shadow-sky-600/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membedah Soal dengan Gemini 3.1...</span>
                </>
              ) : (
                <span>Bedah Soal &amp; Rekomendasikan Jurnal</span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Analysis Result Display */}
      {analysis && (
        <div className="space-y-5">
          {/* Core Concept & Recommended Query Banner */}
          <section className="bg-slate-900 dark:bg-[#0E1B38] text-white rounded-2xl p-5 sm:p-6 border border-slate-800 dark:border-[#1E3563] shadow-md">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span className="font-heading font-bold">Konsep Inti Masalah Soal</span>
              </div>
              <span className="text-[11px] text-sky-300 bg-sky-950/60 border border-sky-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Tersimpan di Riwayat Anda</span>
              </span>
            </div>
            <p className="text-sm sm:text-base font-normal text-slate-100 leading-relaxed">
              {analysis.coreConcept}
            </p>

            {/* Recommended Query Box */}
            <div className="mt-4 pt-4 border-t border-slate-700/80 dark:border-[#1E3563] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-300 block mb-1 font-semibold">
                  Frasa Pencarian Utama Rekomendasi AI:
                </span>
                <code className="text-xs sm:text-sm font-mono text-sky-300 font-semibold bg-slate-950 dark:bg-[#070F1E] px-3 py-1.5 rounded-lg border border-slate-700 dark:border-[#1E3563] inline-block">
                  {analysis.recommendedQuery}
                </code>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyQuery(analysis.recommendedQuery)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedQuery ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQuery ? "Tersalin" : "Salin Kueri"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSearchInJournalTab(analysis.recommendedQuery)}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm shadow-sky-600/30"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Cari di Langkah 2 (Jurnal)</span>
                </button>
              </div>
            </div>
          </section>

          {/* Keywords & Theoretical Frameworks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Keywords */}
            <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 border border-slate-200 dark:border-[#1E3563] shadow-xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white mb-3">
                <Search className="w-4 h-4 text-sky-600" />
                <span className="font-heading">Kata Kunci Pencarian Literatur</span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 block mb-2">
                    Bahasa Indonesia (Garuda, Neliti, SINTA, Perpusnas)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.searchKeywords.indonesian.map((kw, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onSearchInJournalTab(kw)}
                        className="text-xs bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-semibold px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                        title="Klik untuk langsung cari di Langkah 2"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Bahasa Inggris (DOAJ, Semantic Scholar, PubMed)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.searchKeywords.english.map((kw, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onSearchInJournalTab(kw)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#132347] dark:hover:bg-[#1E3563] text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1E3563] transition-colors cursor-pointer"
                        title="Klik untuk langsung cari di Langkah 2"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Theoretical Frameworks */}
            <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 border border-slate-200 dark:border-[#1E3563] shadow-xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white mb-3">
                <Layers className="w-4 h-4 text-amber-500" />
                <span className="font-heading">Rekomendasi Teori &amp; Landasan Akademik</span>
              </div>
              <ul className="space-y-2">
                {analysis.theoreticalFrameworks.map((theory, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{theory}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E3563]">
                <button
                  type="button"
                  onClick={() => onOpenNotebookLMWithPrompt(analysis.recommendedQuery)}
                  className="w-full text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300 bg-slate-50 dark:bg-[#132347] hover:bg-sky-50 dark:hover:bg-sky-950/30 border border-slate-200 dark:border-[#1E3563] rounded-xl py-2 px-3 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Siapkan Template Ringkasan di NotebookLM</span>
                </button>
              </div>
            </div>
          </div>

          {/* Suggested Journal Topics */}
          <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 border border-slate-200 dark:border-[#1E3563] shadow-xs">
            <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Rekomendasi Judul &amp; Topik Paper Relevan</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.suggestedJournalTopics.map((topic, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1E3563] bg-slate-50/70 dark:bg-[#132347] flex flex-col justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug mb-1">
                      {topic.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {topic.reason}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSearchInJournalTab(topic.searchSnippet || topic.title)}
                    className="w-full text-xs font-bold text-sky-600 dark:text-sky-300 bg-white dark:bg-[#0E1B38] border border-sky-200 dark:border-sky-800 hover:border-sky-500 py-1.5 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Search className="w-3 h-3" />
                    <span>Cari Topik Ini</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Discussion Outline / Structure */}
          {analysis.discussionOutline && analysis.discussionOutline.length > 0 && (
            <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 border border-slate-200 dark:border-[#1E3563] shadow-xs">
              <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Rekomendasi Alur Struktur Jawaban Tugas / Diskusi UT</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Gunakan alur sistematis ini saat menulis tanggapan agar argumen Anda runtut, ilmiah, dan bernilai maksimal.
              </p>

              <div className="space-y-2">
                {analysis.discussionOutline.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#132347] border border-slate-100 dark:border-[#1E3563] text-xs text-slate-800 dark:text-slate-200"
                  >
                    <span className="font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded text-[10px] shrink-0">
                      Bagian {idx + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
