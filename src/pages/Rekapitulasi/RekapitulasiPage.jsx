import { useState, useEffect } from "react";
import {
  getKehamilanList,
  getPersalinanList,
  getKBList,
  getImunisasiList,
  getVillages,
  exportKehamilanData,
  exportPersalinanData,
  exportKBData,
  exportImunisasiData,
  exportKehamilanPDF,
  exportPersalinanPDF,
  exportKBPDF,
  exportImunisasiPDF,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/dateFormatter";
import { isBidanKoordinator } from "../../utils/roleHelpers";
import "../../App.css";

const RekapitulasiPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const [rekapData, setRekapData] = useState([]);
  const [rekapLoading, setRekapLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [villages, setVillages] = useState([]);
  const [filters, setFilters] = useState({
    module: "pemeriksaan-kehamilan",
    month: String(now.getMonth() + 1).padStart(2, "0"),
    year: String(now.getFullYear()),
    village_id: "",
  });

  const [exportFilters, setExportFilters] = useState({
    module: "pemeriksaan-kehamilan", // Add module to exportFilters
    month: String(now.getMonth() + 1).padStart(2, "0"),
    year: String(now.getFullYear()),
    village_id: "",
  });

  useEffect(() => {
    if (!isBidanKoordinator(user)) {
      navigate("/");
      return;
    }
    loadVillages();
    fetchRekapData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, filters]);

  const loadVillages = async () => {
    try {
      const res = await getVillages();
      setVillages(res.data || []);
    } catch (err) {
      console.error("Gagal memuat desa:", err);
    }
  };

  const fetchRekapData = async (overrideFilters = null) => {
    setRekapLoading(true);
    const useFilters = overrideFilters || filters;
    try {
      const params = {
        status_verifikasi: "APPROVED",
        month: useFilters.month,
        year: useFilters.year,
        village_id: useFilters.village_id || undefined,
        limit: 100, // More data for report page
      };

      let result;
      switch (useFilters.module) {
        case "pemeriksaan-kehamilan":
          result = await getKehamilanList(params);
          break;
        case "persalinan":
          result = await getPersalinanList(params);
          break;
        case "keluarga-berencana":
          result = await getKBList(params);
          break;
        case "imunisasi":
          result = await getImunisasiList(params);
          break;
        default:
          result = await getKehamilanList(params);
      }

      if (result?.data) {
        setRekapData(result.data);
      } else {
        setRekapData([]);
      }
    } catch (error) {
      console.error("Rekap Data Fetch Error:", error);
      setRekapData([]);
    } finally {
      setRekapLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Set initial export filters from current page filters
    setExportFilters({
      module: filters.module,
      month: filters.month,
      year: filters.year,
      village_id: filters.village_id,
    });
    setShowExportModal(true);
  };

  const executeExportExcel = async () => {
    setExportLoading(true);
    try {
      const params = {
        month: exportFilters.month,
        year: exportFilters.year,
        village_id: exportFilters.village_id || undefined,
      };

      let response;
      let moduleNameFile = "";

      switch (exportFilters.module) {
        case "pemeriksaan-kehamilan":
          response = await exportKehamilanData(params);
          moduleNameFile = "Kehamilan";
          break;
        case "persalinan":
          response = await exportPersalinanData(params);
          moduleNameFile = "Persalinan";
          break;
        case "keluarga-berencana":
          response = await exportKBData(params);
          moduleNameFile = "KB";
          break;
        case "imunisasi":
          response = await exportImunisasiData(params);
          moduleNameFile = "Imunisasi";
          break;
        default:
          throw new Error("Modul tidak dikenali");
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const monthName = new Date(
        0,
        parseInt(exportFilters.month) - 1,
      ).toLocaleString("id-ID", { month: "long" });
      const filename = `Rekap_${moduleNameFile}_${monthName}_${exportFilters.year}.xlsx`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (error) {
      console.error("Export Excel Error:", error);
      alert("Gagal mengunduh file Excel. Pastikan data tersedia.");
    } finally {
      setExportLoading(false);
    }
  };

  const executeExportPDF = async () => {
    setExportLoading(true);
    try {
      const params = {
        month: exportFilters.month,
        year: exportFilters.year,
        village_id: exportFilters.village_id || undefined,
      };

      let response;
      let moduleNameFile = "";

      switch (exportFilters.module) {
        case "pemeriksaan-kehamilan":
          response = await exportKehamilanPDF(params);
          moduleNameFile = "Kehamilan";
          break;
        case "persalinan":
          response = await exportPersalinanPDF(params);
          moduleNameFile = "Persalinan";
          break;
        case "keluarga-berencana":
          response = await exportKBPDF(params);
          moduleNameFile = "KB";
          break;
        case "imunisasi":
          response = await exportImunisasiPDF(params);
          moduleNameFile = "Imunisasi";
          break;
        default:
          throw new Error("Modul tidak dikenali");
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const monthName = new Date(
        0,
        parseInt(exportFilters.month) - 1,
      ).toLocaleString("id-ID", { month: "long" });
      const filename = `Rekap_${moduleNameFile}_${monthName}_${exportFilters.year}.pdf`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (error) {
      console.error("Export PDF Error:", error);
      alert("Gagal mengunduh file PDF. Pastikan data tersedia.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header no-print">
        <div>
          <h1>Rekapitulasi Pelayanan</h1>
          <p className="text-muted">
            Laporan bulanan data pelayanan yang telah disetujui (Approved)
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/")}
            className="btn-primary"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--glass-border)",
              width: "auto",
              padding: "0.5rem 1rem",
            }}
          >
            Kembali
          </button>

          <button
            onClick={handleExportExcel}
            className="btn-primary"
            disabled={exportLoading}
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              border: "1px solid #3b82f6",
              color: "#60a5fa",
              width: "auto",
              padding: "0.5rem 1.5rem",
            }}
          >
            {exportLoading ? "⏳ Exporting..." : "📑 Export Excel"}
          </button>

          <button
            onClick={handlePrint}
            className="btn-primary"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10b981",
              color: "#34d399",
              width: "auto",
              padding: "0.5rem 1.5rem",
            }}
          >
            🖨️ Cetak Laporan
          </button>
        </div>
      </header>

      {/* Filters Section */}
      <div
        className="auth-card no-print"
        style={{ marginBottom: "2rem", maxWidth: "none" }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div
            className="form-group"
            style={{ marginBottom: 0, flex: 1, minWidth: "200px" }}
          >
            <label className="form-label">Jenis Pelayanan</label>
            <select
              className="form-input"
              value={filters.module}
              onChange={(e) =>
                setFilters({ ...filters, module: e.target.value })
              }
            >
              <option value="pemeriksaan-kehamilan">Kehamilan</option>
              <option value="persalinan">Persalinan</option>
              <option value="keluarga-berencana">KB</option>
              <option value="imunisasi">Imunisasi</option>
            </select>
          </div>

          <div
            className="form-group"
            style={{ marginBottom: 0, width: "150px" }}
          >
            <label className="form-label">Bulan</label>
            <select
              className="form-input"
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: e.target.value })
              }
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div
            className="form-group"
            style={{ marginBottom: 0, flex: 1, minWidth: "150px" }}
          >
            <label className="form-label">Filter Wilayah (Desa)</label>
            <select
              className="form-input"
              value={filters.village_id}
              onChange={(e) =>
                setFilters({ ...filters, village_id: e.target.value })
              }
            >
              <option value="">Semua Wilayah</option>
              {villages.map((v) => (
                <option key={v.village_id} value={v.village_id}>
                  {v.nama_desa}
                </option>
              ))}
            </select>
          </div>

          <div
            className="form-group"
            style={{ marginBottom: 0, width: "120px" }}
          >
            <label className="form-label">Tahun</label>
            <select
              className="form-input"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn-primary"
            style={{ width: "auto", padding: "0.75rem 2rem" }}
            disabled={rekapLoading}
          >
            {rekapLoading ? "Memuat..." : "Data Ditampilkan"}
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div
        className="auth-card print-area"
        style={{
          padding: 0,
          overflowX: "auto",
          maxWidth: "none",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="only-print"
          style={{
            padding: "2rem",
            textAlign: "center",
            borderBottom: "2px solid #333",
          }}
        >
          <h2>
            REKAPITULASI DATA {filters.module.replace("-", " ").toUpperCase()}
          </h2>
          <p>
            Periode:{" "}
            {new Date(0, parseInt(filters.month) - 1).toLocaleString("id-ID", {
              month: "long",
            })}{" "}
            {filters.year}
          </p>
        </div>

        <table className="dashboard-table">
          <thead>
            {filters.module === "pemeriksaan-kehamilan" ? (
              <tr>
                <th rowSpan="2" className="col-no">
                  No
                </th>
                <th rowSpan="2" className="col-name">
                  Data Pasien
                </th>
                <th colSpan="3">Kunjungan</th>
                <th colSpan="3">Pemeriksaan Fisik</th>
                <th colSpan="2">Laboratorium</th>
                <th rowSpan="2" className="col-medical">
                  Resti
                </th>
                <th rowSpan="2" className="col-bidan">
                  Bidan/Tempat
                </th>
                <th rowSpan="2" style={{ width: "100px" }}>
                  Tgl
                </th>
              </tr>
            ) : filters.module === "persalinan" ? (
              <tr>
                <th rowSpan="2" className="col-no">
                  No
                </th>
                <th rowSpan="2" className="col-name">
                  Data Pasien
                </th>
                <th colSpan="3">Data Ibu</th>
                <th rowSpan="2" style={{ width: "120px" }}>
                  Kondisi Ibu
                </th>
                <th colSpan="3">Data Bayi</th>
                <th rowSpan="2" style={{ width: "120px" }}>
                  Kondisi Bayi
                </th>
                <th rowSpan="2" className="col-bidan">
                  Bidan/Tempat
                </th>
                <th rowSpan="2" style={{ width: "100px" }}>
                  Tgl
                </th>
              </tr>
            ) : filters.module === "keluarga-berencana" ? (
              <tr>
                <th rowSpan="2" className="col-no">
                  No
                </th>
                <th rowSpan="2" className="col-name">
                  Data Pasien
                </th>
                <th colSpan="2">Demografi Anak</th>
                <th colSpan="2">Pelayanan KB</th>
                <th rowSpan="2" style={{ width: "200px" }}>
                  Keterangan
                </th>
                <th rowSpan="2" className="col-bidan">
                  Bidan/Tempat
                </th>
                <th rowSpan="2" style={{ width: "100px" }}>
                  Tgl
                </th>
              </tr>
            ) : (
              <tr>
                <th rowSpan="2" className="col-no">
                  No
                </th>
                <th rowSpan="2" className="col-name">
                  Data Pasien (Anak)
                </th>
                <th colSpan="3">Kondisi Anak</th>
                <th rowSpan="2" style={{ width: "150px" }}>
                  Jenis Imunisasi
                </th>
                <th rowSpan="2" style={{ width: "150px" }}>
                  Nama Orang Tua
                </th>
                <th rowSpan="2" className="col-bidan">
                  Bidan/Tempat
                </th>
                <th rowSpan="2" style={{ width: "100px" }}>
                  Tgl
                </th>
              </tr>
            )}
            {filters.module === "pemeriksaan-kehamilan" && (
              <tr>
                <th className="col-medical">GPA</th>
                <th className="col-medical">UK</th>
                <th className="col-medical">Jenis</th>
                <th className="col-medical">TD</th>
                <th className="col-medical">BB</th>
                <th className="col-medical">LILA</th>
                <th className="col-medical">HB</th>
                <th className="col-medical">Triple E</th>
              </tr>
            )}
            {filters.module === "persalinan" && (
              <tr>
                <th className="col-medical">GPA</th>
                <th style={{ width: "100px" }}>Partus</th>
                <th style={{ width: "60px" }}>Supl</th>
                <th className="col-medical">BB(g)</th>
                <th className="col-medical">PB(cm)</th>
                <th className="col-medical">JK</th>
              </tr>
            )}
            {filters.module === "keluarga-berencana" && (
              <tr>
                <th className="col-medical">Laki</th>
                <th className="col-medical">Pr</th>
                <th style={{ width: "130px" }}>Metode</th>
                <th className="col-medical">AT</th>
              </tr>
            )}
            {filters.module === "imunisasi" && (
              <tr>
                <th className="col-medical">BB(kg)</th>
                <th className="col-medical">Suhu</th>
                <th style={{ width: "150px" }}>Catatan</th>
              </tr>
            )}
          </thead>
          <tbody>
            {rekapLoading ? (
              <tr>
                <td
                  colSpan={13}
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  Sedang mengambil data laporan...
                </td>
              </tr>
            ) : rekapData.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  style={{ textAlign: "center", padding: "3rem" }}
                  className="text-muted"
                >
                  Tidak ada data yang ditemukan untuk filter ini
                </td>
              </tr>
            ) : (
              rekapData.map((r, index) => {
                if (filters.module === "pemeriksaan-kehamilan") {
                  return (
                    <tr key={r.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td className="col-name">
                        <div style={{ fontWeight: "600" }}>
                          {r.pasien?.nama}
                        </div>
                        <div
                          style={{ fontSize: "0.7rem" }}
                          className="text-muted"
                        >
                          {r.pasien?.nik}
                        </div>
                      </td>
                      <td>{r.gpa || "-"}</td>
                      <td>{r.umur_kehamilan} m</td>
                      <td>{r.jenis_kunjungan}</td>
                      <td>{r.td}</td>
                      <td>{r.bb}k</td>
                      <td>{r.lila}c</td>
                      <td>{r.ceklab_report?.hb || "-"}</td>
                      <td style={{ fontSize: "0.65rem" }}>
                        <div>
                          H:{r.ceklab_report?.hiv ? "P" : "N"} S:
                          {r.ceklab_report?.sifilis ? "P" : "N"} B:
                          {r.ceklab_report?.hbsag ? "P" : "N"}
                        </div>
                      </td>
                      <td
                        style={{
                          fontWeight: "600",
                          color:
                            r.resti === "TINGGI"
                              ? "#ef4444"
                              : r.resti === "RENDAH"
                                ? "#10b981"
                                : "inherit",
                        }}
                      >
                        {r.resti?.substring(0, 1)}
                      </td>
                      <td className="col-bidan">
                        <div style={{ fontSize: "0.8rem" }}>
                          {r.creator?.full_name}
                        </div>
                        <div
                          style={{ fontSize: "0.65rem" }}
                          className="text-muted"
                        >
                          {r.practice_place?.nama_praktik}
                        </div>
                      </td>
                      <td>{formatDate(r.tanggal)}</td>
                    </tr>
                  );
                }

                if (filters.module === "persalinan") {
                  const ki = r.keadaan_ibu_persalinan || {};
                  const kb = r.keadaan_bayi_persalinan || {};

                  return (
                    <tr key={r.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td className="col-name">
                        <div style={{ fontWeight: "600" }}>
                          {r.pasien?.nama}
                        </div>
                        <div
                          style={{ fontSize: "0.7rem" }}
                          className="text-muted"
                        >
                          {r.pasien?.nik}
                        </div>
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>
                        G{r.gravida} P{r.para} A{r.abortus}
                      </td>
                      <td style={{ fontSize: "0.8rem" }}>
                        {formatDate(r.tanggal_partus)}
                      </td>
                      <td style={{ fontSize: "0.65rem" }}>
                        <div>
                          K:{r.vit_k ? "✓" : "-"} B0:{r.hb_0 ? "✓" : "-"} A:
                          {r.vit_a_bufas ? "✓" : "-"}
                        </div>
                      </td>
                      <td style={{ fontSize: "0.7rem" }}>
                        <div
                          style={{ color: ki.hidup ? "#10b981" : "#ef4444" }}
                        >
                          {ki.hidup ? "Hidup" : "Mati"}
                        </div>
                        {ki.hap && <div style={{ color: "#ef4444" }}>HAP</div>}
                        {ki.pre_eklamsi && (
                          <div style={{ color: "#ef4444" }}>PE</div>
                        )}
                      </td>
                      <td>{kb.bb}</td>
                      <td>{kb.pb}</td>
                      <td>{kb.jenis_kelamin === "LAKI_LAKI" ? "L" : "P"}</td>
                      <td style={{ fontSize: "0.7rem" }}>
                        <div
                          style={{ color: kb.hidup ? "#10b981" : "#ef4444" }}
                        >
                          {kb.hidup ? "H" : "M"}
                        </div>
                        {kb.asfiksia && <span>Asf</span>}{" "}
                        {kb.rds && <span>RDS</span>}
                      </td>
                      <td className="col-bidan">
                        <div style={{ fontSize: "0.8rem" }}>
                          {r.creator?.full_name}
                        </div>
                        <div
                          style={{ fontSize: "0.65rem" }}
                          className="text-muted"
                        >
                          {r.practice_place?.nama_praktik}
                        </div>
                      </td>
                      <td>{formatDate(r.tanggal)}</td>
                    </tr>
                  );
                }

                if (filters.module === "keluarga-berencana") {
                  return (
                    <tr key={r.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td className="col-name">
                        <div style={{ fontWeight: "600" }}>
                          {r.pasien?.nama}
                        </div>
                        <div
                          style={{ fontSize: "0.7rem" }}
                          className="text-muted"
                        >
                          {r.pasien?.nik}
                        </div>
                      </td>
                      <td>{r.jumlah_anak_laki}</td>
                      <td>{r.jumlah_anak_perempuan}</td>
                      <td style={{ fontWeight: "600" }}>
                        {r.alat_kontrasepsi?.replace(/_/g, " ")}
                      </td>
                      <td>
                        {r.at ? (
                          <span style={{ color: "#ef4444" }}>Ya</span>
                        ) : (
                          "Td"
                        )}
                      </td>
                      <td style={{ fontSize: "0.7rem", textAlign: "left" }}>
                        {r.keterangan || "-"}
                      </td>
                      <td className="col-bidan">
                        <div style={{ fontSize: "0.8rem" }}>
                          {r.creator?.full_name}
                        </div>
                        <div
                          style={{ fontSize: "0.65rem" }}
                          className="text-muted"
                        >
                          {r.practice_place?.nama_praktik}
                        </div>
                      </td>
                      <td>{formatDate(r.tanggal_kunjungan || r.tanggal)}</td>
                    </tr>
                  );
                }

                if (filters.module === "imunisasi") {
                  return (
                    <tr key={r.id}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td className="col-name">
                        <div style={{ fontWeight: "600" }}>
                          {r.pasien?.nama}
                        </div>
                        <div
                          style={{ fontSize: "0.7rem" }}
                          className="text-muted"
                        >
                          {r.pasien?.nik}
                        </div>
                      </td>
                      <td>{r.berat_badan}k</td>
                      <td>{r.suhu_badan ? `${r.suhu_badan}°` : "-"}</td>
                      <td style={{ fontSize: "0.7rem", textAlign: "left" }}>
                        {r.catatan || "-"}
                      </td>
                      <td style={{ fontWeight: "600" }}>
                        {r.jenis_imunisasi?.replace(/_/g, " ")}
                      </td>
                      <td>{r.nama_orangtua || "-"}</td>
                      <td className="col-bidan">
                        <div style={{ fontSize: "0.8rem" }}>
                          {r.creator?.full_name}
                        </div>
                        <div
                          style={{ fontSize: "0.65rem" }}
                          className="text-muted"
                        >
                          {r.practice_place?.nama_praktik}
                        </div>
                      </td>
                      <td>{formatDate(r.tgl_imunisasi || r.tanggal)}</td>
                    </tr>
                  );
                }

                return null;
              })
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
          min-width: 1400px; /* Increased to accommodate all columns */
          table-layout: auto;
        }
        .dashboard-table th {
          background: rgba(255,255,255,0.08);
          padding: 0.6rem 0.4rem;
          color: #fff;
          font-weight: 600;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.15);
          vertical-align: middle;
        }
        .dashboard-table td {
          padding: 0.6rem 0.4rem;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.08);
          vertical-align: middle;
          word-wrap: break-word;
          line-height: 1.2;
        }
        .dashboard-table .col-no { width: 40px; }
        .dashboard-table .col-name { width: 180px; text-align: left; }
        .dashboard-table .col-bidan { width: 160px; text-align: left; }
        .dashboard-table .col-medical { width: 60px; }
        .dashboard-table tr:hover td { background: rgba(255,255,255,0.02); }
        
        @media print {
          .no-print { display: none !important; }
          .only-print { display: block !important; }
          .dashboard { padding: 0 !important; margin: 0 !important; background: white !important; color: black !important; }
          .auth-card { border: none !important; box-shadow: none !important; background: white !important; color: black !important; padding: 0 !important; }
          .dashboard-table { min-width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; }
          .dashboard-table th { background: #f0f0f0 !important; color: black !important; border: 1px solid #000 !important; padding: 4px !important; font-size: 9pt !important; }
          .dashboard-table td { border: 1px solid #000 !important; color: black !important; padding: 4px !important; font-size: 8pt !important; }
          .text-muted { color: #666 !important; }
          body { background: white !important; }
        }
        .only-print { display: none; }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          width: 100%;
          max-width: 500px;
          background: #1a1a1a;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
      `}</style>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>
              Konfigurasi Export Excel
            </h3>
            <p
              className="text-muted"
              style={{ marginBottom: "1.5rem", fontSize: "0.9rem" }}
            >
              Pilih kriteria data yang ingin Anda unduh dalam format Excel
              (.xlsx)
            </p>

            <div className="form-group">
              <label className="form-label">Jenis Pelayanan</label>
              <select
                className="form-input"
                value={exportFilters.module}
                onChange={(e) =>
                  setExportFilters({ ...exportFilters, module: e.target.value })
                }
              >
                <option value="pemeriksaan-kehamilan">
                  PEMERIKSAAN KEHAMILAN
                </option>
                <option value="persalinan">PERSALINAN</option>
                <option value="keluarga-berencana">KELUARGA BERENCANA</option>
                <option value="imunisasi">IMUNISASI</option>
              </select>
            </div>

            <div
              style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}
            >
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Bulan</label>
                <select
                  className="form-input"
                  value={exportFilters.month}
                  onChange={(e) =>
                    setExportFilters({
                      ...exportFilters,
                      month: e.target.value,
                    })
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                      {new Date(0, i).toLocaleString("id-ID", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Tahun</label>
                <select
                  className="form-input"
                  value={exportFilters.year}
                  onChange={(e) =>
                    setExportFilters({ ...exportFilters, year: e.target.value })
                  }
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Filter Wilayah (Desa)</label>
              <select
                className="form-input"
                value={exportFilters.village_id}
                onChange={(e) =>
                  setExportFilters({
                    ...exportFilters,
                    village_id: e.target.value,
                  })
                }
              >
                <option value="">Semua Wilayah</option>
                {villages.map((v) => (
                  <option key={v.village_id} value={v.village_id}>
                    {v.nama_desa}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button
                className="btn-primary"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid var(--glass-border)",
                  flex: 1,
                }}
                onClick={() => setShowExportModal(false)}
              >
                Batal
              </button>

              <button
                className="btn-primary"
                style={{
                  flex: 2,
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid #ef4444",
                  color: "#fca5a5",
                }}
                onClick={executeExportPDF}
                disabled={exportLoading}
              >
                {exportLoading ? "⏳..." : "📄 Export PDF"}
              </button>

              <button
                className="btn-primary"
                style={{ flex: 2 }}
                onClick={executeExportExcel}
                disabled={exportLoading}
              >
                {exportLoading ? "⏳..." : "📊 Export Excel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RekapitulasiPage;
