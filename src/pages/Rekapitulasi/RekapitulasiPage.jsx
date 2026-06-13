import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import PageHeader from "../../components/layout/PageHeader";
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
  getPracticePlacesByVillage,
  getVillages,
} from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import { isBidanDesa, isBidanKoordinator } from "../../utils/roleHelpers";
import "../../App.css";
import "./RekapitulasiPage.css";

const PAGE_SIZE = 20;

const MODULES = [
  { value: "pemeriksaan-kehamilan", label: "Kehamilan" },
  { value: "persalinan", label: "Persalinan" },
  { value: "keluarga-berencana", label: "KB" },
  { value: "imunisasi", label: "Imunisasi" },
];

const YEARS = [2023, 2024, 2025, 2026, 2027];

const MONTH_LABELS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const EXPORTERS = {
  "pemeriksaan-kehamilan": { excel: exportKehamilanData, pdf: exportKehamilanPDF, file: "Kehamilan" },
  persalinan: { excel: exportPersalinanData, pdf: exportPersalinanPDF, file: "Persalinan" },
  "keluarga-berencana": { excel: exportKBData, pdf: exportKBPDF, file: "KB" },
  imunisasi: { excel: exportImunisasiData, pdf: exportImunisasiPDF, file: "Imunisasi" },
};

const getModuleLabel = (module) => MODULES.find((m) => m.value === module)?.label || module;
const getCreatorName = (item) => item.creator?.full_name || item.creator?.name || item.creator?.email || "-";

const EMPTY_FILTERS = {
  module: "pemeriksaan-kehamilan",
  month: "",
  year: "",
  village_id: "",
  practice_id: "",
};

const RekapitulasiPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isKoor = isBidanKoordinator(user);
  const isDesa = isBidanDesa(user);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [rekapData, setRekapData] = useState([]);
  const [rekapLoading, setRekapLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [villages, setVillages] = useState([]);
  const [practicePlaces, setPracticePlaces] = useState([]);
  const [page, setPage] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilters, setExportFilters] = useState(EMPTY_FILTERS);

  // Load villages for Bidan Koordinator on mount
  useEffect(() => {
    if (isKoor) {
      getVillages()
        .then((res) => setVillages(res.data || []))
        .catch((err) => console.error("Gagal memuat desa:", err));
    }
  }, [isKoor]);

  // Load practice places for Bidan Desa on mount (from their assigned village)
  useEffect(() => {
    if (isDesa && user?.village_id) {
      getPracticePlacesByVillage(user.village_id)
        .then((res) => setPracticePlaces(res.data || []))
        .catch((err) => console.error("Gagal memuat tempat praktik:", err));
    }
  }, [isDesa, user?.village_id]);

  // For Bidan Koordinator: load practice places when village changes
  useEffect(() => {
    if (!isKoor) return;
    if (!filters.village_id) {
      setPracticePlaces([]);
      return;
    }
    getPracticePlacesByVillage(filters.village_id)
      .then((res) => setPracticePlaces(res.data || []))
      .catch((err) => console.error("Gagal memuat tempat praktik:", err));
  }, [isKoor, filters.village_id]);

  const fetchRekapData = async (activeFilters) => {
    setRekapLoading(true);
    try {
      const params = { status_verifikasi: "APPROVED" };
      if (activeFilters.month) params.month = activeFilters.month;
      if (activeFilters.year) params.year = activeFilters.year;
      if (activeFilters.practice_id) params.practice_id = activeFilters.practice_id;

      let result;
      if (activeFilters.module === "pemeriksaan-kehamilan") result = await getKehamilanList(params);
      else if (activeFilters.module === "persalinan") result = await getPersalinanList(params);
      else if (activeFilters.module === "keluarga-berencana") result = await getKBList(params);
      else result = await getImunisasiList(params);

      setRekapData(result?.data || []);
    } catch (err) {
      console.error("Rekap fetch error:", err);
      setRekapData([]);
    } finally {
      setRekapLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedFilters({ ...filters });
    setPage(1);
    setHasSearched(true);
    fetchRekapData(filters);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(null);
    setRekapData([]);
    setHasSearched(false);
    setPage(1);
    if (isKoor) setPracticePlaces([]);
  };

  const handleVillageChange = (village_id) => {
    setFilters((prev) => ({ ...prev, village_id, practice_id: "" }));
  };

  // Pagination
  const totalPages = Math.ceil(rekapData.length / PAGE_SIZE);
  const pagedData = useMemo(
    () => rekapData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rekapData, page],
  );
  const pageOffset = (page - 1) * PAGE_SIZE;

  // Summary stats (from all fetched data, not just current page)
  const stats = useMemo(() => {
    if (!appliedFilters) return { total: 0, notes: 0, practitioners: 0 };
    const noteField = appliedFilters.module === "keluarga-berencana" ? "keterangan" : "catatan";
    return {
      total: rekapData.length,
      notes: rekapData.filter((item) => Boolean(item[noteField])).length,
      practitioners: new Set(rekapData.map(getCreatorName).filter((v) => v !== "-")).size,
    };
  }, [appliedFilters, rekapData]);

  // Summary labels
  const periodLabel = useMemo(() => {
    if (!appliedFilters) return "-";
    const m = appliedFilters.month ? MONTH_LABELS[parseInt(appliedFilters.month, 10) - 1] : "Semua Bulan";
    const y = appliedFilters.year || "Semua Tahun";
    return `${m} ${y}`;
  }, [appliedFilters]);

  const practiceLabel = useMemo(() => {
    if (!appliedFilters?.practice_id) return "Semua Tempat Praktik";
    return practicePlaces.find((p) => p.practice_id === appliedFilters.practice_id)?.nama_praktik || "Tempat Dipilih";
  }, [appliedFilters, practicePlaces]);

  // Export handlers
  const handleOpenExport = () => {
    setExportFilters(appliedFilters || filters);
    setShowExportModal(true);
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      const config = EXPORTERS[exportFilters.module];
      const params = {};
      if (exportFilters.month) params.month = exportFilters.month;
      if (exportFilters.year) params.year = exportFilters.year;
      if (exportFilters.practice_id) params.practice_id = exportFilters.practice_id;

      const response = await config[format](params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const mLabel = exportFilters.month ? MONTH_LABELS[parseInt(exportFilters.month, 10) - 1] : "Semua";
      link.setAttribute("download", `Rekap_${config.file}_${mLabel}_${exportFilters.year || "Semua"}.${format === "excel" ? "xlsx" : "pdf"}`);
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

  // Table head — uses appliedFilters.module
  const renderHead = () => {
    const mod = appliedFilters?.module;
    if (mod === "pemeriksaan-kehamilan") return (
      <>
        <tr><th rowSpan="2">No</th><th rowSpan="2" className="rekap-col-name">Data Pasien</th><th colSpan="3">Kunjungan</th><th colSpan="3">Fisik</th><th colSpan="2">Lab</th><th rowSpan="2">Resti</th><th rowSpan="2" className="rekap-col-bidan">Bidan / Tempat</th><th rowSpan="2">Tgl</th></tr>
        <tr><th>GPA</th><th>UK</th><th>Jenis</th><th>TD</th><th>BB</th><th>LILA</th><th>HB</th><th>Triple E</th></tr>
      </>
    );
    if (mod === "persalinan") return (
      <>
        <tr><th rowSpan="2">No</th><th rowSpan="2" className="rekap-col-name">Data Pasien</th><th colSpan="3">Data Ibu</th><th rowSpan="2">Kondisi Ibu</th><th colSpan="3">Data Bayi</th><th rowSpan="2">Kondisi Bayi</th><th rowSpan="2" className="rekap-col-bidan">Bidan / Tempat</th><th rowSpan="2">Tgl</th></tr>
        <tr><th>GPA</th><th>Partus</th><th>Supl</th><th>BB</th><th>PB</th><th>JK</th></tr>
      </>
    );
    if (mod === "keluarga-berencana") return (
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

  const renderRows = () => pagedData.map((item, idx) => {
    const no = pageOffset + idx + 1;
    const mod = appliedFilters?.module;
    if (mod === "pemeriksaan-kehamilan") return (
      <tr key={item.id}><td>{no}</td><td className="rekap-cell-left"><div className="rekap-primary">{item.pasien?.nama}</div><div className="rekap-secondary">{item.pasien?.nik}</div></td><td>{item.gpa || "-"}</td><td>{item.umur_kehamilan} m</td><td>{item.jenis_kunjungan || "-"}</td><td>{item.td || "-"}</td><td>{item.bb ?? "-"}</td><td>{item.lila ?? "-"}</td><td>{item.ceklab_report?.hb || "-"}</td><td className="rekap-compact">H:{item.ceklab_report?.hiv ? "P" : "N"} S:{item.ceklab_report?.sifilis ? "P" : "N"} B:{item.ceklab_report?.hbsag ? "P" : "N"}</td><td>{item.resti?.substring(0, 1) || "-"}</td><td className="rekap-cell-left"><div className="rekap-primary">{getCreatorName(item)}</div><div className="rekap-secondary">{item.practice_place?.nama_praktik || "-"}</div></td><td>{formatDate(item.tanggal)}</td></tr>
    );
    if (mod === "persalinan") {
      const ibu = item.keadaan_ibu_persalinan || {};
      const bayi = item.keadaan_bayi_persalinan || {};
      return <tr key={item.id}><td>{no}</td><td className="rekap-cell-left"><div className="rekap-primary">{item.pasien?.nama}</div><div className="rekap-secondary">{item.pasien?.nik}</div></td><td>G{item.gravida} P{item.para} A{item.abortus}</td><td>{formatDate(item.tanggal_partus)}</td><td className="rekap-compact">K:{item.vit_k ? "Y" : "-"} B0:{item.hb_0 ? "Y" : "-"} A:{item.vit_a_bufas ? "Y" : "-"}</td><td className="rekap-compact">{ibu.hidup ? "Hidup" : "Meninggal"}{ibu.hap ? " / HAP" : ""}{ibu.pre_eklamsi ? " / PE" : ""}</td><td>{bayi.bb ?? "-"}</td><td>{bayi.pb ?? "-"}</td><td>{bayi.jenis_kelamin === "LAKI_LAKI" ? "L" : "P"}</td><td className="rekap-compact">{bayi.hidup ? "Hidup" : "Meninggal"}{bayi.asfiksia ? " / Asf" : ""}{bayi.rds ? " / RDS" : ""}</td><td className="rekap-cell-left"><div className="rekap-primary">{getCreatorName(item)}</div><div className="rekap-secondary">{item.practice_place?.nama_praktik || "-"}</div></td><td>{formatDate(item.tanggal_partus || item.tanggal)}</td></tr>;
    }
    if (mod === "keluarga-berencana") return (
      <tr key={item.id}><td>{no}</td><td className="rekap-cell-left"><div className="rekap-primary">{item.pasien?.nama}</div><div className="rekap-secondary">{item.pasien?.nik}</div></td><td>{item.jumlah_anak_laki ?? 0}</td><td>{item.jumlah_anak_perempuan ?? 0}</td><td>{item.alat_kontrasepsi?.replace(/_/g, " ") || "-"}</td><td>{item.at ? "Ya" : "Tidak"}</td><td className="rekap-cell-left">{item.keterangan || "-"}</td><td className="rekap-cell-left"><div className="rekap-primary">{getCreatorName(item)}</div><div className="rekap-secondary">{item.practice_place?.nama_praktik || "-"}</div></td><td>{formatDate(item.tanggal_kunjungan || item.tanggal)}</td></tr>
    );
    return (
      <tr key={item.id}><td>{no}</td><td className="rekap-cell-left"><div className="rekap-primary">{item.pasien?.nama}</div><div className="rekap-secondary">{item.pasien?.nik}</div></td><td>{item.berat_badan ?? "-"}</td><td>{item.suhu_badan ?? "-"}</td><td className="rekap-cell-left">{item.catatan || "-"}</td><td>{item.jenis_imunisasi?.replace(/_/g, " ") || "-"}</td><td>{item.nama_orangtua || "-"}</td><td className="rekap-cell-left"><div className="rekap-primary">{getCreatorName(item)}</div><div className="rekap-secondary">{item.practice_place?.nama_praktik || "-"}</div></td><td>{formatDate(item.tgl_imunisasi || item.tanggal)}</td></tr>
    );
  });

  return (
    <div className="dashboard page-shell rekap-page">
      <PageHeader
        title="Rekapitulasi Pelayanan"
        subtitle="Laporan data pelayanan berstatus approved per modul dan periode"
        actions={
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {hasSearched && (
              <>
                <Button variant="secondary" onClick={handleOpenExport} disabled={exportLoading}>
                  {exportLoading ? "Exporting..." : "Export Data"}
                </Button>
                <Button variant="secondary" onClick={() => window.print()}>
                  Cetak Laporan
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Summary cards — only shown after search */}
      {hasSearched && (
        <div className="rekap-stat-row no-print">
          <div className="rekap-stat-card">
            <span className="rekap-stat-label">Modul</span>
            <span className="rekap-stat-value rekap-stat-value--text">{getModuleLabel(appliedFilters?.module)}</span>
          </div>
          <div className="rekap-stat-card">
            <span className="rekap-stat-label">Periode</span>
            <span className="rekap-stat-value rekap-stat-value--text">{periodLabel}</span>
          </div>
          <div className="rekap-stat-card">
            <span className="rekap-stat-label">Tempat Praktik</span>
            <span className="rekap-stat-value rekap-stat-value--text">{practiceLabel}</span>
          </div>
          <div className="rekap-stat-card">
            <span className="rekap-stat-label">Total Data</span>
            <span className="rekap-stat-value">{stats.total}</span>
            <span className="rekap-stat-note">{stats.practitioners} praktik terlibat</span>
          </div>
        </div>
      )}

      {/* Filter form */}
      <div className="rekap-filter-box no-print">
        <h3 className="rekap-filter-title">Filter Rekapitulasi</h3>
        <p className="rekap-filter-sub">
          Pilih modul dan filter yang diinginkan, lalu klik <strong>Cari</strong> untuk menampilkan data
        </p>
        <form onSubmit={handleSearch} className="rekap-filter-grid">
          {/* Modul */}
          <div className="input-wrapper">
            <label className="input-label" htmlFor="rekap-module">Jenis Pelayanan</label>
            <select
              id="rekap-module"
              className="rekap-select"
              value={filters.module}
              onChange={(e) => setFilters((f) => ({ ...f, module: e.target.value }))}
            >
              {MODULES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {/* Bulan */}
          <div className="input-wrapper">
            <label className="input-label" htmlFor="rekap-month">Bulan</label>
            <select
              id="rekap-month"
              className="rekap-select"
              value={filters.month}
              onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
            >
              <option value="">Semua Bulan</option>
              {MONTH_LABELS.map((label, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{label}</option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div className="input-wrapper">
            <label className="input-label" htmlFor="rekap-year">Tahun</label>
            <select
              id="rekap-year"
              className="rekap-select"
              value={filters.year}
              onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            >
              <option value="">Semua Tahun</option>
              {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>

          {/* Desa — Bidan Koordinator only (cascading) */}
          {isKoor && (
            <div className="input-wrapper">
              <label className="input-label" htmlFor="rekap-village">Desa</label>
              <select
                id="rekap-village"
                className="rekap-select"
                value={filters.village_id}
                onChange={(e) => handleVillageChange(e.target.value)}
              >
                <option value="">Semua Desa</option>
                {villages.map((v) => (
                  <option key={v.village_id} value={v.village_id}>{v.nama_desa}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tempat Praktik — both roles */}
          <div className="input-wrapper">
            <label className="input-label" htmlFor="rekap-practice">Tempat Praktik</label>
            <select
              id="rekap-practice"
              className="rekap-select"
              value={filters.practice_id}
              onChange={(e) => setFilters((f) => ({ ...f, practice_id: e.target.value }))}
              disabled={isKoor && !filters.village_id}
            >
              <option value="">
                {isKoor && !filters.village_id ? "Pilih desa terlebih dahulu" : "Semua Tempat Praktik"}
              </option>
              {practicePlaces.map((p) => (
                <option key={p.practice_id} value={p.practice_id}>{p.nama_praktik}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="filter-actions">
            <Button type="submit" variant="primary" disabled={rekapLoading}>
              {rekapLoading ? "Memuat..." : "Cari"}
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="content-card-light print-area rekap-table-card">
        {/* Print header (only visible when printing) */}
        <div className="only-print rekap-print-header">
          <h2>REKAPITULASI DATA {getModuleLabel(appliedFilters?.module || "").toUpperCase()}</h2>
          <p>Periode {periodLabel} | {practiceLabel}</p>
        </div>

        <div className="rekap-table-header no-print">
          <div>
            <h3 className="rekap-table-title">Rekap {getModuleLabel(appliedFilters?.module || filters.module)}</h3>
            <p className="rekap-table-sub">
              {!hasSearched
                ? "Atur filter di atas lalu klik Cari untuk menampilkan data"
                : rekapLoading
                  ? "Memuat data laporan..."
                  : `Menampilkan ${pagedData.length} dari ${rekapData.length} data`}
            </p>
          </div>
        </div>

        <div className="rekap-table-wrapper">
          <table className="rekap-table">
            <thead>{hasSearched && renderHead()}</thead>
            <tbody>
              {!hasSearched ? (
                <tr><td colSpan="13" className="rekap-empty">Belum ada data — gunakan filter di atas dan klik Cari</td></tr>
              ) : rekapLoading ? (
                <tr><td colSpan="13" className="rekap-empty">Sedang mengambil data laporan...</td></tr>
              ) : rekapData.length === 0 ? (
                <tr><td colSpan="13" className="rekap-empty">Tidak ada data untuk filter yang dipilih</td></tr>
              ) : (
                renderRows()
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {hasSearched && !rekapLoading && totalPages > 1 && (
          <div className="rekap-pagination no-print">
            <span className="rekap-page-info">
              Halaman {page} dari {totalPages} ({rekapData.length} total)
            </span>
            <div className="rekap-page-btns">
              <Button variant="secondary" size="sm" onClick={() => setPage(1)} disabled={page === 1}>
                «
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                ‹ Sebelumnya
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Selanjutnya ›
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                »
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="auth-eyebrow">Export</div>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Konfigurasi Export</h3>
            <p className="text-muted" style={{ marginBottom: "1rem" }}>
              Pilih modul, periode, dan tempat praktik sebelum mengunduh laporan.
            </p>
            <div className="form-group">
              <label className="form-label">Jenis Pelayanan</label>
              <select className="form-input" value={exportFilters.module} onChange={(e) => setExportFilters((f) => ({ ...f, module: e.target.value }))}>
                {MODULES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Bulan</label>
                <select className="form-input" value={exportFilters.month} onChange={(e) => setExportFilters((f) => ({ ...f, month: e.target.value }))}>
                  <option value="">Semua Bulan</option>
                  {MONTH_LABELS.map((label, i) => <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{label}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tahun</label>
                <select className="form-input" value={exportFilters.year} onChange={(e) => setExportFilters((f) => ({ ...f, year: e.target.value }))}>
                  <option value="">Semua Tahun</option>
                  {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tempat Praktik</label>
              <select className="form-input" value={exportFilters.practice_id} onChange={(e) => setExportFilters((f) => ({ ...f, practice_id: e.target.value }))}>
                <option value="">Semua Tempat Praktik</option>
                {practicePlaces.map((p) => <option key={p.practice_id} value={p.practice_id}>{p.nama_praktik}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
              <Button variant="secondary" onClick={() => setShowExportModal(false)}>Batal</Button>
              <Button variant="danger" onClick={() => handleExport("pdf")} disabled={exportLoading}>
                {exportLoading ? "Processing..." : "Export PDF"}
              </Button>
              <Button variant="primary" onClick={() => handleExport("excel")} disabled={exportLoading}>
                {exportLoading ? "Processing..." : "Export Excel"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .rekap-table{width:100%;border-collapse:collapse;min-width:1280px;font-size:.82rem}
        .rekap-table th{background:rgba(220,234,207,.82);color:#233022;border:1px solid rgba(77,122,44,.12);padding:.7rem .5rem;text-align:center;vertical-align:middle;font-weight:600}
        .rekap-table td{border:1px solid rgba(73,62,50,.08);padding:.75rem .55rem;text-align:center;vertical-align:middle;line-height:1.3;color:#233022}
        .rekap-col-name{width:180px}.rekap-col-bidan{width:170px}.rekap-cell-left{text-align:left!important}.rekap-primary{font-weight:700}.rekap-secondary{color:#7a8f74;font-size:.72rem;margin-top:.15rem}.rekap-compact{font-size:.73rem}.rekap-empty{text-align:center;padding:3rem 1rem;color:#7a8f74}
        .rekap-table tbody tr:hover td{background:rgba(79,146,40,.05)}
        .modal-overlay{position:fixed;inset:0;background:rgba(35,51,24,.32);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:center;z-index:1000;padding:1rem}
        .modal-content{width:100%;max-width:520px;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(237,242,230,.97));border:1px solid rgba(77,122,44,.14);border-radius:24px;padding:2rem;box-shadow:0 24px 52px rgba(35,51,24,.14);color:#233022}
        .modal-content .form-label{color:#1a2e1a;font-weight:600;display:block;margin-bottom:.45rem;font-size:.9rem}
        .modal-content .form-input{background:rgba(255,255,255,.88);border:1px solid rgba(77,122,44,.18);border-radius:12px;color:#233022;width:100%;min-height:44px;padding:.75rem 1rem;font-size:.95rem;box-sizing:border-box;transition:border-color .2s,box-shadow .2s}
        .modal-content .form-input:focus{outline:none;border-color:#4f9228;box-shadow:0 0 0 3px rgba(79,146,40,.14)}
        .modal-content select.form-input option{background:#fff;color:#233022}
        .modal-content h3{color:#1a2e1a}
        .modal-content .text-muted{color:#7a8f74}
        .only-print{display:none}
        @media print{
          .no-print{display:none!important}.only-print{display:block!important}.dashboard{padding:0!important;background:white!important}.rekap-table{min-width:100%!important;font-size:8pt!important}.rekap-table th{background:#f0f0f0!important;color:black!important;border:1px solid #000!important;padding:4pt!important}.rekap-table td{border:1px solid #000!important;color:black!important;padding:4pt!important}.rekap-secondary{color:#555!important}body{background:white!important}
        }
      `}</style>
    </div>
  );
};

export default RekapitulasiPage;
