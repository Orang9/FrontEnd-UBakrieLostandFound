# UBakrie Lost & Found — Frontend

Aplikasi frontend web untuk layanan barang hilang dan ditemukan di lingkungan Universitas Bakrie. Proyek ini menggunakan React SPA dan disusun per fitur supaya pengembangan setiap epic dapat dilakukan secara terpisah.

> **Status:** prototipe frontend. Beranda, pencarian katalog, pelaporan, klaim, profil, penjadwalan, E-Ticket, scanner, dashboard admin, review klaim, kelola barang, kelola slot admin, audit trail, dan intake satpam memiliki UI/interaksi dengan data lokal atau contoh. Halaman login menggunakan kontrak endpoint backend `/auth/login`; autentikasi berhasil hanya jika backend tersedia dan mengembalikan session yang valid.

## Fitur

Struktur navigasi dan folder fitur mencakup kebutuhan berikut:

- **Autentikasi** — halaman masuk dengan NIM dan kata sandi, session pengguna, proteksi rute mahasiswa, serta proteksi role `ADMIN_BEM` untuk seluruh halaman admin.
- **Beranda** — titik masuk pengguna dan navigasi ke katalog atau pelaporan.
- **Katalog** — pencarian dan filter daftar barang contoh.
- **Pelaporan barang** — form responsif untuk laporan kehilangan/temuan, kategori umum/sensitif, validasi field, dan upload foto JPG/PNG maksimal 5 MB dengan preview blur untuk item sensitif.
- **Klaim** — form verifikasi kepemilikan, validasi dua jawaban/bukti opsional, pencegahan klaim aktif ganda, dan status preview `PENDING` pada profil. Review klaim admin memiliki UI preview dengan data contoh; keputusan belum disimpan ke backend.
- **Penjadwalan** — pengguna dengan klaim `APPROVED` dapat memilih tanggal dan slot, lalu mengubah klaim menjadi `SCHEDULED`.
- **E-Ticket** — kartu klaim terjadwal di profil membuka QR preview dengan timer 30 menit dan aksi perbarui.
- **Scanner admin** — pemindaian kamera atau input token manual, validasi tiket preview, dan hasil valid/kedaluwarsa/digunakan/duplikat. Halaman ini prototipe lokal, bukan validasi tiket produksi.
- **Kelola barang admin** — filter status, detail laporan, terima/catat, form alasan dan catatan penolakan, serta tinjau ulang laporan. Data dan perubahan hanya preview lokal; katalog, Audit Trail, serta email belum terhubung.
- **Penerimaan barang / Intake Satpam** — form intake harian, validasi foto JPG/PNG maksimal 5 MB, checklist batch mingguan, dan preview pemindahan ke Lemari Kaca. Perubahan intake masih bersifat lokal dan belum memperbarui katalog/backend.
- **Dashboard admin** — ringkasan KPI, grafik laporan/klaim, distribusi status, dan tabel batch mingguan dengan data contoh.
- **Kelola slot admin** — daftar slot dan form tambah slot dalam preview lokal; perubahan belum tersimpan ke backend.
- **Audit trail** — tabel aktivitas dan filter aktor/peristiwa/periode dengan data contoh.
- **Profil dan riwayat** — tab riwayat klaim/laporan, kartu klaim dengan timeline status, dan badge status.

Fitur yang berkomunikasi dengan backend memisahkan pemanggilan HTTP ke modul `api/` pada folder fiturnya. Kontrak endpoint yang tersedia saat ini adalah titik awal dan harus disesuaikan dengan API backend sebenarnya.

Beranda dan katalog dapat dibuka tanpa login. Pengajuan klaim, pelaporan, profil/riwayat, penjadwalan, dan E-Ticket memerlukan session pengguna. Akses ke semua halaman `/admin/*` memerlukan session dengan role `ADMIN_BEM`; pengguna tanpa session diarahkan ke `/login`, sedangkan role lain diarahkan ke beranda.

Form login mengirim `{ "nim": "...", "password": "..." }` ke `POST /auth/login`. Backend diharapkan mengembalikan `{ "user": { "id": "...", "nim": "...", "name": "...", "role": "MAHASISWA|ADMIN_BEM" }, "token": "..." }`. Token session disimpan di `localStorage` dan dikirim sebagai bearer token untuk permintaan API. Backend tetap harus memvalidasi kredensial serta role; route guard frontend bukan pengganti otorisasi backend.

Pengiriman klaim disimpan hanya di `localStorage` browser sebagai data preview `PENDING`, bukan dikirim ke backend. Riwayat profil menyertakan klaim contoh berstatus `APPROVED` untuk mencoba alur jadwal; kartu klaim `SCHEDULED` dapat dibuka untuk menampilkan QR preview yang berlaku 30 menit dan dapat diperbarui. Slot, ketersediaan, perubahan status `SCHEDULED`, intake, dan QR tiket hanya preview lokal; kuota real-time, persetujuan admin, token terenkripsi, validasi sekali pakai oleh scanner, serta tiket pengambilan sebenarnya belum terhubung ke backend. Pengiriman laporan masih menampilkan pemberitahuan bahwa integrasi backend belum tersedia. Data riwayat profil dan katalog awal merupakan data contoh.

Mahasiswa yang sudah login dapat keluar melalui tombol **Keluar** di topbar desktop atau navigasi bawah mobile. Session dihapus dari browser dan pengguna dikembalikan ke beranda.

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
git clone <URL_REPOSITORY>
Set-Location <NAMA_FOLDER_REPOSITORY>
npm install
```

Ganti `<URL_REPOSITORY>` dengan URL repository GitHub dan `<NAMA_FOLDER_REPOSITORY>` dengan nama folder hasil clone. Buat file `.env` lokal di root proyek; file ini tidak disimpan ke Git.

Setelah `.env` dibuat, atur variabel berikut sesuai lingkungan backend:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=UBakrie Lost & Found
```

`VITE_API_BASE_URL` harus diarahkan ke base URL API yang benar. Jangan menyimpan secret, password, atau private key di variabel frontend `VITE_*`, karena nilainya dapat tersedia di browser.

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
