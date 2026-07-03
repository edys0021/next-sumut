# Changelog

## 2026-07-01 - Perbaikan responsive input nominal

### UI e-form
- Layout input `Jumlah` pada Tarikan Tunai dan Setoran Tunai dipindah dari inline style ke class CSS khusus.
- Prefix `IDR` diberi kolom tetap agar teks tidak terpotong oleh padding input.
- Input nominal dibuat fleksibel dengan `minmax(0, 1fr)` agar tetap rapi di layar desktop dan mobile.
- Field input memakai `box-sizing: border-box` supaya padding dan border tidak membuat ukuran elemen overflow.

### Verifikasi
- `npm.cmd run lint` berhasil.
- `npm.cmd run build` berhasil.

## 2026-07-01 - Refactor migrasi Next.js

### Perbaikan loading image
- Semua pemanggilan `loading.gif` dipusatkan ke `lib/assets.ts` dengan path absolut `/assets/images/loading.gif`.
- Loader inline di `ConfigProvider`, e-form, validasi, dan voucher diganti menjadi komponen reusable `components/commons/loading-overlay`.
- Path relatif lama seperti `assets/images/loading.gif` dan `./images/loading.gif` dihapus agar browser tidak mencari asset berdasarkan route aktif.

### Refactor asset dan image
- Logo dan ikon pada home/navbar dipindah ke `next/image`.
- `next.config.ts` menambahkan `images.unoptimized = true` agar cocok dengan `output: "export"`.
- Path CSS voucher diperbaiki dari `/public/images/main-background.jpg` menjadi `/assets/images/main-background.jpg`.
- Path asset umum dipusatkan di `lib/assets.ts`.

### Refactor state dan storage transaksi
- Ditambahkan `lib/transaction-storage.ts` untuk mengelola:
  - kategori transaksi di `localStorage`,
  - cookie draft transaksi,
  - judul transaksi,
  - pembersihan session transaksi.
- Halaman e-form, validasi, dan voucher kini memakai helper yang sama sehingga pembacaan kategori/cookie lebih konsisten.
- Pembacaan cookie terenkripsi pada e-form tidak lagi dilakukan berulang-ulang saat render.
- Mapping draft cookie diperbaiki:
  - Tarikan Tunai memakai cookie `withdraw`.
  - Setoran Tunai memakai cookie `deposit`.

### Refactor e-form
- Directive komponen diperbaiki dari `"use-client"` menjadi `"use client"`.
- Validasi input angka/huruf dipindah ke helper kecil agar tidak banyak duplikasi.
- Mutasi langsung ke state seperti `tt["tt-amounttext"] = ...` dan `st["st-amounttext"] = ...` dihapus.
- Request validasi nomor rekening diperbaiki dari dua kali POST menjadi satu kali POST.
- Error handling validasi rekening diringkas, tetapi perilaku error tetap menandai nama rekening tidak valid.
- Form rendering dipisah menjadi helper `InputGroup` dan `WarningMessage` supaya JSX lebih mudah dibaca.

### Refactor validasi dan voucher
- `title` dan `form` tidak lagi di-set sinkron di `useEffect`; datanya diturunkan dari helper storage.
- Halaman voucher menghapus state yang tidak dipakai.
- Loading saat simpan voucher kembali ditampilkan lewat `LoadingOverlay`.
- Field nama setoran pada voucher diperbaiki dari `st-name` ke `st-rekname`.
- Label konfirmasi setoran diperjelas untuk `Nama Penyetor` dan `Sumber Dana`.

### Build dan TypeScript
- `next/font/google` diganti menjadi `next/font/local` memakai font Commissioner lokal agar build tidak membutuhkan koneksi ke Google Fonts.
- `lib/encryptor.ts` dan `lib/decryptor.ts` diganti dari `require` ke `import`.
- Ditambahkan deklarasi lokal `types/crypto-js.d.ts` karena package `crypto-js` tidak menyediakan type declaration di project ini.

### Verifikasi
- `npm.cmd run lint` berhasil.
- `npm.cmd run build` berhasil.
