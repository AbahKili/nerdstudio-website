# WILAYAH GAS Library — Deployment Guide

## Step 1: Buat Google Sheet companion

1. Buka https://sheets.new
2. Rename sheet jadi `wilayah-desa`
3. Tab pertama rename jadi `desa`
4. Import CSV: File → Import → Upload → pilih `desa.csv`
5. Import location: "Replace current sheet"
6. Separator type: "Comma"
7. Copy Sheet ID dari URL:
   `https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXX/edit`
   yang `XXXXXXXXXXXXXXX` itu Sheet ID-nya

## Step 2: Buat GAS Library Project

1. Buka https://script.google.com/new
2. Copy-paste isi file-file ini ke editor:
   - `provinsi.gs` → buat file baru `provinsi.gs`
   - `kabkota.gs` → buat file baru `kabkota.gs`
   - `kecamatan.gs` → buat file baru `kecamatan.gs`
   - `Code.gs` → overwrite `Code.gs` default
3. Di file `Code.gs`, update CONFIG kalau perlu (opsional, auto-detect)
4. Save: File → Save (Ctrl+S)
5. Deploy sebagai library:
   - Deploy → New Deployment
   - Type: Library
   - Description: "Data Wilayah Indonesia - Kepmendagri 2025"
   - Deploy → Copy Script ID

## Step 3: Gunakan di GAS lain

```javascript
// Di GAS project lain:
// 1. Editor → Libraries (+) → paste Script ID → pilih versi

// 2. Init (sekali aja)
function setup() {
  WILAYAH.init({
    sheetId: 'XXXXXXXXXXXXXXX',  // dari Step 1
  });
  console.log(WILAYAH.status());
}

// 3. Gunakan!
function testDropdown() {
  // Provinsi
  const prov = WILAYAH.getProvinsiList();
  // [{kode: "11", nama: "Aceh"}, ...]

  // Kab/Kota di Jawa Timur
  const kab = WILAYAH.getKabKota('32');
  // [{kode: "32.71", nama: "Kota Bogor"}, ...]

  // Kecamatan di Kota Bogor
  const kec = WILAYAH.getKecamatan('32.71');
  // [{kode: "32.71.01", nama: "Bogor Selatan"}, ...]

  // Desa di Bogor Selatan
  const desa = WILAYAH.getDesa('32.71.01');
  // [{kode: "32.71.01.1001", nama: "Menteng", tipe: "Kelurahan"}, ...]

  // Cari
  const hasil = WILAYAH.cari('Menteng');
  // [{kode: "...", nama: "Menteng", level: "desa"}, ...]

  // Nama lengkap
  WILAYAH.getNamaWilayah('32.71.01');
  // "Jawa Timur, Kota Bogor, Bogor Selatan"
}
```

## File Sizes

| File | Size | Load time |
|------|------|-----------|
| provinsi.gs | 1 KB | instant |
| kabkota.gs | 29 KB | instant |
| kecamatan.gs | 360 KB | <100ms |
| Code.gs | 7 KB | instant |
| desa.csv (in Sheet) | 3.990 KB | per-query: <500ms (cached) |
| **Total GAS project** | **~400 KB** | startup <1 detik |
