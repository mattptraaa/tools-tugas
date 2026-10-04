import { JournalSourceInfo } from "../types";

export const JOURNAL_SOURCES: JournalSourceInfo[] = [
  {
    id: "garuda",
    name: "Garuda (Garba Rujukan Digital Kemdikbud)",
    badge: "Nasional Dikti",
    description: "Portal resmi Kemdikbudristek RI yang mengindeks ratusan ribu jurnal ilmiah Indonesia dan karya tugas akhir kampus.",
    urlTemplate: (q) => `https://garuda.kemdikbud.go.id/documents?q=${encodeURIComponent(q)}`,
    homeUrl: "https://garuda.kemdikbud.go.id/",
    isFree: true,
    type: "nasional",
  },
  {
    id: "neliti",
    name: "Neliti Indonesia",
    badge: "Open Repository",
    description: "Repositori penelitian nasional Indonesia terbuka untuk jurnal ilmiah terakreditasi SINTA dan laporan riset kebijakan.",
    urlTemplate: (q) => `https://www.neliti.com/id/search?q=${encodeURIComponent(q)}`,
    homeUrl: "https://www.neliti.com/id",
    isFree: true,
    type: "nasional",
  },
  {
    id: "google-scholar",
    name: "Google Scholar (Cendekia)",
    badge: "Global & Indonesia",
    description: "Mesin pencari literatur akademik terlengkap dari berbagai disiplin ilmu, skripsi, tesis, dan jurnal peer-reviewed.",
    urlTemplate: (q) => `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`,
    homeUrl: "https://scholar.google.com/",
    isFree: true,
    type: "internasional",
  },
  {
    id: "doaj",
    name: "DOAJ (Directory of Open Access Journals)",
    badge: "Peer-Reviewed Global",
    description: "Direktori independen jurnal open access bereputasi tinggi dari seluruh dunia tanpa paywall berbayar.",
    urlTemplate: (q) => `https://doaj.org/search/articles?ref=homepage&source=%7B%22query%22%3A%7B%22query_string%22%3A%7B%22query%22%3A%22${encodeURIComponent(q)}%22%7D%7D%7D`,
    homeUrl: "https://doaj.org/",
    isFree: true,
    type: "internasional",
  },
  {
    id: "semantic-scholar",
    name: "Semantic Scholar",
    badge: "AI-Powered",
    description: "Mesin pencari riset berbasis AI oleh Allen Institute yang mengekstraksi kutipan kunci, metodologi, dan grafik sitasi.",
    urlTemplate: (q) => `https://www.semanticscholar.org/search?q=${encodeURIComponent(q)}`,
    homeUrl: "https://www.semanticscholar.org/",
    isFree: true,
    type: "internasional",
  },
  {
    id: "perpusnas",
    name: "Perpusnas RI (e-Resources)",
    badge: "Perpustakaan Nasional",
    description: "Akses jutaan jurnal internasional berbayar (EBSCO, ProQuest, Taylor & Francis) secara gratis dengan no anggota Perpusnas.",
    urlTemplate: (_q) => "https://e-resources.perpusnas.go.id/",
    homeUrl: "https://e-resources.perpusnas.go.id/",
    isFree: true,
    type: "nasional",
  },
  {
    id: "pubmed",
    name: "PubMed (Biomedis & Kesehatan)",
    badge: "Kesehatan / Kedokteran",
    description: "Pangkalan data rujukan medis dan ilmu biologi terlengkap dari National Library of Medicine (NLM).",
    urlTemplate: (q) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`,
    homeUrl: "https://pubmed.ncbi.nlm.nih.gov/",
    isFree: true,
    type: "internasional",
  },
];

export interface DiscussionTemplatePreset {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

export const DISCUSSION_TEMPLATES: DiscussionTemplatePreset[] = [
  {
    id: "lms-tuton-format",
    title: "Format 1: Jawaban Diskusi Forum Tuton / LMS UT",
    category: "Standar Diskusi UT",
    description: "Format jawaban diskusi: Analisis & pembahasan masalah terstruktur, opini kritis & solusi alternatif, serta kaidah penulisan sumber yang benar.",
    content: `Jawaban yang baik harus memuat

1. Analisis & Pembahasan Masalah:
Mengaitkan teori di atas dengan konteks permasalahan yang didiskusikan, ada beberapa hal krusial yang perlu kita cermati:
a.. [Poin Analisis Pertama]: Berdasarkan pengamatan dan telaah ilmiah, faktor ini berpengaruh terhadap... Hal ini dibuktikan dengan [sebutkan contoh atau fakta pendukung].
b. [Poin Analisis Kedua]: Di sisi lain, tantangan yang sering muncul adalah... Pendekatan yang ideal untuk mengantisipasinya yaitu...

2. Opini Kritis & Solusi Alternatif:
Menurut hemat saya, solusi yang relevan dan aplikatif untuk diterapkan di Indonesia adalah [uraikan gagasan orisinal Anda sendiri secara logis dan terukur]

Penulisan sumber yang benar adalah dengan format
Nama pengarang. Tahun Terbit. Nama buku/jurnal. Halaman. Penerbit`,
  },
  {
    id: "tugas-esai-format",
    title: "Format 2: Tugas Esai Analitis (Tugas 1, 2, atau 3)",
    category: "Format Tugas Wajib",
    description: "Sistematika baku pengerjaan tugas kuliah: Judul, Pendahuluan, Tinjauan Teori, Pembahasan Mendalam Berbasis Data/Jurnal, Kesimpulan, dan Daftar Pustaka APA Style.",
    content: `JUDUL TUGAS: [Tuliskan Judul Tugas yang Menarik dan Terarah]
Mata Kuliah: [Nama Mata Kuliah / Kode MK]
Nama Mahasiswa: [Nama Lengkap Anda]
NIM: [Nomor Induk Mahasiswa]
UPBJJ-UT: [Nama UPBJJ Anda]

---

I. PENDAHULUAN
1.1 Latar Belakang:
[Jelaskan konteks permasalahan yang sedang diangkat, mengapa topik ini krusial untuk dikaji, serta fenomena nyata yang terjadi di lapangan atau masyarakat saat ini.]
1.2 Rumusan Masalah:
Berdasarkan latar belakang di atas, pertanyaan utama yang akan dibahas dalam tugas ini adalah:
1. Bagaimana pengaruh/kondisi [Topik Masalah]?
2. Apa strategi atau solusi alternatif yang efektif untuk menyelesaikannya?

II. TINJAUAN TEORI / LANDASAN PUSTAKA
Kajian ini berlandaskan pada teori [Nama Teori/Konsep] yang dikemukakan oleh [Nama Ahli, Tahun]. Teori ini menggarisbawahi bahwa [tuliskan proposisi atau prinsip utama teori tersebut]. Selain itu, konsep ini diperkuat oleh modul BMP UT Modul [Nomor Modul] KB [Nomor Kegiatan Belajar] mengenai [Topik Bahasan].

III. PEMBAHASAN ANALITIS
3.1 Analisis Kondisi & Faktor Penyebab:
[Uraikan pembahasan secara sistematis menggunakan kalimat Anda sendiri. Hubungkan teori dengan data empiris atau hasil penelitian jurnal terkini.]
3.2 Implikasi & Dampak:
[Jelaskan dampak positif/negatif yang timbul jika permasalahan ini ditangani atau dibiarkan.]
3.3 Gagasan Solusi dan Rekomendasi Aksi:
[Kemukakan langkah-langkah praktis dan terukur yang dapat diimplementasikan.]

IV. KESIMPULAN & SARAN
4.1 Kesimpulan:
[Ringkas poin-poin utama jawaban tanpa mengulang kalimat pendahuluan.]
4.2 Saran / Rekomendasi:
[Berikan masukan kepada pihak terkait (pemerintah, lembaga, atau praktisi).]

DAFTAR PUSTAKA:
Bass, B. M., & Riggio, R. E. (2006). Transformational Leadership (2nd ed.). Psychology Press.
Universitas Terbuka. (2022). Buku Materi Pokok [Kode Matakuliah]. Tangerang Selatan: Universitas Terbuka.`,
  },
  {
    id: "studi-kasus-format",
    title: "Format 3: Pemecahan Kasus Nyata (Case Study)",
    category: "Analisis Kasus",
    description: "Format pemecahan problem solving: Identifikasi Akar Masalah, Landasan Teori, Analisis Kasus 360 Derajat, Alternatif Solusi, dan Rekomendasi Terpilih.",
    content: `TANGGAPAN ANALISIS STUDI KASUS

Identitas Mahasiswa:
Nama: [Nama Lengkap] | NIM: [Nomor Induk Mahasiswa]
Kasus / Skenario: [Tuliskan Judul atau Inti Kasus yang Diberikan]

1. Identifikasi Akar Masalah (Root Cause):
Dari skenario yang disajikan, persoalan utama yang dihadapi oleh [Subjek/Organisasi] bukanlah sekadar [masalah permukaan], melainkan akar permasalahan berupa:
- [Faktor Internal: misalnya tata kelola, komunikasi internal, atau kendala manajerial]
- [Faktor Eksternal: misalnya dinamika pasar, regulasi baru, atau disrupsi teknologi]

2. Landasan Konseptual:
Untuk membedah kasus ini, konsep [Sebutkan Teori / Matakuliah] menjadi pisau analisis yang tepat. Menurut [Nama Ahli / Modul UT], penyelesaian masalah jenis ini menuntut pemenuhan prinsip [Sebutkan Prinsip Utama].

3. Analisis Kritis Kasus:
Apabila kita tinjau tindakan yang diambil oleh [Pihak dalam Kasus], terdapat beberapa catatan evaluatif:
- Kelemahan Keputusan: [Jelaskan apa yang keliru atau kurang tepat disertai alasan ilmiah].
- Dampak yang Muncul: [Jelaskan akibat langsung bagi organisasi/pihak terkait].

4. Rekomendasi Solusi & Langkah Tindakan (Action Plan):
Sebagai alternatif pemecahan yang terukur, saya merekomendasikan 3 langkah strategis:
1) Jangka Pendek: [Langkah darurat / perbaikan segera]
2) Jangka Menengah: [Penataan sistem / SOP baru]
3) Jangka Panjang: [Evaluasi berkala dan pembangunan kapabilitas berkelanjutan]

Referensi:
[Cantumkan rujukan buku, modul UT, atau jurnal pendukung]`,
  },
];

export const NOTEBOOK_LM_PROMPTS = [
  {
    title: "Ringkasan Cepat & Poin Kunci",
    prompt: `Tolong buatkan ringkasan eksekutif dari dokumen jurnal ini yang mencakup:
1. Latar belakang & masalah utama yang ingin dijawab.
2. Metodologi yang diterapkan peneliti.
3. 3-5 temuan paling krusial secara berurutan.
4. Kesimpulan akhir dan implikasi praktisnya.
Gunakan bahasa Indonesia yang lugas dan terstruktur dengan poin-poin jelas.`,
  },
  {
    title: "Ekstraksi Sitasi & Teori untuk Tugas",
    prompt: `Identifikasi semua teori utama, definisi istilah penting, dan kutipan kunci dari dokumen ini yang bisa saya kutip untuk menjawab soal tugas kuliah. Sertakan konteks halaman atau bagian dokumen tempat kutipan tersebut ditemukan.`,
  },
  {
    title: "Sintesis Kritis & Keterbatasan Riset",
    prompt: `Lakukan analisis kritis terhadap jurnal ini: apa saja kebaruan (novelty) riset ini, dan apa batasan atau celah (limitations) yang disebutkan oleh penulis yang bisa dijadikan bahan diskusi dalam kelas?`,
  },
  {
    title: "Instruksi Pembuatan Audio Overview (Podcast)",
    prompt: `Berdasarkan jurnal ini, siapkan pemetaan konsep dalam gaya percakapan santai namun berbobot agar saya bisa mendengarkan Audio Overview dua host NotebookLM dengan pemahaman maksimal.`,
  },
];

export const QUILLBOT_HUMANIZING_TIPS = [
  {
    title: "Pahami Cara Kerja Detektor AI QuillBot",
    desc: "QuillBot menganalisis pola keterulangan kata (perplexitas) dan ritme struktur kalimat (burstiness). Teks yang seluruhnya memiliki struktur seragam akan dicurigai sebagai hasil AI.",
  },
  {
    title: "Parafrase Mandiri dengan Kosakata Sendiri",
    desc: "Setelah membaca referensi jurnal atau modul, tuliskan pemahaman Anda dengan bahasa sendiri. Gunakan sinonim yang wajar dan jangan sekadar menukar kata dengan kamus sinonim otomatis.",
  },
  {
    title: "Variasikan Panjang & Ritme Kalimat (Burstiness)",
    desc: "Campurkan kalimat pendek bernas untuk menegaskan poin dengan kalimat majemuk untuk menjelaskan argumentasi sebab-akibat secara mendalam.",
  },
  {
    title: "Sertakan Studi Kasus & Pengalaman Konkret",
    desc: "Detektor AI tidak mengenali detail kontekstual lokal yang spesifik. Masukkan contoh kasus riil di Indonesia, data lapangan, atau refleksi pribadi untuk memperkuat orisinalitas.",
  },
  {
    title: "Sertakan Sitasi Ilmiah Standar APA / BMP UT",
    desc: "Kutipan terstruktur dengan nama penulis dan tahun (misal: 'Menurut Suwarto, 2023...') membuktikan bahwa karya Anda disusun melalui telaah pustaka sungguhan.",
  },
];

export const ZEROGPT_HUMANIZING_TIPS = QUILLBOT_HUMANIZING_TIPS;

export const UT_ASSIGNMENT_COVER_DRIVE_URL =
  "https://drive.google.com/drive/folders/1ZCduTgtwLh-6lSnQwpGLKXxTOF-MY8jL?usp=sharing";

export interface AiDetectorOption {
  id: "quillbot" | "zerogpt" | "gptzero" | "scribbr";
  name: string;
  brandTitle: string;
  tagline: string;
  url: string;
  minChars: number;
  badge: string;
  badgeColor: string;
  borderHoverColor: string;
  accentBg: string;
  accentText: string;
  description: string;
  highlightAdvantage: string;
}

export const AI_DETECTOR_OPTIONS: AiDetectorOption[] = [
  {
    id: "quillbot",
    name: "QuillBot",
    brandTitle: "QuillBot AI Detector",
    tagline: "Detektor persentase AI kalimat & paragraf",
    url: "https://quillbot.com/ai-content-detector",
    minChars: 150,
    badge: "Pilihan Populer",
    badgeColor: "text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30",
    borderHoverColor: "hover:border-[#06B6D4]",
    accentBg: "bg-[#06B6D4]",
    accentText: "text-[#06B6D4]",
    description: "Mendeteksi probabilitas teks hasil AI secara komprehensif dengan persentase per kalimat dan tingkat keterbacaan.",
    highlightAdvantage: "Sangat responsif, mudah dipahami, dan dilengkapi fitur pengujian variasi teks.",
  },
  {
    id: "zerogpt",
    name: "ZeroGPT",
    brandTitle: "ZeroGPT AI Detector",
    tagline: "Deteksi akurat dengan visual highlight",
    url: "https://www.zerogpt.com/",
    minChars: 250,
    badge: "Pembanding Akurat",
    badgeColor: "text-[#E0247A] bg-[#E0247A]/10 border-[#E0247A]/30",
    borderHoverColor: "hover:border-[#E0247A]",
    accentBg: "bg-[#E0247A]",
    accentText: "text-[#E0247A]",
    description: "Mesin pemeriksa AI mendalam yang menyorot kalimat-kalimat spesifik berisiko AI dengan warna kuning dan merah.",
    highlightAdvantage: "Visualisasi highlight kalimat sangat jelas untuk mengetahui bagian mana yang perlu diperbaiki.",
  },
  {
    id: "gptzero",
    name: "GPTZero",
    brandTitle: "GPTZero Academic Detector",
    tagline: "Spesialis Perplexity & Burstiness",
    url: "https://gptzero.me/",
    minChars: 250,
    badge: "Standar Kampus",
    badgeColor: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30",
    borderHoverColor: "hover:border-[#F59E0B]",
    accentBg: "bg-[#F59E0B]",
    accentText: "text-[#F59E0B]",
    description: "Detektor standar akademik perguruan tinggi yang menganalisis variasi kata (perplexity) dan ritme acak kalimat (burstiness).",
    highlightAdvantage: "Banyak diandalkan akademisi internasional dan dosen perguruan tinggi untuk menguji keaslian esai.",
  },
  {
    id: "scribbr",
    name: "Scribbr",
    brandTitle: "Scribbr AI Detector",
    tagline: "Detektor tugas kuliah & esai global",
    url: "https://www.scribbr.com/ai-detector/",
    minChars: 150,
    badge: "Akademik Global",
    badgeColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    borderHoverColor: "hover:border-emerald-500",
    accentBg: "bg-emerald-500",
    accentText: "text-emerald-500",
    description: "Pemeriksa orisinalitas esai dan makalah akademik dengan standar verifikasi internasional berakurasi tinggi.",
    highlightAdvantage: "Bebas batasan dan sangat cocok untuk memvalidasi esai ilmiah mahasiswa standar internasional.",
  },
];
