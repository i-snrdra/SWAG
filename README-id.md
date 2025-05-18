# SWAG - Simple WhatsApp Gateway

[![English](https://img.shields.io/badge/Language-English-blue.svg)](README.md)
[![Indonesian](https://img.shields.io/badge/Language-Indonesian-red.svg)](README-id.md)

Gateway WhatsApp sederhana yang dibangun dengan Node.js, Express, dan library Baileys. Proyek ini menyediakan antarmuka web dan API untuk mengirim pesan WhatsApp, mengelola auto-reply, dan menangani pesan grup.

## Fitur

- 📱 Koneksi WhatsApp Web
- 💬 Kirim Pesan (Tunggal & Massal)
- 👥 Dukungan Pesan Grup
- ⏰ Sistem Auto Reply
- 📊 Riwayat Pesan
- 🎯 Dashboard Admin Modern
- 🔌 RESTful API

## Persyaratan

- Node.js (v20 atau lebih tinggi)
- Database MySQL
- Akun WhatsApp

## Instalasi

1. Clone repository:
```bash
git clone https://github.com/i-snrdra/SWAG.git
cd SWAG
```

2. Install dependensi:
```bash
npm install
```

3. Buat file `.env` di direktori `src` dengan konten berikut:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=whatsapp_gateway
```

4. Buat database dan tabel:
```bash
mysql -u your_db_user -p your_db_name < database.sql
```

## Penggunaan

1. Jalankan server:
```bash
npm start
```

2. Akses dashboard admin:
```
http://localhost:3000
```

3. Scan QR code dengan WhatsApp Anda untuk terhubung

## API Endpoints

### Pesan
- `POST /api/send-message` - Kirim pesan
- `GET /api/messages` - Dapatkan riwayat pesan
- `GET /api/groups` - Dapatkan daftar grup WhatsApp

### Auto Reply
- `GET /api/auto-replies` - Dapatkan semua aturan auto-reply
- `POST /api/auto-replies` - Tambah aturan auto-reply baru
- `DELETE /api/auto-replies/:id` - Hapus aturan auto-reply

### Status
- `GET /api/status` - Periksa status koneksi WhatsApp

## Dependensi

- [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) - API WhatsApp Web
- [express](https://expressjs.com/) - Framework web
- [mysql2](https://github.com/sidorares/node-mysql2) - Klien MySQL
- [dotenv](https://github.com/motdotla/dotenv) - Konfigurasi environment
- [cors](https://github.com/expressjs/cors) - Middleware CORS
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) - Pembuatan QR code

## Daftar To-Do

- [ ] Dukungan Multi Device/Multi Session
  - Dukungan untuk beberapa akun WhatsApp
  - Manajemen sesi untuk setiap perangkat
  - Kemudahan beralih antar akun

- [ ] Dukungan Media yang Ditingkatkan
  - Lampiran file
  - Berbagi gambar
  - Berbagi video
  - Berbagi vCard
  - Berbagi dokumen

- [ ] Manajemen Grup yang Ditingkatkan
  - Membuat grup baru
  - Menambah/menghapus anggota
  - Mengubah pengaturan grup
  - Link undangan grup
  - Statistik grup

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](LICENSE) untuk detailnya. 