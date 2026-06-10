import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import RoleGuard from "../../components/RoleGuard";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import { deleteVillage, getVillages } from "../../services/api";
import { isAdmin } from "../../utils/roleHelpers";

const getVillageMidwifeTotal = (village) => {
  if (typeof village?.total_bidan_wilayah === "number") {
    return village.total_bidan_wilayah;
  }

  if (
    typeof village?.total_bidan_desa === "number" ||
    typeof village?.total_bidan_praktik === "number"
  ) {
    return (village?.total_bidan_desa || 0) + (village?.total_bidan_praktik || 0);
  }

  return village?._count?.users || 0;
};

const VillageList = () => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    villageId: null,
    villageName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isAdmin(user)) {
      navigate("/");
      return;
    }
    fetchVillages();
  }, [user, navigate]);

  const summary = useMemo(() => {
    const totalVillages = villages.length;
    const totalMidwives = villages.reduce(
      (sum, village) => sum + getVillageMidwifeTotal(village),
      0,
    );
    const totalPractices = villages.reduce(
      (sum, village) => sum + (village._count?.practice_places || 0),
      0,
    );

    return { totalVillages, totalMidwives, totalPractices };
  }, [villages]);

  const fetchVillages = async () => {
    try {
      setLoading(true);
      const response = await getVillages();
      setVillages(
        response.success && Array.isArray(response.data) ? response.data : [],
      );
      setError("");
    } catch (err) {
      setError("Gagal memuat data desa");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVillage(deleteDialog.villageId);
      setDeleteDialog({ isOpen: false, villageId: null, villageName: "" });
      await fetchVillages();
      alert("Desa berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus desa");
    }
  };

  return (
    <div className="dashboard page-shell">
      <div className="dashboard-header" style={styles.header}>
        <div className="page-intro">
          <div className="page-kicker">Village Management</div>
          <h2 className="page-title" style={styles.pageTitle}>Manajemen Desa</h2>
          <p className="page-subtitle" style={styles.pageSubtitle}>
            Kelola desa, ringkasan bidan, dan relasi tempat praktik
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
          <RoleGuard allowedRoles={["ADMIN"]}>
            <button
              onClick={() => navigate("/villages/add")}
              className="btn-primary"
              style={styles.primaryButton}
            >
              + Tambah Desa
            </button>
          </RoleGuard>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div className="stat-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total Desa</span>
          <strong style={styles.summaryValue}>{summary.totalVillages}</strong>
        </div>
        <div className="stat-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total Bidan</span>
          <strong style={styles.summaryValue}>{summary.totalMidwives}</strong>
        </div>
        <div className="stat-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Tempat Praktik</span>
          <strong style={styles.summaryValue}>{summary.totalPractices}</strong>
        </div>
      </div>

      {error ? (
        <div className="error-alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div style={styles.loadingState}>
          <p>Memuat data desa...</p>
        </div>
      ) : villages.length === 0 ? (
        <div className="content-card-light" style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>Belum ada data desa</h3>
          <p className="text-muted" style={styles.emptySubtitle}>
            Tambahkan desa pertama untuk mulai mengelola wilayah dan praktik.
          </p>
          <RoleGuard allowedRoles={["ADMIN"]}>
            <button
              onClick={() => navigate("/villages/add")}
              className="btn-primary"
              style={styles.primaryButton}
            >
              Tambah Desa Pertama
            </button>
          </RoleGuard>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {villages.map((village) => (
            <div key={village.village_id} className="content-card-light" style={styles.villageCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>{village.nama_desa}</h3>
                  <p className="text-muted" style={styles.cardSubtitle}>
                    Ringkasan sumber daya desa
                  </p>
                </div>
                <span style={styles.badge}>Desa</span>
              </div>

              <div style={styles.metaGrid}>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>Total Bidan</span>
                  <span style={styles.metaValue}>
                    {getVillageMidwifeTotal(village)}
                  </span>
                </div>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>Tempat Praktik</span>
                  <span style={styles.metaValue}>
                    {village._count?.practice_places || 0}
                  </span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => navigate(`/villages/${village.village_id}`)}
                  className="btn-primary"
                  style={styles.detailButton}
                >
                  Detail
                </button>
                <RoleGuard allowedRoles={["ADMIN"]}>
                  <button
                    onClick={() => navigate(`/villages/${village.village_id}/edit`)}
                    className="btn-primary"
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setDeleteDialog({
                        isOpen: true,
                        villageId: village.village_id,
                        villageName: village.nama_desa,
                      })
                    }
                    className="btn-primary"
                    style={styles.deleteButton}
                  >
                    Hapus
                  </button>
                </RoleGuard>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, villageId: null, villageName: "" })
        }
        onConfirm={handleDelete}
        title="Hapus Desa"
        message={`Apakah Anda yakin ingin menghapus desa "${deleteDialog.villageName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

const styles = {
  header: { gap: "1rem", flexWrap: "wrap" },
  pageTitle: { marginBottom: "0.35rem" },
  pageSubtitle: { margin: 0 },
  headerActions: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  primaryButton: { width: "auto", minWidth: "150px", paddingInline: "1rem" },
  secondaryButton: {
    width: "auto",
    minWidth: "120px",
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
  summaryValue: { fontSize: "1.55rem", lineHeight: 1.2 },
  loadingState: { textAlign: "center", padding: "3rem" },
  emptyCard: {
    maxWidth: "none",
    margin: 0,
    textAlign: "center",
    padding: "3rem",
  },
  emptyTitle: { marginBottom: "0.6rem" },
  emptySubtitle: { marginBottom: "1.25rem" },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1rem",
  },
  villageCard: { maxWidth: "none", margin: 0 },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  cardTitle: { fontSize: "1.2rem", marginBottom: "0.25rem" },
  cardSubtitle: { margin: 0 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.4rem 0.8rem",
    borderRadius: "999px",
    background: "rgba(204, 120, 92, 0.14)",
    border: "1px solid rgba(204, 120, 92, 0.24)",
    color: "var(--color-primary-dark)",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0.85rem",
  },
  metaCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "1rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(73, 62, 50, 0.1)",
  },
  metaLabel: {
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--color-text-muted)",
  },
  metaValue: { fontWeight: "700", lineHeight: 1.5 },
  cardFooter: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(73, 62, 50, 0.08)",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  detailButton: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(93, 184, 166, 0.16)",
    border: "1px solid rgba(93, 184, 166, 0.3)",
    color: "#236b5d",
  },
  editButton: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(232, 165, 90, 0.16)",
    border: "1px solid rgba(212, 160, 23, 0.28)",
    color: "#8d6119",
  },
  deleteButton: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(198, 69, 69, 0.12)",
    border: "1px solid rgba(198, 69, 69, 0.24)",
    color: "#a13a3a",
  },
};

export default VillageList;
