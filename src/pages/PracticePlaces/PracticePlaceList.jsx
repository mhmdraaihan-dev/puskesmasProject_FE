import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import RoleGuard from "../../components/RoleGuard";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import { deletePracticePlace, getPracticePlaces } from "../../services/api";
import { isAdmin } from "../../utils/roleHelpers";

const getAssignedMidwivesLabel = (place) => {
  if (Array.isArray(place.users) && place.users.length > 0) {
    return place.users.map((practiceUser) => practiceUser.full_name).join(", ");
  }
  return place.user?.full_name || "-";
};

const PracticePlaceList = () => {
  const [practicePlaces, setPracticePlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    practiceId: null,
    practiceName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isAdmin(user)) {
      navigate("/");
      return;
    }
    fetchPracticePlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const summary = useMemo(() => {
    const totalPractices = practicePlaces.length;
    const totalMidwives = practicePlaces.reduce((sum, place) => {
      if (Array.isArray(place.users) && place.users.length > 0) {
        return sum + place.users.length;
      }
      return sum + (place.user ? 1 : 0);
    }, 0);
    const totalHealthData = practicePlaces.reduce(
      (sum, place) => sum + (place._count?.health_data || 0),
      0,
    );

    return { totalPractices, totalMidwives, totalHealthData };
  }, [practicePlaces]);

  const fetchPracticePlaces = async () => {
    try {
      setLoading(true);
      const response = await getPracticePlaces();
      setPracticePlaces(
        response.success && Array.isArray(response.data) ? response.data : [],
      );
      setError("");
    } catch (err) {
      setError("Gagal memuat data tempat praktik");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePracticePlace(deleteDialog.practiceId);
      setDeleteDialog({ isOpen: false, practiceId: null, practiceName: "" });
      await fetchPracticePlaces();
      alert("Tempat praktik berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus tempat praktik");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Manajemen Tempat Praktik</h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            Kelola praktik bidan, keterkaitan desa, dan penugasan bidan praktik
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
          <RoleGuard allowedRoles={["ADMIN"]}>
            <button
              onClick={() => navigate("/practice-places/add")}
              className="btn-primary"
              style={styles.primaryButton}
            >
              + Tambah Tempat Praktik
            </button>
          </RoleGuard>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Total Praktik</span>
          <strong style={styles.summaryValue}>{summary.totalPractices}</strong>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Bidan Terhubung</span>
          <strong style={styles.summaryValue}>{summary.totalMidwives}</strong>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Riwayat Data</span>
          <strong style={styles.summaryValue}>{summary.totalHealthData}</strong>
        </div>
      </div>

      {error ? (
        <div className="error-alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div style={styles.loadingState}>
          <p>Memuat data tempat praktik...</p>
        </div>
      ) : practicePlaces.length === 0 ? (
        <div className="auth-card" style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>Belum ada data tempat praktik</h3>
          <p className="text-muted" style={styles.emptySubtitle}>
            Tambahkan tempat praktik pertama untuk mulai menghubungkan bidan praktik.
          </p>
          <RoleGuard allowedRoles={["ADMIN"]}>
            <button
              onClick={() => navigate("/practice-places/add")}
              className="btn-primary"
              style={styles.primaryButton}
            >
              Tambah Tempat Praktik Pertama
            </button>
          </RoleGuard>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {practicePlaces.map((place) => (
            <div key={place.practice_id} className="auth-card" style={styles.practiceCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>{place.nama_praktik}</h3>
                  <p className="text-muted" style={styles.cardSubtitle}>
                    Desa {place.village?.nama_desa || "-"}
                  </p>
                </div>
                <span style={styles.badge}>Praktik</span>
              </div>

              <div style={styles.metaGrid}>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>Alamat</span>
                  <span style={styles.metaValue}>{place.alamat || "-"}</span>
                </div>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>Bidan Praktik</span>
                  <span style={styles.metaValue}>
                    {getAssignedMidwivesLabel(place)}
                  </span>
                </div>
                <div style={styles.metaCard}>
                  <span style={styles.metaLabel}>Riwayat Data</span>
                  <span style={styles.metaValue}>
                    {place._count?.health_data || 0}
                  </span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => navigate(`/practice-places/${place.practice_id}`)}
                  className="btn-primary"
                  style={styles.detailButton}
                >
                  Detail
                </button>
                <RoleGuard allowedRoles={["ADMIN"]}>
                  <button
                    onClick={() =>
                      navigate(`/practice-places/${place.practice_id}/edit`)
                    }
                    className="btn-primary"
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setDeleteDialog({
                        isOpen: true,
                        practiceId: place.practice_id,
                        practiceName: place.nama_praktik,
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
          setDeleteDialog({ isOpen: false, practiceId: null, practiceName: "" })
        }
        onConfirm={handleDelete}
        title="Hapus Tempat Praktik"
        message={`Apakah Anda yakin ingin menghapus tempat praktik "${deleteDialog.practiceName}"?`}
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
  primaryButton: { width: "auto", minWidth: "170px", paddingInline: "1rem" },
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
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1rem",
  },
  practiceCard: { maxWidth: "none", margin: 0 },
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
    background: "rgba(59,130,246,0.16)",
    border: "1px solid rgba(96,165,250,0.35)",
    color: "#93c5fd",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  metaGrid: { display: "grid", gap: "0.85rem" },
  metaCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "1rem",
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
  metaValue: { lineHeight: 1.5, fontWeight: "600" },
  cardFooter: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  detailButton: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(59,130,246,0.22)",
    border: "1px solid rgba(96,165,250,0.45)",
  },
  editButton: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(168,85,247,0.22)",
    border: "1px solid rgba(168,85,247,0.45)",
  },
  deleteButton: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
    backgroundColor: "rgba(239,68,68,0.2)",
    border: "1px solid rgba(248,113,113,0.45)",
  },
};

export default PracticePlaceList;
