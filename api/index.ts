import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

// Model resolution function
function resolveModel(modelName?: string): string {
  if (modelName === "gemini-3.1-flash-lite") {
    return "gemini-3.1-flash-lite";
  }
  return "gemini-3.1-flash-lite";
}

// Helper: Validasi format token Gemini API (wajib diawali AIzaSy atau AQ)
function isValidGeminiKey(key?: string): boolean {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  return (trimmed.startsWith("AIzaSy") || trimmed.startsWith("AQ")) && trimmed.length >= 15;
}

// Get Gemini client strictly requiring user-supplied API key
function getGeminiClient(userApiKey?: string): GoogleGenAI {
  const key = userApiKey?.trim();
  if (!key || !isValidGeminiKey(key)) {
    throw new Error(
      "Token Gemini pribadi wajib digunakan. Kunci harus diawali dengan 'AIzaSy' atau 'AQ' (didapatkan gratis via Google AI Studio di aistudio.google.com)."
    );
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function generateGeminiContent(
  prompt: string,
  isJson: boolean = true,
  userApiKey?: string,
  modelName?: string
): Promise<string> {
  const ai = getGeminiClient(userApiKey);
  const chosenModel = resolveModel(modelName);

  const response = await ai.models.generateContent({
    model: chosenModel,
    contents: prompt,
    config: isJson
      ? {
          responseMimeType: "application/json",
          temperature: 0.3,
        }
      : {
          temperature: 0.3,
        },
  });

  if (response && response.text) {
    return response.text;
  }

  throw new Error(`Layanan ${chosenModel} tidak mengembalikan teks jawaban.`);
}

// API: Verifikasi API Key Pengguna (handle both /api/ai/verify-key and /ai/verify-key)
const router = express.Router();

router.post("/verify-key", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!isValidGeminiKey(apiKey)) {
      return res.status(400).json({
        valid: false,
        error: "Format API Key tidak valid. Kode token Google Gemini wajib diawali dengan 'AIzaSy' atau 'AQ'.",
      });
    }

    const testAi = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const testRes = await testAi.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: "Halo",
    });

    if (testRes && testRes.text) {
      return res.json({ valid: true, message: "API Key berhasil diverifikasi dan aktif!" });
    }

    return res.status(400).json({ valid: false, error: "Gagal memverifikasi API Key." });
  } catch (err: any) {
    console.error("Error verifying Gemini API key:", err);
    const msg = err?.message || String(err);
    return res.status(400).json({
      valid: false,
      error: msg.includes("API_KEY_INVALID")
        ? "API Key salah atau tidak terdaftar di Google AI Studio."
        : msg.includes("RESOURCE_EXHAUSTED")
        ? "Kuota API Key ini saat ini sedang penuh. Silakan coba beberapa saat lagi atau buat kunci baru."
        : `Verifikasi gagal: ${msg}`,
    });
  }
});

router.post("/analyze-question", async (req, res) => {
  try {
    const { question, courseSubject, userApiKey, model } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Pertanyaan atau soal tugas harus diisi." });
    }

    if (!isValidGeminiKey(userApiKey)) {
      return res.status(401).json({
        error: "Token Gemini pribadi wajib digunakan.",
        details: "Setiap pengguna wajib memasukkan API Key Gemini sendiri (diawali dengan 'AIzaSy' atau 'AQ') dari Google AI Studio.",
        requiresApiKey: true,
      });
    }

    const prompt = `Anda adalah asisten kurasi referensi jurnal ilmiah dan pembimbing riset akademik mahasiswa perguruan tinggi di Indonesia.
PENTING: JANGAN BERIKAN TEKS JAWABAN TUGAS/ESAI SIAP PAKAI, agar mahasiswa tetap belajar mandiri, membaca literatur, dan berpikir kritis.
Fokuslah 100% pada kurasi referensi jurnal, konsep ilmiah, teori rujukan, dan kata kunci pencarian jurnal.

Pengguna memberikan soal tugas / topik diskusi berikut:
Mata Kuliah / Bidang (jika ada): ${courseSubject || "Umum"}
Soal / Topik: "${question}"

Berikan hasil analisis referensi dalam format JSON dengan struktur persis seperti berikut:
{
  "coreConcept": "Penjelasan ringkas 1-2 kalimat mengenai esensi permasalahan akademik dan konsep utama yang diuji dalam soal.",
  "searchKeywords": {
    "indonesian": ["kata kunci jurnal 1", "kata kunci jurnal 2", "kata kunci jurnal 3"],
    "english": ["journal keyword 1", "journal keyword 2", "journal keyword 3"]
  },
  "recommendedQuery": "Frasa pencarian Google Scholar / Neliti / Garuda yang paling akurat untuk menemukan jurnal pendukung",
  "theoreticalFrameworks": [
    "Nama Teori / Konsep Akademik 1 beserta tokoh/ahli",
    "Nama Teori / Konsep Akademik 2 beserta tokoh/ahli",
    "Nama Teori / Model Ilmiah 3"
  ],
  "suggestedJournalTopics": [
    {
      "title": "Rekomendasi judul / topik jurnal ilmiah 1 yang relevan",
      "reason": "Alasan mengapa jurnal topik ini penting dirujuk untuk membedah soal tersebut",
      "searchSnippet": "Frasa pencarian jurnal spesifik 1"
    },
    {
      "title": "Rekomendasi judul / topik jurnal ilmiah 2 yang relevan",
      "reason": "Alasan mengapa jurnal ini dibutuhkan sebagai bukti empiris/teoretis",
      "searchSnippet": "Frasa pencarian jurnal spesifik 2"
    },
    {
      "title": "Rekomendasi judul / topik jurnal ilmiah 3 yang relevan",
      "reason": "Alasan relevansi sebagai pembanding atau studi kasus",
      "searchSnippet": "Frasa pencarian jurnal spesifik 3"
    }
  ],
  "discussionOutline": [
    "Panduan poin analisis 1: Konsep dasar dan teori yang perlu Anda kutip",
    "Panduan poin analisis 2: Argumen kritis dan perbandingan data yang perlu Anda kaji dari jurnal",
    "Panduan poin analisis 3: Kesimpulan konseptual dan solusi yang perlu Anda rumuskan sendiri"
  ]
}
Kembalikan HANYA format JSON yang valid tanpa Markdown \`\`\`json.`;

    const rawText = await generateGeminiContent(prompt, true, userApiKey, model);
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleaned);
    return res.json(data);
  } catch (err: any) {
    console.error("Error in /api/ai/analyze-question:", err);
    return res.status(500).json({
      error: "Gagal menganalisis soal dengan AI. Silakan coba kembali.",
      details: err?.message || String(err),
    });
  }
});

router.post("/polish-answer", async (req, res) => {
  try {
    const { text, type, format, userApiKey, model } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Teks jawaban tugas harus diisi." });
    }

    if (!isValidGeminiKey(userApiKey)) {
      return res.status(401).json({
        error: "Token Gemini pribadi wajib digunakan.",
        details: "Setiap pengguna wajib memasukkan API Key Gemini sendiri (diawali dengan 'AIzaSy' atau 'AQ') dari Google AI Studio.",
        requiresApiKey: true,
      });
    }

    const prompt = `Anda adalah editor akademik terkemuka, dosen penilai Universitas Terbuka (UT), dan pakar penulisan ilmiah bebas deteksi AI.
Tugas Anda adalah merombak dan memoles draf jawaban mahasiswa berikut agar memiliki STRUKTUR AKADEMIK SEMPURNA serta GAYA BAHASA ALAMI MANUSIAWI YANG TIDAK TERDETEKSI OLEH AI DETECTOR (ZeroGPT, Turnitin AI, GPTZero, CopyLeaks).

Konteks Tugas:
- Jenis Tugas: ${type || "Tanggapan Forum Diskusi Kuliah"}
- Format Sitasi Rujukan: ${format || "APA 7th Edition"}
- Model yang Digunakan: ${model || "gemini-3.8-flash"}

Draf Awal Mahasiswa:
"""
${text}
"""

Instruksi Penulisan Akademis & Anti-Deteksi AI:
1. STRUKTUR FORMAT HARUS RUNTUT (5 Komponen Standar UT):
   - Salam pembuka santun & pengantar topik yang fokus.
   - Landasan konsep/teori (kaitkan dengan BMP Modul UT atau literatur jurnal ilmiah).
   - Analisis & pembahasan mendalam.
   - Opini kritis & solusi alternatif logis dan aplikatif.
   - Daftar pustaka / penulisan sumber rujukan yang benar (${format || "APA 7th Edition"}).

2. TEKNIK ANTI-DETEKSI AI:
   - Variasi ritme kalimat (Burstiness).
   - Hindari kata klise AI generik.
   - Diksi akademik alami PUEBI/KBBI.

Format Output Wajib JSON:
{
  "polishedText": "Teks lengkap hasil revisi yang sudah terstruktur rapi dengan 5 komponen, mengalir alami, santun, ilmiah.",
  "academicToneScore": "Sangat Baik (Sesuai Kaidah PUEBI & Standar UT)",
  "structureScore": "Lengkap (5/5 Komponen Terpenuhi)",
  "aiDetectorRisk": "Sangat Rendah (< 5% - Gaya Alami Manusia)",
  "improvements": [
    "Poin perbaikan 1",
    "Poin perbaikan 2",
    "Poin perbaikan 3"
  ],
  "suggestedCitationTemplate": "Contoh format sitasi yang sesuai",
  "humanizationAdvice": "Tips tambahan konkret agar tulisan semakin autentik saat dinilai dosen."
}
Kembalikan HANYA format JSON yang valid tanpa tanda petik backtick Markdown \`\`\`json.`;

    const rawText = await generateGeminiContent(prompt, true, userApiKey, model);
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleaned);
    return res.json(data);
  } catch (err: any) {
    console.error("Error in /api/ai/polish-answer:", err);
    return res.status(500).json({
      error: "Gagal memproses teks dengan AI.",
      details: err?.message || String(err),
    });
  }
});

router.post("/translate-answer", async (req, res) => {
  try {
    const { text, userApiKey, model } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Teks yang ingin diterjemahkan harus diisi." });
    }

    if (!isValidGeminiKey(userApiKey)) {
      return res.status(401).json({
        error: "Token Gemini pribadi wajib digunakan.",
        details: "Setiap pengguna wajib memasukkan API Key Gemini sendiri (diawali dengan 'AIzaSy' atau 'AQ') dari Google AI Studio.",
        requiresApiKey: true,
      });
    }

    const prompt = `Anda adalah penerjemah akademik profesional dan editor jurnal ilmiah internasional.
Tugas Anda adalah menerjemahkan draf atau jawaban tugas akademik mahasiswa Indonesia berikut ke dalam BAHASA INGGRIS AKADEMIK TINGKAT TINGGI (CEFR C1/C2 - Formal Academic English).

Teks Asli Bahasa Indonesia:
"""
${text}
"""

Format Output Wajib JSON:
{
  "translatedText": "Teks lengkap hasil terjemahan dalam Bahasa Inggris akademik yang rapi, elegan, dan siap digunakan.",
  "academicNotes": "Catatan singkat mengenai istilah ilmiah atau penyesuaian register akademik yang diterapkan.",
  "wordCount": 120
}
Kembalikan HANYA format JSON valid tanpa tanda backtick Markdown \`\`\`json.`;

    const rawText = await generateGeminiContent(prompt, true, userApiKey, model);
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleaned);
    return res.json(data);
  } catch (err: any) {
    console.error("Error in /api/ai/translate-answer:", err);
    return res.status(500).json({
      error: "Gagal menerjemahkan teks dengan AI.",
      details: err?.message || String(err),
    });
  }
});

// Journal search endpoint
const journalSearchHandler = async (req: express.Request, res: express.Response) => {
  try {
    const query = (req.query.q as string) || "";
    if (!query.trim()) {
      return res.json({ results: [] });
    }

    const encoded = encodeURIComponent(query);
    const openAlexUrl = `https://api.openalex.org/works?search=${encoded}&per_page=12&mailto=student.research@example.com`;

    const response = await fetch(openAlexUrl, {
      headers: {
        "User-Agent": "MahaRiset-AcademicAssistant/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`OpenAlex API responded with status ${response.status}`);
    }

    const rawData = (await response.json()) as any;
    const results = (rawData.results || []).map((work: any) => {
      const authors = (work.authorships || [])
        .map((a: any) => a.author?.display_name)
        .filter(Boolean)
        .slice(0, 4);

      const venue = work.primary_location?.source?.display_name || work.host_venue?.display_name || "Jurnal Ilmiah";
      const pdfUrl = work.open_access?.oa_url || work.primary_location?.pdf_url || null;
      const doiUrl = work.doi || null;
      const landingPage = work.primary_location?.landing_page_url || doiUrl || null;

      let abstract = "";
      if (work.abstract_inverted_index) {
        const wordIndices: [number, string][] = [];
        for (const [word, positions] of Object.entries(work.abstract_inverted_index)) {
          for (const pos of positions as number[]) {
            wordIndices.push([pos, word]);
          }
        }
        wordIndices.sort((a, b) => a[0] - b[0]);
        abstract = wordIndices.map((item) => item[1]).join(" ");
        if (abstract.length > 350) {
          abstract = abstract.slice(0, 350) + "...";
        }
      }

      return {
        id: work.id,
        title: work.display_name || work.title || "Tanpa Judul",
        publicationYear: work.publication_year || "Tahun tidak tertera",
        authors: authors.length > 0 ? authors.join(", ") : "Penulis Anonim",
        venue,
        isOpenAccess: Boolean(work.open_access?.is_oa),
        pdfUrl,
        doi: work.doi,
        url: landingPage || `https://scholar.google.com/scholar?q=${encodeURIComponent(work.display_name || "")}`,
        abstract: abstract || "Abstrak ringkas tersedia di tautan sumber lengkap.",
        citedByCount: work.cited_by_count || 0,
      };
    });

    return res.json({ results });
  } catch (err: any) {
    console.warn("OpenAlex search failed:", err);
    return res.json({
      results: [],
      message: "Pencarian langsung OpenAlex mengalami jeda, silakan klik tautan sumber langsung.",
    });
  }
};

// Mount routes on /api/ai, /ai, /api/journals, and /journals
app.use("/api/ai", router);
app.use("/ai", router);
app.get("/api/journals/search", journalSearchHandler);
app.get("/journals/search", journalSearchHandler);

export default app;
