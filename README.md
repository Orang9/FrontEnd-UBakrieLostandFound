# UBakrie Lost & Found — Frontend

Aplikasi frontend web untuk layanan barang hilang dan ditemukan di lingkungan Universitas Bakrie. Proyek ini menggunakan React SPA dan disusun per fitur supaya pengembangan setiap epic dapat dilakukan secara terpisah.

> **Status:** terintegrasi dengan REST API `BackEnd-TrustFound`. Login/registrasi mahasiswa dan login Admin/Satpam, katalog, pelaporan temuan, klaim, riwayat klaim, penjadwalan, QR E-Ticket, scanner serah-terima, penerimaan barang, review klaim, dashboard, laporan PDF, dan audit trail menggunakan endpoint backend.

## Fitur

Struktur navigasi dan folder fitur mencakup kebutuhan berikut:

- **Autentikasi** — registrasi dan login mahasiswa menggunakan NIM, login Admin/Satpam menggunakan NIP, penyimpanan session JWT, serta proteksi rute berdasarkan role.
- **Beranda** — titik masuk pengguna dan navigasi ke katalog atau pelaporan.
- **Katalog** — pencarian/filter item API, detail barang, status, kategori, dan gambar.
- **Pelaporan barang** — laporan barang temuan dengan kategori dari backend, validasi field, dan upload foto multipart hingga 5 MB.
- **Klaim** — pengajuan klaim dengan jawaban `challange_answer`, tampilan status dari API, dan review Admin/Satpam.
- **Penjadwalan** — daftar slot serta kuota berdasarkan tanggal aktual, lalu menyimpan jadwal ke backend.
- **E-Ticket dan scanner** — QR token backend dengan TTL 24 jam dan validasi serah-terima atomik melalui kamera atau token manual.
- **Penerimaan barang** — Admin/Satpam dapat mencatat item langsung ke lemari penyimpanan.
- **Dashboard admin** — metrik realtime, pengamanan barang yang menunggu, unduhan laporan bulanan PDF, dan antrean aktivitas.
- **Slot Admin** — menampilkan konfigurasi slot yang aktif; perubahan slot belum tersedia karena backend belum memiliki endpoint pengelolaan.
- **Audit trail** — riwayat aktivitas dari API backend.
- **Profil dan riwayat** — menampilkan klaim pengguna dari API. Riwayat laporan pribadi belum tersedia karena backend belum menyediakan endpoint terkait.

Fitur yang berkomunikasi dengan backend memisahkan pemanggilan HTTP ke modul `api/` pada folder fiturnya. Atur `VITE_API_BASE_URL` ke base path `/api` backend, misalnya `http://localhost:5000/api`. Jika variabel tidak diatur, development secara default mengarah ke `http://localhost:5000/api`. Endpoint pelaporan barang hilang dan riwayat laporan pribadi belum tersedia di kontrak backend; karena itu UI hanya mengirim laporan barang temuan.

## Tech stack

- **React 18**, **JavaScript/JSX**, dan **Vite** untuk aplikasi SPA dan proses development/build.
- **Tailwind CSS v4** untuk styling dan design token.
- **React Router** untuk navigasi dan proteksi rute.
- **Axios** untuk komunikasi REST/JSON.
- **React Hook Form** untuk pengelolaan form.
- **qrcode.react** dan **html5-qrcode** untuk QR ticket dan scanner.
- **Recharts**, **lucide-react**, dan **date-fns** (locale `id`) sebagai pustaka UI pendukung.
- **Vitest**, **Testing Library**, dan **Playwright** untuk pengujian.
- **ESLint** dan **Prettier** untuk kualitas dan konsistensi kode.

Daftar dependensi lengkap tersedia di [package.json](./package.json).

## Struktur folder

```text
public/                    Aset statis seperti favicon dan logo
src/
├── app/                   Entry point, App, provider, router, route guard, dan daftar path
│   ├── providers/         AuthProvider dan ToastProvider
│   └── router/            paths, routes, ProtectedRoute, dan RoleRoute
├── layouts/               Kerangka halaman autentikasi, pengguna, dan admin
├── features/              Fitur aplikasi, masing-masing dikelompokkan per domain/epic
│   ├── auth/              Login dan autentikasi
│   ├── home/              Beranda
│   ├── profile/           Profil dan riwayat
│   ├── catalog/           Katalog dan detail barang
│   ├── report-item/       Pelaporan barang
│   ├── claim/             Pengajuan dan peninjauan klaim
│   ├── scheduling/        Jadwal dan pengelolaan slot
│   ├── eticket/           E-Ticket dan QR
│   ├── scanner/           Pemindaian QR untuk admin
│   ├── intake/            Penerimaan barang
│   ├── dashboard/         Dashboard admin
│   └── audit/             Audit trail
├── components/
│   ├── ui/                Komponen generik, misalnya Button, Input, Tabs, Dialog, Toast
│   └── domain/            Komponen domain, misalnya ItemCard, StatusBadge, KpiCard
├── hooks/                 Custom React hooks yang digunakan lintas fitur
├── lib/                   Utilitas bersama: apiClient, format tanggal/angka, dan env
├── config/                Informasi konfigurasi aplikasi
├── constants/             Status, pesan sistem, dan batasan validasi
├── styles/                CSS global dan design token Tailwind
└── types/                 Referensi typedef JSDoc lintas fitur
tests/
├── unit/                  Unit dan component test (Vitest/Testing Library)
└── e2e/                   End-to-end test (Playwright)
```

Pola umum folder fitur adalah `pages/`, `components/`, `api/`, `hooks/`, `schemas/`, `types.js`, dan `index.js` sesuai kebutuhan fitur. Ikuti aturan dependensi pada spesifikasi: fitur lain diakses melalui `index.js`, komponen generik tidak mengimpor fitur, komponen tidak memanggil Axios langsung, dan path rute menggunakan `src/app/router/paths.js`.

## Prasyarat

- **Node.js 20 atau lebih baru** dan npm.
- Git untuk mengambil repository.
- Backend REST API bila ingin menguji integrasi data.

## Clone dan instalasi pertama

Buka PowerShell, lalu jalankan:

```powershell
git clone https://github.com/Orang9/FrontEnd-UBakrieLostandFound.git
Set-Location FrontEnd-UBakrieLostandFound
npm install
```

Ganti `<URL_REPOSITORY>` dengan URL repository GitHub dan `<NAMA_FOLDER_REPOSITORY>` dengan nama folder hasil clone. Buat file `.env` lokal di root proyek; file ini tidak disimpan ke Git.

Setelah `.env` dibuat, atur variabel berikut sesuai lingkungan backend:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=UBakrie Lost & Found
```

`VITE_API_BASE_URL` harus diarahkan ke base URL API yang benar. Jangan menyimpan secret, password, atau private key di variabel frontend `VITE_*`, karena nilainya dapat tersedia di browser.

## Menjalankan frontend dan backend dengan Docker Compose

Dari root repository, pastikan Docker aktif dan file `BackEnd-TrustFound/.env` telah diisi dengan konfigurasi backend lokal, lalu jalankan:

```powershell
docker compose up --build
```

Buka `http://localhost:8080` untuk frontend. Compose membangun aplikasi frontend ini dengan API URL `http://localhost:5001/api` (port backend yang dipublikasikan di host). Jika backend dijalankan di luar Compose, gunakan `http://localhost:5000/api` untuk development lokal.

## Menjalankan secara lokal

Dari folder repository:

```powershell
npm run dev
```

Buka URL yang ditampilkan Vite di terminal (biasanya `http://localhost:5173`). Biarkan terminal tetap berjalan selama development; tekan `Ctrl+C` untuk menghentikan server.

## Perintah pengembangan dan validasi

```powershell
npm run build        # buat production build di dist/
npm run preview      # sajikan production build secara lokal
npm run lint         # jalankan ESLint
npm run format:check # periksa format Prettier
npm run format       # format source dan konfigurasi
npm test             # jalankan unit test sekali
npm run test:watch   # jalankan Vitest dalam mode watch
npm run test:e2e     # jalankan end-to-end test Playwright
```

Jika Playwright belum memiliki browser Chromium di komputer, pasang satu kali:

```powershell
npx playwright install chromium
```

## Catatan kamera scanner

Browser hanya mengizinkan akses kamera pada `localhost` atau origin HTTPS. Karena itu scanner dapat diuji lokal melalui server development, tetapi staging dan produksi wajib menggunakan HTTPS. Pengujian kamera juga perlu dilakukan pada perangkat Android dan iOS nyata.
