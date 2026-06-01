import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Standard Pamekasan Kecamatan list mapping
const PAMEKASAN_KECAMATAN: Record<string, string> = {
  "010": "Tlanakan",
  "020": "Pademawu",
  "030": "Galis",
  "040": "Pamekasan",
  "050": "Proppo",
  "060": "Palenggaan",
  "070": "Pegantenan",
  "080": "Larangan",
  "090": "Pakong",
  "100": "Waru",
  "110": "Batu Marmar",
  "120": "Kadur",
  "130": "Pasean"
};

// Levenshtein distance implementation for spatial name check
function computeLevenshtein(s1: string, s2: string): number {
  const cleanKey1 = s1.trim().toUpperCase().replace(/[^A-Z\s']/g, "");
  const cleanKey2 = s2.trim().toUpperCase().replace(/[^A-Z\s']/g, "");

  if (cleanKey1.length < cleanKey2.length) {
    return computeLevenshtein(cleanKey2, cleanKey1);
  }
  if (cleanKey2.length === 0) {
    return cleanKey1.length;
  }

  let previousRow = Array.from({ length: cleanKey2.length + 1 }, (_, i) => i);
  for (let i = 0; i < cleanKey1.length; i++) {
    const currentRow = [i + 1];
    for (let j = 0; j < cleanKey2.length; j++) {
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + (cleanKey1[i] !== cleanKey2[j] ? 1 : 0);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }
    previousRow = currentRow;
  }
  return previousRow[previousRow.length - 1];
}

function calculateSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const distance = computeLevenshtein(s1, s2);
  return (maxLen - distance) / maxLen;
}

// Global parameters locked based on SSoT
const GARIS_KEMISKINAN_2025 = 482278.0;
const RATA_RATA_ART_MISKIN = 4.53;
const AMBANG_BATAS_PENGELUARAN_RT = 2184719.34; // 4.53 * 482278.0 = 2184719.34 IDR

export async function POST(req: NextRequest) {
  try {
    // 1. Safe IP Extraction from header (Rule #1)
    const xForwardedFor = req.headers.get("x-forwarded-for");
    let clientIp = "127.0.0.1";
    if (xForwardedFor) {
      const parts = xForwardedFor.split(","); // Perform .split(',') array operation FIRST
      const firstPart = parts[0]; // Capture index [0]
      if (firstPart) {
        clientIp = firstPart.trim(); // ONLY THEN invoke the .trim() method on the string
      }
    }

    // 2. Strict Input Validation & Zero Tolerance for Truncated inputs (Rule #2)
    const bodyText = await req.text();
    if (!bodyText || bodyText.trim() === "") {
      return NextResponse.json(
        { error: "Permintaan kosong: Input data terpotong atau tidak lengkap." },
        { status: 400 }
      );
    }

    let rawData: any;
    try {
      rawData = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { error: "Format payload rusak: Malformed JSON atau truncated payload." },
        { status: 400 }
      );
    }

    // Verify critical presence of elements to enforce ZERO TRUNCATION
    const requiredKeys = [
      "mfd_code",
      "census_block",
      "questionnaire_type",
      "household_id",
      "relationship_to_krt",
      "member_gender",
      "member_age",
      "monthly_expenditure",
      "household_members"
    ];

    for (const key of requiredKeys) {
      if (rawData[key] === undefined || rawData[key] === null || rawData[key] === "") {
        return NextResponse.json(
          { error: `Data tidak lengkap (Truncation Blocked): Kunci wajib '${key}' hilang atau kosong.` },
          { status: 400 }
        );
      }
    }

    const {
      mfd_code,
      census_block,
      questionnaire_type,
      household_id,
      relationship_to_krt,
      member_gender,
      member_age,
      monthly_expenditure,
      household_members,
      has_luxury_assets,
      st_kawin,
      schooling_status,
      keg_utama,
      jam_kerja,
      has_balita,
      akta_balita,
      desa_name_input
    } = rawData;

    const logValidasi: Array<{
      aspek: string;
      status: "WARNING" | "CRITICAL";
      pesan: string;
    }> = [];

    // --- LOGIC GATE 1: Wilayah / MFD Validation ---
    if (mfd_code.length !== 10 || !/^\d+$/.test(mfd_code)) {
      logValidasi.push({
        aspek: "WILAYAH",
        status: "CRITICAL",
        pesan: "Kode MFD wajib bernilai tepat 10 digit numerik."
      });
    } else {
      const prov = mfd_code.slice(0, 2);
      const kab = mfd_code.slice(2, 4);
      const kec = mfd_code.slice(4, 7);
      const desa = mfd_code.slice(7, 10);

      // Lock parameters to Kabupaten Pamekasan (3528)
      if (prov !== "35") {
        logValidasi.push({
          aspek: "WILAYAH",
          status: "CRITICAL",
          pesan: `Provinsi wajib berkode 35 (Jawa Timur), terdeteksi: ${prov}.`
        });
      }
      if (kab !== "28") {
        logValidasi.push({
          aspek: "WILAYAH",
          status: "CRITICAL",
          pesan: `Kabupaten wajib berkode 28 (Pamekasan), terdeteksi: ${kab}.`
        });
      }
      if (!PAMEKASAN_KECAMATAN[kec]) {
        logValidasi.push({
          aspek: "WILAYAH",
          status: "CRITICAL",
          pesan: `Kecamatan berkode ${kec} tidak terdaftar di Kabupaten Pamekasan.`
        });
      } else if (desa_name_input) {
        // Run Levenshtein to matching desa
        const activeKecName = PAMEKASAN_KECAMATAN[kec];
        // Suppose we have some sample official village in Pademawu (020): "Buddih", "Pademawu Timur"
        // Let's matching against a mock database list
        const officialVillages: Record<string, string[]> = {
          "010": ["Tlanakan", "Branta Tinggi", "Branta Pesisir"],
          "020": ["Buddih", "Pademawu Timur", "Pademawu Barat", "Sentol", "Bunder"],
          "120": ["Kertagena Dajah", "Kadur", "Pamoloan", "Gagah"]
        };
        const listDesa = officialVillages[kec] || ["Desa Sampel"];
        let bestMatch = "";
        let maxSimilarity = 0;

        for (const vf of listDesa) {
          const sim = calculateSimilarity(desa_name_input, vf);
          if (sim > maxSimilarity) {
            maxSimilarity = sim;
            bestMatch = vf;
          }
        }

        if (maxSimilarity >= 0.95) {
          if (desa_name_input.toUpperCase() !== bestMatch.toUpperCase()) {
            logValidasi.push({
              aspek: "WILAYAH",
              status: "WARNING",
              pesan: `Auto-koreksi nama desa dari '${desa_name_input}' menjadi nama resmi '${bestMatch}' (Tingkat kemiripan Levenshtein: ${(maxSimilarity * 100).toFixed(2)}% >= 95%).`
            });
          }
        } else if (maxSimilarity < 0.8) {
          logValidasi.push({
            aspek: "WILAYAH",
            status: "CRITICAL",
            pesan: `Nama desa '${desa_name_input}' ditolak secara ketat. Kemiripan dengan '${bestMatch}' hanya ${(maxSimilarity * 100).toFixed(2)}% (< 80% ambang batas). Input manual terkunci, silakan pilih dari menu dropdown.`
          });
        } else {
          logValidasi.push({
            aspek: "WILAYAH",
            status: "WARNING",
            pesan: `Akurasi nama desa '${desa_name_input}' cukup rendah (${(maxSimilarity * 100).toFixed(2)}%). Direkomendasikan untuk menilik kecocokan desa resmi: '${bestMatch}'.`
          });
        }
      }
    }

    // --- LOGIC GATE 2: Demografi & KRT (Pilar Kependudukan) ---
    if (relationship_to_krt === 1) {
      if (member_gender !== "L" && member_gender !== "P") {
        logValidasi.push({
          aspek: "DEMOGRAFI",
          status: "CRITICAL",
          pesan: "Kepala Rumah Tangga wajib memiliki jenis kelamin yang diinput sebagai L atau P."
        });
      }
    }

    // Pernikahan anak di bawah umur standar BPS
    if (st_kawin && [2, 3, 4].includes(Number(st_kawin)) && Number(member_age) < 15) {
      logValidasi.push({
        aspek: "DEMOGRAFI",
        status: "WARNING",
        pesan: `Responden dengan status perkawinan '${st_kawin}' tercatat berumur ${member_age} tahun. Wajib melampirkan Catatan Lapangan (Remark PCL) untuk mengonfirmasi perkawinan di bawah umur standar (<15 tahun).`
      });
    }

    // --- LOGIC GATE 3: Sosio-Ekonomi & Kemiskinan ---
    const pengeluaranPerkapita = Number(monthly_expenditure) / Number(household_members);

    // Deteksi miskin ekstrem vs aset mewah
    if (has_luxury_assets === true && pengeluaranPerkapita < GARIS_KEMISKINAN_2025) {
      logValidasi.push({
        aspek: "SOSIO-EKONOMI",
        status: "CRITICAL",
        pesan: `Anomali Aset Mewah: Rumah tangga melaporkan pengeluaran per kapita (Rp${pengeluaranPerkapita.toLocaleString("id-ID")}) di bawah Garis Kemiskinan Pamekasan Maret 2025 (Rp${GARIS_KEMISKINAN_2025.toLocaleString("id-ID")}) tetapi memiliki aset mewah (AC, Mobil, atau Laptop).`
      });
    }

    // Kebocoran data pengeluaran abnormal rendah
    if (pengeluaranPerkapita < (GARIS_KEMISKINAN_2025 / 2)) {
      logValidasi.push({
        aspek: "SOSIO-EKONOMI",
        status: "WARNING",
        pesan: `Nilai pengeluaran per kapita sangat rendah (Rp${pengeluaranPerkapita.toLocaleString("id-ID")} atau < 50% dari Garis Kemiskinan Rp${GARIS_KEMISKINAN_2025.toLocaleString("id-ID")}). Pengawas PML wajib memverifikasi ulang kondisi fisik bangunan.`
      });
    }

    // --- LOGIC GATE 4: Pendidikan & Ketenagakerjaan ---
    const usia = Number(member_age);
    if (usia >= 7 && usia <= 15) {
      if (Number(schooling_status) !== 2) { // 2 = Masih Sekolah
        logValidasi.push({
          aspek: "PENDIDIKAN",
          status: "WARNING",
          pesan: `Anak usia wajib belajar (umur ${usia} tahun) tidak berstatus 'Masih Sekolah'. Wajib memasukkan kode alasan utama pada kuesioner kesejahteraan anak.`
        });
      }
    }

    // Kegiatan Utama Bekerja tapi Jam Kerja nol (Crucial check)
    if (Number(keg_utama) === 1 && Number(jam_kerja) === 0) {
      logValidasi.push({
        aspek: "KETENAGAKERJAAN",
        status: "CRITICAL",
        pesan: `Mencegah data inkonsisten: Status kegiatan utama adalah 'Bekerja' namun total jam kerja diisi 0 jam seminggu. Sistem menolak input, silakan ganti status kegiatan ke 'Mencari Kerja', 'Sekolah', atau 'Mengurus Rumah Tangga'.`
      });
    }

    // --- LOGIC GATE 5: Balita ---
    if (has_balita === true && usia >= 5) {
      logValidasi.push({
        aspek: "DEMOGRAFI",
        status: "CRITICAL",
        pesan: "Konflik umur: Fitur kuesioner Balita ditandai aktif namun umur individu tercatat berusia >= 5 tahun."
      });
    } else if (usia >= 0 && usia <= 4 && has_balita === false) {
      logValidasi.push({
        aspek: "DEMOGRAFI",
        status: "WARNING",
        pesan: "Sistem mendeteksi adanya balita (umur 0-4 tahun) tetapi blok kuesioner balita dilewati oleh petugas."
      });
    }

    // Calculate status final
    const hasCritical = logValidasi.some(log => log.status === "CRITICAL");
    const hasWarning = logValidasi.some(log => log.status === "WARNING");
    const statusFinal = hasCritical ? "CRITICAL" : hasWarning ? "WARNING" : "CLEAN";

    // --- AI-Powered Auxiliary Audit insights via Gemini 3.5-flash ---
    let aiAdvice = "";
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });

        // Set prompt tailored to the BPS metadata
        const prompt = `Lakukan audit laporan penjaminan mutu data kuesioner BPS Pamekasan Maret 2025.
        Data Teknis Lapangan:
        - Kecamatan Code: ${mfd_code.slice(4, 7)}
        - Jenis Kuesioner: ${questionnaire_type}
        - Anggota RT: ${household_members} jiwa
        - Pengeluaran RT Sebulan: Rp${Number(monthly_expenditure).toLocaleString("id-ID")}
        - Pengeluaran per Kapita: Rp${pengeluaranPerkapita.toLocaleString("id-ID")}
        - Memiliki Aset Mewah: ${has_luxury_assets ? "Ya" : "Tidak"}
        - Status Anomali Terdeteksi: ${statusFinal}
        - Temuan Validasi Logika: ${JSON.stringify(logValidasi)}
        
        Garis Kemiskinan Acuan: Rp482.278,00 per kapita/bulan.
        Berikan nasehat ringkas (maksimal 2 kalimat terstruktur) bagi supervisor lapangan BPS (PML) mengenai apa yang harus dilakukan di lapangan.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt
        });

        aiAdvice = response.text || "";
      } catch (err: any) {
        aiAdvice = `Tautan API Gemini gagal: ${err.message}. Alternatif bantuan offline aktif.`;
      }
    } else {
      // Offline simulated guidance based on SSoT
      if (statusFinal === "CRITICAL") {
        aiAdvice = "Nasehat Offline PML: Koreksi data wajib dilakukan segara di kuesioner fisik. Silakan pastikan kebenaran input aset mewah dengan pengeluaran bulanan yang dilaporkan.";
      } else if (statusFinal === "WARNING") {
        aiAdvice = "Nasehat Offline PML: Rekomendasi warning membutuhkan pencantuman remark tertulis dari PCL. Selesaikan isian catatan sebelum mengekspor kuesioner.";
      } else {
        aiAdvice = "Nasehat Offline PML: Data dinilai konsisten dan memenuhi standar zero-error. Diizinkan untuk ditautkan langsung ke database server pusat.";
      }
    }

    return NextResponse.json({
      status_final: statusFinal,
      logs: logValidasi,
      ip: clientIp,
      metrics: {
        total_expenditure: Number(monthly_expenditure),
        household_members: Number(household_members),
        per_capita_expenditure: Math.round(pengeluaranPerkapita),
        poverty_line: GARIS_KEMISKINAN_2025,
        household_poverty_floor: AMBANG_BATAS_PENGELUARAN_RT,
        deviation_percentage: (((pengeluaranPerkapita - GARIS_KEMISKINAN_2025) / GARIS_KEMISKINAN_2025) * 100).toFixed(2)
      },
      ai_insights: aiAdvice.trim()
    });

  } catch (globalError: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: globalError.message },
      { status: 500 }
    );
  }
}
