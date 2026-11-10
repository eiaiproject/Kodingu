# Review Menyeluruh Kodingu

**Tanggal:** 10 November 2026
**Objek:** `Kodingu-main.zip` (situs statis HTML/CSS/JS, https://kodingu.pages.dev/)
**Metode:** Panduan Full Review Proyek GitHub (25 domain), diterapkan ke kode sumber di dalam zip.

---

## 1. Ringkasan eksekutif

Kodingu adalah situs belajar HTML, CSS, dan JavaScript yang statis: 70 pelajaran (32 HTML, 19 CSS, 19 JS), 4 proyek terpandu, 6 tantangan tambahan. Tidak ada backend, akun, atau runtime dependency. Progres disimpan di `localStorage`.

**Kesimpulan:** proyek ini matang dan layak produksi. Tidak ada temuan Critical atau High, dan pencarian secret tidak menemukan apa pun. Risiko terbesarnya adalah utang aksesibilitas, celah di CI, dan kerapian CSS, bukan kerentanan.

**Risiko terbesar:**

1. Batas kontrol (tombol sekunder, input nama sertifikat) hanya berkontras sekitar 1,9:1, di bawah ambang 3:1 yang diklaim `DESIGN.md`.
2. Sekitar 52 deklarasi font di `app.css` berukuran 10,5 sampai 11,5px, padahal audiensnya belajar di ponsel.
3. CI tidak memeriksa dependency, secret, atau SAST. Script `npm run audit` ternyata audit UI, bukan `npm audit`.
4. CSS tidak punya skala: 33 nilai spacing, 40 deklarasi ukuran font, 7 breakpoint.
5. Preflight JavaScript berjalan di Worker satu origin dengan stub jaringan yang bisa dilepas (dampak hanya ke diri sendiri).
6. `icons.js` 139 KB dimuat di setiap halaman, sekitar 30 dari 51 ikon terlihat tidak dipakai.

**Rekomendasi paling mendesak:** perbaiki kontras batas kontrol dan ukuran font kecil (A11Y-001, A11Y-002), lalu tambahkan dependency audit ke CI (CI-001).

---

## 2. Cakupan dan batasan

**Yang saya verifikasi langsung:**

- ESLint (`npx eslint .`): bersih.
- `npm audit`: 4 moderate (semua rantai dev), `npm audit --omit=dev`: 0.
- `node scripts/verify.mjs --only=data`: 98 dari 98 lolos.
- Regenerasi `course-index`, `lesson-data`, `lessons/*.html`, `sitemap`: hasil identik dengan isi zip (tidak ada drift).
- Pencarian secret di seluruh pohon file: kosong.
- Kontras WCAG semua pasangan token di kedua tema (dihitung).
- Statistik CSS: spacing, font, radius, shadow, z-index, breakpoint.
- Isi precache `sw.js` dibandingkan dengan graf import statis.

**Yang tidak bisa saya lakukan:**

- Menjalankan `npm run verify` penuh (E2E) dan `npm run audit` (audit UI). Keduanya butuh Chromium yang tidak tersedia di sandbox saya. Skor Pengujian di bawah berdasarkan membaca harness, bukan menjalankannya.
- Menilai tampilan yang dirender (ritme visual, alignment).
- Menilai riwayat Git, branch protection, pengaturan deploy Cloudflare, dan tag rilis, karena zip tidak berisi `.git`.

**Tidak berlaku untuk proyek ini:** database, API, concurrency, Docker/Kubernetes/IaC, observability backend.

---

## 3. Scorecard

| Dimensi | Skor | Bukti |
|---|---:|---|
| Arsitektur | 8/10 | Tanpa build step, ES modules, konten data-driven, generator terpisah (`core`, `pages`, `editor`, `data`) |
| Kualitas kode | 7/10 | Lint bersih, tetapi ada fungsi 130 sampai 160 baris dan CSS 3.047 baris tanpa skala |
| Keamanan | 8/10 | CSP ketat, iframe sandbox, `postMessage` divalidasi, input URL lewat lookup katalog |
| Pengujian | 8/10 | Harness E2E 1.599 baris yang menjalankan setiap pelajaran dan memeriksa pelanggaran CSP (tidak saya jalankan) |
| CI / operasional | 7/10 | Actions dipin ke SHA, izin read-only, Dependabot, tetapi tanpa dependency/secret scan |
| Dokumentasi | 8/10 | README 22 KB dengan deploy dan rollback, `DESIGN.md`, `AGENTS.md`, `SECURITY.md` |
| Lisensi | 9/10 | MIT, teks OFL tiga font, teks MIT Reicon disertakan |
| Aksesibilitas | 7/10 | Skip link, fokus, reduced motion, target 44px, tetapi batas kontrol berkontras rendah |
| Kinerja | 7/10 | Tanpa dependency, tetapi `icons.js` 139 KB dan cache header seragam |
| Kesiapan produksi | 8/10 | Siap pakai, perbaikan di bawah bersifat penyempurnaan |

---

## 4. Daftar temuan

Tidak ada P0 atau P1. Estimasi effort adalah perkiraan saya.

| ID | Prioritas | Judul | Effort |
|---|---|---|---|
| A11Y-001 | P2 | Batas kontrol berkontras di bawah 3:1 | 1 sampai 2 jam |
| A11Y-002 | P2 | Teks 10,5 sampai 11,5px dipakai di ±52 tempat | 1 jam + cek visual |
| CI-001 | P2 | CI tanpa dependency scan, secret scan, SAST | 1 sampai 2 jam |
| SEC-001 | P3 | Preflight Worker satu origin | 0,5 sampai 1 hari |
| SEC-002 | P3 | Header HSTS dan COOP tidak ada, font tanpa cache panjang | 1 jam |
| PERF-001 | P3 | `icons.js` 139 KB dengan ikon tak terpakai | 1 sampai 2 jam |
| MNT-001 | P3 | Fungsi panjang dan escaping tidak konsisten | 2 sampai 4 hari |
| CSS-001 | P3 | CSS tanpa skala spacing, tipografi, breakpoint | 0,5 sampai 1 hari |
| DOC-001 | P3 | File komunitas dan template belum ada | 2 sampai 3 jam |
| DEP-001 | Info | 4 moderate di rantai dev eslint | 0 |
| SW-001 | Info | Precache dan versi cache service worker manual | 0,5 hari |

### A11Y-001: Batas kontrol berkontras di bawah 3:1

- **Kategori:** Aksesibilitas, WCAG 2.2 SC 1.4.11 (Non-text Contrast)
- **Prioritas:** P2
- **Lokasi:** `assets/css/base.css` (`--line-strong`), `assets/css/app.css` (`.button-secondary`, `.certificate-actions input`, `.sidebar-toggle`)
- **Bukti:** `--line-strong` berkontras 1,87:1 terhadap `--paper` dan 2,01:1 terhadap `--paper-raised` (tema terang), 1,99:1 dan 1,84:1 (tema gelap). `DESIGN.md` menyatakan batas UI minimal 3:1. Pada input nama sertifikat, batas border adalah satu-satunya penanda visual kontrol tersebut.
- **Dampak:** Pengguna dengan penglihatan rendah sulit melihat tepi input dan tombol sekunder.
- **Rekomendasi:** Tambah token `--control-border` (lihat bagian 5.4) dan pakai untuk border kontrol. Biarkan `--line-strong` untuk garis dekoratif.
- **Status:** Open

### A11Y-002: Teks sangat kecil

- **Kategori:** Aksesibilitas dan keterbacaan
- **Prioritas:** P2
- **Lokasi:** `assets/css/app.css`, mis. baris 202, 323, 368, 497, 517, 675, 759, 771, 796
- **Bukti:** Di `app.css`: `0.68rem` ×21, `0.72rem` ×15, `0.7rem` ×14, `0.66rem` ×2 (total 52 deklarasi, 10,5 sampai 11,5px), dipakai di `.demo-kicker`, `.catalog-progress-label`, `.sidebar-num`, `.goal-label`, dan lainnya, sebagian besar memakai font mono.
- **Dampak:** Sulit dibaca di ponsel, sementara `DESIGN.md` menyebut pembelajar mungkin memakai ponsel.
- **Rekomendasi:** Batas bawah `0.75rem` (12px), lalu cek visual label yang mungkin melebar (bagian 5.5).
- **Status:** Open

### CI-001: CI tanpa dependency scan, secret scan, SAST

- **Kategori:** CI/CD dan supply chain
- **Prioritas:** P2
- **Lokasi:** `.github/workflows/verify.yml`, `package.json` (script `audit`)
- **Bukti:** Langkah CI: `npm ci`, `npm run lint`, `playwright install`, `npm run verify`, `npm run audit`. Script `audit` menjalankan `scripts/audit-ui.mjs`, yaitu audit layout/kontras/fokus, bukan `npm audit`. Tidak ada Gitleaks/TruffleHog atau CodeQL.
- **Dampak:** Kerentanan dependency atau secret yang tidak sengaja ter-commit tidak tertangkap otomatis. Nama script yang sama dengan perintah npm juga membingungkan.
- **Rekomendasi:** Tambahkan `npm audit --omit=dev` (hari ini hasilnya 0), rename script `audit` menjadi `audit:ui`, dan aktifkan GitHub secret scanning serta CodeQL bila repo publik. Perbarui README dan `AGENTS.md` yang menyebut `npm run audit`.
- **Status:** Open

### SEC-001: Preflight Worker berjalan satu origin

- **Kategori:** Isolasi eksekusi kode
- **Prioritas:** P3
- **Lokasi:** `assets/js/editor/js-runner.js`, sekitar baris 96 sampai 110
- **Bukti:** Skrip murid dijalankan lebih dulu di `Worker` dari blob URL (origin sama dengan situs). Stub `fetch`, `XMLHttpRequest`, `WebSocket`, dan `importScripts` di `PREFLIGHT_PREAMBLE` bisa dilepas oleh skrip itu sendiri. Eksekusi sebenarnya memang di iframe `sandbox="allow-scripts"`.
- **Dampak:** Rendah. CSP `connect-src 'self'` tetap berlaku dan progres ada di `localStorage`, yang tidak terjangkau Worker. Dampak hanya ke diri sendiri. Klaim di `DESIGN.md` ("halaman utama tidak pernah mengeval kode murid") benar untuk thread utama, tetapi Worker-nya tidak di-sandbox.
- **Rekomendasi:** Jalankan preflight di iframe sandbox juga, atau sesuaikan teks `DESIGN.md` agar menyebut Worker.
- **Status:** Open

### SEC-002: Header keamanan dan cache

- **Kategori:** Header browser
- **Prioritas:** P3
- **Lokasi:** `_headers`
- **Bukti:** CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` sudah ada. Tidak ada `Strict-Transport-Security` dan `Cross-Origin-Opener-Policy`. Saya tidak bisa memastikan apakah Cloudflare menambahkan HSTS untuk domainmu. Semua path (termasuk woff2) memakai `Cache-Control: public, max-age=0, must-revalidate`.
- **Dampak:** Rendah. Font divalidasi ulang di setiap kunjungan.
- **Rekomendasi:**

```text
/*
  Cross-Origin-Opener-Policy: same-origin

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
```

  Tambahkan HSTS bila memakai domain sendiri. Karena nama file font tidak di-hash, ganti nama file bila font berubah.
- **Status:** Open

### PERF-001: Payload ikon

- **Kategori:** Kinerja
- **Prioritas:** P3
- **Lokasi:** `assets/js/core/icons.js` (139 KB), diimpor `assets/js/core/chrome.js`
- **Bukti:** 51 ikon didefinisikan, sekitar 21 terlihat dipakai dari string literal di kode. Saya tidak bisa menutup kemungkinan nama ikon dibuat dinamis, jadi verifikasi dulu.
- **Dampak:** Sekitar 80 KB tak terkompresi dimuat dan di-precache di semua halaman.
- **Rekomendasi:** Batasi daftar ikon di `scripts/fetch-icons.mjs` ke yang dipakai, lalu generate ulang.
- **Status:** Open

### MNT-001: Fungsi panjang dan escaping tidak konsisten

- **Kategori:** Kualitas kode
- **Prioritas:** P3
- **Lokasi:** `pages/lesson.js::renderMain` (160 baris), `editor/workspace.js::mountWorkspace` (156), `pages/challenge.js::renderMain` (130), `pages/project.js::renderMain` (129), `pages/lesson.js::wireLesson` (128), `pages/certificate.js` baris 65 sampai 66
- **Bukti:** Panduan menyebut fungsi di atas sekitar 50 sampai 80 baris perlu ditinjau. Template `innerHTML` memakai `escapeHtml` di sebagian tempat dan tidak di tempat lain (mis. `course.title` di `certificate.js` baris 65 sampai 66 tidak di-escape, tetapi di baris 110 di-escape). Aman hari ini karena datanya statis dan tepercaya.
- **Dampak:** Risiko regresi saat data atau konten mulai berasal dari sumber lain.
- **Rekomendasi:** Buat tagged template `html` yang meng-escape interpolasi secara default dan pecah fungsi panjang.
- **Status:** Open

### CSS-001: CSS tanpa skala

- **Kategori:** Maintainability UI
- **Prioritas:** P3
- **Lokasi:** `assets/css/app.css` (3.047 baris), `base.css`, `static.css`
- **Bukti:** 33 nilai spacing berbeda, 40 deklarasi `font-size` berbeda, 7 breakpoint (600, 720, 860, 900, 980, 1024, 1080px), `--motion-fast: 150ms` dan `--motion-slow: 160ms` hampir sama. Token hanya ada untuk warna, font, motion, dan lebar.
- **Rekomendasi:** Ikuti panduan UI di bagian 5.
- **Status:** Open

### DOC-001: File komunitas

- **Kategori:** Dokumentasi dan governance
- **Prioritas:** P3
- **Bukti:** Tidak ada `CONTRIBUTING.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `.github/CODEOWNERS`, template issue atau PR. README punya bagian Contributing singkat.
- **Rekomendasi:** Tambahkan sesuai kebutuhan. Keberadaan `SECURITY.md` dan `THIRD-PARTY-NOTICES.md` sudah baik.
- **Status:** Open

### DEP-001: Kerentanan di rantai dev (informasional)

- **Bukti:** `npm audit` melaporkan 4 moderate: `eslint` 10 → `@eslint/config-array` → `minimatch` (DoS regex, GHSA-g3hv-75wg-m249). `npm audit --omit=dev` menghasilkan 0 karena situs tidak punya dependency runtime.
- **Rekomendasi:** Tunggu rilis eslint yang menambal. Jangan jalankan `npm audit fix --force`, karena itu menurunkan ke eslint 9.39.5.

### SW-001: Service worker manual (informasional)

- **Lokasi:** `sw.js` (`CACHE = 'kodingu-v14'`, daftar `SHELL`)
- **Bukti:** Daftar `SHELL` saat ini sinkron dengan 25 modul JS yang dapat dijangkau secara statis. 70 modul data pelajaran dimuat on-demand, jadi offline hanya berlaku untuk pelajaran yang sudah pernah dibuka. `AGENTS.md` mewajibkan bump nama cache secara manual.
- **Rekomendasi:** Pertimbangkan membuat daftar dan versi cache otomatis dari skrip generator, dan pertahankan grup `offline` di `verify`.

---

## 5. Panduan membenahi UI

### 5.1 Prinsip: dari sistem ke elemen, bukan sebaliknya

Review UI tidak perlu per elemen. Urutannya:

1. **Sistem:** token spacing, tipografi, radius, warna, motion. Satu perubahan di sini memperbaiki ratusan deklarasi.
2. **Layout halaman:** ritme vertikal antar section, lebar konten, alignment.
3. **Komponen berulang:** tombol, kartu pelajaran, daftar langkah, editor + preview, header. Review satu kali per komponen, lengkap dengan state hover, fokus, disabled, dan error.
4. **Elemen:** hanya yang janggal.
5. **Kondisi:** mobile (320 sampai 390px), tablet, desktop lebar, terang dan gelap.

### 5.2 Kondisi sekarang (hasil audit)

| Aspek | Temuan |
|---|---|
| Spacing | 33 nilai berbeda di `padding`/`margin`/`gap`. Kelompok hampir kembar: 0,3 / 0,35 / 0,4 / 0,45rem, lalu 0,55 / 0,6 / 0,65 / 0,7rem, lalu 0,75 / 0,8 / 0,85 / 0,9rem, lalu 1,05 / 1,1 / 1,2 / 1,25 / 1,35 / 1,4rem |
| Font | 40 deklarasi berbeda, ±52 di `app.css` berukuran 0,66 sampai 0,72rem |
| Radius | 2px ×14, 4px ×3, 0 ×2, 3px ×1 (satu nilai keluar dari pola 2px/4px di `DESIGN.md`) |
| Shadow | 2 (demo dan menu mobile), sesuai `DESIGN.md` |
| z-index | 2 nilai (50 dan 80), rapi |
| Breakpoint | 600, 720, 860, 900, 980, 1024 (+ `pointer: coarse`), 1080px |
| Motion | `--motion-fast: 150ms` dan `--motion-slow: 160ms` (hampir sama, dalam rentang 120 sampai 180ms) |
| Warna di-hardcode | `#ffffff`, `#e4ded2`, `#6b655b` di `.demo-preview`, `.preview-label`, `.editor-preview` (baris 360, 365 sampai 366, 377, 1418, 1422, 1430), serta blok `@media print` |

### 5.3 Langkah 1: tambahkan token di `base.css`

Tambahkan di dalam `:root`, sebelum `--shell`:

```css
  /* Spacing */
  --space-1: 0.25rem;   /* 4px  */
  --space-2: 0.375rem;  /* 6px  */
  --space-3: 0.5rem;    /* 8px  */
  --space-4: 0.75rem;   /* 12px */
  --space-5: 1rem;      /* 16px */
  --space-6: 1.25rem;   /* 20px */
  --space-7: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-9: 2.5rem;    /* 40px */
  --space-10: 3rem;     /* 48px */
  --space-11: 4rem;     /* 64px */
  --space-12: 5rem;     /* 80px */

  /* Type scale */
  --text-xs: 0.75rem;    /* 12px, batas bawah */
  --text-sm: 0.8125rem;  /* 13px */
  --text-md: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;
  --text-3xl: 1.75rem;
  --text-4xl: 2rem;
  --text-5xl: 2.5rem;

  /* Radius */
  --radius-control: 2px;
  --radius-surface: 4px;
```

Satukan juga token motion:

```css
  --motion: 150ms;   /* ganti --motion-fast dan --motion-slow */
```

Di blok `@media (prefers-reduced-motion: reduce)`, ganti dua baris `--motion-fast` dan `--motion-slow` dengan `--motion: 0.01ms;`, lalu cari-ganti `var(--motion-fast)` dan `var(--motion-slow)` menjadi `var(--motion)`.

### 5.4 Langkah 2: perbaiki kontras batas kontrol (A11Y-001)

Nilai di bawah sudah saya hitung: terang 3,59:1 terhadap `--paper` dan 3,85:1 terhadap `--paper-raised`, gelap 3,84:1 dan 3,56:1.

```css
:root {
  --control-border: #857c6d;
}

[data-theme="dark"] {
  --control-border: #7a746d;
}
```

Lalu ganti `var(--line-strong)` menjadi `var(--control-border)` pada border selector berikut di `app.css`:

| Selector | Wajib? |
|---|---|
| `.button-secondary` | Ya |
| `.certificate-actions input` | Ya (batas adalah penanda satu-satunya) |
| `.sidebar-toggle` | Ya |
| `.icon-button:hover`, `.quiz-option:hover`, `.checklist-item:hover`, `.site-nav a:hover` | Opsional (state hover) |

Selector lain yang memakai `--line-strong` (`.demo-panel`, `.method-list`, `.course-rows`, `.code-block`, `.editor`, dst.) adalah pemisah atau wadah dekoratif, jadi boleh tetap. `.editor` membungkus textarea, yang dikenali dari isinya.

### 5.5 Langkah 3: ganti nilai mentah dengan token (skrip)

File `tokenize-css.mjs` (disertakan terpisah) mengganti nilai `rem` di deklarasi `padding`, `margin`, `gap`, dan `font-size` ke token terdekat. Ia melewati deklarasi yang memakai `calc()`/`clamp()`/`var()`, nilai di bawah 0,25rem, nilai negatif, serta satuan `px`/`em`. Selisih yang sama dibulatkan ke nilai yang lebih besar supaya spacing tidak menyempit.

**Cara pakai:**

```bash
git switch -c refactor/css-tokens
cp tokenize-css.mjs scripts/
# 1. tambahkan token dari 5.3 ke base.css lebih dulu
node scripts/tokenize-css.mjs            # dry run, hanya laporan
node scripts/tokenize-css.mjs --write    # terapkan
git diff --stat
```

**Hasil uji pada salinan kodemu** (token ditambahkan lebih dulu):

- 327 deklarasi spacing diganti: 33 nilai berbeda menjadi 12 token.
- 144 deklarasi font-size diganti: 40 menjadi 10 token. Sisa deklarasi khusus: 4 `clamp()` untuk heading, `16px` (2×, kemungkinan sengaja untuk input agar iOS tidak zoom), dan `0.88em`.
- Kurung kurawal seimbang di ketiga file, tidak ada token yang tidak terdefinisi, dan ESLint serta 98 data check tetap lolos.
- Tampilan visual dan E2E belum diuji di sini, jadi lakukan langkah 5.8.

**Pemetaan spacing (jumlah kemunculan di `base`/`app`/`static`):**

| Token | Nilai | Nilai lama yang dipetakan |
|---|---|---|
| `--space-1` | 0,25rem | 0,25 (8), 0,3 (7) |
| `--space-2` | 0,375rem | 0,35 (26), 0,4 (12) |
| `--space-3` | 0,5rem | 0,5 (27), 0,6 (11), 0,55 (6), 0,45 (5) |
| `--space-4` | 0,75rem | 0,75 (35), 0,65 (9), 0,8 (7), 0,7 (7), 0,85 (4) |
| `--space-5` | 1rem | 1 (74), 1,1 (12), 0,9 (9), 1,05 (1) |
| `--space-6` | 1,25rem | 1,25 (11), 1,2 (3), 1,35 (1) |
| `--space-7` | 1,5rem | 1,5 (21), 1,4 (2) |
| `--space-8` | 2rem | 2 (14), 1,75 (4), 2,2 (1) |
| `--space-9` | 2,5rem | 2,5 (4), 2,25 (1) |
| `--space-10` sampai `--space-12` | 3 / 4 / 5rem | 3 (3), 4 (1), 5 (1) |

**Pemetaan font-size:**

| Token | Nilai | Nilai lama yang dipetakan |
|---|---|---|
| `--text-xs` | 0,75rem | 0,66 sampai 0,78 (total 62) |
| `--text-sm` | 0,8125rem | 0,8 (7), 0,82 (6) |
| `--text-md` | 0,875rem | 0,85 sampai 0,93 (total 37) |
| `--text-base` | 1rem | 0,95 (5), 1 (2), 1,05 (1) |
| `--text-lg` | 1,125rem | 1,08 sampai 1,18 (total 6) |
| `--text-xl` sampai `--text-5xl` | 1,25 sampai 2,5rem | 1,2 sampai 2,4 (total 18) |

**Perubahan yang paling terasa di layar:**

- Label 0,66 sampai 0,72rem naik sampai +1,4px. Cek teks yang mungkin melebar atau membungkus: nomor sidebar, label progress, `.demo-kicker`.
- 0,35rem menjadi 0,375rem dan 1,1rem menjadi 1rem (selisih sekitar 1,6px).
- 1,75rem menjadi 2rem (+4px, 4 tempat). Periksa tempat ini lebih dulu.

**14 nilai di bawah 0,25rem yang dibiarkan** (kemungkinan koreksi optik, putuskan satu per satu: pertahankan sebagai angka literal berkomentar atau hapus):

```text
app.css: 328, 509, 1343, 1656, 1821, 1876 (margin-top: 0.15 atau 0.2rem)
         791 (padding: 0.2rem), 1084, 1089, 1477, 2413 (padding-top: 0.1 atau 0.2rem)
         1599, 2121, 2270 (gap: 0.15 atau 0.2rem)
```

**22 deklarasi dilewati** karena memakai `calc()`/`clamp()`/`var()`. Cek manual: bila memakai `rem` mentah di dalamnya, ubah ke token (mis. `calc(var(--space-5) * 2)`).

### 5.6 Langkah 4: radius dan warna preview

- Ganti `border-radius: 2px` dengan `var(--radius-control)` dan `4px` dengan `var(--radius-surface)`. Putuskan nasib `3px` (1 tempat): 2px untuk kontrol atau 4px untuk wadah. `border-radius: 0` ×2 tetap bila disengaja.
- Beri nama pada warna preview yang di-hardcode. Warna ini sengaja tidak mengikuti tema karena iframe preview menampilkan halaman murid di atas putih seperti browser:

```css
:root {
  /* Preview selalu putih: meniru browser, tidak mengikuti tema. */
  --preview-paper: #ffffff;
  --preview-line: #e4ded2;
  --preview-meta: #6b655b;   /* 5,77:1 di atas putih */
}
```

Ganti `#ffffff`, `#e4ded2`, `#6b655b` di `.demo-preview`, `.preview-label`, `.demo-preview iframe`, `.editor-preview`, `.editor-preview .preview-label`, `.editor-preview iframe`. Warna di `@media print` boleh tetap literal, beri satu baris komentar.

### 5.7 Langkah 5: konsolidasi breakpoint

CSS tidak bisa memakai `var()` di dalam `@media`, jadi tulis satu kali di komentar atas `app.css` dan pakai konsisten. Saran tiga titik:

| Nama | Nilai | Menggantikan |
|---|---|---|
| Ponsel | `max-width: 600px` | 600, 720 |
| Tablet | `max-width: 860px` | 860, 900 |
| Desktop sempit | `max-width: 1080px` | 980, 1024, 1080 |

Pertahankan `(max-width: 1024px), (pointer: coarse)` bila memang menargetkan perangkat sentuh. Menggabungkan 720 ke 600 atau 980 ke 1080 mengubah layout di rentang tersebut, jadi uji ulang setiap komponen di rentang 600 sampai 1080px.

### 5.8 Langkah 6: bump cache, verifikasi, dan cek visual

`AGENTS.md` mewajibkan bump nama cache bila shell berubah. Ubah `const CACHE = 'kodingu-v14';` di `sw.js` menjadi `'kodingu-v15'`.

Jalankan di mesinmu (saya tidak bisa menjalankan dua yang terakhir karena butuh Chromium):

```bash
npm run lint
npm run verify
npm run audit      # audit UI: layout, kontras, fokus
```

Lalu cek visual manual pada lebar 360, 390, 768, 1024, dan 1440px, di mode terang dan gelap, untuk: header dan menu mobile, hero dan demo, kartu pelajaran dan katalog, sidebar pelajaran, editor + preview, hasil check (lulus/gagal), halaman progres, sertifikat (termasuk cetak).

### 5.9 Opsional

- **Memecah `app.css`** (3.047 baris) menjadi `layout.css`, `components.css`, `lesson.css`. Tanpa build step, tiap file harus ditambahkan ke `<link>` di semua halaman HTML dan ke `SHELL` di `sw.js`. Alternatif yang lebih ringan: tetap satu file dengan penanda bagian yang jelas.
- **Tailwind** tidak disarankan untuk proyek ini. `AGENTS.md` melarang build step, Tailwind butuh CLI atau Play CDN (yang tidak untuk produksi dan kemungkinan bentrok dengan CSP), markup tersebar di HTML, controller JS, dan halaman hasil generate, dan default-nya (`rounded-md` 6px, palet bawaan) bertentangan dengan `DESIGN.md`. Hasil yang sama bisa dicapai dengan token di atas. Bila kelak tetap ingin Tailwind, token yang sudah rapi mudah dipindah ke `@theme`.

---

## 6. Yang sudah kuat

- **Isolasi kode murid:** preview HTML memakai `sandbox=""`, runner JS memakai `sandbox="allow-scripts"` tanpa `allow-same-origin`.
- **`postMessage`:** runner memeriksa `origin === 'null'`, `event.source`, channel, dan request id, serta mengirim dengan `targetOrigin`. Payload JSON meng-escape `<`.
- **CSP:** `default-src 'self'`, `script-src 'self' blob:`, `object-src 'none'`, `frame-ancestors 'none'`, `connect-src 'self'`. Tidak ada permintaan eksternal di kode runtime.
- **Input:** parameter URL dipetakan lewat lookup katalog. Nama sertifikat lewat `textContent`/`input.value`, bukan `innerHTML`.
- **Impor progres:** divalidasi versi, dimigrasi, dinormalisasi, dan data korup dicadangkan.
- **Arsitektur:** tanpa dependency runtime, file hasil generate sinkron (diuji dengan regenerasi), `.sonarcloud.properties` mengecualikan duplikasi data dengan alasan jelas.
- **CI:** Actions dipin ke commit SHA, `permissions: contents: read`, matriks Node 22 dan 24, Dependabot untuk npm dan Actions.
- **Aksesibilitas:** semua pasangan warna teks lolos AA di kedua tema (terendah 4,56:1), skip link, `:focus-visible`, `prefers-reduced-motion`, target sentuh 44px di 12 tempat.
- **Lisensi:** MIT, teks OFL untuk tiga font, teks MIT Reicon di `THIRD-PARTY-NOTICES.md`.

---

## 7. Rencana remediasi berdasarkan prioritas

| Prioritas | Item | Target (usulan) |
|---|---|---|
| P2 | A11Y-001, A11Y-002, CI-001 | 2 sampai 6 minggu, idealnya dalam satu sprint |
| P3 | SEC-001, SEC-002, PERF-001, MNT-001, CSS-001, DOC-001 | Backlog terjadwal |
| Info | DEP-001, SW-001 | Pantau |

Urutan kerja yang efisien: (1) A11Y-001 dan A11Y-002 sambil mengerjakan CSS-001 dalam satu branch dan satu putaran verifikasi visual, (2) CI-001 dan SEC-002, (3) PERF-001, (4) sisanya.

### Quick wins (kurang dari 1 hari)

1. Tambah `--control-border` dan pakai untuk `.button-secondary`, `.certificate-actions input`, `.sidebar-toggle`.
2. Naikkan ukuran font minimum ke 0,75rem.
3. Tambah `npm audit --omit=dev` di CI dan rename script `audit` menjadi `audit:ui`.
4. Tambah `COOP` dan cache panjang untuk `/assets/fonts/*` di `_headers`.
5. Pangkas `icons.js` ke ikon yang dipakai.

---

## 8. Pertanyaan terbuka

- Apakah branch protection dan review wajib aktif di GitHub?
- Apakah ada rencana domain sendiri (untuk HSTS)?
- Apakah target pelajarnya berbahasa Indonesia? UI dan konten saat ini sepenuhnya berbahasa Inggris (`lang="en"`).
- Apakah nama ikon pernah dibuat dinamis (mempengaruhi PERF-001)?

---

## Lampiran A: hasil tools

| Pemeriksaan | Hasil |
|---|---|
| `npx eslint .` | Lulus, tanpa peringatan |
| `npm audit` | 4 moderate (rantai dev: eslint → `@eslint/config-array` → minimatch) |
| `npm audit --omit=dev` | 0 kerentanan |
| `node scripts/verify.mjs --only=data` | 98 ok, 0 gagal (70 modul data pelajaran cocok dengan sumber) |
| Regenerasi `course-index`, `lesson-data`, `pages`, `sitemap` | `diff -rq` kosong (tidak ada drift) |
| Pencarian secret (AWS, GitHub token, `sk-`, `xox`, private key, `api_key`/`secret`/`password` literal) | Tidak ada temuan |
| HTML (82 file) | `lang`, `title`, meta description, viewport ada di semua. `canonical` hilang hanya di `404.html` dan `offline.html`. Skip link dan `<h1>` untuk halaman aplikasi dirender JS (`chrome.js`) |
| Precache `sw.js` | 25 modul JS statis semuanya ada di `SHELL` |
| Validasi `tokenize-css.mjs` pada salinan | Braces seimbang, 0 token tak terdefinisi, lint dan 98 data check tetap lulus |
| Tidak dijalankan | `npm run verify` (E2E), `npm run audit` (UI) |

## Lampiran B: kontras token (rasio WCAG)

| Pasangan | Terang | Gelap | Syarat |
|---|---:|---:|---:|
| `ink` di atas `paper` | 14,65 | 14,92 | 4,5 |
| `ink-soft` di atas `paper` | 8,17 | 10,03 | 4,5 |
| `ink-meta` di atas `paper` | 5,03 | 6,44 | 4,5 |
| `ink-meta` di atas `paper-raised` | 5,40 | 5,97 | 4,5 |
| `ink-meta` di atas `paper-sunken` | 4,56 | 6,74 | 4,5 |
| `accent` di atas `paper` | 5,17 | 5,03 | 4,5 |
| `accent` di atas `paper-raised` | 5,55 | 4,66 | 4,5 |
| `accent` di atas `paper-sunken` | 4,69 | 5,26 | 4,5 |
| `accent-ink` di atas `accent` | 5,93 | 5,03 | 4,5 |
| `pass` di atas `paper` | 5,48 | 8,92 | 4,5 |
| `warn` di atas `paper` | 5,14 | 7,63 | 4,5 |
| `line-strong` di atas `paper` | **1,87** | **1,99** | 3,0 |
| `line-strong` di atas `paper-raised` | **2,01** | **1,84** | 3,0 |
| `line` di atas `paper` | 1,35 | 1,48 | dekoratif |
| `--control-border` usulan di atas `paper` | 3,59 | 3,84 | 3,0 |
| `--control-border` usulan di atas `paper-raised` | 3,85 | 3,56 | 3,0 |

## Lampiran C: statistik CSS (`app.css`)

- Radius: `2px` ×14, `4px` ×3, `0` ×2, `3px` ×1
- `box-shadow`: 2 (baris 308 dan 2674)
- `z-index`: 2 nilai (50, 80)
- Transisi: seluruhnya memakai `var(--motion-fast)` atau `var(--motion-slow)`
- `min-height: 44px`: 12 tempat
- Fungsi terpanjang: `lesson.js::renderMain` 160 baris, `workspace.js::mountWorkspace` 156, `challenge.js::renderMain` 130, `project.js::renderMain` 129, `lesson.js::wireLesson` 128, `chrome.js::renderHeader` 99

---

## 9. Checklist verifikasi ulang

- [ ] `--control-border` dipakai di kontrol, kontras ≥ 3:1 di dua tema
- [ ] Tidak ada `font-size` di bawah `0.75rem` di `app.css`
- [ ] Skrip tokenisasi dijalankan, 14 nilai mikro dan 22 deklarasi fungsi ditinjau manual
- [ ] Breakpoint tinggal 3 titik, layout diuji di rentang 600 sampai 1080px
- [ ] `CACHE` di `sw.js` di-bump
- [ ] `npm run lint`, `npm run verify`, `npm run audit:ui` lulus
- [ ] Cek visual 360, 390, 768, 1024, 1440px di mode terang dan gelap
- [ ] `verify.yml` memuat `npm audit --omit=dev`, README dan `AGENTS.md` diperbarui untuk nama script baru
- [ ] `_headers` memuat COOP dan cache font
- [ ] `icons.js` hanya berisi ikon yang dipakai
