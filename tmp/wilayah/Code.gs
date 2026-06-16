/**
 * WILAYAH — Library Data Wilayah Administrasi Indonesia
 * ======================================================
 * Source: Kepmendagri No 300.2.2-2430/2025
 * Data:   github.com/cahyadsn/wilayah
 *
 * Deployment:
 *   1. Copy provinsi.gs, kabkota.gs, kecamatan.gs, Code.gs ke project ini
 *   2. Import desa.csv ke Google Sheet (tab name: "desa")
 *   3. Set SHEET_ID di fungsi init() atau biarkan auto-detect
 *
 * Usage dari GAS lain:
 *   1. Tambahkan library ini via Script ID
 *   2. panggil:  WILAYAH.getProvinsi()
 *                WILAYAH.getKabKota('32')
 *                WILAYAH.getKecamatan('32.71')
 *                WILAYAH.getDesa('32.71.01')
 */

// ──────────────────────────────────────────────────────────────────
// CONFIG — set once after deployment
// ──────────────────────────────────────────────────────────────────

var CONFIG = {
  sheetId: '1EfAXvrV5GpblW97Ozq75euVlH7Qi7T2tkEAhHPZciJY',  // Sheet "desa" — anyone with link can view
  cacheTtl: 21600,                                         // 6 jam (dalam detik)
  useCache: true,
};

// ──────────────────────────────────────────────────────────────────
// INTERNAL — cache + sheet access
// ──────────────────────────────────────────────────────────────────

function _cacheGet(key) {
  if (!CONFIG.useCache) return null;
  try {
    var cache = CacheService.getScriptCache();
    var val = cache.get(key);
    return val ? JSON.parse(val) : null;
  } catch (e) { return null; }
}

function _cacheSet(key, data) {
  if (!CONFIG.useCache) return;
  try {
    var cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(data), CONFIG.cacheTtl);
  } catch (e) {}
}

function _getSheet() {
  var id = CONFIG.sheetId;
  // Auto-detect if not set
  if (!id) {
    // Try first: companion sheet with same name pattern
    var files = DriveApp.getFilesByName('wilayah-desa');
    if (files.hasNext()) {
      id = files.next().getId();
      CONFIG.sheetId = id;
    }
  }
  if (!id) throw new Error('SHEET_ID not configured. Set CONFIG.sheetId in Code.gs');
  return SpreadsheetApp.openById(id).getSheetByName('desa');
}

function _queryDesa(kodeKecamatan) {
  // Cache check
  var cacheKey = 'desa_' + kodeKecamatan;
  var cached = _cacheGet(cacheKey);
  if (cached) return cached;

  // Query from Sheet
  var sheet = _getSheet();
  var data = sheet.getDataRange().getValues();
  var result = [];

  // Row 0 = header, start from row 1
  for (var i = 1; i < data.length; i++) {
    if (data[i][4] === kodeKecamatan) {  // kolom E = kode_kecamatan
      result.push([data[i][0], data[i][1], data[i][5]]); // [kode, nama, tipe]
    }
  }

  _cacheSet(cacheKey, result);
  return result;
}

/**
 * Search through all data in sheet (uncached, slow — use sparingly).
 */
function _searchDesa(query) {
  var q = query.toLowerCase();
  var sheet = _getSheet();
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).toLowerCase().indexOf(q) !== -1) {
      result.push({
        kode: data[i][0],
        nama: data[i][1],
        kode_provinsi: data[i][2],
        kode_kabkota: data[i][3],
        kode_kecamatan: data[i][4],
        tipe: data[i][5]
      });
      if (result.length >= 20) break; // max 20 hasil
    }
  }
  return result;
}

// ──────────────────────────────────────────────────────────────────
// PUBLIC API
// ──────────────────────────────────────────────────────────────────

/**
 * Get all provinces.
 * @returns {Object} { "11": "Aceh", "32": "Jawa Timur", ... }
 */
function getProvinsi() {
  return PROVINSI;
}

/**
 * Get all provinces as array.
 * @returns {Array<{kode: string, nama: string}>}
 */
function getProvinsiList() {
  return Object.keys(PROVINSI).map(function(k) {
    return { kode: k, nama: PROVINSI[k] };
  });
}

/**
 * Get regencies/cities for a province.
 * @param {string} kodeProvinsi — 2-digit province code
 * @returns {Array<{kode: string, nama: string}>}
 */
function getKabKota(kodeProvinsi) {
  var items = KABKOTA[kodeProvinsi];
  if (!items) return [];
  return items.map(function(row) {
    return { kode: row[0], nama: row[1] };
  });
}

/**
 * Get districts for a regency/city.
 * @param {string} kodeKabKota — 4-digit code
 * @returns {Array<{kode: string, nama: string}>}
 */
function getKecamatan(kodeKabKota) {
  var items = KECAMATAN[kodeKabKota];
  if (!items) return [];
  return items.map(function(row) {
    return { kode: row[0], nama: row[1] };
  });
}

/**
 * Get villages for a district.
 * @param {string} kodeKecamatan — 6-digit code
 * @returns {Array<{kode: string, nama: string, tipe: string}>}
 */
function getDesa(kodeKecamatan) {
  var rows = _queryDesa(kodeKecamatan);
  return rows.map(function(row) {
    return { kode: row[0], nama: row[1], tipe: row[2] };
  });
}

/**
 * Get the full administrative name chain for any code.
 * @param {string} kode — any level code (e.g. "32.71.01")
 * @returns {string} e.g. "Jawa Timur, Kota Bogor, Bogor Selatan"
 */
function getNamaWilayah(kode) {
  var parts = kode.split('.');
  var result = [];
  if (parts.length >= 1) result.push(PROVINSI[parts[0]] || '');
  if (parts.length >= 2) {
    var kabItems = KABKOTA[parts[0]] || [];
    for (var i = 0; i < kabItems.length; i++) {
      if (kabItems[i][0] === parts[0] + '.' + parts[1]) {
        result.push(kabItems[i][1]);
        break;
      }
    }
  }
  if (parts.length >= 3) {
    var kabCode = parts[0] + '.' + parts[1];
    var kecItems = KECAMATAN[kabCode] || [];
    for (var j = 0; j < kecItems.length; j++) {
      if (kecItems[j][0] === kode) {
        result.push(kecItems[j][1]);
        break;
      }
    }
  }
  if (parts.length >= 4) {
    var desaData = _queryDesa(parts[0] + '.' + parts[1] + '.' + parts[2]);
    for (var k = 0; k < desaData.length; k++) {
      if (desaData[k][0] === kode) {
        result.push(desaData[k][1]);
        break;
      }
    }
  }
  return result.join(', ');
}

/**
 * Search for a region by name (partial match).
 * Searches across provinces, regencies, districts, and villages.
 * @param {string} nama — search query
 * @param {string} level — optional: 'provinsi','kabkota','kecamatan','desa' (default: all)
 * @returns {Array<{kode: string, nama: string, level: string}>} max 20 results
 */
function cari(nama, level) {
  var q = nama.toLowerCase();
  var results = [];

  function add(kode, namaItem, lvl) {
    if (results.length < 20) {
      results.push({ kode: kode, nama: namaItem, level: lvl });
    }
  }

  if (!level || level === 'provinsi') {
    Object.keys(PROVINSI).forEach(function(k) {
      if (PROVINSI[k].toLowerCase().indexOf(q) !== -1) add(k, PROVINSI[k], 'provinsi');
    });
  }

  if (!level || level === 'kabkota') {
    Object.keys(KABKOTA).forEach(function(prov) {
      (KABKOTA[prov] || []).forEach(function(row) {
        if (row[1].toLowerCase().indexOf(q) !== -1) add(row[0], row[1], 'kabkota');
      });
    });
  }

  if (!level || level === 'kecamatan') {
    Object.keys(KECAMATAN).forEach(function(kab) {
      (KECAMATAN[kab] || []).forEach(function(row) {
        if (results.length >= 20) return;
        if (row[1].toLowerCase().indexOf(q) !== -1) add(row[0], row[1], 'kecamatan');
      });
    });
  }

  if (!level || level === 'desa') {
    var sheetResults = _searchDesa(q);
    sheetResults.forEach(function(row) {
      add(row.kode, row.nama, 'desa');
    });
  }

  return results.slice(0, 20);
}

/**
 * Initialize library with custom config.
 * Call this ONCE in your consumer project.
 * @param {Object} opts — { sheetId, cacheTtl, useCache }
 */
function init(opts) {
  if (opts.sheetId) CONFIG.sheetId = opts.sheetId;
  if (opts.cacheTtl !== undefined) CONFIG.cacheTtl = opts.cacheTtl;
  if (opts.useCache !== undefined) CONFIG.useCache = opts.useCache;
  return { ok: true, version: '1.0.0', source: 'kepmendagri-300.2.2-2430-2025' };
}

/**
 * Get library status.
 */
function status() {
  return {
    version: '1.0.0',
    provinsi: Object.keys(PROVINSI).length,
    kabkota: Object.values(KABKOTA).reduce(function(a, v) { return a + v.length; }, 0),
    kecamatan: Object.values(KECAMATAN).reduce(function(a, v) { return a + v.length; }, 0),
    desaInSheet: true,
    cacheEnabled: CONFIG.useCache,
    cacheTtl: CONFIG.cacheTtl,
    sheetConfigured: !!CONFIG.sheetId,
  };
}
