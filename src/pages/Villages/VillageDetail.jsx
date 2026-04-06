import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleGuard from "../../components/RoleGuard";
import "../../App.css";
import { getVillageById } from "../../services/api";
import { getPositionLabel } from "../../utils/roleHelpers";

const VillageDetail = () => {
  const { villageId } = useParams();
  const navigate = useNavigate();
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVillage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villageId]);

  const fetchVillage = async () => {
    try {
      setLoading(true);
      const response = await getVillageById(villageId);
      setVillage(response.data);
      setError("");
    } catch (err) {
      setError("Gagal memuat detail desa");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Memuat data desa...</p>
        </div>
      </div>
    );
  }

  if (error || !village) {
    return (
      <div className="dashboard">
        <div className="error-alert">{error || "Data desa tidak ditemukan"}</div>
        <button
          onClick={() => navigate("/villages")}
          className="btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Kembali ke Daftar Desa
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>{village.nama_desa}</h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            Ringkasan bidan dan tempat praktik di wilayah ini
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate("/villages")}
            className="btn-primary"
            style={styles.secondaryButton}
          >
            Kembali
          </button>
          <RoleGuard allowedRoles={["ADMIN"]}>
            <button
              onClick={() => navigate(`/villages/${villageId}/edit`)}
              className="btn-primary"
              style={styles.primaryButton}
            >
              Edit Desa
            </button>
          </RoleGuard>
        </div>
      </div>

      <div className="auth-card" style={styles.heroCard}>
        <div style={styles.heroTop}>
          <div>
            <div style={styles.badge}>Wilayah Desa</div>
            <h3 style={styles.heroTitle}>{village.nama_desa}</h3>
            <p className="text-muted" style={{ margin: 0 }}>
              Data master untuk relasi bidan desa dan tempat praktik
            </p>
          </div>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Bidan</span>
            <span style={styles.summaryValue}>{village.users?.length || 0}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Tempat Praktik</span>
            <span style={styles.summaryValue}>
              {village.practice_places?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div className="auth-card" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Daftar Bidan</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Tenaga yang terdaftar pada desa ini
            </p>
          </div>

          {village.users && village.users.length > 0 ? (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHead}>Nama</th>
                    <th style={styles.tableHead}>Email</th>
                    <th style={styles.tableHead}>Posisi</th>
                  </tr>
                </thead>
                <tbody>
                  {village.users.map((user) => (
                    <tr key={user.user_id} style={styles.tableRow}>
                      <td style={styles.tableCellStrong}>{user.full_name}</td>
                      <td style={styles.tableCellMuted}>{user.email}</td>
                      <td style={styles.tableCell}>
                        <span className="role-badge">
                          {getPositionLabel(user.position_user)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p className="text-muted" style={{ margin: 0 }}>
                Belum ada bidan di desa ini
              </p>
            </div>
          )}
        </div>

        <div className="auth-card" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Tempat Praktik</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Daftar praktik yang terhubung ke desa ini
            </p>
          </div>

          {village.practice_places && village.practice_places.length > 0 ? (
            <div style={styles.practiceGrid}>
              {village.practice_places.map((place) => (
                <div key={place.practice_id} style={styles.practiceCard}>
                  <h4 style={styles.practiceTitle}>{place.nama_praktik}</h4>
                  <p className="text-muted" style={styles.practiceMeta}>
                    {place.alamat}
                  </p>
                  {Array.isArray(place.users) && place.users.length > 0 ? (
                    <p style={styles.practiceStaff}>
                      Bidan:{" "}
                      {place.users.map((practiceUser) => practiceUser.full_name).join(", ")}
                    </p>
                  ) : place.user ? (
                    <p style={styles.practiceStaff}>Bidan: {place.user.full_name}</p>
                  ) : (
                    <p className="text-muted" style={styles.practiceStaff}>
                      Belum ada bidan terhubung
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p className="text-muted" style={{ margin: 0 }}>
                Belum ada tempat praktik di desa ini
              </p>
            </div>
          )}
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
  primaryButton: { width: "auto", minWidth: "140px", paddingInline: "1rem" },
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
  },
  sectionCard: { maxWidth: "none", margin: 0, padding: "1.5rem" },
  sectionHeader: { marginBottom: "1rem" },
  sectionTitle: { marginBottom: "0.35rem", fontSize: "1.1rem" },
  sectionSubtitle: { margin: 0 },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: {
    padding: "0.85rem 0.75rem",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "var(--color-text-muted)",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tableRow: { borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tableCell: { padding: "0.85rem 0.75rem" },
  tableCellStrong: { padding: "0.85rem 0.75rem", fontWeight: "700" },
  tableCellMuted: {
    padding: "0.85rem 0.75rem",
    color: "var(--color-text-muted)",
  },
  practiceGrid: { display: "grid", gap: "1rem" },
  practiceCard: {
    padding: "1rem",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  practiceTitle: { marginBottom: "0.35rem" },
  practiceMeta: { margin: "0 0 0.6rem" },
  practiceStaff: { fontSize: "0.9rem", lineHeight: 1.5, margin: 0 },
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

export default VillageDetail;
