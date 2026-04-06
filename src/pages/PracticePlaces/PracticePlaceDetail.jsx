import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleGuard from "../../components/RoleGuard";
import "../../App.css";
import { getPracticePlaceById } from "../../services/api";

const PracticePlaceDetail = () => {
  const { practiceId } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const assignedUsers =
    Array.isArray(place?.users) && place.users.length > 0
      ? place.users
      : place?.user
        ? [place.user]
        : [];

  useEffect(() => {
    fetchPracticePlace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceId]);

  const fetchPracticePlace = async () => {
    try {
      setLoading(true);
      const response = await getPracticePlaceById(practiceId);
      setPlace(response.data);
      setError("");
    } catch (err) {
      setError("Gagal memuat detail tempat praktik");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Memuat data tempat praktik...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="dashboard">
        <div className="error-alert">
          {error || "Tempat praktik tidak ditemukan"}
        </div>
        <button
          onClick={() => navigate("/practice-places")}
          className="btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>{place.nama_praktik}</h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            Detail relasi praktik, desa, dan bidan terhubung
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate("/practice-places")}
            className="btn-primary"
            style={styles.secondaryButton}
          >
            Kembali
          </button>
          <RoleGuard allowedRoles={["ADMIN"]}>
            <button
              onClick={() => navigate(`/practice-places/${practiceId}/edit`)}
              className="btn-primary"
              style={styles.primaryButton}
            >
              Edit
            </button>
          </RoleGuard>
        </div>
      </div>

      <div className="auth-card" style={styles.heroCard}>
        <div style={styles.heroTop}>
          <div>
            <div style={styles.badge}>Tempat Praktik</div>
            <h3 style={styles.heroTitle}>{place.nama_praktik}</h3>
            <p className="text-muted" style={{ margin: 0 }}>
              Desa {place.village?.nama_desa || "-"}
            </p>
          </div>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Bidan Terhubung</span>
            <span style={styles.summaryValue}>{assignedUsers.length}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Riwayat Data</span>
            <span style={styles.summaryValue}>{place._count?.health_data || 0}</span>
          </div>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div className="auth-card" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Informasi Utama</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Ringkasan profil tempat praktik
            </p>
          </div>

          <div style={styles.detailGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Nama Praktik</span>
              <span style={styles.detailValue}>{place.nama_praktik}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Desa</span>
              <span style={styles.detailValue}>{place.village?.nama_desa || "-"}</span>
            </div>
            <div style={{ ...styles.detailItem, gridColumn: "1 / -1" }}>
              <span style={styles.detailLabel}>Alamat Lengkap</span>
              <span style={styles.detailValue}>{place.alamat || "-"}</span>
            </div>
          </div>
        </div>

        <div className="auth-card" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Bidan Praktik</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Tenaga yang terhubung ke tempat praktik ini
            </p>
          </div>

          {assignedUsers.length > 0 ? (
            <div style={styles.staffGrid}>
              {assignedUsers.map((practiceUser) => (
                <div key={practiceUser.user_id} style={styles.staffCard}>
                  <h4 style={styles.staffName}>{practiceUser.full_name}</h4>
                  <p className="text-muted" style={styles.staffMeta}>
                    {practiceUser.email}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p className="text-muted" style={{ margin: 0 }}>
                Belum ada bidan praktik yang terhubung
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="auth-card" style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Statistik Data</h3>
          <p className="text-muted" style={styles.sectionSubtitle}>
            Ringkasan data yang terkait dengan tempat praktik ini
          </p>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Data Tersimpan</span>
            <span style={styles.summaryValue}>{place._count?.health_data || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: { gap: "1rem", flexWrap: "wrap" },
  pageTitle: { marginBottom: "0.35rem" },
  pageSubtitle: { margin: 0 },
  headerActions: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  primaryButton: { width: "auto", minWidth: "120px", paddingInline: "1rem" },
  secondaryButton: {
    width: "auto",
    minWidth: "120px",
    paddingInline: "1rem",
    backgroundColor: "transparent",
    border: "1px solid var(--glass-border)",
  },
  heroCard: { maxWidth: "none", margin: "0 0 1.5rem", padding: "1.75rem" },
  heroTop: { marginBottom: "1.25rem" },
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
    marginBottom: "0.75rem",
  },
  heroTitle: { marginBottom: "0.35rem", fontSize: "1.7rem" },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.85rem",
  },
  summaryItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "1rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  summaryLabel: {
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--color-text-muted)",
  },
  summaryValue: { fontWeight: "700", lineHeight: 1.5 },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  sectionCard: { maxWidth: "none", margin: 0, padding: "1.5rem" },
  sectionHeader: { marginBottom: "1rem" },
  sectionTitle: { marginBottom: "0.35rem", fontSize: "1.1rem" },
  sectionSubtitle: { margin: 0 },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "0.85rem",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "1rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  detailLabel: {
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--color-text-muted)",
  },
  detailValue: { lineHeight: 1.5, fontWeight: "600" },
  staffGrid: { display: "grid", gap: "0.85rem" },
  staffCard: {
    padding: "1rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  staffName: { marginBottom: "0.25rem" },
  staffMeta: { margin: 0 },
  emptyState: {
    minHeight: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: "14px",
    border: "1px dashed rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    padding: "1rem",
  },
};

export default PracticePlaceDetail;
