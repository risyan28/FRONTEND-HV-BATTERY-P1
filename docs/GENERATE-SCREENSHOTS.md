# Generate PWA Screenshots - Quick Steps

## 🚀 Quick Fix (2 menit):

1. **Buka file:** `generate-screenshots.html` di browser (double-click)

2. **Klik tombol:** "Generate All Screenshots"

3. **File otomatis terdownload:**
   - ✅ `screenshot-mobile.png` (390x844)
   - ✅ `screenshot-desktop.png` (1920x1080)

4. **Pindahkan kedua file** ke folder:

   ```
   public/images/
   ```

5. **Refresh browser** → Warning PWA hilang ✅

---

## 📝 Alternative: Screenshot Real Dashboard

Kalau mau pakai screenshot dari aplikasi real:

### Desktop (wide):

1. Buka app di browser (full screen)
2. F12 → Toggle device (Ctrl+Shift+M)
3. Set: Responsive → 1920 x 1080
4. Screenshot → Save as `screenshot-desktop.png`
5. Paste ke `public/images/`

### Mobile:

1. Toggle device (Ctrl+Shift+M)
2. Set: iPhone SE → 390 x 844
3. Screenshot → Save as `screenshot-mobile.png`
4. Paste ke `public/images/`

---

## ✅ Done!

Manifest sudah dikonfigurasi untuk menerima kedua screenshot. Tinggal generate dan simpan file-nya.
