import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import { deleteKehamilan, getKehamilanList } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  canDeleteKehamilan,
  canEditKehamilan,
  isAdmin,
  isBidanPraktik,
} from "../../utils/roleHelpers";

const restiStyleMap = {
  TINGGI: {
    background: "rgba(239, 68, 68, 0.18)",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    color: "#fca5a5",
  },
  SEDANG: {
    background: "rgba(251, 191, 36, 0.16)",
    border: "1px solid rgba(251, 191, 36, 0.35)",
    color: "#fcd34d",
  },
  RENDAH: {
    background: "rgba(16, 185, 129, 0.16)",
    border: "1px solid rgba(52, 211, 153, 0.35)",
    color: "#6ee7b7",
  },
};

const PemeriksaanKehamilanList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    search: "",
    tanggal_start: "",
    tanggal_end: "",
    resti: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    dataId: null,
    patientName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const canAddData = isBidanPraktik(user);

  useEffect(() => {
    if (isAdmin(user)) {
      navigate("/");
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const stats = useMemo(() => {
    const total = dataList.length;
    const pending = dataList.filter((item) => item.status_verifikasi === "PENDING").length;
    const approved = dataList.filter((item) => item.status_verifikasi === "APPROVED").length;
    const rejected = dataList.filter((item) => item.status_verifikasi === "REJECTED").length;

    return { total, pending, approved, rejected };
  }, [dataList]);

  const fetchData = async (overrideFilter = filter) => {
    try {
      setLoading(true);
      const params = { ...overrideFilter };
      Object.keys(params).forEach((key) => {
        if (!params[key]) {
          delete params[key];
        }
      });

      const response = await getKehamilanList(params);
      setDataList(response.data || []);
      setError("");
    } catch (err) {
      setError("Gagal memuat data pemeriksaan kehamilan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDelete = async () => {
    try {
      await deleteKehamilan(deleteDialog.dataId);
      setDeleteDialog({ isOpen: false, dataId: null, patientName: "" });
      fetchData();
      alert("Data pemeriksaan berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Pemeriksaan Kehamilan</h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            {canAddData
              ? "Input, pantau, dan kelola pemeriksaan kehamilan pasien"
              : "Lihat data pemeriksaan kehamilan dan proses verifikasi yang masuk"}
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
          {canAddData ? (
            <button
              onClick={() => navigate("/pemeriksaan-kehamilan/add")}
              className="btn-primary"
              style={styles.primaryButton}
            >
              + Input Data Baru
            </button>
          ) : null}
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total Data</span>
          <strong style={styles.summaryValue}>{stats.total}</strong>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Menunggu Verifikasi</span>
          <strong style={styles.summaryValue}>{stats.pending}</strong>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Disetujui</span>
          <strong style={styles.summaryValue}>{stats.approved}</strong>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Ditolak</span>
          <strong style={styles.summaryValue}>{stats.rejected}</strong>
        </div>
      </div>

      <div className="auth-card" style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Filter Pemeriksaan</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Persempit data berdasarkan pasien, rentang tanggal, dan level risiko
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
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Risiko Tinggi</label>
            <select
              className="form-input"
              value={filter.resti}
              onChange={(e) => setFilter({ ...filter, resti: e.target.value })}
            >
              <option value="">Semua Level</option>
              <option value="RENDAH">Rendah</option>
              <option value="SEDANG">Sedang</option>
              <option value="TINGGI">Tinggi</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Dari Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={filter.tanggal_start}
              onChange={(e) =>
                setFilter({ ...filter, tanggal_start: e.target.value })
              }
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sampai Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={filter.tanggal_end}
              onChange={(e) =>
                setFilter({ ...filter, tanggal_end: e.target.value })
              }
            />
          </div>
          <div style={styles.filterActions}>
            <button type="submit" className="btn-primary" style={styles.primaryButton}>
              Cari
            </button>
            <button
              type="button"
              className="btn-primary"
              style={styles.secondaryButton}
              onClick={() => {
                const resetFilter = {
                  search: "",
                  tanggal_start: "",
                  tanggal_end: "",
                  resti: "",
                };
                setFilter(resetFilter);
                fetchData(resetFilter);
              }}
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

      {loading ? (
        <div style={styles.loadingState}>
          <p>Memuat data pemeriksaan kehamilan...</p>
        </div>
      ) : dataList.length === 0 ? (
        <div className="auth-card" style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>Belum ada data pemeriksaan</h3>
          <p className="text-muted" style={styles.emptySubtitle}>
            {canAddData
              ? "Silakan tambahkan data baru atau ubah filter pencarian."
              : "Belum ada data pemeriksaan yang bisa ditampilkan saat ini."}
          </p>
          {canAddData ? (
            <button
              onClick={() => navigate("/pemeriksaan-kehamilan/add")}
              className="btn-primary"
              style={styles.primaryButton}
            >
              Input Data Pertama
            </button>
          ) : null}
        </div>
      ) : (
        <div style={styles.listGrid}>
          {dataList.map((item) => {
            const patientName = item.pasien?.nama || item.nama_pasien || "Pasien";
            const restiStyle = restiStyleMap[item.resti] || restiStyleMap.RENDAH;

            return (
              <div key={item.id} className="auth-card" style={styles.dataCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.headerTopRow}>
                      <h3 style={styles.cardTitle}>{patientName}</h3>
                      {item.status_verifikasi ? (
                        <StatusBadge status={item.status_verifikasi} />
                      ) : null}
                    </div>
                    <p className="text-muted" style={styles.cardSubtitle}>
                      {formatDate(item.tanggal)} | {item.jenis_kunjungan || "-"}
                    </p>
                  </div>
                  <span style={{ ...styles.restiBadge, ...restiStyle }}>
                    Risiko {item.resti || "-"}
                  </span>
                </div>

                <div style={styles.metaGrid}>
                  <div style={styles.metaCard}>
                    <span style={styles.metaLabel}>Umur Kehamilan</span>
                    <span style={styles.metaValue}>
                      {item.umur_kehamilan || "-"} minggu
                    </span>
                  </div>
                  <div style={styles.metaCard}>
                    <span style={styles.metaLabel}>GPA</span>
                    <span style={styles.metaValue}>{item.gpa || "-"}</span>
                  </div>
                  <div style={styles.metaCard}>
                    <span style={styles.metaLabel}>Tempat Praktik</span>
                    <span style={styles.metaValue}>
                      {item.practice_place?.nama_praktik || "-"}
                    </span>
                  </div>
                  <div style={styles.metaCard}>
                    <span style={styles.metaLabel}>Tekanan Darah</span>
                    <span style={styles.metaValue}>{item.td || "-"}</span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <button
                    onClick={() => navigate(`/pemeriksaan-kehamilan/${item.id}`)}
                    className="btn-primary"
                    style={styles.inlinePrimaryAction}
                  >
                    Detail
                  </button>
                  {canEditKehamilan(user, item) ? (
                    <button
                      onClick={() =>
                        navigate(`/pemeriksaan-kehamilan/${item.id}/edit`)
                      }
                      className="btn-primary"
                      style={styles.inlineSecondaryAction}
                    >
                      Edit
                    </button>
                  ) : null}
                  {canDeleteKehamilan(user, item) ? (
                    <button
                      onClick={() =>
                        setDeleteDialog({
                          isOpen: true,
                          dataId: item.id,
                          patientName,
                        })
                      }
                      className="btn-primary"
                      style={styles.inlineDangerAction}
                    >
                      Hapus
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, dataId: null, patientName: "" })
        }
        onConfirm={handleDelete}
        title="Hapus Data"
        message={`Apakah Anda yakin ingin menghapus data pemeriksaan "${deleteDialog.patientName}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
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
  primaryButton: {
    width: "auto",
    minWidth: "140px",
    paddingInline: "1rem",
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
  loadingState: {
    textAlign: "center",
    padding: "3rem",
  },
  emptyCard: {
    maxWidth: "none",
    margin: 0,
    textAlign: "center",
    padding: "3rem",
  },
  emptyTitle: {
    marginBottom: "0.6rem",
  },
  emptySubtitle: {
    marginBottom: "1.25rem",
  },
  listGrid: {
    display: "grid",
    gap: "1rem",
  },
  dataCard: {
    maxWidth: "none",
    margin: 0,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  headerTopRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginBottom: "0.35rem",
  },
  cardTitle: {
    fontSize: "1.2rem",
    marginBottom: 0,
  },
  cardSubtitle: {
    margin: 0,
  },
  restiBadge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "0.45rem 0.8rem",
    fontSize: "0.8rem",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "0.85rem",
  },
  metaCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "0.95rem 1rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  metaLabel: {
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--color-text-muted)",
  },
  metaValue: {
    lineHeight: 1.5,
    fontWeight: "600",
  },
  cardFooter: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  inlinePrimaryAction: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(59, 130, 246, 0.22)",
    border: "1px solid rgba(96, 165, 250, 0.45)",
  },
  inlineSecondaryAction: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(168, 85, 247, 0.22)",
    border: "1px solid rgba(168, 85, 247, 0.45)",
  },
  inlineDangerAction: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    border: "1px solid rgba(248, 113, 113, 0.45)",
  },
};

export default PemeriksaanKehamilanList;
