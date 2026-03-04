# 📘 Frontend Runtime Maintenance & Troubleshooting Guide

Dokumentasi ini dibuat untuk membantu teknisi atau user melakukan **maintenance**, **troubleshooting**, dan **operasional** pada sistem **Frontend Runtime (React Router + SSR)** yang sudah dibundle dan berjalan tanpa internet.

---

# 📦 1. Struktur Folder Runtime
Setelah proses bundling dan extract ZIP, struktur folder akan seperti berikut:

```
frontend-runtime/
├── build/               # Hasil build FE (static files)
├── node_modules/        # Dependency untuk runtime (include cross-env)
├── server.js            # Entry point SSR FE
├── package.json         # Configuration & script
├── package-lock.json
└── .env                 # (Opsional) Environment variable
```

Semua file ini **wajib ada** agar Frontend berjalan normal.

---

# ▶️ 2. Menjalankan Frontend
Frontend dijalankan menggunakan **PM2** agar stabil dan auto-restart jika ada error.

### ✔ Menjalankan FE:
```
pm2 start server.js --name frontend
```

### ✔ Mengecek apakah FE berjalan:
```
pm2 status
```

### ✔ Melihat log realtime:
```
pm2 logs frontend
```

### ✔ Restart FE setelah perubahan:
```
pm2 restart frontend
```

### ✔ Stop FE:
```
pm2 stop frontend
```

### ✔ Auto‑start saat server reboot:
```
pm2 save
pm2 startup
```

---

# ⚙️ 3. Konfigurasi Environment (.env)
Jika Frontend membutuhkan environment variable, file `.env` harus diletakkan di folder runtime.

Contoh:
```
API_URL=http://192.168.1.10:3000
NODE_ENV=production
```

Setelah mengubah `.env`, lakukan restart FE:
```
pm2 restart frontend
```

---

# 🔄 4. Update / Deploy Versi Baru
Ketika ada update Frontend baru:

1. Jalankan script bundler di development PC:
   ```
   npm run bundle:fe
   ```

2. Akan menghasilkan file:
   ```
   frontend-runtime.zip
   ```

3. Copy ZIP ke server lokal (flashdisk / LAN transfer)

4. Extract ZIP:
   ```
   unzip frontend-runtime.zip
   ```

5. Stop versi lama:
   ```
   pm2 stop frontend
   ```

6. Replace folder lama dengan yang baru

7. Jalankan versi baru:
   ```
   pm2 start server.js --name frontend
   ```

---

# 🛠 5. Troubleshooting

## ❌ 1. **Browser tidak menampilkan halaman (Blank Page)**
**Kemungkinan masalah:**
- `server.js` tidak berjalan
- Port bentrok
- Path build tidak ditemukan

**Solusi:**
```
pm2 logs frontend
```
Cari error seperti:
- `Cannot find module`
- `EADDRINUSE`
- `ENOENT: no such file or directory`

---

## ❌ 2. **Error: 'cross-env' is not recognized**
**Penyebab:** cross-env tidak ada di dependencies.

**Solusi:**
- Pastikan bundler terbaru dipakai
- Pastikan `cross-env` ada di **dependencies**, bukan devDependencies

---

## ❌ 3. **Port sudah digunakan (EADDRINUSE)**
**Solusi:**
1. Cari proses yang memakai port:
   ```
pm2 list
   ```

2. Stop aplikasi yang bentrok
   ```
pm2 stop <nama>
   ```

3. Jalankan FE kembali:
   ```
pm2 start server.js --name frontend
   ```

---

## ❌ 4. **Setelah update, FE tetap menampilkan versi lama**
**Solusi:**
1. Clear cache browser (CTRL + F5)
2. Pastikan folder runtime benar-benar ter-replace
3. Restart PM2:
   ```
pm2 restart frontend
   ```

---

# 🧹 6. Maintenance Rutin
Disarankan melakukan ini secara berkala:

### ✔ Bersihkan log PM2
```
pm2 flush
```

### ✔ Restart server secara berkala
```
pm2 restart frontend
```

### ✔ Backup folder runtime
Copy folder `frontend-runtime/` ke drive lain.

---

# 📞 7. Kontak Support (Opsional)
Tambahkan sesuai kebutuhan perusahaan Anda.

Contoh:
```
Divisi Pengembang Sistem
Email: support@example.com
Telp: 021-XXXX-XXXX
```

---

# ✅ Penutup
Dokumen ini dibuat agar teknisi dan user dapat dengan mudah melakukan:
- Menjalankan FE
- Monitoring
- Update
- Troubleshooting
- Maintenance rutin

Jika butuh versi **PDF**, **RTF**, atau **print‑friendly**, tinggal bilang, nanti saya generate otomatis.

