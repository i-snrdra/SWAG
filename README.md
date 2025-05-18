# SWAG - Simple WhatsApp Gateway

Sistem WhatsApp Gateway internal untuk mengirim pesan, mencatat history, dan auto-reply menggunakan Node.js dan Baileys.

## Fitur

- Mengirim pesan ke banyak nomor sekaligus (blasting)
- Mencatat history pesan yang dikirim
- Fitur auto-reply berdasarkan keyword
- API endpoint untuk integrasi eksternal
- Tampilan admin menggunakan template Mazer Admin

## Persyaratan

- Node.js v14 atau lebih tinggi
- MySQL v5.7 atau lebih tinggi
- WhatsApp Web yang sudah terdaftar

## Instalasi

1. Clone repository ini
2. Install dependensi:
   ```bash
   npm install
   ```
3. Buat database MySQL menggunakan file `database.sql`
4. Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi
5. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

## Penggunaan

1. Setelah menjalankan aplikasi, scan QR code yang muncul di terminal menggunakan WhatsApp Web
2. Setelah terhubung, Anda dapat menggunakan API endpoints berikut:

### API Endpoints

- `POST /api/send-message`
  - Body: `{ "receiver": "628xxxxxxxxxx", "message": "Hello" }`
  - Untuk mengirim pesan ke nomor tertentu

- `GET /api/messages`
  - Untuk melihat history pesan yang telah dikirim

- `POST /api/auto-reply`
  - Body: `{ "keyword": "hello", "response": "Hi there!" }`
  - Untuk menambahkan aturan auto-reply

- `GET /api/status`
  - Untuk melihat status koneksi WhatsApp

## Lisensi

MIT 