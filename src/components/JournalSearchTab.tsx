import React, { useState, useEffect } from "react";
import { Search, ExternalLink, Download, BookOpen, Check, Copy, Globe, Loader2, Filter } from "lucide-react";
import { JournalItem } from "../types";
import { JOURNAL_SOURCES } from "../data/sources";

interface JournalSearchTabProps {
  initialQuery?: string;
  onSendToNotebookLM: (journalTitle: string, abstract: string) => void;
}

export const JournalSearchTab: React.FC<JournalSearchTabProps> = ({
  initialQuery = "",
  onSendToNotebookLM,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<JournalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "openAccess">("all");

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/journals/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil data dari repositori jurnal.");
      }
      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      setError("Pencarian live sedang lambat, namun Anda tetap dapat membuka tautan langsung ke Garuda, Neliti, dan Google Scholar di bawah.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleCopyCitation = (item: JournalItem) => {
    const citation = `${item.authors} (${item.publicationYear}). ${item.title}. ${item.venue}. ${item.doi || item.url || ""}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredResults = results.filter((item) => {
    if (activeFilter === "openAccess") return item.isOpenAccess;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Section: Search Bar & 7 Registered Sources */}
      <section className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1E3563] shadow-xs transition-colors">
        <div className="mb-4 pb-4 border-b border-slate-100 dark:border-[#1E3563]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
              Langkah 2: Cari Sumber Jurnal
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Cari artikel ilmiah open access langsung atau gunakan link langsung ke 7 repositori bereputasi nasional dan internasional.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleFormSubmit} className="mt-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 absolute left-3 sm:left-3.5 pointer-events-none" />
            <input
              id="search-journal-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik topik atau judul jurnal (misal: kurikulum merdeka, digital banking...)"
              className="w-full text-xs sm:text-sm pl-9 sm:pl-11 pr-20 sm:pr-28 py-2.5 sm:py-3 bg-slate-50 dark:bg-[#132347] border border-slate-300 dark:border-[#1E3563] rounded-xl focus:bg-white dark:focus:bg-[#0E1B38] focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all text-slate-900 dark:text-white"
            />
            <button
              id="btn-search-journals"
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-sky-600 hover:bg-sky-700 text-white font-heading font-bold text-xs sm:text-sm rounded-lg transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">Cari Jurnal</span>
              <span className="sm:hidden">Cari</span>
            </button>
          </div>
        </form>

        {/* 7 Registered Sources Links */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#1E3563]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="font-heading">7 Portal Jurnal Terdaftar Resmi:</span>
            </span>
            {query.trim() && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Kueri terisi: <strong>"{query.trim()}"</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {JOURNAL_SOURCES.map((source) => {
              const targetUrl = query.trim() ? source.urlTemplate(query.trim()) : source.homeUrl;
              return (
                <a
                  key={source.id}
                  id={`link-source-${source.id}`}
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1E3563] bg-slate-50/70 dark:bg-[#132347] hover:border-sky-500 dark:hover:border-sky-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-[#0E1B38] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E3563]">
                        {source.badge}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors shrink-0" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                      {source.name}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {source.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 mt-3 block">
                    {query.trim() ? "Cari kueri di portal ini" : "Buka portal resmi"}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Search Results Header & Filter */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-[#0E1B38] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E3563]">
            <div className="text-xs text-slate-700 dark:text-slate-300">
              Menampilkan <strong>{filteredResults.length}</strong> artikel untuk:{" "}
              <span className="font-bold text-sky-600 dark:text-sky-400">"{query}"</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                  activeFilter === "all"
                    ? "bg-white dark:bg-[#132347] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-[#1E3563]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Semua ({results.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("openAccess")}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                  activeFilter === "openAccess"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Open Access Bebas Unduh ({results.filter((r) => r.isOpenAccess).length})
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-800 dark:text-amber-300">
              {error}
            </div>
          )}

          {/* Results List */}
          {loading ? (
            <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-10 border border-slate-200 dark:border-[#1E3563] flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Mengambil artikel jurnal dari database OpenAlex...
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Sistem memilah jurnal terindeks dengan teks lengkap dan data sitasi ilmiah.
              </p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#0E1B38] rounded-2xl p-5 border border-slate-200 dark:border-[#1E3563] hover:border-slate-300 dark:hover:border-[#2D4C8A] transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        {item.venue}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#132347] px-2 py-0.5 rounded">
                        Tahun {item.publicationYear}
                      </span>
                      {item.isOpenAccess && (
                        <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Open Access
                        </span>
                      )}
                      {item.citedByCount > 0 && (
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#132347] px-2 py-0.5 rounded border border-slate-200 dark:border-[#1E3563]">
                          Disitasi {item.citedByCount} kali
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors leading-snug mb-1.5">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-1">
                        <span>{item.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-1 text-slate-400" />
                      </a>
                    </h3>

                    {/* Authors */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2.5">
                      <strong>Penulis:</strong> {item.authors}
                    </p>

                    {/* Abstract preview */}
                    <div className="bg-slate-50 dark:bg-[#132347] p-3 rounded-xl border border-slate-100 dark:border-[#1E3563] text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Abstrak Ringkas:</span>
                      <p className="line-clamp-3">{item.abstract}</p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#1E3563] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {item.pdfUrl ? (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh PDF Full-Text</span>
                        </a>
                      ) : (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#132347] hover:bg-slate-200 dark:hover:bg-[#1E3563] text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Halaman Artikel</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyCitation(item)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-white dark:bg-[#0E1B38] hover:bg-slate-50 dark:hover:bg-[#132347] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E3563] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === item.id ? "Sitasi Tersalin" : "Salin Sitasi"}</span>
                      </button>
                    </div>

                    {/* Send to NotebookLM */}
                    <button
                      type="button"
                      onClick={() => onSendToNotebookLM(item.title, item.abstract)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>Ringkas di Langkah 3 (NotebookLM)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0E1B38] rounded-2xl p-8 border border-slate-200 dark:border-[#1E3563] text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tidak ada hasil yang cocok secara persis di OpenAlex.
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Silakan coba gunakan kata kunci dalam Bahasa Inggris atau klik salah satu sumber nasional di atas seperti <strong>Garuda Kemdikbud</strong> atau <strong>Google Scholar</strong> untuk koleksi lokal Indonesia.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
