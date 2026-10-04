import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  History,
  Search,
  Trash2,
  Calendar,
  Copy,
  Check,
  Loader2,
  BookOpen,
} from "lucide-react";
import { AnalysisHistoryItem, QuestionAnalysisResult } from "../types";

interface HistoryTabProps {
  onReopenAnalysis: (
    question: string,
    courseSubject: string,
    analysis: QuestionAnalysisResult
  ) => void;
  onGoToAnalyzer: () => void;
}

const LOCAL_HISTORY_KEY = "tools_tugas_analysis_history";

export const HistoryTab: React.FC<HistoryTabProps> = ({
  onReopenAnalysis,
  onGoToAnalyzer,
}) => {
  const { currentUser } = useAuth();
  const [historyItems, setHistoryItems] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const fetchHistory = async () => {
    setLoading(true);
    const localItems: AnalysisHistoryItem[] = [];
    try {
      const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          localItems.push(...parsed);
        }
      }
    } catch (e) {
      console.warn("Failed reading local history:", e);
    }

    if (currentUser) {
      try {
        const historyRef = collection(db, "users", currentUser.uid, "history");
        const q = query(historyRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        snap.forEach((docSnap) => {
          const d = docSnap.data();
          // Avoid duplicate by id
          if (!localItems.some((it) => it.id === docSnap.id)) {
            localItems.push({
              id: docSnap.id,
              userId: d.userId || currentUser.uid,
              question: d.question || "",
              courseSubject: d.courseSubject || "",
              modelUsed: d.modelUsed || "gemini-3.1-flash-lite",
              result: d.result as QuestionAnalysisResult,
              createdAt: typeof d.createdAt === "number" ? d.createdAt : Date.now(),
            });
          }
        });
      } catch (err) {
        console.warn("Error fetching analysis history from firestore:", err);
      }
    }

    // Sort descending by createdAt
    localItems.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setHistoryItems(localItems);
    setLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat analisis soal ini?")) {
      return;
    }

    setDeletingId(id);
    try {
      // Remove from local storage
      const updated = historyItems.filter((item) => item.id !== id);
      setHistoryItems(updated);
      try {
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }

      // If document was from firestore and user logged in
      if (currentUser && !id.startsWith("local_")) {
        await deleteDoc(doc(db, "users", currentUser.uid, "history", id));
      }
    } catch (err) {
      console.error("Error deleting history document:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyQuery = (id: string, queryText: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(queryText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = historyItems.filter((item) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      item.question.toLowerCase().includes(term) ||
      item.courseSubject.toLowerCase().includes(term) ||
      (item.result?.recommendedQuery && item.result.recommendedQuery.toLowerCase().includes(term))
    );
  });

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "Baru saja";
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <section className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold shrink-0 border border-sky-200 dark:border-sky-800">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
              Riwayat Analisis Soal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Analisis soal yang telah Anda proses ({historyItems.length} tersimpan).
            </p>
          </div>
        </div>

        {/* Search bar inside history */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari soal atau mata kuliah..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-xl focus:bg-white dark:focus:bg-[#0E1B38] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-900 dark:text-white"
          />
        </div>
      </section>

      {/* Loading state */}
      {loading ? (
        <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-12 border border-slate-200 dark:border-[#1E3563] text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            Memuat riwayat analisis soal Anda...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-12 border border-slate-200 dark:border-[#1E3563] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center mx-auto border border-sky-200 dark:border-sky-800">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              {searchFilter ? "Tidak ada riwayat yang cocok" : "Belum Ada Riwayat Analisis"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {searchFilter
                ? "Coba gunakan kata kunci pencarian yang lain."
                : "Saat Anda membedah soal di Langkah 1 (AI Asisten Soal), hasil analisis akan otomatis tersimpan di sini."}
            </p>
          </div>
          {!searchFilter && (
            <button
              type="button"
              onClick={onGoToAnalyzer}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-heading font-bold rounded-xl transition-all shadow-sm shadow-sky-600/30 cursor-pointer"
            >
              <span>Mulai Bedah Soal di Langkah 1</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 border border-slate-200 dark:border-[#1E3563] hover:border-sky-500 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1E3563] pb-3">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 rounded-lg">
                    {item.courseSubject || "Mata Kuliah Umum"}
                  </span>

                  <span className="text-[11px] font-semibold bg-slate-100 dark:bg-[#132347] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E3563] px-2 py-0.5 rounded-lg">
                    {item.modelUsed === "gemini-3.8-flash" ? "Gemini 3.8" : "Gemini 3.1"}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400 dark:text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    disabled={deletingId === item.id}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Hapus riwayat"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 block mb-1">
                  Soal Tugas:
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                  &ldquo;{item.question}&rdquo;
                </p>
              </div>

              {item.result?.coreConcept && (
                <div className="p-3 bg-slate-50 dark:bg-[#132347] rounded-xl border border-slate-100 dark:border-[#1E3563] text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Konsep Inti:</span>
                  <p className="line-clamp-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.result.coreConcept}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                {item.result?.recommendedQuery ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Kueri:</span>
                    <code className="text-xs font-mono bg-slate-100 dark:bg-[#132347] text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded border border-slate-200 dark:border-[#1E3563]">
                      {item.result.recommendedQuery}
                    </code>
                    <button
                      type="button"
                      onClick={(e) => handleCopyQuery(item.id, item.result.recommendedQuery, e)}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-[#132347] transition-colors cursor-pointer"
                      title="Salin kueri jurnal"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() => onReopenAnalysis(item.question, item.courseSubject, item.result)}
                  className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-600 dark:hover:text-white font-bold text-xs rounded-xl transition-all border border-sky-200 dark:border-sky-800 cursor-pointer shadow-2xs"
                >
                  <span>Buka di Langkah 1</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
