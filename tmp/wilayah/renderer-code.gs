/**
 * PROJECT 2: NERD STUDIO FORM PORTAL RENDERER
 * Powered by WILAYAH library — data wilayah Indonesia.
 */

function doGet(e) {
  if (e.parameter && e.parameter.f) {
    try {
      var decodedBytes = Utilities.base64DecodeWebSafe(e.parameter.f);
      var configObj = JSON.parse(Utilities.newBlob(decodedBytes).getDataAsString());
      
      var template = HtmlService.createTemplateFromFile('form_render');
      template.config = configObj;
      template.dataProv = WILAYAH.getProvinsi();
      template.dataKab = buildKabKotaMap();
      template.dataKec = buildKecamatanMap();
      
      return template.evaluate()
        .setTitle(configObj.branding.title)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    } catch(err) {
      return HtmlService.createHtmlOutput(
        '<div style="padding:2rem;font-family:sans-serif;">' +
        '<h2>Configuration Error</h2><pre>' + err.toString() + '</pre></div>'
      );
    }
  }
  return HtmlService.createHtmlOutput(
    '<div style="padding:2rem;font-family:sans-serif;text-align:center;">' +
    '<h2>Nerd Studio Form Portal Renderer</h2>' +
    '<p style="color:#666;">SaaS Engine Active — awaiting configuration token.</p>' +
    '</div>'
  );
}

function buildKabKotaMap() {
  var result = {};
  var prov = WILAYAH.getProvinsi();
  for (var kode in prov) {
    var items = WILAYAH.getKabKota(kode);
    result[kode] = items.map(function(k) { return [k.kode, k.nama]; });
  }
  return result;
}

function buildKecamatanMap() {
  var result = {};
  var prov = WILAYAH.getProvinsi();
  for (var p in prov) {
    var kabItems = WILAYAH.getKabKota(p);
    for (var i = 0; i < kabItems.length; i++) {
      var kecItems = WILAYAH.getKecamatan(kabItems[i].kode);
      if (kecItems.length > 0) {
        result[kabItems[i].kode] = kecItems.map(function(k) { return [k.kode, k.nama]; });
      }
    }
  }
  return result;
}
