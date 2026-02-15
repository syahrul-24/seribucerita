# 💙 SeribuCerita — Teman Cerita AI untuk Kesehatan Mental

<p align="center">
  <img src="public/images/hero_illustration.png" alt="SeribuCerita Hero" width="400"/>
</p>

<p align="center">
  <strong>Ceritakan Harimu, Kami Mendengarkan.</strong><br/>
  Chatbot AI empatik yang siap mendengarkan ceritamu — kapan saja, di mana saja.
</p>

---

## 🎯 Masalah yang Kami Selesaikan

Indonesia menghadapi krisis kesehatan mental yang serius:

- **1 dari 5 orang Indonesia** mengalami gangguan kesehatan mental *(Riskesdas 2018)*
- Hanya tersedia **1 psikolog per 400.000 penduduk** — jauh dari standar WHO
- **Stigma sosial** masih menjadi penghalang utama untuk mencari bantuan profesional
- Banyak orang **tidak tahu harus berbagi cerita ke siapa** saat merasa cemas, sedih, atau tertekan

**SeribuCerita** hadir sebagai **solusi awal** — ruang aman digital tempat siapa saja bisa bercerita tanpa takut dihakimi.

---

## 👥 Target Pengguna

| Segmen | Deskripsi |
|--------|-----------|
| 🎓 **Mahasiswa & Pelajar** | Menghadapi tekanan akademik, kecemasan sosial, dan quarter-life crisis |
| 💼 **Pekerja Muda (20-35 tahun)** | Mengalami burnout, stres kerja, dan kesulitan work-life balance |
| 🏠 **Siapa saja yang butuh teman cerita** | Merasa kesepian, butuh didengarkan, atau ingin berbagi perasaan tanpa menghakimi |
| 📚 **Pencari informasi kesehatan mental** | Ingin belajar tentang depresi, stres, dan cara merawat diri sendiri |

---

## 💡 Bagaimana SeribuCerita Membantu Pengguna?

### 1. 🤖 AI Chatbot Empatik — Teman Cerita 24/7
SeribuCerita menggunakan **Google Gemini AI** dengan persona **psikolog profesional** yang:
- **Mendengarkan tanpa menghakimi** — pengguna bebas cerita apa saja
- Memberikan **respon empatik dan menenangkan** dengan bahasa yang suportif
- Tersedia **24 jam sehari, 7 hari seminggu** — tidak perlu buat janji atau antri
- **Gratis** dan bisa diakses dari mana saja

### 2. 📖 Edukasi Kesehatan Mental
Konten edukatif yang mudah dipahami untuk meningkatkan *mental health literacy*:
- **Apa Itu Depresi?** — Kenali tanda-tanda dan langkah awal mencari bantuan
- **Mengelola Stres Sehari-hari** — Teknik praktis untuk mengurangi stres
- **Panduan Self-Care** — Langkah merawat kesehatan mental dan fisik

### 3. 🔒 Privasi & Keamanan
- Percakapan **tidak disimpan** di server
- Tidak memerlukan **login atau registrasi**
- Pengguna bisa bercerita dengan **anonim dan aman**

---

## ✨ Fitur Website

| Fitur | Deskripsi |
|-------|-----------|
| 🏠 **Landing Page** | Halaman utama dengan desain *Soft UI* yang menenangkan |
| 🧭 **Navigasi Responsif** | Navbar yang rapi di desktop dan mobile (hamburger menu) |
| 🎨 **Hero Section** | Headline yang mengundang dan CTA menuju chatbot |
| 📚 **Seksi Edukasi** | 3 kartu artikel kesehatan mental dengan ilustrasi |
| 💬 **Chatbot Interaktif** | Chat real-time dengan AI, typing indicator, dan bubble chat modern |
| ℹ️ **Tentang Kami** | Penjelasan visi dan keunggulan SeribuCerita |
| 📱 **Fully Responsive** | Optimal di desktop, tablet, dan smartphone |

---

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| **Node.js + Express** | Backend server & API |
| **Google Gemini AI** (`gemini-2.5-flash`) | AI engine untuk chatbot |
| **Tailwind CSS** | Styling frontend |
| **Vanilla JavaScript** | Interaktivitas chatbot & UI |
| **HTML5** | Struktur halaman |

---

## 📁 Struktur Project

```
gemini-chatbot-api/
├── public/
│   ├── images/
│   │   ├── hero_illustration.png
│   │   ├── edu_depression.png
│   │   ├── edu_stress.png
│   │   └── edu_selfcare.png
│   ├── index.html          # Halaman utama (Landing + Chatbot)
│   └── script.js           # Logic chatbot & mobile menu
├── index.js                 # Express server + Gemini API
├── package.json
├── .env                     # API Key (tidak di-push ke GitHub)
├── .gitignore
└── README.md
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [Google Gemini API Key](https://aistudio.google.com/apikey)

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/syahrul-24/seribucerita.git
cd seribucerita

# 2. Install dependencies
npm install

# 3. Buat file .env
echo "GEMINI_API_KEY=your_api_key_here" > .env

# 4. Jalankan server
npm start
```

Buka **http://localhost:3000** di browser Anda.

---


## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat **Pull Request** atau buka **Issue** jika ada saran atau bug.

---

## 📄 Lisensi

Project ini dilisensikan di bawah [ISC License](https://opensource.org/licenses/ISC).

---

<p align="center">
  Dibuat dengan 💙 oleh <strong>SeribuCerita Team</strong>
</p>
