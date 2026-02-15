import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPracticePlaces, deletePracticePlace } from "../../services/api";
import RoleGuard from "../../components/RoleGuard";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { isAdmin } from "../../utils/roleHelpers";
import "../../App.css";

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
  }, [user, navigate]);

  const fetchPracticePlaces = async () => {
    try {
      setLoading(true);
      const response = await getPracticePlaces();
      // Backend response structure: { success: true, data: [...] }
      setPracticePlaces(
        response.success && Array.isArray(response.data) ? response.data : [],
      );
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
      <div className="dashboard-header">
        <div>
          <h2>Manajemen Tempat Praktik</h2>
          <p className="text-muted">Kelola tempat praktik bidan</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => navigate("/")}
            className="btn-primary"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--glass-border)",
            }}
          >
            Kembali
          </button>
          <RoleGuard allowedRoles={["ADMIN"]}>
            <button
              onClick={() => navigate("/practice-places/add")}
              className="btn-primary"
            >
              + Tambah Tempat Praktik
            </button>
          </RoleGuard>
        </div>
      </div>

      {error && (
        <div className="error-alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Memuat data...</p>
        </div>
      ) : practicePlaces.length === 0 ? (
        <div
          className="auth-card"
          style={{ textAlign: "center", padding: "3rem" }}
        >
          <p style={{ color: "var(--text-muted)" }}>
            Belum ada data tempat praktik
          </p>
          <RoleGuard allowedRoles={["ADMIN"]}>
            <button
              onClick={() => navigate("/practice-places/add")}
              className="btn-primary"
              style={{ marginTop: "1rem" }}
            >
              Tambah Tempat Praktik Pertama
            </button>
          </RoleGuard>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {practicePlaces.map((place) => (
            <div key={place.practice_id} className="auth-card">
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  {place.nama_praktik}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  🏘️ {place.village?.nama_desa || "-"}
                </p>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.5rem",
                  }}
                >
                  📍 {place.alamat}
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  👤 {place.user?.full_name || "-"}
                </p>
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                  }}
                >
                  📊 {place._count?.health_data || 0} data kesehatan
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <button
                  onClick={() =>
                    navigate(`/practice-places/${place.practice_id}`)
                  }
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "rgba(59, 130, 246, 0.3)",
                    border: "1px solid #60a5fa",
                  }}
                >
                  Detail
                </button>
                <RoleGuard allowedRoles={["ADMIN"]}>
                  <button
                    onClick={() =>
                      navigate(`/practice-places/${place.practice_id}/edit`)
                    }
                    className="btn-primary"
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      fontSize: "0.875rem",
                      backgroundColor: "rgba(168, 85, 247, 0.3)",
                      border: "1px solid #a855f7",
                    }}
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
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      fontSize: "0.875rem",
                      backgroundColor: "rgba(239, 68, 68, 0.3)",
                      border: "1px solid #ef4444",
                    }}
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

export default PracticePlaceList;
