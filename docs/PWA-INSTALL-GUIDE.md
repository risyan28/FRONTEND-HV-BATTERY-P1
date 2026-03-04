# 🚀 Cara Test PWA Install

## ❌ Masalah Saat Ini

PWA install **TIDAK akan muncul** di:

- ❌ `http://192.168.1.167:5173` → IP address tidak support PWA install
- ❌ HTTP tanpa SSL

PWA install **HANYA jalan** di:

- ✅ `http://localhost:5173` → Localhost
- ✅ `https://domain.com` → HTTPS domain

---

## ✅ Solusi 1: Test di Desktop (Localhost)

### Di PC yang sama (tempat dev server jalan):

1. **Buka browser:**

   ```
   http://localhost:5173
   ```

2. **Lihat address bar** → Ada icon **+** atau **⬇️** (install)

3. **Klik icon install** → Popup muncul "Install HV Battery P1?"

4. **Klik Install** → App terbuka di window terpisah

### Verifikasi PWA:

1. **Chrome DevTools** (F12) → Tab **Application**
2. **Cek:**
   - ✅ Manifest → Detected
   - ✅ Service Workers → Registered & Running
   - ✅ Install → Tombol "Install app" tersedia

---

## ✅ Solusi 2: Test di HP (Setup HTTPS)

PWA di mobile **wajib HTTPS** kecuali localhost. Ada 2 cara:

### Cara 2A: Pakai HTTPS Tunnel (Tercepat)

1. **Install ngrok:**

   ```powershell
   # Download dari https://ngrok.com/download
   # Atau pakai Chocolatey:
   choco install ngrok
   ```

2. **Setup ngrok:**

   ```powershell
   ngrok config add-authtoken YOUR_TOKEN
   ```

3. **Jalankan tunnel:**

   ```powershell
   ngrok http 5173
   ```

4. **Copy URL HTTPS** yang muncul:

   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:5173
   ```

5. **Buka di HP:**
   - URL: `https://abc123.ngrok.io`
   - Chrome → Menu (⋮) → **Add to Home Screen**
   - Icon muncul di home screen HP
   - Buka → App fullscreen tanpa address bar

### Cara 2B: Self-Signed SSL (Lebih Kompleks)

1. **Install mkcert:**

   ```powershell
   choco install mkcert
   mkcert -install
   ```

2. **Generate certificate:**

   ```powershell
   cd frontend
   mkcert localhost 192.168.1.167
   ```

3. **Update vite.config.ts:**

   ```typescript
   import fs from 'fs'

   export default defineConfig({
     server: {
       https: {
         key: fs.readFileSync('./localhost+1-key.pem'),
         cert: fs.readFileSync('./localhost+1.pem'),
       },
       host: '0.0.0.0',
       port: 5173,
     },
   })
   ```

4. **Restart server** → Akses `https://192.168.1.167:5173`

---

## ✅ Solusi 3: Test PWA Manual di HP

Kalau ga bisa install, kamu masih bisa test fitur PWA:

1. **Buka Chrome di HP:**

   ```
   http://192.168.1.167:5173
   ```

2. **Menu (⋮)** → **Add to Home Screen**
   - Ini **bukan install PWA** (cuma bookmark)
   - Tapi service worker tetap aktif
   - Offline mode tetap jalan

3. **Test Offline:**
   - Buka app
   - Matikan WiFi/Data
   - Refresh → App tetap load (dari cache)

---

## 🧪 Quick Test PWA Features

### Test 1: Service Worker

```javascript
// Paste di console browser
navigator.serviceWorker.getRegistrations().then((registrations) => {
  console.log('Service Workers:', registrations.length)
  registrations.forEach((sw) => console.log('SW:', sw))
})
```

### Test 2: Installability

```javascript
// Paste di console
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ PWA can be installed!')
})

// Check current status
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ App is installed and running standalone')
} else {
  console.log('⚠️ App running in browser tab')
}
```

### Test 3: Cache

```javascript
// Check cached files
caches.keys().then((names) => {
  console.log('Caches:', names)
  names.forEach((name) => {
    caches.open(name).then((cache) => {
      cache.keys().then((keys) => {
        console.log(name + ':', keys.length, 'files')
      })
    })
  })
})
```

---

## 📱 PWA Install Behavior per Browser

| Browser     | Desktop Install | Mobile Install | Requirement        |
| ----------- | --------------- | -------------- | ------------------ |
| **Chrome**  | ✅ Auto prompt  | ✅ Auto prompt | HTTPS or localhost |
| **Edge**    | ✅ Auto prompt  | ✅ Auto prompt | HTTPS or localhost |
| **Firefox** | ⚠️ Limited      | ⚠️ Limited     | HTTPS or localhost |
| **Safari**  | ❌ No install   | ✅ Add to Home | HTTPS only         |

**Note:** Safari iOS tidak punya install prompt seperti Chrome. User harus manual:

- Share button → **Add to Home Screen**

---

## 🎯 Recommended: Test Localhost Dulu

**Paling mudah dan pasti jalan:**

1. **Di PC (tempat server jalan):**

   ```
   http://localhost:5173
   ```

2. **Install PWA di desktop** → Test fitur offline

3. **Kalau mau test di HP:**
   - **Production**: Deploy ke Vercel/Netlify (otomatis HTTPS)
   - **Development**: Pakai ngrok (HTTPS tunnel)

---

## ✅ Checklist PWA Working

- [ ] Buka `http://localhost:5173`
- [ ] DevTools → Application → Manifest detected
- [ ] DevTools → Service Workers → Active
- [ ] Address bar → Icon install muncul
- [ ] Klik install → Popup konfirmasi
- [ ] Install → App buka di window sendiri
- [ ] Offline test → Matikan network, app tetap load
- [ ] Desktop shortcut → Icon HV Battery muncul

Kalau semua ✅, PWA udah fully working! 🎉

---

## 🚀 Next: Deploy Production with HTTPS

Untuk production PWA di mobile:

1. **Build:**

   ```powershell
   npm run build
   ```

2. **Deploy ke platform HTTPS:**
   - Vercel (gratis, otomatis HTTPS)
   - Netlify (gratis, otomatis HTTPS)
   - Railway/Render (gratis tier)

3. **Akses domain HTTPS** → PWA install otomatis jalan di semua device

**Example deploy Vercel:**

```powershell
npm i -g vercel
vercel --prod
```

Dapat URL: `https://hv-battery.vercel.app` → Bisa install di HP ✅
