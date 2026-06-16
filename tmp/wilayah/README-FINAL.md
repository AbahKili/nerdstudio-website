# Nerd Studio Form Generator — Complete Package

## File Delivery

### Project 2: FORM PORTAL RENDERER (yang error)

| File | URL | Deskripsi |
|------|-----|-----------|
| **Code.gs** | https://nerdstudio.online/tmp/wilayah/form-renderer-code.gs | 70 baris — inject data wilayah + doGet + testRender |
| **form_render.html** | https://nerdstudio.online/tmp/wilayah/form-renderer-html.html | 300 baris — dropdown + 2 halaman + direct POST |
| provinsi.gs | https://nerdstudio.online/tmp/wilayah/provinsi.gs | Data 38 provinsi (1 KB) |
| kabkota.gs | https://nerdstudio.online/tmp/wilayah/kabkota.gs | Data 514 kab/kota (29 KB) |
| kecamatan.gs | https://nerdstudio.online/tmp/wilayah/kecamatan.gs | Data 7.265 kecamatan (360 KB) |

### Project 1: DASHBOARD GENERATOR

| File | URL | Deskripsi |
|------|-----|-----------|
| **Code.gs** | https://nerdstudio.online/tmp/wilayah/dashboard-code.gs | FormApp.create, parseGoogleForm, generateLiveSaaSLink |
| index.html | (sama dengan yang sudah ada) | Dashboard UI Tailwind |

## Bug Fixes (Project 2)

1. ✅ **Config crash** → Proteksi `if(!config.regions)`, `if(!config.branding)`
2. ✅ **Dropdown kosong** → `< ?!= JSON.stringify(...) ?>` (double-force-print)
3. ✅ **.sort() crash** → Konversi Object → Array sebelum `.sort()`
4. ✅ **Error message** → `err.message + err.lineNumber` di tampilan error
5. ✅ **Multi-page** → Page 1 (wilayah + Lanjutkan), Page 2 (fields + Kirim Pendaftaran)
6. ✅ **Hidden iframe POST** → Direct submit ke Google Form User A

## File Structure (Project 2)

```
Code.gs          — doGet(), testRender()   (70 lines)
provinsi.gs      — var PROVINSI = {...}     (38 items)
kabkota.gs       — var KABKOTA = {...}      (514 items)
kecamatan.gs     — var KECAMATAN = {...}    (7.265 items)
form_render.html — template HTML + JS       (300 lines)
```

Total project size: ~400 KB (cold start < 2 detik)

## Deployment Steps

### Project 2 (Renderer):
1. Buka GAS Editor
2. Buat file baru: provinsi.gs, kabkota.gs, kecamatan.gs → copy-paste dari URL di atas
3. Ganti Code.gs dengan form-renderer-code.gs
4. Ganti form_render.html dengan form-renderer-html.html
5. Deploy > New Deployment > Web App
   - Execute As: Me
   - Access: Anyone
6. Copy URL deployment

### Project 1 (Dashboard):
1. Ganti Code.gs dengan dashboard-code.gs
2. Update `RENDERER_URL` di baris 15 dengan URL deployment Project 2
3. Deploy > New Deployment > Web App
   - Execute As: User accessing the web app
   - Access: Anyone with Google account
