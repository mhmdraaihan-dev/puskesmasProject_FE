import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import {
  exportImunisasiData,
  exportImunisasiPDF,
  exportKBData,
  exportKBPDF,
  exportKehamilanData,
  exportKehamilanPDF,
  exportPersalinanData,
  exportPersalinanPDF,
  getImunisasiList,
  getKBList,
  getKehamilanList,
  getPersalinanList,
  getVillages,
} from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import { isBidanKoordinator } from "../../utils/roleHelpers";

const MODULES = [
  { value: "pemeriksaan-kehamilan", label: "Kehamilan" },
  { value: "persalinan", label: "Persalinan" },
  { value: "keluarga-berencana", label: "KB" },
  { value: "imunisasi", label: "Imunisasi" },
];

const YEARS = [2024, 2025, 2026, 2027];

const EXPORTERS = {
  "pemeriksaan-kehamilan": {
    excel: exportKehamilanData,
    pdf: exportKehamilanPDF,
    file: "Kehamilan",
  },
  persalinan: {
    excel: exportPersalinanData,
    pdf: exportPersalinanPDF,
    file: "Persalinan",
  },
  "keluarga-berencana": {
    excel: exportKBData,
    pdf: exportKBPDF,
    file: "KB",
  },
  imunisasi: {
    excel: exportImunisasiData,
    pdf: exportImunisasiPDF,
    file: "Imunisasi",
  },
};

const getModuleLabel = (module) =>
  MODULES.find((item) => item.value === module)?.label || module;

const getMonthLabel = (month) =>
  new Date(0, parseInt(month, 10) - 1).toLocaleString("id-ID", { month: "long" });

const getCreatorName = (item) =>
  item.creator?.full_name || item.creator?.name || item.creator?.email || "-";

const RekapitulasiPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const now = new Date();
  const baseFilters = {
    module: "pemeriksaan-kehamilan",
    month: String(now.getMonth() + 1).padStart(2, "0"),
    year: String(now.getFullYear()),
    village_id: "",
  };

  const [filters, setFilters] = useState(baseFilters);
  const [exportFilters, setExportFilters] = useState(baseFilters);
  const [rekapData, setRekapData] = useState([]);
  const [rekapLoading, setRekapLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [villages, setVillages] = useState([]);

  useEffect(() => {
    if (!isBidanKoordinator(user)) {
      navigate("/");
      return;
    }
    loadVillages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  useEffect(() => {
    if (isBidanKoordinator(user)) fetchRekapData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user]);

  const loadVillages = async () => {
    try {
      const response = await getVillages();
      setVillages(response.data || []);
    } catch (err) {
      console.error("Gagal memuat desa:", err);
    }
  };

  const fetchRekapData = async (activeFilters) => {
    setRekapLoading(true);
    try {
      const params = {
        status_verifikasi: "APPROVED",
        month: activeFilters.month,
        year: activeFilters.year,
        village_id: activeFilters.village_id || undefined,
        limit: 100,
      };
      let result;
      if (activeFilters.module === "pemeriksaan-kehamilan") result = await getKehamilanList(params);
      else if (activeFilters.module === "persalinan") result = await getPersalinanList(params);
      else if (activeFilters.module === "keluarga-berencana") result = await getKBList(params);
      else result = await getImunisasiList(params);
      setRekapData(result?.data || []);
    } catch (err) {
      console.error("Rekap Data Fetch Error:", err);
      setRekapData([]);
    } finally {
      setRekapLoading(false);
    }
  };

  const selectedVillageName = useMemo(() => {
    if (!filters.village_id) return "Semua Wilayah";
    return villages.find((v) => v.village_id === filters.village_id)?.nama_desa || "Wilayah Dipilih";
  }, [filters.village_id, villages]);

  const stats = useMemo(() => {
    const noteField = filters.module === "keluarga-berencana" ? "keterangan" : "catatan";
    return {
      total: rekapData.length,
      notes: rekapData.filter((item) => Boolean(item[noteField])).length,
      practitioners: new Set(rekapData.map(getCreatorName).filter((value) => value !== "-")).size,
    };
  }, [filters.module, rekapData]);

  const handleOpenExport = () => {
    setExportFilters(filters);
    setShowExportModal(true);
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      const config = EXPORTERS[exportFilters.module];
      const response = await config[format]({
        month: exportFilters.month,
        year: exportFilters.year,
        village_id: exportFilters.village_id || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Rekap_${config.file}_${getMonthLabel(exportFilters.month)}_${exportFilters.year}.${format === "excel" ? "xlsx" : "pdf"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (err) {
      console.error(`Export ${format} error:`, err);
      alert(`Gagal mengunduh file ${format === "excel" ? "Excel" : "PDF"}.`);
    } finally {
      setExportLoading(false);
    }
  };

  const renderHead = () => {
    if (filters.module === "pemeriksaan-kehamilan") return (
      <>
        <tr><th rowSpan="2">No</th><th rowSpan="2" className="rekap-col-name">Data Pasien</th><th colSpan="3">Kunjungan</th><th colSpan="3">Fisik</th><th colSpan="2">Lab</th><th rowSpan="2">Resti</th><th rowSpan="2" className="rekap-col-bidan">Bidan / Tempat</th><th rowSpan="2">Tgl</th></tr>
        <tr><th>GPA</th><th>UK</th><th>Jenis</th><th>TD</th><th>BB</th><th>LILA</th><th>HB</th><th>Triple E</th></tr>
      </>
    );
    if (filters.module === "persalinan") return (
      <>
        <tr><th rowSpan="2">No</th><th rowSpan="2" className="rekap-col-name">Data Pasien</th><th colSpan="3">Data Ibu</th><th rowSpan="2">Kondisi Ibu</th><th colSpan="3">Data Bayi</th><th rowSpan="2">Kondisi Bayi</th><th rowSpan="2" className="rekap-col-bidan">Bidan / Tempat</th><th rowSpan="2">Tgl</th></tr>
        <tr><th>GPA</th><th>Partus</th><th>Supl</th><th>BB</th><th>PB</th><th>JK</th></tr>
      </>
    );
    if (filters.module === "keluarga-berencana") return (
      <>
        <tr><th rowSpan="2">No</th><th rowSpan="2" className="rekap-col-name">Data Pasien</th><th colSpan="2">Demografi</th><th colSpan="2">Pelayanan KB</th><th rowSpan="2">Keterangan</th><th rowSpan="2" className="rekap-col-bidan">Bidan / Tempat</th><th rowSpan="2">Tgl</th></tr>
        <tr><th>Laki</th><th>Pr</th><th>Metode</th><th>AT</th></tr>
      </>
    );
    return (
      <>
        <tr><th rowSpan="2">No</th><th rowSpan="2" className="rekap-col-name">Data Pasien</th><th colSpan="3">Kondisi Anak</th><th rowSpan="2">Jenis Imunisasi</th><th rowSpan="2">Orang Tua</th><th rowSpan="2" className="rekap-col-bidan">Bidan / Tempat</th><th rowSpan="2">Tgl</th></tr>
        <tr><th>BB</th><th>Suhu</th><th>Catatan</th></tr>
      </>
    );
  };

  const renderRows = () => rekapData.map((item, index) => {
    if (filters.module === "pemeriksaan-kehamilan") return (
      <tr key={item.id}><td>{index + 1}</td><td className="rekap-cell-left"><div className="rekap-primary">{item.pasien?.nama}</div><div className="rekap-secondary">{item.pasien?.nik}</div></td><td>{item.gpa || "-"}</td><td>{item.umur_kehamilan} m</td><td>{item.jenis_kunjungan || "-"}</td><td>{item.td || "-"}</td><td>{item.bb ?? "-"}</td><td>{item.lila ?? "-"}</td><td>{item.ceklab_report?.hb || "-"}</td><td className="rekap-compact">H:{item.ceklab_report?.hiv ? "P" : "N"} S:{item.ceklab_report?.sifilis ? "P" : "N"} B:{item.ceklab_report?.hbsag ? "P" : "N"}</td><td>{item.resti?.substring(0, 1) || "-"}</td><td className="rekap-cell-left"><div className="rekap-primary">{getCreatorName(item)}</div><div className="rekap-secondary">{item.practice_place?.nama_praktik || "-"}</div></td><td>{formatDate(item.tanggal)}</td></tr>
    );
    if (filters.module === "persalinan") {
      const ibu = item.keadaan_ibu_persalinan || {};
      const bayi = item.keadaan_bayi_persalinan || {};
      return <tr key={item.id}><td>{index + 1}</td><td className="rekap-cell-left"><div className="rekap-primary">{item.pasien?.nama}</div><div className="rekap-secondary">{item.pasien?.nik}</div></td><td>G{item.gravida} P{item.para} A{item.abortus}</td><td>{formatDate(item.tanggal_partus)}</td><td className="rekap-compact">K:{item.vit_k ? "Y" : "-"} B0:{item.hb_0 ? "Y" : "-"} A:{item.vit_a_bufas ? "Y" : "-"}</td><td className="rekap-compact">{ibu.hidup ? "Hidup" : "Meninggal"}{ibu.hap ? " / HAP" : ""}{ibu.pre_eklamsi ? " / PE" : ""}</td><td>{bayi.bb ?? "-"}</td><td>{bayi.pb ?? "-"}</td><td>{bayi.jenis_kelamin === "LAKI_LAKI" ? "L" : "P"}</td><td className="rekap-compact">{bayi.hidup ? "Hidup" : "Meninggal"}{bayi.asfiksia ? " / Asf" : ""}{bayi.rds ? " / RDS" : ""}</td><td className="rekap-cell-left"><div className="rekap-primary">{getCreatorName(item)}</div><div className="rekap-secondary">{item.practice_place?.nama_praktik || "-"}</div></td><td>{formatDate(item.tanggal_partus || item.tanggal)}</td></tr>;
    }
    if (filters.module === "keluarga-berencana") return (
      <tr key={item.id}><td>{index + 1}</td><td className="rekap-cell-left"><div className="rekap-primary">{item.pasien?.nama}</div><div className="rekap-secondary">{item.pasien?.nik}</div></td><td>{item.jumlah_anak_laki ?? 0}</td><td>{item.jumlah_anak_perempuan ?? 0}</td><td>{item.alat_kontrasepsi?.replace(/_/g, " ") || "-"}</td><td>{item.at ? "Ya" : "Tidak"}</td><td className="rekap-cell-left">{item.keterangan || "-"}</td><td className="rekap-cell-left"><div className="rekap-primary">{getCreatorName(item)}</div><div className="rekap-secondary">{item.practice_place?.nama_praktik || "-"}</div></td><td>{formatDate(item.tanggal_kunjungan || item.tanggal)}</td></tr>
    );
    return (
      <tr key={item.id}><td>{index + 1}</td><td className="rekap-cell-left"><div className="rekap-primary">{item.pasien?.nama}</div><div className="rekap-secondary">{item.pasien?.nik}</div></td><td>{item.berat_badan ?? "-"}</td><td>{item.suhu_badan ?? "-"}</td><td className="rekap-cell-left">{item.catatan || "-"}</td><td>{item.jenis_imunisasi?.replace(/_/g, " ") || "-"}</td><td>{item.nama_orangtua || "-"}</td><td className="rekap-cell-left"><div className="rekap-primary">{getCreatorName(item)}</div><div className="rekap-secondary">{item.practice_place?.nama_praktik || "-"}</div></td><td>{formatDate(item.tgl_imunisasi || item.tanggal)}</td></tr>
    );
  });

  return (
    <div className="dashboard">
      <header className="dashboard-header no-print" style={styles.header}>
        <div><h1 style={styles.pageTitle}>Rekapitulasi Pelayanan</h1><p className="text-muted" style={styles.pageSubtitle}>Laporan bulanan data pelayanan berstatus approved</p></div>
        <div style={styles.headerActions}>
          <button onClick={() => navigate("/")} className="btn-primary" style={styles.secondaryButton}>Kembali</button>
          <button onClick={handleOpenExport} className="btn-primary" style={styles.infoButton} disabled={exportLoading}>{exportLoading ? "Exporting..." : "Export Data"}</button>
          <button onClick={() => window.print()} className="btn-primary" style={styles.successButton}>Cetak Laporan</button>
        </div>
      </header>

      <div style={styles.summaryGrid}>
        <div className="auth-card no-print" style={styles.summaryCard}><span style={styles.summaryLabel}>Modul Aktif</span><strong style={styles.summaryValue}>{getModuleLabel(filters.module)}</strong></div>
        <div className="auth-card no-print" style={styles.summaryCard}><span style={styles.summaryLabel}>Periode</span><strong style={styles.summaryValue}>{getMonthLabel(filters.month)} {filters.year}</strong></div>
        <div className="auth-card no-print" style={styles.summaryCard}><span style={styles.summaryLabel}>Wilayah</span><strong style={styles.summaryValue}>{selectedVillageName}</strong></div>
        <div className="auth-card no-print" style={styles.summaryCard}><span style={styles.summaryLabel}>Total Data / Catatan</span><strong style={styles.summaryValue}>{stats.total} / {stats.notes}</strong><span className="text-muted" style={styles.summaryHelper}>Praktik terlibat: {stats.practitioners}</span></div>
      </div>

      <div className="auth-card no-print" style={styles.filterCard}>
        <div style={styles.filterGrid}>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Jenis Pelayanan</label><select className="form-input" value={filters.module} onChange={(e) => setFilters({ ...filters, module: e.target.value })}>{MODULES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Bulan</label><select className="form-input" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{new Date(0, i).toLocaleString("id-ID", { month: "long" })}</option>)}</select></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Tahun</label><select className="form-input" value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>{YEARS.map((year) => <option key={year} value={String(year)}>{year}</option>)}</select></div>
          <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Filter Wilayah</label><select className="form-input" value={filters.village_id} onChange={(e) => setFilters({ ...filters, village_id: e.target.value })}><option value="">Semua Wilayah</option>{villages.map((village) => <option key={village.village_id} value={village.village_id}>{village.nama_desa}</option>)}</select></div>
        </div>
      </div>

      <div className="auth-card print-area" style={styles.tableCard}>
        <div className="only-print" style={styles.printHeader}><h2>REKAPITULASI DATA {getModuleLabel(filters.module).toUpperCase()}</h2><p>Periode {getMonthLabel(filters.month)} {filters.year} | {selectedVillageName}</p></div>
        <div style={styles.reportHeader}><h3 style={styles.sectionTitle}>Rekap {getModuleLabel(filters.module)}</h3><p className="text-muted" style={styles.sectionSubtitle}>{rekapLoading ? "Memuat data laporan..." : `${rekapData.length} data approved ditemukan`}</p></div>
        <div style={styles.tableWrapper}>
          <table className="rekap-table"><thead>{renderHead()}</thead><tbody>{rekapLoading ? <tr><td colSpan="13" className="rekap-empty">Sedang mengambil data laporan...</td></tr> : rekapData.length === 0 ? <tr><td colSpan="13" className="rekap-empty">Tidak ada data yang ditemukan untuk filter ini</td></tr> : renderRows()}</tbody></table>
        </div>
      </div>

      {showExportModal ? <div className="modal-overlay"><div className="modal-content"><h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Konfigurasi Export</h3><p className="text-muted" style={{ marginBottom: "1rem" }}>Pilih modul, periode, dan wilayah sebelum mengunduh laporan.</p><div className="form-group"><label className="form-label">Jenis Pelayanan</label><select className="form-input" value={exportFilters.module} onChange={(e) => setExportFilters({ ...exportFilters, module: e.target.value })}>{MODULES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><div style={styles.exportGrid}><div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Bulan</label><select className="form-input" value={exportFilters.month} onChange={(e) => setExportFilters({ ...exportFilters, month: e.target.value })}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{new Date(0, i).toLocaleString("id-ID", { month: "long" })}</option>)}</select></div><div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Tahun</label><select className="form-input" value={exportFilters.year} onChange={(e) => setExportFilters({ ...exportFilters, year: e.target.value })}>{YEARS.map((year) => <option key={year} value={String(year)}>{year}</option>)}</select></div></div><div className="form-group"><label className="form-label">Filter Wilayah</label><select className="form-input" value={exportFilters.village_id} onChange={(e) => setExportFilters({ ...exportFilters, village_id: e.target.value })}><option value="">Semua Wilayah</option>{villages.map((village) => <option key={village.village_id} value={village.village_id}>{village.nama_desa}</option>)}</select></div><div style={styles.exportActions}><button className="btn-primary" style={styles.secondaryButton} onClick={() => setShowExportModal(false)}>Batal</button><button className="btn-primary" style={styles.dangerButton} onClick={() => handleExport("pdf")} disabled={exportLoading}>{exportLoading ? "Processing..." : "Export PDF"}</button><button className="btn-primary" style={styles.primaryButton} onClick={() => handleExport("excel")} disabled={exportLoading}>{exportLoading ? "Processing..." : "Export Excel"}</button></div></div></div> : null}

      <style>{`
        .rekap-table{width:100%;border-collapse:collapse;min-width:1280px;font-size:.82rem}
        .rekap-table th{background:rgba(255,255,255,.07);color:#fff;border:1px solid rgba(255,255,255,.12);padding:.7rem .5rem;text-align:center;vertical-align:middle;font-weight:600}
        .rekap-table td{border:1px solid rgba(255,255,255,.08);padding:.75rem .55rem;text-align:center;vertical-align:middle;line-height:1.3}
        .rekap-col-name{width:180px}.rekap-col-bidan{width:170px}.rekap-cell-left{text-align:left}.rekap-primary{font-weight:700}.rekap-secondary{color:var(--color-text-muted);font-size:.72rem;margin-top:.15rem}.rekap-compact{font-size:.73rem}.rekap-empty{text-align:center;padding:3rem 1rem;color:var(--color-text-muted)}
        .rekap-table tbody tr:hover td{background:rgba(255,255,255,.02)}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(4px);display:flex;justify-content:center;align-items:center;z-index:1000;padding:1rem}
        .modal-content{width:100%;max-width:520px;background:#1a1a1a;border:1px solid var(--glass-border);border-radius:16px;padding:2rem;box-shadow:0 20px 25px -5px rgba(0,0,0,.5)}
        @media print{
          .no-print{display:none!important}.only-print{display:block!important}.dashboard{padding:0!important;margin:0!important;background:white!important;color:black!important}.auth-card{border:none!important;box-shadow:none!important;background:white!important;color:black!important;padding:0!important}.rekap-table{min-width:100%!important;font-size:8pt!important}.rekap-table th{background:#f0f0f0!important;color:black!important;border:1px solid #000!important;padding:4px!important;font-size:9pt!important}.rekap-table td{border:1px solid #000!important;color:black!important;padding:4px!important;font-size:8pt!important}.rekap-secondary,.text-muted{color:#555!important}body{background:white!important}
        }
        .only-print{display:none}
      `}</style>
    </div>
  );
};

const styles = {
  header: { gap: "1rem", flexWrap: "wrap" },
  pageTitle: { marginBottom: "0.35rem" },
  pageSubtitle: { margin: 0 },
  headerActions: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  primaryButton: { width: "auto", minWidth: "140px", paddingInline: "1rem" },
  secondaryButton: { width: "auto", minWidth: "120px", paddingInline: "1rem", backgroundColor: "transparent", border: "1px solid var(--glass-border)" },
  infoButton: { width: "auto", minWidth: "130px", paddingInline: "1rem", backgroundColor: "rgba(59,130,246,.2)", border: "1px solid rgba(96,165,250,.45)", color: "#93c5fd" },
  successButton: { width: "auto", minWidth: "140px", paddingInline: "1rem", backgroundColor: "rgba(16,185,129,.2)", border: "1px solid rgba(52,211,153,.45)", color: "#6ee7b7" },
  dangerButton: { width: "auto", minWidth: "120px", paddingInline: "1rem", backgroundColor: "rgba(239,68,68,.2)", border: "1px solid rgba(248,113,113,.45)", color: "#fca5a5" },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  summaryCard: { maxWidth: "none", margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem" },
  summaryLabel: { fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)" },
  summaryValue: { fontSize: "1.55rem", lineHeight: 1.2 },
  summaryHelper: { fontSize: "0.85rem" },
  filterCard: { maxWidth: "none", margin: "0 0 1.5rem" },
  filterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" },
  tableCard: { padding: "1.25rem", overflowX: "auto", maxWidth: "none", background: "rgba(0,0,0,.2)" },
  reportHeader: { marginBottom: "1rem" },
  sectionTitle: { marginBottom: "0.35rem", fontSize: "1.1rem" },
  sectionSubtitle: { margin: 0 },
  printHeader: { padding: "2rem", textAlign: "center", borderBottom: "2px solid #333" },
  tableWrapper: { overflowX: "auto" },
  exportGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
  exportActions: { display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.5rem" },
};

export default RekapitulasiPage;
