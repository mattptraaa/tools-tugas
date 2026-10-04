/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Header } from "./components/Header";
import { StepProgressNav } from "./components/StepProgressNav";
import { QuestionAnalyzerTab } from "./components/QuestionAnalyzerTab";
import { JournalSearchTab } from "./components/JournalSearchTab";
import { NotebookLMTab } from "./components/NotebookLMTab";
import { AcademicTemplateTab } from "./components/AcademicTemplateTab";
import { HistoryTab } from "./components/HistoryTab";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TabId, QuestionAnalysisResult } from "./types";

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<TabId>("ai-analyzer");

  // Cross-tab communication state
  const [journalSearchQuery, setJournalSearchQuery] = useState("");
  const [notebookJournalTitle, setNotebookJournalTitle] = useState("");
  const [notebookJournalAbstract, setNotebookJournalAbstract] = useState("");
  const [academicDraftText, setAcademicDraftText] = useState("");

  // History re-open state
  const [analyzerInitialQuestion, setAnalyzerInitialQuestion] = useState("");
  const [analyzerInitialSubject, setAnalyzerInitialSubject] = useState("");
  const [analyzerInitialAnalysis, setAnalyzerInitialAnalysis] = useState<QuestionAnalysisResult | null>(null);

  const handleSearchInJournalTab = (keyword: string) => {
    setJournalSearchQuery(keyword);
    setActiveTab("journal-search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenNotebookLMWithPrompt = (topic: string) => {
    setNotebookJournalTitle(topic);
    setNotebookJournalAbstract("");
    setActiveTab("notebooklm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendToNotebookLM = (journalTitle: string, abstract: string) => {
    setNotebookJournalTitle(journalTitle);
    setNotebookJournalAbstract(abstract);
    setActiveTab("notebooklm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReopenAnalysis = (
    question: string,
    courseSubject: string,
    analysis: QuestionAnalysisResult
  ) => {
    setAnalyzerInitialQuestion(question);
    setAnalyzerInitialSubject(courseSubject);
    setAnalyzerInitialAnalysis(analysis);
    setActiveTab("ai-analyzer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070F1E] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* Header with Tools Tugas Branding & Actions */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* API Key Modal for Gemini Token Self-Management */}
      <ApiKeyModal />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7 space-y-5 sm:space-y-6">
        {/* 4-step horizontal progress indicator */}
        <StepProgressNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content Display */}
        {activeTab === "ai-analyzer" && (
          <QuestionAnalyzerTab
            onSearchInJournalTab={handleSearchInJournalTab}
            onOpenNotebookLMWithPrompt={handleOpenNotebookLMWithPrompt}
            onOpenHistory={() => setActiveTab("history")}
            initialQuestion={analyzerInitialQuestion}
            initialCourseSubject={analyzerInitialSubject}
            initialAnalysis={analyzerInitialAnalysis}
          />
        )}

        {activeTab === "journal-search" && (
          <JournalSearchTab
            initialQuery={journalSearchQuery}
            onSendToNotebookLM={handleSendToNotebookLM}
          />
        )}

        {activeTab === "notebooklm" && (
          <NotebookLMTab
            initialJournalTitle={notebookJournalTitle}
            initialJournalAbstract={notebookJournalAbstract}
          />
        )}

        {activeTab === "templates" && (
          <AcademicTemplateTab
            initialDraft={academicDraftText}
          />
        )}

        {activeTab === "history" && (
          <HistoryTab
            onReopenAnalysis={handleReopenAnalysis}
            onGoToAnalyzer={() => setActiveTab("ai-analyzer")}
          />
        )}
      </main>

      {/* Clean & Minimalist Footer */}
      <footer className="bg-white dark:bg-[#0E1B38] border-t border-slate-200 dark:border-[#1E3563] py-5 mt-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-heading font-black text-slate-900 dark:text-white text-sm">
              Tools Tugas
            </span>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} UT Family. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
