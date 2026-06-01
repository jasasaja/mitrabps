"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "./theme-provider";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Terminal,
  ShieldCheck,
  CreditCard,
  Layers,
  Database,
  Cpu,
  Coins,
  Users,
  Clock,
  Sparkles,
  MapPin,
  Activity,
  FileText,
  Check,
  Lock,
  RefreshCw,
  Sliders,
  AlertCircle,
  Sun,
  Moon
} from "lucide-react";

// Official Pamekasan Kecamatan reference map
const KEC_LIST = [
  { code: "010", name: "Tlanakan", villages: ["Tlanakan", "Branta Tinggi", "Branta Pesisir"] },
  { code: "020", name: "Pademawu", villages: ["Buddih", "Pademawu Timur", "Pademawu Barat", "Sentol", "Bunder"] },
  { code: "030", name: "Galis", villages: ["Galis", "Konang", "Tobungan"] },
  { code: "040", name: "Pamekasan", villages: ["Kowel", "Gladak Anyar", "Kolpajung", "Bugih"] },
  { code: "050", name: "Proppo", villages: ["Proppo", "Klampar", "Candi Burung"] },
  { code: "060", name: "Palenggaan", villages: ["Palenggaan Dajah", "Palenggaan Laok"] },
  { code: "070", name: "Pegantenan", villages: ["Pegantenan", "Plakpak", "Bulangan"] },
  { code: "080", name: "Larangan", villages: ["Larangan Dalam", "Larangan Tokol"] },
  { code: "090", name: "Pakong", villages: ["Pakong", "Bandungan", "Klampis"] },
  { code: "100", name: "Waru", villages: ["Waru Barat", "Waru Timur", "Sana Tengah"] },
  { code: "110", name: "Batu Marmar", villages: ["Batu Marmar", "Tamberu", "Lesong Daya"] },
  { code: "120", name: "Kadur", villages: ["Kertagena Dajah", "Kadur", "Pamoloan", "Gagah"] },
  { code: "130", name: "Pasean", villages: ["Sotobas", "Pasean", "Tlontor Raja"] }
];

// Official BPS Pamekasan March 2025 poverty line constant
const GARIS_KEMISKINAN_2025 = 482278;

export default function Home() {
  const [activeTab, setActiveTab] = useState<"audit" | "qa" | "upstash" | "xendit" | "pdp">("audit");
  const { theme, toggleTheme: contextToggleTheme } = useTheme();

  const toggleTheme = () => {
    contextToggleTheme();
    triggerToast(`Mode ${theme === "light" ? "Gelap" : "Terang"} diaktifkan`, "info");
  };
  
  // Shared state simulation variables
  const [tenantTier, setTenantTier] = useState<"FREE" | "PRO">("FREE");
  const [apiCallCount, setApiCallCount] = useState<number>(0);
  const [tokenExpiredSeconds, setTokenExpiredSeconds] = useState<number>(86400);
  const [resetEpoch, setResetEpoch] = useState<number>(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResetEpoch(Date.now() + tokenExpiredSeconds * 1000);
  }, [tokenExpiredSeconds, apiCallCount]);

  const [show429Modal, setShow429Modal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info", text: string } | null>(null);
  
  // Tab 1: Live Input form simulation values
  const [mfdKec, setMfdKec] = useState<string>("020");
  const [mfdDesaInput, setMfdDesaInput] = useState<string>("Buddih");
  const [questionnaireType, setQuestionnaireType] = useState<string>("SUSENAS_KOR");
  const [krtCount, setKrtCount] = useState<number>(1);
  const [spouseGenderConflict, setSpouseGenderConflict] = useState<boolean>(false);
  const [maritalAgeCheck, setMaritalAgeCheck] = useState<number>(24);
  const [maritalStatus, setMaritalStatus] = useState<number>(2); // 2 = Married
  const [floorMaterial, setFloorMaterial] = useState<string>("Keramik");
  const [wallMaterial, setWallMaterial] = useState<string>("Tembok");
  const [monthlyExpenditure, setMonthlyExpenditure] = useState<number>(2500000);
  const [householdMembers, setHouseholdMembers] = useState<number>(4);
  const [hasLuxuryAssets, setHasLuxuryAssets] = useState<boolean>(false);
  const [schoolingStatus, setSchoolingStatus] = useState<number>(2); // 2 = Still in school
  const [kegUtamaBekerja, setKegUtamaBekerja] = useState<boolean>(true);
  const [workingHours, setWorkingHours] = useState<number>(40);
  const [hasBalita, setHasBalita] = useState<boolean>(false);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  
  // Audit Result State
  const [auditResult, setAuditResult] = useState<any | null>(null);

  // QA Slider State variables (Simulated Dashboard metrics)
  const [qaTotalCacah, setQaTotalCacah] = useState<number>(420);
  const [qaWarningCount, setQaWarningCount] = useState<number>(12);
  const [qaCriticalCount, setQaCriticalCount] = useState<number>(0);
  const [qaAverageVelocity, setQaAverageVelocity] = useState<number>(34.2); // minutes per household
  const [qaUnresolvedCritical, setQaUnresolvedCritical] = useState<number>(0);

  // Webhook Simulator States
  const [xenditPaymentId, setXenditPaymentId] = useState<string>("xnd_pay_90831093122");
  const [xenditReferenceId, setXenditReferenceId] = useState<string>("tenant-742a-993d-bfdb");
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState<boolean>(false);
  const [webhookLogs, setWebhookLogs] = useState<{ database: string[], redis: string[] } | null>(null);

  // UU PDP Signed Consent state
  const [pdpConsentAccepted, setPdpConsentAccepted] = useState<boolean>(false);

  // Helper trigger inline notification toasts
  const triggerToast = (text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Run the real Next.js API logic consistency checker
  const handleRunAudit = async () => {
    // 1. Quota Gate check under sliding window simulation
    const quotaCap = tenantTier === "FREE" ? 5 : 500;
    if (apiCallCount >= quotaCap) {
      setShow429Modal(true);
      triggerToast("Batas limitasi kuota harian tercapai! (HTTP 429)", "error");
      return;
    }

    setIsAuditing(true);
    setAuditResult(null);

    // Increment simulated Redis api call counter
    setApiCallCount(prev => prev + 1);

    // Build the strict structured input payload matching standard schemas
    const parsedMfdCode = `3528${mfdKec}001`; // Prov (35) + Kab (28) + Kec (3 chars) + Desa (001)
    const payload = {
      mfd_code: parsedMfdCode,
      census_block: "010B",
      questionnaire_type: questionnaireType,
      household_id: `HH-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      relationship_to_krt: krtCount > 1 ? 1 : 1, // KRT definition
      member_gender: "L", // Default head is male for gender test
      member_age: maritalAgeCheck,
      monthly_expenditure: monthlyExpenditure,
      household_members: householdMembers,
      has_luxury_assets: hasLuxuryAssets,
      st_kawin: maritalStatus,
      schooling_status: schoolingStatus,
      keg_utama: kegUtamaBekerja ? 1 : 3, // Bekerja vs Sekolah
      jam_kerja: workingHours,
      has_balita: hasBalita,
      desa_name_input: mfdDesaInput
    };

    try {
      const response = await fetch("/api/audit-kuesioner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        triggerToast(data.error || "Gagal memproses audit.", "error");
        setAuditResult({
          status_final: "CRITICAL",
          logs: [{ aspek: "SISTEM", status: "CRITICAL", pesan: data.error || "Kegagalan Validasi Internal" }],
          ai_insights: "Periksa kembali input data kuesioner Anda untuk memperbaiki struktur data."
        });
      } else {
        setAuditResult(data);
        if (data.status_final === "CRITICAL") {
          triggerToast("Peringatan: Ditemukan anomali kritis pada kuesioner!", "error");
        } else if (data.status_final === "WARNING") {
          triggerToast("Deteksi anomali ringan: Butuh verifikasi supervisor.", "info");
        } else {
          triggerToast("Sempurna! Data kuesioner lolos uji konsistensi.", "success");
        }
      }
    } catch {
      triggerToast("Koneksi API terputus. Silakan coba sesaat lagi.", "error");
    } finally {
      setIsAuditing(false);
    }
  };

  // Run Xendit Upstream Webhook simulator and lock testing
  const triggerXenditUpgrade = async () => {
    setIsSimulatingWebhook(true);
    setWebhookLogs(null);
    try {
      const payload = {
        id: xenditPaymentId,
        event: "invoice.paid",
        status: "COMPLETED",
        data: {
          id: xenditPaymentId,
          reference_id: xenditReferenceId,
          status: "SUCCESS"
        }
      };

      const response = await fetch("/api/webhooks/xendit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-callback-token": "DEFAULT_JASASAJA_XENDIT_TOKEN_2025" // Matches simulated fallback token
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        setTenantTier("PRO");
        setApiCallCount(0); // Instantly invalidate Redis cache, fresh quota of 500 reset
        setWebhookLogs(data.transaction_logs);
        triggerToast("Upgrade Tier Sukses! Akun beralih ke PRO (500 audits/hari).", "success");
      } else {
        triggerToast(data.error || "Webhook upgrade gagal.", "error");
      }
    } catch {
      triggerToast("Gagal menautkan webhook Xendit.", "error");
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  // Simulated metrics formulas (AR, CV, DCI)
  const simulatedAR = ((qaWarningCount + qaCriticalCount) / qaTotalCacah) * 100;
  const simulatedDCI = (1 - (qaUnresolvedCritical / (qaTotalCacah || 1))) * 100;
  const isVelocityBad = qaAverageVelocity < 15;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-12" id="main-container">
      
      {/* Brand Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 gap-4" id="brand-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-mono rounded tracking-widest font-bold">PT MEMORY GROUPS SEJAHTERA</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-transparent dark:border-emerald-800/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Auditor Active
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100" id="site-title">
            JASASAJA <span className="font-light text-slate-500 dark:text-slate-400">SaaS Suite</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-1">
            Portal Penjaminan Mutu, Pengawasan Konsistensi Logika, & Kepatuhan Legal Statistik BPS Republik Indonesia (Spesifikasi Kabupaten Pamekasan 2025).
          </p>
        </div>

        {/* Action Controls & Live Tenant Status Overview */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Dynamic Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
            id="theme-toggle-button"
            title="Toggle Light/Dark Theme"
          >
            {theme === "light" ? (
              <>
                <Moon className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                <span>Mode Gelap</span>
              </>
            ) : (
              <>
                <Sun className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <span>Mode Terang</span>
              </>
            )}
          </button>

          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 min-w-[280px]" id="tenant-status">
            <div className="h-10 w-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900" id="tenant-logo">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tenant ID: {xenditReferenceId.slice(0, 11)}...</span>
                <span className={`px-2 py-0.2 text-[10px] uppercase font-bold rounded ${tenantTier === "PRO" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"}`}>
                  {tenantTier} Tier
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Sabrun Jamil (Lead Mitra)</p>
              {/* Limit Counter progress indicator */}
              <div className="mt-1.5">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                  <span>Kuota Audit: {apiCallCount} / {tenantTier === "FREE" ? 5 : 500}</span>
                  <span>Reset: {tenantTier === "FREE" ? "24 Jam" : "Instan via Cloud"}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${apiCallCount >= (tenantTier === "FREE" ? 5 : 500) ? "bg-rose-500" : "bg-slate-900 dark:bg-slate-100"}`} 
                    style={{ width: `${Math.min(100, (apiCallCount / (tenantTier === "FREE" ? 5 : 500)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global SSoT Parameters Indicator Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="ssot-parameters">
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs" id="poverty-line-box">
          <span className="text-xs text-slate-400 dark:text-slate-550 font-medium uppercase tracking-wider block">Garis Kemiskinan Maret 2025</span>
          <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100 block mt-1">Rp482.278,00</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Kabupaten Pamekasan per kapita/bulan</span>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs" id="household-line-box">
          <span className="text-xs text-slate-400 dark:text-slate-550 font-medium uppercase tracking-wider block">Uji Batas Khusus Keluarga</span>
          <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100 block mt-1">Rp2.184.719,34</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Rata-rata 4,53 ART Miskin Kabupaten</span>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs" id="tpt-box">
          <span className="text-xs text-slate-400 dark:text-slate-550 font-medium uppercase tracking-wider block">Tingkat Pengangguran Terbuka</span>
          <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100 block mt-1">1,33%</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Indikator Ketenagakerjaan Pamekasan 2025</span>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs" id="legal-box">
          <span className="text-xs text-slate-400 dark:text-slate-550 font-medium uppercase tracking-wider block">Peran Hukum UU PDP</span>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100 block mt-1">DATA PROCESSOR</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">PT Memory Groups Sejahtera (JASASAJA)</span>
        </div>
      </div>

      {/* Primary Dashboard Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto whitespace-nowrap flex" id="tab-navigation">
        <button
          onClick={() => setActiveTab("audit")}
          className={`py-3 px-5 border-b-2 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${activeTab === "audit" ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}
          id="btn-tab-audit"
        >
          <Cpu className="h-4 w-4" />
          Gerbang Konsistensi Logika (Audit)
        </button>
        <button
          onClick={() => setActiveTab("qa")}
          className={`py-3 px-5 border-b-2 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${activeTab === "qa" ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}
          id="btn-tab-qa"
        >
          <Activity className="h-4 w-4" />
          Kinerja QA & Evaluasi BPS
        </button>
        <button
          onClick={() => setActiveTab("upstash")}
          className={`py-3 px-5 border-b-2 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${activeTab === "upstash" ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}
          id="btn-tab-upstash"
        >
          <Database className="h-4 w-4" />
          Upstash Gateway Rates
        </button>
        <button
          onClick={() => setActiveTab("xendit")}
          className={`py-3 px-5 border-b-2 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${activeTab === "xendit" ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}
          id="btn-tab-xendit"
        >
          <CreditCard className="h-4 w-4" />
          Billing Xendit Webhook
        </button>
        <button
          onClick={() => setActiveTab("pdp")}
          className={`py-3 px-5 border-b-2 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer ${activeTab === "pdp" ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100 font-semibold" : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"}`}
          id="btn-tab-pdp"
        >
          <ShieldCheck className="h-4 w-4" />
          Regulasi Hukum & UU PDP
        </button>
      </div>

      {/* Tabs Container */}
      <div className="min-h-[500px]" id="tab-content-container">

        {/* Tab 1: Gerbang Konsistensi Logika */}
        {activeTab === "audit" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            id="panel-audit"
          >
            {/* Input Config Form Column */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs" id="audit-form-col">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-500" />
                Input Dokumen Kuesioner Lapangan (Susenas/Sakernas)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Pilih Jenis Survei</label>
                  <select 
                    value={questionnaireType} 
                    onChange={(e) => setQuestionnaireType(e.target.value)} 
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-950 dark:text-slate-100 font-medium text-sm"
                  >
                    <option value="SUSENAS_KOR">Susenas Kor (VSEN.K)</option>
                    <option value="SUSENAS_KONSUMSI">Susenas Konsumsi (VSEN.M)</option>
                    <option value="SAKERNAS">Sakernas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Blok Sensus & Sampel No.</label>
                  <input 
                    type="text" 
                    disabled 
                    value="010B-RT441" 
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 dark:text-slate-400 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Sub-Header: Geofencing & Wilayah */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 mb-3 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  Kecocokan Wilayah (Master File Desa & Geofencing)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-550 block mb-1">Kecamatan (Geofenced)</label>
                    <select 
                      value={mfdKec} 
                      onChange={(e) => {
                        setMfdKec(e.target.value);
                        // Setup automatic valid village helper to avoid frustration
                        const targetKec = KEC_LIST.find(k => k.code === e.target.value);
                        if (targetKec && targetKec.villages.length > 0) {
                           setMfdDesaInput(targetKec.villages[0]);
                        }
                      }} 
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-950 dark:text-slate-100 text-sm"
                    >
                      {KEC_LIST.map(kec => (
                        <option key={kec.code} value={kec.code}>{kec.code} - {kec.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-555 block mb-1">Input Nama Desa (Menilai Levenshtein)</label>
                    <input 
                      type="text" 
                      value={mfdDesaInput} 
                      onChange={(e) => setMfdDesaInput(e.target.value)} 
                      placeholder="Contoh: Buddih, Kertagena Dajah"
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm bg-white dark:bg-slate-950 dark:text-slate-100"
                      id="input-desa"
                    />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">
                      Kode MFD Terbentuk: 3528{mfdKec}001
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Header: Demografi & Kependudukan */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 mb-3 flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  Profil Responden & Kependudukan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-550 block mb-1">Jumlah Kepala Keluarga (KRT)</label>
                    <input 
                      type="number" 
                      value={krtCount} 
                      onChange={(e) => setKrtCount(Math.max(1, Number(e.target.value)))} 
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm bg-white dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-550 block mb-1">Umur Individu</label>
                    <input 
                      type="number" 
                      value={maritalAgeCheck} 
                      onChange={(e) => setMaritalAgeCheck(Math.max(0, Number(e.target.value)))} 
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm bg-white dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-550 block mb-1">Status Perkawinan</label>
                    <select 
                      value={maritalStatus} 
                      onChange={(e) => setMaritalStatus(Number(e.target.value))} 
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-950 dark:text-slate-100 text-sm"
                    >
                      <option value={1}>1 - Belum Kawin</option>
                      <option value={2}>2 - Kawin</option>
                      <option value={3}>3 - Cerai Hidup</option>
                      <option value={4}>4 - Cerai Mati</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-Header: Sosio-Ekonomi */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 mb-3 flex items-center gap-1">
                  <Coins className="h-4 w-4 text-emerald-500" />
                  Dimensi Sosio-Ekonomi & Pengeluaran
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-550 block mb-1">Keluarga (ART) Jumlah</label>
                    <input 
                      type="number" 
                      value={householdMembers} 
                      onChange={(e) => setHouseholdMembers(Math.max(1, Number(e.target.value)))} 
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm bg-white dark:bg-slate-950 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-550 block mb-1">Total Pengeluaran Rumah Tangga</label>
                    <input 
                      type="number" 
                      value={monthlyExpenditure} 
                      onChange={(e) => setMonthlyExpenditure(Math.max(0, Number(e.target.value)))} 
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm bg-white dark:bg-slate-950 dark:text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-550 block mb-1">Garis Kemiskinan Proyektif</label>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg p-2 text-sm font-mono text-center">
                      Rp{(householdMembers * GARIS_KEMISKINAN_2025).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="chk-luxury-assets" 
                      checked={hasLuxuryAssets} 
                      onChange={(e) => setHasLuxuryAssets(e.target.checked)} 
                      className="h-4 w-4 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-705 rounded"
                    />
                    <label htmlFor="chk-luxury-assets" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Rumah tangga memiliki Aset Mewah (AC, Mobil, atau Laptop)
                    </label>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-2 py-0.5 rounded">
                    Socio Warning Gate
                  </span>
                </div>
              </div>

              {/* Sub-Header: Pendidikan & Ketenagakerjaan */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 mb-3 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Pendidikan & Ketenagakerjaan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3 rounded-xl justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="chk-keg-bekerja" 
                        checked={kegUtamaBekerja} 
                        onChange={(e) => {
                          setKegUtamaBekerja(e.target.checked);
                          if (!e.target.checked) setWorkingHours(0);
                        }} 
                        className="h-4 w-4 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-705 rounded"
                      />
                      <label htmlFor="chk-keg-bekerja" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Status Utama: Bekerja (Seminggu Lalu)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-550 block mb-1">Total Jam Kerja Sepekan</label>
                    <input 
                      type="number" 
                      disabled={!kegUtamaBekerja}
                      value={workingHours} 
                      onChange={(e) => setWorkingHours(Math.max(0, Number(e.target.value)))} 
                      className={`w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm bg-white dark:bg-slate-950 dark:text-slate-100 font-mono ${!kegUtamaBekerja ? "bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed" : ""}`}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="chk-balita" 
                    checked={hasBalita} 
                    onChange={(e) => setHasBalita(e.target.checked)} 
                    className="h-4 w-4 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-705 rounded"
                  />
                  <div className="text-sm">
                    <label htmlFor="chk-balita" className="font-medium text-slate-700 dark:text-slate-300 block">
                      Terdapat Balita (0-4 Tahun) di Rumah Tangga
                    </label>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Mewajibkan isian akta lahir dan kartu imunisasi balita aktif.</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2" id="submit-actions">
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="flex-1 bg-slate-950 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950 font-bold hover:bg-slate-800 text-white rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
                  id="btn-run-audit"
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Mengekstraksi & Menganalisis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 text-amber-300 dark:text-indigo-600" />
                      Jalankan Audit Konsistensi Logika
                    </>
                  )}
                </button>

                <button 
                  onClick={() => {
                    // Pre-fill valid clean data
                    setKrtCount(1);
                    setMfdDesaInput("Buddih");
                    setMfdKec("020");
                    setMaritalAgeCheck(35);
                    setMaritalStatus(2); // Married (kawin)
                    setHouseholdMembers(5);
                    setMonthlyExpenditure(3000000); // 3m / 5 rt = 600k per capita (above 482k)
                    setHasLuxuryAssets(true); // AC is logical here
                    setKegUtamaBekerja(true);
                    setWorkingHours(40);
                    setHasBalita(false);
                    triggerToast("Dokumen diisi dengan Profil Susenas BERSIH (CLEAN). Ready to audit.", "info");
                  }}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl py-3 px-4 text-sm cursor-pointer"
                  id="btn-load-clean-vsen"
                >
                  Load Clean Profile
                </button>
                
                <button 
                  onClick={() => {
                    // Pre-fill anomaly critical values
                    setKrtCount(2); // CRITICAL
                    setMfdDesaInput("Kertagne"); // Wrong Levenshtein
                    setMfdKec("120");
                    setMaritalAgeCheck(12); // Underage marriage (WARNING)
                    setMaritalStatus(2);
                    setHouseholdMembers(5);
                    setMonthlyExpenditure(1200000); // 240k per capita (extremely poor)
                    setHasLuxuryAssets(true); // AC/Mobil with 240k! (CRITICAL)
                    setKegUtamaBekerja(true);
                    setWorkingHours(0); // Bekerja but 0 hours! (CRITICAL)
                    setHasBalita(false);
                    triggerToast("Dokumen diisi dengan Profil VSEN ANOMALI KRITIS. Ready to audit.", "info");
                  }}
                  className="bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400 font-bold border border-red-200 dark:border-red-900/40 rounded-xl py-3 px-4 text-sm cursor-pointer"
                  id="btn-load-dirty-vsen"
                >
                  Load Dirty Profile
                </button>
              </div>
            </div>

            {/* Results Terminal Column */}
            <div className="lg:col-span-5 flex flex-col gap-6" id="audit-results-col">
              
              {/* Header result Status Box */}
              <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-6 flex flex-col justify-between border border-transparent dark:border-slate-800" id="status-box">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase block">Evaluasi Status Terakhir</span>
                  <div className="flex items-center gap-3 mt-2" id="status-display">
                    {auditResult ? (
                      <>
                        {auditResult.status_final === "CLEAN" && (
                          <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                        {auditResult.status_final === "WARNING" && (
                          <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                        )}
                        {auditResult.status_final === "CRITICAL" && (
                          <div className="h-10 w-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
                            <XCircle className="h-5 w-5" />
                          </div>
                        )}
                        <span className={`text-2xl font-black ${auditResult.status_final === 'CLEAN' ? 'text-emerald-400' : auditResult.status_final === 'WARNING' ? 'text-amber-400' : 'text-rose-400'}`}>
                          {auditResult.status_final}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                          <Activity className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold text-slate-400">Belum Ada Sesi</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block mt-2">
                    Laporan diproses di Next.js Edge Runtime (Simulated PostgreSQL pool). IP: {auditResult?.ip || "127.0.0.1"}
                  </span>
                </div>
                
                {/* Visual meter for poverty or deviation */}
                {auditResult && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Rincian Keuangan RT Kuesioner:</span>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Rata-Rata Anggota: Rp{auditResult.metrics?.per_capita_expenditure?.toLocaleString("id-ID")}/bulan</span>
                      <span className={Number(auditResult.metrics?.deviation_percentage) < 0 ? "text-rose-400" : "text-emerald-400"}>
                        {auditResult.metrics?.deviation_percentage}% {Number(auditResult.metrics?.deviation_percentage) < 0 ? "Dibawah GK BPS font-semibold" : "Diatas GK BPS font-semibold"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Logs Terminal Card */}
              <div className="bg-slate-950 text-slate-300 font-mono text-xs rounded-2xl p-6 flex flex-col flex-1 border border-slate-800 shadow-xl" id="validation-logs-box">
                <span className="text-amber-400 uppercase text-[10px] font-bold tracking-widest mb-3 flex items-center gap-1">
                  <Terminal className="h-4 w-4" />
                  Daftar Temuan Validasi Logika BPS
                </span>

                <div className="flex-1 overflow-y-auto max-h-[220px] scrollbar-thin scrollbar-thumb-slate-800 pr-1 space-y-3" id="validation-logs-content">
                  {auditResult ? (
                    auditResult.logs && auditResult.logs.length > 0 ? (
                      auditResult.logs.map((log: any, idx: number) => (
                        <div key={idx} className={`p-2.5 rounded border ${log.status === 'CRITICAL' ? 'bg-rose-950/40 border-rose-900/60 text-rose-300' : 'bg-amber-950/40 border-amber-900/60 text-amber-300'}`}>
                          <div className="flex items-center gap-1.5 font-bold mb-1">
                            {log.status === "CRITICAL" ? <XCircle className="h-3.5 w-3.5 text-rose-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                            <span>[{log.aspek}] - {log.status}</span>
                          </div>
                          <p className="text-[11px] font-mono tracking-tight leading-relaxed">{log.pesan}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 p-3 rounded flex items-start gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">STATUS_OK: CLEAN</p>
                          <p className="text-[11px] mt-0.5">Seluruh 7 Pilar Konsistensi Logika BPS terpenuhi tanpa anomali. Dokumen legal untuk diunggah kuesioner.</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-slate-500 text-center py-12">
                      &gt;_ Menunggu kuesioner dijalankan untuk melihat audit dan temuan spanduk lapangan...
                    </div>
                  )}
                </div>
              </div>

              {/* Server-Side Generative AI (Gemini 3.5-flash) Audit Engine Response Card */}
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900/40 dark:to-indigo-950/15 border border-indigo-100 dark:border-indigo-950/50 rounded-2xl p-6 shadow-sm relative overflow-hidden" id="gemini-ai-card">
                <div className="absolute right-0 top-0 h-16 w-16 opacity-10 dark:opacity-20 bg-indigo-500 rounded-full blur-xl"></div>
                <div className="flex items-center gap-1.5 mb-3 text-indigo-800 dark:text-indigo-400 font-bold" id="ai-auditor-header">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-900 dark:text-indigo-300">AI-Powered Audit Insights (Gemini 3.5)</span>
                </div>
                
                {auditResult ? (
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium italic">
                    &ldquo;{auditResult.ai_insights}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    Sistem akan memicu penjelajahan audit cerdas dari server PT Memory Groups Sejahtera yang ditenagai oleh model AI Google Studio setelah verifikasi didorong.
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold uppercase font-mono">
                  <span>Model: gemini-3.5-flash</span>
                  <span>Ground truth locked</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Tab 2: Kinerja QA & Evaluasi BPS */}
        {activeTab === "qa" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            id="panel-qa"
          >
            {/* Interactive sliders for auditing simulations */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs" id="qa-simulator-col">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Sliders className="h-5 w-5 text-slate-500" />
                Parameter Kinerja Lapangan BPS
              </h2>

              <div className="space-y-6" id="sliders-controls">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    <span>Total Kuesioner Terisi</span>
                    <span className="font-mono text-slate-800 dark:text-slate-100">{qaTotalCacah} Dokumen</span>
                  </div>
                  <input 
                    type="range" min={10} max={1000} step={10}
                    value={qaTotalCacah} 
                    onChange={(e) => setQaTotalCacah(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    <span>Kasus Logika Ringan (Warning)</span>
                    <span className="font-mono text-slate-800 dark:text-amber-400 text-amber-600">{qaWarningCount} Kasus</span>
                  </div>
                  <input 
                    type="range" min={0} max={100} step={1}
                    value={qaWarningCount} 
                    onChange={(e) => setQaWarningCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    <span>Kasus Logika Berat (Critical)</span>
                    <span className="font-mono text-slate-800 dark:text-rose-400 text-rose-600">{qaCriticalCount} Kasus</span>
                  </div>
                  <input 
                    type="range" min={0} max={50} step={1}
                    value={qaCriticalCount} 
                    onChange={(e) => setQaCriticalCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    <span>Unresolved Critical (DCI metric)</span>
                    <span className="font-mono text-slate-800 dark:text-red-400 text-red-700">{qaUnresolvedCritical} Kasus</span>
                  </div>
                  <input 
                    type="range" min={0} max={qaCriticalCount} step={1}
                    value={qaUnresolvedCritical} 
                    onChange={(e) => setQaUnresolvedCritical(Math.min(qaCriticalCount, Number(e.target.value)))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    <span>Kecepatan Cacah (Completion Velocity)</span>
                    <span className={`font-mono font-bold ${isVelocityBad ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {qaAverageVelocity} Menit/RT
                    </span>
                  </div>
                  <input 
                    type="range" min={5} max={60} step={0.5}
                    value={qaAverageVelocity} 
                    onChange={(e) => setQaAverageVelocity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  {isVelocityBad && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 block font-semibold animate-pulse leading-snug">
                      Peringatan: Kecepatan &lt; 15 menit/RT teridentifikasi otomatis oleh sistem JASASAJA sebagai kecurigaan manipulasi data / data fiktif (re-audit dipaksa).
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => {
                      setQaTotalCacah(420);
                      setQaWarningCount(12);
                      setQaCriticalCount(0);
                      setQaAverageVelocity(34.2);
                      setQaUnresolvedCritical(0);
                      triggerToast("Indikator disetel ulang ke profil Kabupaten Pamekasan standard.", "info");
                    }}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg py-2 cursor-pointer transition-all"
                    id="btn-baseline-pamekasan"
                  >
                    Reset Ke Pamekasan Baseline
                  </button>
                </div>
              </div>
            </div>

            {/* QA Formula and Graphs Column */}
            <div className="lg:col-span-8 flex flex-col gap-6" id="qa-formula-col">
              
              {/* Formula and Live KPI cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="qa-kpis">
                
                {/* KPI Card 1: AR */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs" id="ar-kpi">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">System Anomaly Rate (AR)</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                      {simulatedAR.toFixed(2)}%
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${simulatedAR < 5.0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.2 rounded" : "text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.2 rounded"}`}>
                      {simulatedAR < 5.0 ? "SLA Pas" : "SLA Gagal"}
                    </span>
                  </div>
                  
                  {/* LaTeX representation block */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 font-mono text-[9px] text-slate-500 rounded p-2.5 mt-3 border border-slate-100 dark:border-slate-800/60 leading-snug">
                    <p className="font-semibold text-slate-700 dark:text-slate-350 font-sans mb-1">Target BPS: &lt; 5.00%</p>
                    <code className="text-slate-800 dark:text-slate-300">
                      {"AR = \\Sigma(Warning + Critical) / Total_Kuesioner \\times 100%"}
                    </code>
                  </div>
                </div>

                {/* KPI Card 2: CV */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs" id="cv-kpi">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550 block tracking-wider">Completion Velocity (CV)</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                      {qaAverageVelocity}m
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${isVelocityBad ? "text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.2 rounded" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.2 rounded"}`}>
                      {isVelocityBad ? "RE-AUDIT" : "NORMAL"}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-950/60 font-mono text-[9px] text-slate-500 rounded p-2.5 mt-3 border border-slate-100 dark:border-slate-800/60 leading-snug">
                    <p className="font-semibold text-slate-700 dark:text-slate-350 font-sans mb-1">Wajar: 30 - 45 menit / RT</p>
                    <p className="text-[10px] font-sans text-slate-700 dark:text-slate-400 leading-tight">
                      Mencegah fabrikasi data kuesioner. Kecepatan abnormal &lt;15m memicu autolock.
                    </p>
                  </div>
                </div>

                {/* KPI Card 3: DCI */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs" id="dci-kpi">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550 block tracking-wider">Data Cleansing Index (DCI)</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                      {simulatedDCI.toFixed(2)}%
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${simulatedDCI === 100.0 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.2 rounded" : "text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.2 rounded"}`}>
                      {simulatedDCI === 100.0 ? "Prestasi Unggul" : "Pending"}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-950/60 font-mono text-[9px] text-slate-500 rounded p-2.5 mt-3 border border-slate-100 dark:border-slate-800/60 leading-snug">
                    <p className="font-semibold text-slate-700 dark:text-slate-350 font-sans mb-1">Target Mutlak: 100%</p>
                    <code className="text-slate-800 dark:text-slate-300">
                      {"DCI = (1 - (Unresolved_Critical / Total_Entries)) \\times 100%"}
                    </code>
                  </div>
                </div>

              </div>

              {/* Relative Standard Error Gate Visualizer */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs" id="rse-visualizer">
                <h3 className="text-sm uppercase tracking-wider font-extrabold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-500" />
                  RSE Gate: Klasifikasi Kualitas Pengiriman Basis Data
                </h3>

                {/* Calculation math description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Berdasarkan standardisasi simpangan baku deviasi data mikro se-kabupaten terhadap tren Garis Kemiskinan daerah, JASASAJA secara dinamis mengevaluasi estimasi penyebaran tingkat Relative Standard Error (RSE) data klaster:
                </p>

                {/* Visual meter representation */}
                <div className="grid grid-cols-3 gap-3 mb-6 font-mono text-center text-xs">
                  
                  {/* Gate 1 */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${simulatedAR <= 3.0 ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-400'}`}>
                    <span className="font-bold text-sm">RSE &le; 25%</span>
                    <span className="font-sans text-xs uppercase tracking-wider font-extrabold block mt-2">AKURAT & BERSIH</span>
                    <p className="text-[10px] font-sans mt-2 opacity-80 leading-normal">Diizinkan langsung dikirim se-Indonesia ke Server Utama.</p>
                  </div>

                  {/* Gate 2 */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${simulatedAR > 3.0 && simulatedAR <= 8.5 ? 'bg-amber-50/70 border-amber-300 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-400'}`}>
                    <span className="font-bold text-sm">25% &lt; RSE &le; 50%</span>
                    <span className="font-sans text-xs uppercase tracking-wider font-extrabold block mt-2">HIGH WARNING</span>
                    <p className="text-[10px] font-sans mt-2 opacity-80 leading-normal">Komponen input mata uang ditandai, supervisor diwajibkan cek.</p>
                  </div>

                  {/* Gate 3 */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${simulatedAR > 8.5 ? 'bg-rose-50/70 border-rose-300 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-400'}`}>
                    <span className="font-bold text-sm">RSE &gt; 50%</span>
                    <span className="font-sans text-xs uppercase tracking-wider font-extrabold block mt-2">SISTEM TERKUNCI</span>
                    <p className="text-[10px] font-sans mt-2 opacity-80 leading-normal">Dilarang kirim! Memaksa pencacahan ulang pada klaster sampel.</p>
                  </div>

                </div>

                <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 font-mono text-[11px] p-4 rounded-xl border border-transparent dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>STATUS IMPLEMENTASI RSE GEOFENCE GATE</span>
                  </div>
                  <p>Evaluasi Terakhir: {simulatedAR <= 3.0 ? "RSE ≤ 25% [EMERALD GATE OPEN]" : simulatedAR <= 8.5 ? "25% < RSE ≤ 50% [AMBER CHECKPOINT FORCE]" : "RSE > 50% [ROSE AUTOLOCK ACTIVE]"}</p>
                  <p>PCL Assignment Geofence: Kunci Lokasi Prefiks &quot;3528&quot; Kabupaten Pamekasan aktif dan dipindai se-Jawa Timur.</p>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Tab 3: Upstash Redis Gateway Rates */}
        {activeTab === "upstash" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            id="panel-upstash"
          >
            {/* Visual description and quota selectors */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="upstash-gate-col">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Sliding Window Counter Limiter
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Setiap pemanggilan API audit kuesioner disaring di Next.js Edge Runtime menggunakan Upstash Serverless Redis. Kuota kueri harian secara otomatis disinkronkan dengan tier tenant dinamis:
                </p>

                {/* Interactive tier change simulation */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 mb-6">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 block mb-2">Simulasikan Status Tier Tenant</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setTenantTier("FREE");
                        setApiCallCount(Math.min(5, apiCallCount));
                        triggerToast("Akun disimulasikan sebagai FREE Tier. Batas 5 per 24jam.", "info");
                      }}
                      className={`py-2 px-4 rounded-lg font-bold text-xs cursor-pointer transition-all border ${tenantTier === "FREE" ? "bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-950 dark:border-slate-100" : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800"}`}
                      id="btn-tier-free"
                    >
                      FREE Tier (Max 5)
                    </button>
                    <button
                      onClick={() => {
                        setTenantTier("PRO");
                        triggerToast("Akun disimulasikan sebagai PRO Tier. Batas 500 per 24jam.", "info");
                      }}
                      className={`py-2 px-4 rounded-lg font-bold text-xs cursor-pointer transition-all border ${tenantTier === "PRO" ? "bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-950 dark:border-slate-100" : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800"}`}
                      id="btn-tier-pro"
                    >
                      PRO Tier (Max 500)
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">FREE Tenant Redis Key:</span>
                    <code className="text-[10px] bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-neutral-800 dark:text-slate-300 font-mono">
                      @upstash/ratelimit:free:tenant:{xenditReferenceId.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">PRO Tenant Redis Key:</span>
                    <code className="text-[10px] bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-neutral-800 dark:text-slate-300 font-mono">
                      @upstash/ratelimit:pro:tenant:{xenditReferenceId.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Sliding Window Sizing:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">24 Jam (86400 detik)</span>
                  </div>
                </div>
              </div>

              {/* Interactive block calling click to trigger 429 */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6 space-y-3">
                <button
                  onClick={() => {
                    const quota = tenantTier === "FREE" ? 5 : 500;
                    setApiCallCount(quota); // Instantly spike to maximum
                    setShow429Modal(true);
                    triggerToast("Simulasi kuota habis: Counter dilompati ke batas limitasi maksimum.", "info");
                  }}
                  className="w-full bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-700 dark:text-rose-400 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer transition-all"
                  id="btn-trigger-429"
                >
                  Picu Kondisi Kuota Habis (Faktor 429)
                </button>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic">
                  Gunakan simulator Xendit pada tab billing untuk melihat bagaimana webhoook pembayaran memicu pembebasan kuota secara instan dengan menghapus cache.
                </p>
              </div>

            </div>

            {/* Simulated Edge response headers visualizer */}
            <div className="lg:col-span-7 flex flex-col gap-6" id="upstash-terminal-col">
              
              <div className="bg-slate-950 text-slate-300 font-mono text-xs rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col flex-1" id="redis-terminal">
                <h3 className="text-indigo-400 uppercase text-[10px] font-bold tracking-widest mb-4 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4" />
                  Sesi Respons Edge Router & Headers (HTTP 429 State)
                </h3>

                <p className="text-slate-400 text-[11px] mb-4 font-sans leading-relaxed">
                  Saat kuota tenant habis, API Route Gateway akan menolak pemrosesan kuesioner sejak di Edge Router dan menyuntikkan header standardisasi IETF mengenai pemulihan kuota:
                </p>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 mb-4" id="headers-block">
                  <div className="flex justify-between pb-1.5 border-b border-slate-800/80 font-mono text-[11px]">
                    <span className="text-indigo-400 font-bold">HTTP Status Code:</span>
                    <span className={apiCallCount >= (tenantTier === 'FREE' ? 5 : 500) ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                      {apiCallCount >= (tenantTier === 'FREE' ? 5 : 500) ? "429 Too Many Requests" : "200 OK"}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Content-Type:</span>
                    <span>application/json; charset=utf-8</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">X-RateLimit-Limit:</span>
                    <span>{tenantTier === "FREE" ? 5 : 500}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">X-RateLimit-Remaining:</span>
                    <span>{Math.max(0, (tenantTier === "FREE" ? 5 : 500) - apiCallCount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">X-RateLimit-Reset (Epoch ms):</span>
                    <span>{resetEpoch.toString()}</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 dark:bg-slate-950/40 border border-slate-850 dark:border-slate-850 p-3 rounded-lg text-[10px] text-slate-400 space-y-1 leading-relaxed font-sans">
                  <span className="text-slate-300 font-bold font-sans uppercase block mb-1">Mekanisme Mitigasi Client-Side:</span>
                  <div className="flex items-start gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Intersepsi UX:</strong> Aplikasi menangkap status HTTP 429, otomatis menonaktifkan tombol audit kuesioner dan memicu popup upgrade.</span>
                  </div>
                  <div className="flex items-start gap-1 mt-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Exponential Backoff:</strong> Pengiriman ulang asinkron non-interaktif ditunda bertahap sesuai nilai sisa reset.</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Tab 4: Billing Xendit Webhook */}
        {activeTab === "xendit" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            id="panel-xendit"
          >
            {/* Payment simulator config input */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="billing-config-col">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Xendit Payment Simulator Suite
                  </h2>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Saat enumerator menyelesaikan pembayaran Lisensi Musiman seharga Rp149.000,00 di portal Xendit (Virtual Account, QRIS atau Kartu), Xendit akan melayangkan callback webhook asinkron ke server JASASAJA.
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Xendit Payment ID (Unik / Idempotensi)</label>
                    <input 
                      type="text" 
                      value={xenditPaymentId} 
                      onChange={(e) => setXenditPaymentId(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">Reference ID (ID Tenant JASASAJA)</label>
                    <input 
                      type="text"
                      disabled
                      value={xenditReferenceId} 
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1">X-Callback-Token Pengaman</label>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg p-2 text-xs font-mono select-all">
                      DEFAULT_JASASAJA_XENDIT_TOKEN_2025
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 rounded-xl p-3 text-xs flex gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Sistem menjalankan query database atomik terenkapsulasi untuk mengonfirmasi status pembayaran, mencatatkan log idempotensi untuk mencegah double-upgrade, dan asinkron mengosongkan cache rate limit Upstash.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
                <button
                  onClick={triggerXenditUpgrade}
                  disabled={isSimulatingWebhook}
                  className="w-full bg-slate-950 dark:bg-slate-100 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98 disabled:opacity-50"
                  id="btn-simulate-webhook"
                >
                  {isSimulatingWebhook ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Mengonfirmasi Pembayaran & Lock...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Kirim Callback Webhook Xendit
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Tracing Logs column */}
            <div className="lg:col-span-7 flex flex-col gap-6" id="billing-logs-col">
              
              {/* Database and Redis cache invalidation logs terminal */}
              <div className="bg-slate-950 text-slate-300 font-mono text-[11px] rounded-2xl p-6 border border-slate-800 shadow-xl flex-1 flex flex-col" id="billing-terminal">
                <h3 className="text-emerald-400 uppercase text-[10px] font-bold tracking-widest mb-4 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4" />
                  Sesi Tracer / Database Pessimistic Row Lock Logs
                </h3>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-[380px] scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                  {webhookLogs ? (
                    <>
                      <div>
                        <span className="text-indigo-400 font-bold block mb-1.5">{"// NEONDB PostgreSQL Operations Logs (Single Transaction Mode):"}</span>
                        <div className="bg-slate-900 dark:bg-slate-900/60 border border-slate-900 dark:border-slate-800 p-3 rounded-lg space-y-1 block max-h-[140px] overflow-y-auto">
                          {webhookLogs.database.map((log, idx) => (
                            <p key={idx} className="text-slate-300">
                              <span className="text-slate-500">{`[${idx + 1}]`}</span> {log}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-amber-400 font-bold block mb-1.5">{"// UPSTASH REDIS Cache Eviction Logs (Async Purging):"}</span>
                        <div className="bg-slate-900 dark:bg-slate-900/60 border border-slate-900 dark:border-slate-800 p-3 rounded-lg space-y-1 block max-h-[110px] overflow-y-auto">
                          {webhookLogs.redis.map((log, idx) => (
                            <p key={idx} className="text-amber-300/90">
                              <span className="text-slate-500">{`[${idx + 1}]`}</span> {log}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 p-3 rounded-lg flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">STATUS_PRO: TENANT_UPGRADE_COMPLETE</p>
                          <p className="text-[10px] text-emerald-400/90 leading-normal mt-0.5">
                            Transaksi divalidasi aman dan idempotent. Double-transaksi dicegah secara mutlak via pessimistic row locking (FOR UPDATE). Tenant {xenditReferenceId.slice(0,8)}... aktif sebagai PRO.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500 py-24 text-center">
                      &gt;_ Menunggu webhook Xendit dipicu untuk melacak operasi SQL baris kueri secara real-time...
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* Tab 5: Regulasi Hukum & UU PDP */}
        {activeTab === "pdp" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            id="panel-pdp"
          >
            {/* Legal Information Column */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs" id="pdp-legal-col">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-indigo-700 dark:text-indigo-400" />
                Matriks Kepatuhan Tata Kelola UU PDP Indonesia (No. 27 Tahun 2022)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 border-b border-indigo-50/60 dark:border-slate-800 pb-3 font-semibold uppercase font-mono">
                Jurisdiction Disclaimer: PT Memory Groups Sejahtera Hubungan Kemitraan BPS RI
              </p>

              <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed" id="legal-policy-articles">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base mb-1">
                    Klasifikasi Peran Yuridis
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    Berdasarkan Pasal 1 angka 4 dan angka 5 UU Pelindungan Data Pribadi:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl">
                      <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider block text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/25 mb-1 px-2 py-0.5 rounded w-max">
                        Data Controller
                      </span>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        Pengguna Layanan (BPS Mitra/PML)
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                        Bertindak sebagai Pengendali penuh data responden kuesioner. Berkewajuhan mengantongi persetujuan sah (Explicit Consent) dari keluarga responden sebelum proses pendataan lapangan.
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl">
                      <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider block text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/25 mb-1 px-2 py-0.5 rounded w-max">
                        Data Processor
                      </span>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        PT Memory Groups Sejahtera (JASASAJA)
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                        Bertindak murni dan terbatas sebagai utilitas pemrosesan digital, verifikasi spasial, serta ekstraksi OCR/audio tanpa klaim kepemilikan data statistik negara.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base mb-1">Pasal 3: Kebijakan Retensi Penghapusan Data Otomatis</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                     Untuk melindung kemanan informasi dan menimalisir paparan data sensitif di Cloud, JASASAJA menerapkan <strong>Zero-Persistent-Cache Policy</strong>:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1 pl-1">
                    <li>Berkas OCR (JPG, PNG, PDF), rekaman audio, serta transkrip temporer di dalam temporary cache Upstash Redis **Maksimal dipertahankan selama proses ekstraksi aktif**</li>
                    <li>Sistem otomatis menjalankan penghapusan permanen (**Hard Delete**) se-wilayah dalam waktu **maksimal 24 jam** sejak data berhasil terverifikasi.</li>
                    <li>Operasional transaksi di simpan di neonDB diisolasi mutlak via Row Level Security (RLS) dan dimusnahkan permanen maksimal 30 hari jika pengajuan penutupan akun diajukan PML.</li>
                  </ul>
                </div>

                {/* Digital Integrity Consent Checkbox box */}
                <div className="bg-indigo-50/70 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-950/30 p-4 rounded-xl mt-6">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-400 text-xs uppercase mb-1">Pakta Integritas Digital (Consent Box)</h4>
                  <p className="text-[11px] text-indigo-800 dark:text-indigo-300 leading-snug mb-3">
                    Enumerator diwajibkan menyetujui ketaatan hukum berikut secara manual sebelum diizinkan mengunggah data apa pun ke platform JASASAJA:
                  </p>
                  <div className="flex items-start gap-2.5">
                    <input 
                      type="checkbox" 
                      id="chk-pdp-consent"
                      checked={pdpConsentAccepted}
                      onChange={(e) => setPdpConsentAccepted(e.target.checked)}
                      className="h-4.5 w-4.5 text-indigo-600 focus:ring-0 rounded mt-0.5 cursor-pointer dark:bg-slate-900 dark:border-slate-800"
                    />
                    <label htmlFor="chk-pdp-consent" className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-normal cursor-pointer select-none">
                      Saya menjamin telah memperoleh persetujuan tertulis resmi dari responden lapangan, bertanggung jawab penuh hukum atas legalitas sumber data, dan membebaskan Platform JASASAJA (PT Memory Groups Sejahtera) dari sengkata atau tuntutan ganti rugi pihak ketiga berdasarkan UU PDP No. 27 Tahun 2022.
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Breach Timeline Column */}
            <div className="lg:col-span-5 flex flex-col gap-6" id="pdp-timeline-col">
              
              {/* Breach Timeline card */}
              <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-6 border border-slate-800" id="breach-timeline">
                <span className="text-[10px] text-rose-400 font-extrabold tracking-widest uppercase block mb-1">DATA BREACH MITIGATION PROTOCOL</span>
                <h3 className="text-lg font-bold text-slate-100 dark:text-slate-200 mb-4">Protokol Penanganan Kebocoran Lapangan</h3>

                <div className="space-y-6 relative pl-4 border-l border-slate-700 dark:border-slate-800" id="timeline-steps">
                  
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full bg-rose-500 border border-slate-900 dark:border-slate-950 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white dark:bg-slate-900 rounded-full"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">FASE 1: 0 - 24 JAM</span>
                    <span className="text-xs font-bold text-rose-300 dark:text-rose-400 block">Deteksi & Pembendungan Instan</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                      Memutus koneksi API eksternal yang mencurigakan, mengaudit query RLS kuesioner pada database, dan mengirim notifikasi formal awal kepada Pengendali Data dalam kurun waktu 24 jam.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full bg-amber-500 border border-slate-900 dark:border-slate-950 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white dark:bg-slate-900 rounded-full"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">FASE 2: 24 - 48 JAM</span>
                    <span className="text-xs font-bold text-amber-300 dark:text-amber-400 block">Investigasi & Pembuktian Forensik</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                      Mengisolasikan replika database untuk keperluan forensik, membuktikkan kepatuhan RLS tidak mengalami cross-tenant leakage, serta menyiapkan draf laporan insiden formal bagi Lembaga PDP.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full bg-indigo-500 border border-slate-900 dark:border-slate-950 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white dark:bg-slate-900 rounded-full"></div>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">FASE 3: 48 - 72 JAM</span>
                    <span className="text-xs font-bold text-indigo-300 dark:text-indigo-400 block">Pelaporan Instansi & Pemulihan</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal">
                      Melakukan rotasi total enkripsi database (database encryption keys) dan token Redis, merilis tampalan kode Edge, serta melaporkan kegagalan secara resmi kepada pihak otoritas negara (Pasal 46 UU PDP).
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-16 pt-8 pb-12 flex flex-col md:flex-row justify-between text-xs text-slate-400 dark:text-slate-500 gap-4" id="applet-footer">
        <p>&copy; 2026 PT Memory Groups Sejahtera. JASASAJA SaaS Platform - All rights reserved.</p>
        <div className="flex gap-6 mt-1 md:mt-0">
          <span className="font-mono">Server Time: 2026-06-01T05:50:08Z</span>
          <span className="font-mono">Pamekasan Project Cluster Active</span>
        </div>
      </footer>

      {/* Sliding Window HTTP 429 Quota Block Modal Dialog */}
      <AnimatePresence>
        {show429Modal && (
          <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 overflow-y-auto" id="modal-429-backdrop">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
              id="modal-429-content"
            >
              <div className="absolute -right-4 -top-4 text-rose-50/70 dark:text-rose-950/20 h-24 w-24">
                <XCircle className="h-full w-full stroke-1" />
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-450 shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                    HTTP 429 Too Many Requests
                  </h3>
                  <p className="text-xs uppercase font-extrabold text-rose-600 dark:text-rose-400 font-mono tracking-wider mt-0.5">
                    Batas Limitasi Upstash Redis Tercapai!
                  </p>
                </div>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed mb-6">
                <p>
                  Maaf, kuota harian audit data kuesioner Anda sebagai tenant <strong>{tenantTier} Tier</strong> telah habis terpakai dalam siklus sliding window 24 jam terakhir.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>Masa Aktif Window:</span>
                    <span className="font-bold">24 Jam (86400 s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maksimal Audit:</span>
                    <span className="font-bold">{tenantTier === 'FREE' ? "5 Kali" : "500 Kali"}</span>
                  </div>
                </div>

                <p className="text-xs italic text-slate-500 dark:text-slate-450">
                  Untuk mendapatkan akses kueri tak terbatas hingga 500 kali audit / 24 jam demi kelancaran proyek sensus nasional BPS Pamekasan, silakan upgrade lisensi Anda ke PRO Tier.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    // Instantly trigger simulated upgrade via tab change
                    setActiveTab("xendit");
                    setShow429Modal(false);
                    triggerToast("Beralih ke Simulator Mandiri Xendit. Upgrade tier sekarang!", "info");
                  }}
                  className="flex-1 bg-slate-900 dark:bg-slate-100 dark:hover:bg-slate-200 hover:bg-slate-800 text-white dark:text-slate-900 font-bold py-3 px-4 rounded-xl text-xs cursor-pointer text-center shadow"
                >
                  Bayar & Upgrade ke PRO via Xendit
                </button>
                <button
                  onClick={() => {
                    setShow429Modal(false);
                    setApiCallCount(0); // Reset simulation call to let them retry
                    triggerToast("Simulasi Kuota disetel ulang (Sesi Diperbarui).", "success");
                  }}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold py-3 px-4 rounded-xl text-xs cursor-pointer text-center"
                >
                  Simulasikan Reset Token Sesi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating toast alerts handler */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full" id="toast-wrapper">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 ${
                toastMessage.type === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300' 
                  : toastMessage.type === 'error' 
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 text-rose-900 dark:text-rose-300' 
                    : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 text-indigo-900 dark:text-indigo-300'
              }`}
              id="toast-box"
            >
              <div className="shrink-0 mt-0.5">
                {toastMessage.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                {toastMessage.type === "error" && <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
                {toastMessage.type === "info" && <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold leading-normal">{toastMessage.text}</p>
              </div>
              <button 
                onClick={() => setToastMessage(null)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shrink-0 font-bold text-sm"
              >
                &times;
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
