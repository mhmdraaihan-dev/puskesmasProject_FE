import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import "./ModuleHistoryPage.css";
import {
  getImunisasiList,
  getKBList,
  getKehamilanList,
  getPersalinanList,
} from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import { isBidanDesa } from "../../utils/roleHelpers";

const tableShellStyle = {
  padding: 0,
  overflowX: "auto",
  maxWidth: "none",
};

const formatMethod = (value) =>
  String(value || "-")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getPersalinanSummary = (item) => {
  const bayi = item.keadaan_bayi_persalinan || {};
  const ibu = item.keadaan_ibu_persalinan || {};
  const bayiText = `${bayi.bb || "-"} g / ${bayi.pb || "-"} cm`;

  if (ibu.baik) {
    return `Ibu baik • Bayi ${bayiText}`;
  }

  const flags = [];
  if (ibu.hap) flags.push("HAP");
  if (ibu.partus_lama) flags.push("Partus lama");
  if (ibu.pre_eklamsi) flags.push("Pre-eklamsi");
  if (ibu.hidup === false) flags.push("Ibu meninggal");

  return flags.length > 0 ? `${flags.join(", ")} • Bayi ${bayiText}` : bayiText;
};

const MODULE_CONFIG = {
  kehamilan: {
    title: "Riwayat Kehamilan",
    shortLabel: "Kehamilan",
    description:
      "Riwayat keputusan APPROVED dan REJECTED modul kehamilan untuk desa yang Anda tangani.",
    fetcher: getKehamilanList,
    detailRoute: (id) => `/pemeriksaan-kehamilan/${id}`,
    getDate: (item) => item.tanggal,
    getSummary: (item) =>
      `${item.jenis_kunjungan || "-"} • UK ${item.umur_kehamilan || "-"} minggu`,
  },
  persalinan: {
    title: "Riwayat Persalinan",
    shortLabel: "Persalinan",
    description:
      "Riwayat keputusan APPROVED dan REJECTED modul persalinan di desa Anda.",
    fetcher: getPersalinanList,
    detailRoute: (id) => `/persalinan/${id}`,
    getDate: (item) => item.tanggal_partus || item.tanggal,
    getSummary: getPersalinanSummary,
  },
  kb: {
    title: "Riwayat KB",
    shortLabel: "KB",
    description:
      "Riwayat keputusan APPROVED dan REJECTED modul keluarga berencana di desa Anda.",
    fetcher: getKBList,
    detailRoute: (id) => `/keluarga-berencana/${id}`,
    getDate: (item) => item.tanggal_kunjungan || item.tanggal,
    getSummary: (item) =>
      `${formatMethod(item.alat_kontrasepsi)} • AT ${item.at ? "Ya" : "Tidak"}`,
  },
  imunisasi: {
    title: "Riwayat Imunisasi",
    shortLabel: "Imunisasi",
    description:
      "Riwayat keputusan APPROVED dan REJECTED modul imunisasi di desa Anda.",
    fetcher: getImunisasiList,
    detailRoute: (id) => `/imunisasi/${id}`,
    getDate: (item) => item.tgl_imunisasi || item.tanggal,
    getSummary: (item) =>
      `${String(item.jenis_imunisasi || "-").replace(/_/g, " ")} • Suhu ${item.suhu_badan ?? "-"}`,
  },
};

const normalizeRows = (items = [], config) =>
  items
    .map((item) => ({
      id: item.id,
      patientName: item.pasien?.nama || item.nama_pasien || "-",
      patientNik: item.pasien?.nik || item.pasien_nik || "-",
      practice: item.practice_place?.nama_praktik || "-",
      date: config.getDate(item),
      status: item.status_verifikasi || "-",
      summary: config.getSummary(item),
      detailRoute: config.detailRoute(item.id),
    }))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

const ModuleHistoryPage = () => {
  const { moduleKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    search: "",
    status_verifikasi: "",
    tanggal_start: "",
    tanggal_end: "",
  });

  const config = MODULE_CONFIG[moduleKey];

  useEffect(() => {
    if (!isBidanDesa(user)) {
      navigate("/");
      return;
    }

    if (!config) {
      navigate("/");
      return;
    }

    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey, user?.user_id]);

  const stats = useMemo(() => {
    const approved = rows.filter((item) => item.status === "APPROVED").length;
    const rejected = rows.filter((item) => item.status === "REJECTED").length;

    return {
      total: rows.length,
      approved,
      rejected,
      shown: rows.length,
    };
  }, [rows]);

  const fetchHistory = async (overrideFilter = filter) => {
    if (!config) {
      return;
    }

    try {
      setLoading(true);
      const params = { ...overrideFilter };

      Object.keys(params).forEach((key) => {
        if (!params[key]) {
          delete params[key];
        }
      });

      const response = await config.fetcher(params);
      setRows(normalizeRows(response.data || [], config));
      setError("");
    } catch (err) {
      setError(`Gagal memuat ${config?.title?.toLowerCase() || "riwayat data"}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchHistory();
  };

  const handleReset = () => {
    const resetFilter = {
      search: "",
      status_verifikasi: "",
      tanggal_start: "",
      tanggal_end: "",
    };
    setFilter(resetFilter);
    fetchHistory(resetFilter);
  };

  if (!config) {
    return null;
  }

  return (
    <div className="dashboard page-shell module-history-page" style={styles.page}>
      <header className="dashboard-header" style={styles.header}>
        <div className="page-intro">
          <div className="page-kicker">Village History</div>
          <h1 className="page-title" style={styles.pageTitle}>{config.title}</h1>
          <p className="page-subtitle" style={styles.pageSubtitle}>
            {config.description}
          </p>
        </div>
        <div className="page-actions" style={styles.headerActions}>
          <button
            onClick={() => navigate("/")}
            className="btn-secondary"
            style={styles.secondaryButton}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </header>

      <div style={styles.summaryGrid}>
        <div className="stat-card module-history-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Modul</span>
          <strong style={styles.summaryValue}>{config.shortLabel}</strong>
        </div>
        <div className="stat-card module-history-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total Riwayat</span>
          <strong style={styles.summaryValue}>{stats.total}</strong>
        </div>
        <div className="stat-card module-history-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Approved</span>
          <strong style={styles.summaryValue}>{stats.approved}</strong>
        </div>
        <div className="stat-card module-history-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Rejected</span>
          <strong style={styles.summaryValue}>{stats.rejected}</strong>
        </div>
      </div>

      <div
        className="content-card-light module-history-filter-card"
        style={styles.filterCard}
      >
        <div style={styles.filterHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Filter Riwayat</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Tampilkan sebagian informasi penting terlebih dahulu, lalu buka detail
              lengkap bila diperlukan.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} style={styles.filterForm}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Cari Nama / NIK</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ketik nama pasien atau NIK..."
              value={filter.search}
              onChange={(event) =>
                setFilter({ ...filter, search: event.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filter.status_verifikasi}
              onChange={(event) =>
                setFilter({ ...filter, status_verifikasi: event.target.value })
              }
            >
              <option value="">APPROVED + REJECTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dari Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={filter.tanggal_start}
              onChange={(event) =>
                setFilter({ ...filter, tanggal_start: event.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sampai Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={filter.tanggal_end}
              onChange={(event) =>
                setFilter({ ...filter, tanggal_end: event.target.value })
              }
            />
          </div>
          <div style={styles.filterActions}>
            <button type="submit" className="btn-primary" style={styles.primaryButton}>
              Tampilkan
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={styles.secondaryButton}
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {error ? (
        <div className="error-alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      ) : null}

      <div className="module-history-table-shell" style={tableShellStyle}>
        <table className="history-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Pasien</th>
              <th style={{ textAlign: "left" }}>Ringkasan</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th style={{ textAlign: "left" }}>Tempat Praktik</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={styles.tableMessageCell}>
                  Memuat riwayat...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.tableMessageCell}>
                  Belum ada riwayat untuk filter ini.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ textAlign: "left" }}>
                    <div style={styles.cellPrimary}>{row.patientName}</div>
                    <div className="text-muted" style={styles.cellSecondary}>
                      NIK {row.patientNik}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>{row.summary}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>{formatDate(row.date)}</td>
                  <td style={{ textAlign: "left" }}>{row.practice}</td>
                  <td>
                    <button
                      onClick={() =>
                        navigate(row.detailRoute, {
                          state: { backTo: `${location.pathname}${location.search}` },
                        })
                      }
                      className="btn-secondary module-history-detail-btn"
                      style={styles.detailButton}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: "1280px",
    paddingBottom: "3rem",
  },
  header: {
    gap: "1rem",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  pageTitle: {
    marginBottom: "0.35rem",
  },
  pageSubtitle: {
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  primaryButton: {
    width: "auto",
    minWidth: "130px",
    paddingInline: "1rem",
  },
  secondaryButton: {
    width: "auto",
    minWidth: "130px",
    paddingInline: "1rem",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  summaryCard: {
    maxWidth: "none",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  summaryLabel: {
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--color-text-muted)",
  },
  summaryValue: {
    fontSize: "1.55rem",
    lineHeight: 1.2,
  },
  filterCard: {
    maxWidth: "none",
    margin: "0 0 1.5rem",
  },
  filterHeader: {
    marginBottom: "1rem",
  },
  sectionTitle: {
    marginBottom: "0.35rem",
    fontSize: "1.1rem",
  },
  sectionSubtitle: {
    margin: 0,
  },
  filterForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
    alignItems: "end",
  },
  filterActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  tableMessageCell: {
    textAlign: "center",
    padding: "2rem",
  },
  cellPrimary: {
    fontWeight: 600,
  },
  cellSecondary: {
    fontSize: "0.75rem",
    marginTop: "0.2rem",
  },
  detailButton: {
    width: "auto",
    minWidth: "92px",
    paddingInline: "0.9rem",
  },
};

export default ModuleHistoryPage;
