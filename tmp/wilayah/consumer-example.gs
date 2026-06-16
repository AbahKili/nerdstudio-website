/**
 * CONSUMER EXAMPLE — Cara pakai library WILAYAH di GAS project lain.
 *
 * Setup:
 *   1. Tambah library "WILAYAH" via Script ID
 *   2. Panggil WILAYAH.init({ sheetId: '...' });
 */

// ── Contoh Web App dengan dependent dropdown ─────────────────────

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Form')
    .setTitle('Form Alamat')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── API untuk dropdown ───────────────────────────────────────────

function getProvinsi() {
  return WILAYAH.getProvinsiList();
}

function getKabKota(kodeProvinsi) {
  return WILAYAH.getKabKota(kodeProvinsi);
}

function getKecamatan(kodeKabKota) {
  return WILAYAH.getKecamatan(kodeKabKota);
}

function getDesa(kodeKecamatan) {
  return WILAYAH.getDesa(kodeKecamatan);
}

function initWilayah() {
  WILAYAH.init({
    sheetId: PropertiesService.getScriptProperties().getProperty('WILAYAH_SHEET_ID'),
  });
  return WILAYAH.status();
}
