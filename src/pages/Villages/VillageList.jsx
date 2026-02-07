import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVillages, deleteVillage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import RoleGuard from "../../components/RoleGuard";
import ConfirmDialog from "../../components/ConfirmDialog";
import "../../App.css";

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
    fetchVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      setLoading(true);
      const response = await getVillages();
      // Backend response structure: { success: true, data: [...] }
      setVillages(
        response.success && Array.isArray(response.data) ? response.data : [],
      );
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
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Manajemen Desa</h2>
          <p className="text-muted">Kelola data desa dan tempat praktik</p>
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
              onClick={() => navigate("/villages/add")}
              className="btn-primary"
            >
              + Tambah Desa
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
      ) : villages.length === 0 ? (
        <div
          className="auth-card"
          style={{ textAlign: "center", padding: "3rem" }}
        >
          <p style={{ color: "var(--text-muted)" }}>Belum ada data desa</p>
          <RoleGuard allowedRoles={["ADMIN"]}>
            <button
              onClick={() => navigate("/villages/add")}
              className="btn-primary"
              style={{ marginTop: "1rem" }}
            >
              Tambah Desa Pertama
            </button>
          </RoleGuard>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {villages.map((village) => (
            <div key={village.village_id} className="auth-card">
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  {village.nama_desa}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>👥 {village._count?.users || 0} Bidan</span>
                  <span>🏥 {village._count?.practice_places || 0} Praktik</span>
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
                  onClick={() => navigate(`/villages/${village.village_id}`)}
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
                      navigate(`/villages/${village.village_id}/edit`)
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
                        villageId: village.village_id,
                        villageName: village.nama_desa,
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

export default VillageList;
