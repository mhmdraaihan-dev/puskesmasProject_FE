import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import { deletePasien, getPasienList } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  isBidanDesa,
  isBidanKoordinator,
  isBidanPraktik,
} from "../../utils/roleHelpers";

const PasienList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ search: "" });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    dataId: null,
    patientName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const canManage =
    isBidanPraktik(user) || isBidanDesa(user) || isBidanKoordinator(user);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalPatients = dataList.length;
    const patientsWithAddress = dataList.filter(
      (item) => item.alamat_lengkap,
    ).length;
    const latestPatient = dataList[0]?.tanggal_lahir;

    return {
      totalPatients,
      patientsWithAddress,
      latestPatient,
    };
  }, [dataList]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getPasienList({ ...filter });
      setDataList(response.data || []);
      setError("");
    } catch (err) {
      setError("Gagal memuat data pasien");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleReset = async () => {
    const resetFilter = { search: "" };
    setFilter(resetFilter);
    try {
      setLoading(true);
      const response = await getPasienList(resetFilter);
      setDataList(response.data || []);
      setError("");
    } catch (err) {
      setError("Gagal memuat data pasien");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePasien(deleteDialog.dataId);
      setDeleteDialog({ isOpen: false, dataId: null, patientName: "" });
      fetchData();
      alert("Data pasien berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  return (
    <div className="dashboard page-shell" style={styles.page}>
      <div className="dashboard-header" style={styles.header}>
        <div className="page-intro">
          <div className="page-kicker">Patient Records</div>
          <h2 className="page-title" style={styles.pageTitle}>Data Pasien</h2>
          <p className="page-subtitle" style={styles.pageSubtitle}>
            Data pasien yang tampil mengikuti akses akun dan relasi practice place
          </p>
        </div>
        <div className="page-actions" style={styles.headerActions}>
          <button
            onClick={() => navigate("/")}
            className="btn-secondary"
            style={styles.secondaryButton}
          >
            Kembali
          </button>
          {canManage ? (
            <button
              onClick={() => navigate("/pasien/add")}
              className="btn-primary"
              style={styles.primaryButton}
            >
              + Pasien Baru
            </button>
          ) : null}
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div className="stat-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total Pasien</span>
          <strong style={styles.summaryValue}>{stats.totalPatients}</strong>
        </div>
        <div className="stat-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Data Alamat Terisi</span>
          <strong style={styles.summaryValue}>{stats.patientsWithAddress}</strong>
        </div>
        <div className="stat-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Filter Aktif</span>
          <strong style={styles.summaryValue}>
            {filter.search ? "Pencarian Manual" : "Semua Data"}
          </strong>
          <span className="text-muted" style={styles.summaryHelper}>
            {filter.search || "Belum ada kata kunci"}
          </span>
        </div>
        <div className="stat-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Referensi Tanggal</span>
          <strong style={styles.summaryValue}>
            {stats.latestPatient ? formatDate(stats.latestPatient) : "-"}
          </strong>
          <span className="text-muted" style={styles.summaryHelper}>
            Mengikuti data yang tampil saat ini
          </span>
        </div>
      </div>

      <div className="content-card-light" style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <div>
            <h3 style={styles.sectionTitle}>Pencarian Pasien</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Cari pasien berdasarkan nama atau NIK
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} style={styles.filterForm}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama / NIK</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ketik nama pasien atau NIK..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <div style={styles.filterActions}>
            <button type="submit" className="btn-primary" style={styles.primaryButton}>
              Cari Data
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

      {loading ? (
        <div style={styles.loadingState}>
          <p>Memuat data pasien...</p>
        </div>
      ) : dataList.length === 0 ? (
        <div className="content-card-light" style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>Belum ada data pasien</h3>
          <p className="text-muted" style={styles.emptySubtitle}>
            {canManage
              ? "Silakan tambahkan pasien baru atau ubah kata kunci pencarian."
              : "Belum ada data pasien yang dapat ditampilkan."}
          </p>
          {canManage ? (
            <button
              onClick={() => navigate("/pasien/add")}
              className="btn-primary"
              style={styles.primaryButton}
            >
              + Tambah Pasien
            </button>
          ) : null}
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {dataList.map((item) => (
            <div
              key={item.pasien_id}
              className="content-card-light"
              style={styles.patientCard}
            >
              <div style={styles.cardHeader}>
                <div style={styles.identityWrap}>
                  <div style={styles.avatar}>
                    {item.nama?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3 style={styles.patientName}>{item.nama}</h3>
                    <p className="text-muted" style={styles.identityMeta}>
                      NIK {item.nik || "-"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/pasien/${item.pasien_id}`)}
                  className="btn-primary"
                  style={styles.viewButton}
                >
                  Lihat Detail
                </button>
              </div>

              <div style={styles.metaGrid}>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>Tanggal Lahir</span>
                  <span style={styles.metaValue}>
                    {formatDate(item.tanggal_lahir)}
                  </span>
                </div>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>Alamat</span>
                  <span style={styles.metaValue}>{item.alamat_lengkap || "-"}</span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => navigate(`/pasien/${item.pasien_id}`)}
                  className="btn-primary"
                  style={styles.inlinePrimaryAction}
                >
                  Riwayat Pelayanan
                </button>
                {canManage ? (
                  <>
                    <button
                      onClick={() => navigate(`/pasien/${item.pasien_id}/edit`)}
                      className="btn-primary"
                      style={styles.inlineSecondaryAction}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteDialog({
                          isOpen: true,
                          dataId: item.pasien_id,
                          patientName: item.nama,
                        })
                      }
                      className="btn-primary"
                      style={styles.inlineDangerAction}
                    >
                      Hapus
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, dataId: null, patientName: "" })
        }
        onConfirm={handleDelete}
        title="Hapus Data Pasien"
        message={`Menghapus pasien "${deleteDialog.patientName}" juga akan menghapus riwayat layanan yang terhubung. Pastikan data ini memang sudah tidak diperlukan.`}
        confirmText="Hapus Data"
        cancelText="Batal"
        type="warning"
      />
    </div>
  );
};

const styles = {
  page: {
    maxWidth: "1240px",
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
    minWidth: "150px",
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
  summaryHelper: {
    fontSize: "0.85rem",
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
    gridTemplateColumns: "minmax(0, 1fr) auto",
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
  cardGrid: {
    display: "grid",
    gap: "1rem",
  },
  patientCard: {
    maxWidth: "none",
    margin: 0,
    padding: "1rem 1.1rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  identityWrap: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(59,130,246,0.7))",
    color: "#fff",
    fontWeight: "700",
    fontSize: "1.2rem",
    flexShrink: 0,
  },
  patientName: {
    fontSize: "1.05rem",
    marginBottom: "0.2rem",
  },
  identityMeta: {
    margin: 0,
  },
  viewButton: {
    width: "auto",
    minWidth: "140px",
    paddingInline: "1rem",
    backgroundColor: "rgba(59, 130, 246, 0.22)",
    border: "1px solid rgba(96, 165, 250, 0.45)",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0.85rem",
  },
  metaCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "0.8rem 0.9rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.62)",
    border: "1px solid rgba(73, 62, 50, 0.1)",
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
    marginTop: "0.9rem",
    paddingTop: "0.9rem",
    borderTop: "1px solid rgba(73, 62, 50, 0.08)",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  inlinePrimaryAction: {
    width: "auto",
    minWidth: "160px",
    paddingInline: "1rem",
  },
  inlineSecondaryAction: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(232, 165, 90, 0.16)",
    border: "1px solid rgba(212, 160, 23, 0.28)",
    color: "#8d6119",
  },
  inlineDangerAction: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(198, 69, 69, 0.12)",
    border: "1px solid rgba(198, 69, 69, 0.24)",
    color: "#a13a3a",
  },
};

export default PasienList;
