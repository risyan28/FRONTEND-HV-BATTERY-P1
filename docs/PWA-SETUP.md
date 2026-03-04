# 🚀 PWA Setup Guide

## Status: ✅ PWA Aktif

PWA (Progressive Web App) sudah dikonfigurasi dan berjalan. Aplikasi bisa di-install di mobile dan desktop.

## 📋 Quick Test

1. **Jalankan dev server:**

   ```bash
   npm run dev
   ```

2. **Buka Chrome DevTools** (F12) → Tab **Application**

3. **Cek:**
   - ✅ **Manifest** - harus terdeteksi
   - ✅ **Service Workers** - harus terdaftar dan running
   - ✅ **Install** - harusnya ada tombol install di address bar

## 🎨 Generate Proper PWA Icons (Optional)

Untuk production-ready PWA dengan icon sempurna:

### Opsi 1: Pakai HTML Generator (Termudah)

1. **Buka file:** `generate-pwa-icons.html` di browser
2. **Upload** logo TMMIN (`public/images/tmmin.png`)
3. **Download** 4 icon yang di-generate:
   - `icon-192.png`
   - `icon-512.png`
   - `icon-192-maskable.png`
   - `icon-512-maskable.png`
4. **Simpan** semua ke folder `public/images/`
5. **Update manifest.json** dengan config ini:

```json
{
  "icons": [
    {
      "src": "/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/images/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### Opsi 2: Pakai Online Tool

1. Buka https://www.pwabuilder.com/imageGenerator
2. Upload logo TMMIN
3. Download icon pack
4. Extract ke `public/images/`
5. Update `manifest.json`

### Opsi 3: Manual dengan Photoshop/GIMP

**Icon Regular (any):**

- Size: 192x192 dan 512x512
- Background: #1e3a8a (theme color)
- Logo: centered dengan padding 10%

**Icon Maskable:**

- Size: 192x192 dan 512x512
- Background: #1e3a8a
- Logo: centered dengan padding 20% (safe area)

## 📸 Generate Screenshots (Optional)

Untuk "Richer Install UI" yang lebih menarik:

### Desktop Screenshot (wide):

- Size: 1920x1080
- Format: PNG
- Filename: `screenshot-desktop.png`
- Isi: Screenshot dashboard desktop view

### Mobile Screenshot:

- Size: 390x844 (iPhone size)
- Format: PNG
- Filename: `screenshot-mobile.png`
- Isi: Screenshot dashboard mobile view

**Cara ambil screenshot:**

1. Buka app di browser
2. Buka DevTools → Toggle device toolbar (Ctrl+Shift+M)
3. Set responsive width:
   - Desktop: 1920x1080
   - Mobile: 390x844
4. Screenshot → Save ke `public/images/`

5. Update `manifest.json`:

```json
{
  "screenshots": [
    {
      "src": "/images/screenshot-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "label": "Dashboard Mobile View"
    },
    {
      "src": "/images/screenshot-desktop.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard Desktop View"
    }
  ]
}
```

## 🧪 Test PWA

### Test Install:

1. Chrome Desktop: klik icon **+** di address bar
2. Chrome Android: Menu → **Add to Home Screen**
3. iOS Safari: Share → **Add to Home Screen**

### Test Offline:

1. Buka app yang sudah di-install
2. DevTools → Network → **Offline**
3. Refresh page → app tetap load (dari cache)

### Test Update:

1. Ubah code/build baru
2. Refresh app
3. Service worker otomatis update
4. Log di console: "🔄 PWA: New version available, updating..."

## 📱 Browser Support

| Browser | Desktop | Mobile | Install     |
| ------- | ------- | ------ | ----------- |
| Chrome  | ✅      | ✅     | ✅          |
| Edge    | ✅      | ✅     | ✅          |
| Firefox | ✅      | ✅     | ⚠️ Limited  |
| Safari  | ✅      | ✅     | ⚠️ iOS only |

## 🔧 Configuration Files

- **PWA Config:** `vite.config.ts` → VitePWA plugin
- **Manifest:** `public/manifest.json`
- **Service Worker Registration:** `app/root.tsx`
- **TypeScript Types:** `vite-env.d.ts`

## 📚 Fitur PWA yang Aktif

✅ **Install prompt** - User bisa install app ke device  
✅ **Offline support** - App tetap jalan tanpa internet  
✅ **Auto update** - Service worker update otomatis  
✅ **Cache strategy:**

- API calls: NetworkFirst (coba network dulu, fallback cache)
- Images: CacheFirst (pakai cache, background sync)
  ✅ **Dev mode enabled** - PWA aktif bahkan di development  
  ✅ **Theme color** - #1e3a8a (blue)

## 🐛 Troubleshooting

### "No manifest detected"

- ✅ FIXED - Manifest sudah di-link di `<head>`
- ✅ FIXED - Screenshot yang tidak ada sudah dihapus

### "Service worker not registered"

- ✅ FIXED - `useRegisterSW` hook sudah ditambah di root.tsx
- Pastikan tidak ada error di console

### "Icon size mismatch"

- ⚠️ TEMPORARY FIX - Pakai `sizes: "any"` untuk tmmin.png
- 👍 PERMANENT FIX - Generate icon dengan size exact pakai HTML generator

### Cache tidak update

- Clear site data: DevTools → Application → Storage → **Clear site data**
- Atau: Service Worker → **Unregister** → Refresh

## 🚀 Production Deployment

Sebelum deploy ke production:

1. ✅ Generate proper icons (192x192 + 512x512)
2. ✅ Ambil screenshot desktop + mobile
3. ✅ Update manifest.json dengan icon dan screenshot
4. ✅ Test install di berbagai device
5. ✅ Test offline functionality
6. ✅ Build production: `npm run build`

## 📦 Build Output

Setelah `npm run build`, check:

```
build/client/
├── manifest.webmanifest  ← Generated by Vite PWA
├── registerSW.js         ← Service worker registration
├── sw.js                 ← Service worker
└── workbox-*.js          ← Workbox runtime
```

## 🎉 Done!

PWA sudah aktif dan siap digunakan. Icon dan screenshot bersifat optional untuk improve install experience.

**Current Status:**

- ✅ PWA working
- ✅ Service worker registered
- ✅ Manifest detected
- ✅ Can be installed
- ⚠️ Icons using "any" size (temporary)
- ⚠️ No screenshots yet (optional)

Kalau mau sempurnakan, tinggal generate icon dan screenshot sesuai guide di atas.
