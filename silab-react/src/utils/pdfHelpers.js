// Helper functions untuk format data ke PDF

// Fungsi untuk mendapatkan tanggal WIB (UTC+7) yang terupdate
export const getWIBDate = (dateInput = null) => {
  // Jika tidak ada input, gunakan waktu sekarang
  const date = dateInput ? new Date(dateInput) : new Date();

  // Konversi ke WIB (UTC+7)
  const wibOffset = 7 * 60; // WIB adalah UTC+7 dalam menit
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + wibOffset * 60000);

  return wibDate;
};

// Fungsi untuk format tanggal ke format Indonesia (DD/MM/YYYY) dengan WIB
export const formatTanggalWIB = (dateInput = null) => {
  const wibDate = getWIBDate(dateInput);

  const day = String(wibDate.getDate()).padStart(2, "0");
  const month = String(wibDate.getMonth() + 1).padStart(2, "0");
  const year = wibDate.getFullYear();

  return `${day}/${month}/${year}`;
};

// Fungsi untuk format tanggal lengkap dengan hari (Senin, 21 Januari 2026) dengan WIB
export const formatTanggalLengkapWIB = (dateInput = null) => {
  const wibDate = getWIBDate(dateInput);

  const hariNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const hari = hariNames[wibDate.getDay()];
  const tanggal = wibDate.getDate();
  const bulan = bulanNames[wibDate.getMonth()];
  const tahun = wibDate.getFullYear();

  return `${hari}, ${tanggal} ${bulan} ${tahun}`;
};

// Helper function untuk menghitung diferensiasi leukosit
const hitungDiferensiasi = (v) => {
  const toNum = (x) => Number(x) || 0;

  const Limfosit = toNum(v.Limfosit);
  const Heterofil = toNum(v.Heterofil);
  const Eosinofil = toNum(v.Eosinofil);
  const Monosit = toNum(v.Monosit);
  const Basofil = toNum(v.Basofil);

  const Total = Limfosit + Heterofil + Eosinofil + Monosit + Basofil;

  const persen = (x) => (Total > 0 ? ((x / Total) * 100).toFixed(1) : "0.0");

  return {
    Total,
    LimfositPersen: persen(Limfosit),
    HeterofilPersen: persen(Heterofil),
    EosinofilPersen: persen(Eosinofil),
    MonositPersen: persen(Monosit),
    BasofilPersen: persen(Basofil),
    TotalPersen: Total > 0 ? (persen(Limfosit) * 1 + persen(Heterofil) * 1 + persen(Eosinofil) * 1 + persen(Monosit) * 1 + persen(Basofil) * 1).toFixed(1) : "0.0",
  };
};

export const formatDataForPDF = (booking) => {
  // (hapus deklarasi headerTitle1 dan headerTitle2 di sini)
  if (!booking || !booking.analysis_items) {
    console.warn("No booking or analysis_items found");
    return null;
  }

  // Gunakan preferensi user: resultUnits menentukan mg/dL atau g/dL per parameter
  const resultUnits = booking.resultUnits || {};
  // console.log removed for performance

  // FILTER: Tentukan parameter mana yang benar-benar tersedia di analysis_items
  // Tidak lagi bergantung pada jenis_analisis teks, tapi pada data aktual
  const availableItems = new Set(booking.analysis_items.map((item) => item.nama_item));

  // console.log removed for performance

  // Deteksi otomatis berdasarkan data yang ada
  const hasHematologiData = Array.from(availableItems).some((item) => ["BDM", "BDP", "Hemoglobin Darah", "Diferensiasi Leukosit"].includes(item) || item.toLowerCase().includes("hematokrit") || item.toLowerCase() === "pcv");

  const hasMetabolitData = Array.from(availableItems).some((item) =>
    ["Glukosa", "Total Protein", "Albumin", "Kolestrol", "Trigliserida", "Urea/BUN", "Kreatinin", "Kalsium", "HDL-kol", "LDL-kol", "Asam Urat", "SGOT", "SGPT"].includes(item),
  );

  // console.log removed for performance

  const codes = parseKodeSampel(booking.kode_sampel);
  // console.log removed for performance

  let parsedJenisDL = "unggas";

  // Pisahkan items berdasarkan kategori yang DIPESAN
  const hematologiItems = {};
  const metabolitItems = {};
  const availableHematologiParams = new Set();
  const availableMetabolitParams = new Set();

  booking.analysis_items.forEach((item) => {
    const itemName = item.nama_item;
    const hasil = item.hasil || "";

    if (!hasil || hasil.trim() === "") {
      return;
    }

    // Parse hasil per kode sampel
    const resultParts = hasil.split(" | ");
    resultParts.forEach((part) => {
      const match = part.match(/\[(.*?)\]:\s*(.*)/);
      if (!match) return;

      const code = match[1];
      const value = match[2];

      // Deteksi satuan dari value (mg/dL atau g/dL)
      let unit = "mg/dL";
      if (/g\/dL/.test(value)) unit = "g/dL";
      if (/mg\/dL/.test(value)) unit = "mg/dL";
      // Fallback: jika tidak ada satuan, default mg/dL

      // Extract HASIL dari format baru (INPUT=x HASIL=y unit)
      const hasilMatch = value.match(/HASIL=([\d.]+)/);
      let displayValue = hasilMatch ? hasilMatch[1] : value.split(" ")[0];

      // Tidak ada konversi nilai, hanya header satuan yang berubah sesuai preferensi user

      const itemNameLower = (itemName || "").toLowerCase();

      // HEMATOLOGI - hanya jika ada data aktual
      if (hasHematologiData) {
        if (itemName === "BDM") {
          if (!hematologiItems[code]) hematologiItems[code] = {};
          hematologiItems[code].BDM = displayValue;
          availableHematologiParams.add("BDM");
        } else if (itemName === "BDP") {
          if (!hematologiItems[code]) hematologiItems[code] = {};
          hematologiItems[code].BDP = displayValue;
          availableHematologiParams.add("BDP");
        } else if (itemName === "Hemoglobin Darah") {
          if (!hematologiItems[code]) hematologiItems[code] = {};
          hematologiItems[code].HB = displayValue;
          availableHematologiParams.add("HB");
        } else if (itemNameLower.includes("hematokrit") || itemNameLower === "pcv") {
          if (!hematologiItems[code]) hematologiItems[code] = {};
          const label = "PCV";
          hematologiItems[code][label] = displayValue;
          availableHematologiParams.add(label);
        } else if (itemName === "Diferensiasi Leukosit") {
          if (!hematologiItems[code]) hematologiItems[code] = {};
          // Parse diferensiasi: "Lim=10, Het=20, Eos=5, Mon=2, Bas=1"
          const limMatch = value.match(/Lim=([\d.]+)/);
          const hetMatch = value.match(/Het=([\d.]+)/);
          const eosMatch = value.match(/Eos=([\d.]+)/);
          const monMatch = value.match(/Mon=([\d.]+)/);
          const basMatch = value.match(/Bas=([\d.]+)/);
          const jenisMatch = value.match(/Jenis=(\w+)/);

          parsedJenisDL = jenisMatch ? jenisMatch[1] : "unggas";

          const v = {
            Limfosit: limMatch ? limMatch[1] : "0",
            Heterofil: hetMatch ? hetMatch[1] : "0",
            Eosinofil: eosMatch ? eosMatch[1] : "0",
            Monosit: monMatch ? monMatch[1] : "0",
            Basofil: basMatch ? basMatch[1] : "0",
          };

          const h = hitungDiferensiasi(v);

          if (limMatch) {
            hematologiItems[code].Limfosit = h.LimfositPersen;
            availableHematologiParams.add("Limfosit");
          }
          if (hetMatch) {
            hematologiItems[code].Heterofil = h.HeterofilPersen;
            availableHematologiParams.add("Heterofil");
          }
          if (eosMatch) {
            hematologiItems[code].Eosinofil = h.EosinofilPersen;
            availableHematologiParams.add("Eosinofil");
          }
          if (monMatch) {
            hematologiItems[code].Monosit = h.MonositPersen;
            availableHematologiParams.add("Monosit");
          }
          if (basMatch) {
            hematologiItems[code].Basofil = h.BasofilPersen;
            availableHematologiParams.add("Basofil");
          }
        }
      }

      // METABOLIT - hanya jika ada data aktual
      if (hasMetabolitData && ["Glukosa", "Total Protein", "Albumin", "Kolestrol", "Trigliserida", "Urea/BUN", "Kreatinin", "Kalsium", "HDL-kol", "LDL-kol", "Asam Urat", "SGOT", "SGPT"].includes(itemName)) {
        if (!metabolitItems[code]) metabolitItems[code] = {};
        metabolitItems[code][itemName] = displayValue;
        availableMetabolitParams.add(itemName);
      }
    });
  });

  // console.log removed for performance

  // Build dynamic table headers and rows
  const jenisHewan = booking.jenis_hewan || "****";

  // Build table1 (Hematologi) - hanya jika ada data aktual
  let table1 = null;
  let table2 = null;
  let onlyMetabolit = false;
  let onlyHematologi = false;
  let paramStr = "";
  let paramStr2 = "";
  let diffStr = "";
  if (hasHematologiData && availableHematologiParams.size > 0) {
    const hematologiParamOrder = ["BDM", "BDP", "HB", "PCV", "Limfosit", "Heterofil", "Eosinofil", "Monosit", "Basofil"];
    // Tentukan label untuk heterofil berdasarkan jenis hewan dari parsed data
    const heterofilLabel = parsedJenisDL === "ruminansia" ? "Neutrofil" : "Heterofil";
    const headerMap = {
      BDM: "BDM x10^6\n(Butir/mm³)",
      BDP: "BDP x10^3\n(Butir/mm³)",
      HB: "HB\n(G%)",
      PCV: "PCV\n(%)",
      Limfosit: "Limfosit\n(%)",
      Heterofil: `${heterofilLabel}\n(%)`,
      Eosinofil: "Eosinofil\n(%)",
      Monosit: "Monosit\n(%)",
      Basofil: "Basofil\n(%)",
    };
    const activeHematologiParams = hematologiParamOrder.filter((p) => availableHematologiParams.has(p) && headerMap[p]);
    const table1Header = ["No", "Kode", ...activeHematologiParams.map((p) => headerMap[p])];
    const table1Rows = codes.map((code, idx) => {
      const data = hematologiItems[code] || {};
      return [idx + 1, code, ...activeHematologiParams.map((p) => data[p] || "-")];
    });
    // Untuk title, ambil nama parameter saja tanpa satuan, kecuali diferensiasi
    const diffParams = ["Limfosit", "Heterofil", "Eosinofil", "Monosit", "Basofil"];
    const nonDiffParams = activeHematologiParams.filter((p) => !diffParams.includes(p));
    paramStr = nonDiffParams
      .map((p) => {
        const header = headerMap[p] || p;
        // Ambil bagian pertama sebelum spasi atau newline
        return header.split(" ")[0].split("\n")[0];
      })
      .join(", ");
    if (
      activeHematologiParams.includes("Limfosit") ||
      activeHematologiParams.includes("Heterofil") ||
      activeHematologiParams.includes("Eosinofil") ||
      activeHematologiParams.includes("Monosit") ||
      activeHematologiParams.includes("Basofil")
    ) {
      diffStr = " dan Differensiasi Leukosit";
    }
    table1 = [table1Header, ...table1Rows];
  }

  if (hasMetabolitData && availableMetabolitParams.size > 0) {
    const metabolitParamOrder = ["Glukosa", "Total Protein", "Albumin", "Kolestrol", "Trigliserida", "Urea/BUN", "Kreatinin", "Kalsium", "HDL-kol", "LDL-kol", "Asam Urat", "SGOT", "SGPT"];
    const activeMetabolitParams = metabolitParamOrder.filter((p) => availableMetabolitParams.has(p));
    // Header mengikuti resultUnits, default mg/dL
    const headerMap = {
      Glukosa: "Glukosa",
      "Total Protein": "Total Protein",
      Albumin: "Albumin",
      Kolestrol: "Kolestrol",
      Trigliserida: "Trigliserida",
      "Urea/BUN": "Urea/BUN",
      Kreatinin: "Kreatinin",
      Kalsium: "Kalsium",
      "HDL-kol": "HDL-kol",
      "LDL-kol": "LDL-kol",
      "Asam Urat": "Asam Urat",
      SGOT: "SGOT",
      SGPT: "SGPT",
    };
    const getUnit = (param) => {
      if (param === "SGOT" || param === "SGPT") return "U/L";
      return resultUnits[param] || "mg/dL";
    };
    const table2Header = ["No", "Kode", ...activeMetabolitParams.map((p) => `${headerMap[p]}\n(${getUnit(p)})`)];
    const table2Rows = codes.map((code, index) => {
      const data = metabolitItems[code] || {};
      return [
        index + 1,
        code,
        ...activeMetabolitParams.map((p) => {
          let val = data[p] || "-";
          // Nilai di PDF selalu mg/dL, tidak dikonversi meskipun header g/dL
          return val;
        }),
      ];
    });
    // For title, use only parameter names (without units)
    const paramNameOnly = (p) => (typeof p === "string" ? p.split("\n")[0] : p);
    paramStr2 = activeMetabolitParams.map(paramNameOnly).join(", ");
    table2 = [table2Header, ...table2Rows];
  }

  // Penentuan title dan urutan tabel
  let headerTitle1 = null;
  let headerTitle2 = null;
  if (table1 && table2) {
    // Dua-duanya ada
    headerTitle1 = `Tabel 1. Hasil Analisis ${paramStr}${diffStr} pada hewan ternak ${jenisHewan}`;
    headerTitle2 = `Tabel 2. Hasil Analisis ${paramStr2} pada hewan ternak ${jenisHewan}`;
  } else if (table1 && !table2) {
    // Hanya hematologi
    headerTitle1 = `Tabel 1. Hasil Analisis ${paramStr}${diffStr} pada hewan ternak ${jenisHewan}`;
    headerTitle2 = null;
  } else if (!table1 && table2) {
    // Hanya metabolit
    headerTitle1 = null;
    headerTitle2 = `Tabel 1. Hasil Analisis ${paramStr2} pada hewan ternak ${jenisHewan}`;
  }

  const parameterAnalisis = booking.jenis_analisis || (table1 && table2 ? "Hematologi dan Metabolit" : table1 ? "Hematologi" : table2 ? "Metabolit" : "****");
  const tanggalDisplay = formatTanggalWIB();

  return {
    header: {
      kepada: "Kepada Yth.",
      instansi: booking.user?.full_name || booking.user?.name || "****",
      tempat: "Di Tempat",
      tanggal: tanggalDisplay,
      jenis_kelamin: booking.jenis_kelamin || "****",
      umur: booking.umur || "**** minggu",
      status_fisiologis: booking.status_fisiologis || "****",
      parameterAnalisis: parameterAnalisis,
      title1: headerTitle1,
      title2: headerTitle2,
    },
    table1: table1,
    table2: table2,
  };
};

export const parseKodeSampel = (kodeSampel) => {
  if (!kodeSampel) return [];

  try {
    if (typeof kodeSampel === "string") {
      try {
        const parsed = JSON.parse(kodeSampel);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [kodeSampel];
      }
    } else if (Array.isArray(kodeSampel)) {
      return kodeSampel;
    }
  } catch (error) {
    console.error("Error parsing kode_sampel:", error);
  }

  return [];
};
