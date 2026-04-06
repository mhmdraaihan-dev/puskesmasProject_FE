import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import {
  getImunisasiList,
  getKBList,
  getKehamilanList,
  getPersalinanList,
  verifyImunisasi,
  verifyKB,
  verifyKehamilan,
  verifyPersalinan,
} from "../../services/api";
import {
  isBidanKoordinator,
  isBidanDesa,
  VERIFICATION_STATUS,
} from "../../utils/roleHelpers";
import { formatDate } from "../../utils/dateFormatter";

const moduleOptions = [
  { value: "ALL", label: "Semua Modul" },
  { value: "KEHAMILAN", label: "Pemeriksaan Kehamilan" },
  { value: "PERSALINAN", label: "Persalinan" },
  { value: "KB", label: "Keluarga Berencana" },
  { value: "IMUNISASI", label: "Imunisasi" },
];

const getTypeLabel = (type) => {
  switch (type) {
    case "KEHAMILAN":
      return "Pemeriksaan Kehamilan";
    case "PERSALINAN":
      return "Persalinan";
    case "KB":
      return "Keluarga Berencana";
    case "IMUNISASI":
      return "Imunisasi";
    default:
      return type;
  }
};

const getDetailPath = (type, id) => {
  switch (type) {
    case "KEHAMILAN":
      return `/pemeriksaan-kehamilan/${id}`;
    case "PERSALINAN":
      return `/persalinan/${id}`;
    case "KB":
      return `/keluarga-berencana/${id}`;
    case "IMUNISASI":
      return `/imunisasi/${id}`;
    default:
      return "#";
  }
};

const getServiceDate = (type, item) => {
  switch (type) {
    case "KEHAMILAN":
      return item.tanggal;
    case "PERSALINAN":
      return item.tanggal_partus || item.tanggal;
    case "KB":
      return item.tanggal_kunjungan || item.tanggal;
    case "IMUNISASI":
      return item.tgl_imunisasi || item.tanggal;
    default:
      return item.tanggal;
  }
};

const PendingDataList = () => {
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    module: "ALL",
    search: "",
    village: "",
  });
  const [rejectDialog, setRejectDialog] = useState({
    isOpen: false,
    id: null,
    type: null,
    patientName: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [verifyLoadingId, setVerifyLoadingId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const isVerifier = isBidanKoordinator(user) || isBidanDesa(user);
    if (!isVerifier) {
      navigate("/");
      return;
    }
    fetchPendingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { status_verifikasi: "PENDING" };
      const [kehamilan, persalinan, kb, imunisasi] = await Promise.all([
        getKehamilanList(params),
        getPersalinanList(params),
        getKBList(params),
        getImunisasiList(params),
      ]);

      const normalizedData = [
        ...(kehamilan?.data || []).map((item) => ({
          ...item,
          type: "KEHAMILAN",
          service_date: getServiceDate("KEHAMILAN", item),
          pasien_nama: item.pasien?.nama || "-",
          pasien_nik: item.pasien?.nik || "-",
          bidan_praktik:
            item.creator?.full_name || item.creator?.name || item.creator?.email || "-",
          lokasi_desa: item.practice_place?.village?.nama_desa || "-",
        })),
        ...(persalinan?.data || []).map((item) => ({
          ...item,
          type: "PERSALINAN",
          service_date: getServiceDate("PERSALINAN", item),
          pasien_nama: item.pasien?.nama || "-",
          pasien_nik: item.pasien?.nik || "-",
          bidan_praktik:
            item.creator?.full_name || item.creator?.name || item.creator?.email || "-",
          lokasi_desa: item.practice_place?.village?.nama_desa || "-",
        })),
        ...(kb?.data || []).map((item) => ({
          ...item,
          type: "KB",
          service_date: getServiceDate("KB", item),
          pasien_nama: item.pasien?.nama || "-",
          pasien_nik: item.pasien?.nik || "-",
          bidan_praktik:
            item.creator?.full_name || item.creator?.name || item.creator?.email || "-",
          lokasi_desa: item.practice_place?.village?.nama_desa || "-",
        })),
        ...(imunisasi?.data || []).map((item) => ({
          ...item,
          type: "IMUNISASI",
          service_date: getServiceDate("IMUNISASI", item),
          pasien_nama: item.pasien?.nama || "-",
          pasien_nik: item.pasien?.nik || "-",
          bidan_praktik:
            item.creator?.full_name || item.creator?.name || item.creator?.email || "-",
          lokasi_desa: item.practice_place?.village?.nama_desa || "-",
        })),
      ];

      normalizedData.sort(
        (a, b) => new Date(b.service_date || 0) - new Date(a.service_date || 0),
      );

      setPendingData(normalizedData);
    } catch (err) {
      setError("Gagal memuat data pending");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return pendingData.filter((item) => {
      const matchesModule =
        filters.module === "ALL" || item.type === filters.module;
      const searchValue = filters.search.trim().toLowerCase();
      const matchesSearch =
        !searchValue ||
        item.pasien_nama?.toLowerCase().includes(searchValue) ||
        item.pasien_nik?.toLowerCase().includes(searchValue);
      const matchesVillage =
        !filters.village ||
        item.lokasi_desa?.toLowerCase().includes(filters.village.toLowerCase());

      return matchesModule && matchesSearch && matchesVillage;
    });
  }, [filters, pendingData]);

  const stats = useMemo(() => {
    const summary = {
      total: filteredData.length,
      kehamilan: filteredData.filter((item) => item.type === "KEHAMILAN").length,
      persalinan: filteredData.filter((item) => item.type === "PERSALINAN").length,
      kb: filteredData.filter((item) => item.type === "KB").length,
      imunisasi: filteredData.filter((item) => item.type === "IMUNISASI").length,
    };

    return summary;
  }, [filteredData]);

  const performVerification = async (id, type, status, alasan = "") => {
    const payload = { status, alasan };
    switch (type) {
      case "KEHAMILAN":
        return verifyKehamilan(id, payload);
      case "PERSALINAN":
        return verifyPersalinan(id, payload);
      case "KB":
        return verifyKB(id, payload);
      case "IMUNISASI":
        return verifyImunisasi(id, payload);
      default:
        throw new Error("Tipe data tidak dikenali");
    }
  };

  const handleApprove = async (id, type, patientName) => {
    if (!confirm(`Setujui data kesehatan pasien "${patientName}"?`)) {
      return;
    }

    try {
      setVerifyLoadingId(`${type}-${id}`);
      await performVerification(
        id,
        type,
        VERIFICATION_STATUS.APPROVED,
        "Disetujui",
      );
      alert("Data berhasil disetujui");
      await fetchPendingData();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || err.message || "Gagal menyetujui data",
      );
    } finally {
      setVerifyLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Alasan penolakan wajib diisi");
      return;
    }

    try {
      setVerifyLoadingId(`${rejectDialog.type}-${rejectDialog.id}`);
      await performVerification(
        rejectDialog.id,
        rejectDialog.type,
        VERIFICATION_STATUS.REJECTED,
        rejectReason,
      );
      alert("Data berhasil ditolak");
      setRejectDialog({ isOpen: false, id: null, type: null, patientName: "" });
      setRejectReason("");
      await fetchPendingData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Gagal menolak data");
    } finally {
      setVerifyLoadingId(null);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Verifikasi Data Kesehatan</h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            Daftar pelayanan yang menunggu persetujuan verifier
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate("/")}
            className="btn-primary"
            style={styles.secondaryButton}
          >
            Kembali
          </button>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total Pending</span>
          <strong style={styles.summaryValue}>{stats.total}</strong>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Kehamilan</span>
          <strong style={styles.summaryValue}>{stats.kehamilan}</strong>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Persalinan</span>
          <strong style={styles.summaryValue}>{stats.persalinan}</strong>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>KB / Imunisasi</span>
          <strong style={styles.summaryValue}>
            {stats.kb} / {stats.imunisasi}
          </strong>
        </div>
      </div>

      <div className="auth-card" style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Filter Verifikasi</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Persempit antrean verifikasi berdasarkan modul, pasien, atau desa
            </p>
          </div>
        </div>

        <div style={styles.filterGrid}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Modul</label>
            <select
              className="form-input"
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            >
              {moduleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Cari Pasien / NIK</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ketik nama pasien atau NIK..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lokasi Desa</label>
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama desa..."
              value={filters.village}
              onChange={(e) => setFilters({ ...filters, village: e.target.value })}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="error-alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      ) : null}

      <div className="auth-card" style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Antrean Verifikasi</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              {loading
                ? "Memuat data pending..."
                : `${filteredData.length} data siap direview`}
            </p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHead}>Pasien</th>
                <th style={styles.tableHead}>Modul</th>
                <th style={styles.tableHead}>Tanggal</th>
                <th style={styles.tableHead}>Desa</th>
                <th style={styles.tableHead}>Bidan Praktik</th>
                <th style={styles.tableHead}>Status</th>
                <th style={styles.tableHead}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={styles.emptyRow}>
                    Memuat data pending...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyRow}>
                    Tidak ada data yang menunggu verifikasi
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const rowLoading = verifyLoadingId === `${item.type}-${item.id}`;
                  return (
                    <tr key={`${item.type}-${item.id}`} style={styles.tableRow}>
                      <td style={styles.tableCellPatient}>
                        <div style={styles.patientName}>{item.pasien_nama}</div>
                        <div style={styles.patientMeta}>NIK {item.pasien_nik}</div>
                      </td>
                      <td style={styles.tableCell}>{getTypeLabel(item.type)}</td>
                      <td style={styles.tableCell}>
                        {formatDate(item.service_date || item.tanggal)}
                      </td>
                      <td style={styles.tableCell}>{item.lokasi_desa || "-"}</td>
                      <td style={styles.tableCell}>{item.bidan_praktik || "-"}</td>
                      <td style={styles.tableCell}>
                        <span style={styles.pendingBadge}>Pending</span>
                      </td>
                      <td style={styles.tableCellAction}>
                        <button
                          onClick={() => navigate(getDetailPath(item.type, item.id))}
                          className="btn-primary"
                          style={styles.detailButton}
                        >
                          Detail
                        </button>
                        <button
                          onClick={() =>
                            handleApprove(item.id, item.type, item.pasien_nama)
                          }
                          className="btn-primary"
                          style={styles.approveButton}
                          disabled={rowLoading}
                        >
                          {rowLoading ? "Proses..." : "Setujui"}
                        </button>
                        <button
                          onClick={() =>
                            setRejectDialog({
                              isOpen: true,
                              id: item.id,
                              type: item.type,
                              patientName: item.pasien_nama,
                            })
                          }
                          className="btn-primary"
                          style={styles.rejectButton}
                          disabled={rowLoading}
                        >
                          Tolak
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectDialog.isOpen ? (
        <div style={styles.modalOverlay}>
          <div className="auth-card" style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Tolak Data Kesehatan</h3>
            <p className="text-muted" style={styles.modalText}>
              Pasien: <strong>{rejectDialog.patientName}</strong>
            </p>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alasan Penolakan *</label>
              <textarea
                className="form-input"
                rows="5"
                placeholder="Jelaskan alasan penolakan data ini..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setRejectDialog({
                    isOpen: false,
                    id: null,
                    type: null,
                    patientName: "",
                  });
                  setRejectReason("");
                }}
                className="btn-primary"
                style={styles.secondaryButton}
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="btn-primary"
                style={styles.rejectButton}
                disabled={!rejectReason.trim()}
              >
                Tolak Data
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const styles = {
  header: {
    gap: "1rem",
    flexWrap: "wrap",
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
  secondaryButton: {
    width: "auto",
    minWidth: "120px",
    paddingInline: "1rem",
    backgroundColor: "transparent",
    border: "1px solid var(--glass-border)",
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
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  tableCard: {
    maxWidth: "none",
    margin: 0,
    padding: "1.25rem",
  },
  tableHeader: {
    marginBottom: "1rem",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "980px",
  },
  tableHead: {
    padding: "0.9rem 0.85rem",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "var(--color-text-muted)",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: "rgba(255,255,255,0.02)",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tableCell: {
    padding: "1rem 0.85rem",
    verticalAlign: "top",
  },
  tableCellPatient: {
    padding: "1rem 0.85rem",
    verticalAlign: "top",
    minWidth: "220px",
  },
  tableCellAction: {
    padding: "1rem 0.85rem",
    verticalAlign: "top",
    minWidth: "240px",
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  patientName: {
    fontWeight: "700",
    marginBottom: "0.2rem",
  },
  patientMeta: {
    color: "var(--color-text-muted)",
    fontSize: "0.85rem",
  },
  pendingBadge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "0.35rem 0.7rem",
    background: "rgba(251, 191, 36, 0.18)",
    border: "1px solid rgba(251, 191, 36, 0.32)",
    color: "#fcd34d",
    fontSize: "0.78rem",
    fontWeight: "700",
  },
  detailButton: {
    width: "auto",
    minWidth: "70px",
    paddingInline: "0.9rem",
    backgroundColor: "rgba(59, 130, 246, 0.22)",
    border: "1px solid rgba(96, 165, 250, 0.45)",
  },
  approveButton: {
    width: "auto",
    minWidth: "86px",
    paddingInline: "0.9rem",
    backgroundColor: "rgba(16, 185, 129, 0.22)",
    border: "1px solid rgba(52, 211, 153, 0.45)",
  },
  rejectButton: {
    width: "auto",
    minWidth: "78px",
    paddingInline: "0.9rem",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    border: "1px solid rgba(248, 113, 113, 0.45)",
  },
  emptyRow: {
    textAlign: "center",
    padding: "3rem 1rem",
    color: "var(--color-text-muted)",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    zIndex: 1000,
  },
  modalCard: {
    width: "100%",
    maxWidth: "520px",
  },
  modalTitle: {
    marginBottom: "0.5rem",
  },
  modalText: {
    margin: "0 0 1rem",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  },
};

export default PendingDataList;
