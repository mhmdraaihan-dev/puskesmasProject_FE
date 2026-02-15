import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getKehamilanList, deleteKehamilan } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatDate } from "../../utils/dateFormatter";
import {
  canEditKehamilan,
  canDeleteKehamilan,
  isBidanPraktik,
  isAdmin,
} from "../../utils/roleHelpers";
import "../../App.css";

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

  // Check if user has permission to add data
  const canAddData = isBidanPraktik(user);

  useEffect(() => {
    if (isAdmin(user)) {
      navigate("/");
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.resti, user, navigate]); // Refresh when resti filter changes immediately? Or manual search?
  // Usually search is debounced or on enter/button. Resti dropdown can be immediate.
  // Let's make search manual or debounced. For now, manual "Cari" button or effect on change.
  // Given the structure of HealthDataList, it fetches on filter change.

  // Debounce search fetching?
  // For simplicity, let's just use an effect that depends on all filters, perhaps with a small delay for text input if we wanted auto-search.
  // However, to match HealthDataList style, we might want to just fetch on effect.

  // But wait, the previous HealthDataList fetched on `filter` change.
  // I'll add a 'Cari' button for text search to avoid too many requests, but immediate for dropdowns.

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        ...filter,
      };
      // Clean up empty params
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await getKehamilanList(params);
      // API response structure check: "List Data GET" -> usually returns { data: [], meta: ... } or just [].
      // HealthDataList expected `response.data || []`. Let's assume similar wrapper.
      setDataList(response.data || []);
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
      <div className="dashboard-header">
        <div>
          <h2>Pemeriksaan Kehamilan</h2>
          <p className="text-muted">Kelola data pemeriksaan kehamilan pasien</p>
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
          {canAddData && (
            <button
              onClick={() => navigate("/pemeriksaan-kehamilan/add")}
              className="btn-primary"
            >
              + Input Data Baru
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="auth-card" style={{ marginBottom: "1.5rem" }}>
        <form
          onSubmit={handleSearch}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            alignItems: "end",
          }}
        >
          <div>
            <label className="form-label">Cari Nama / NIK</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ketik nama atau NIK..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Resiko Tinggi</label>
            <select
              className="form-input"
              value={filter.resti}
              onChange={(e) => {
                setFilter({ ...filter, resti: e.target.value });
                // Trigger fetch immediately for dropdown if desired, or wait for 'Cari'
              }}
            >
              <option value="">Semua</option>
              <option value="RENDAH">Rendah</option>
              <option value="SEDANG">Sedang</option>
              <option value="TINGGI">Tinggi</option>
            </select>
          </div>
          <div>
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
          <div>
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
          <div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
            >
              Cari
            </button>
          </div>
        </form>
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
      ) : dataList.length === 0 ? (
        <div
          className="auth-card"
          style={{ textAlign: "center", padding: "3rem" }}
        >
          <p style={{ color: "var(--text-muted)" }}>
            Belum ada data pemeriksaan
          </p>
          {canAddData && (
            <button
              onClick={() => navigate("/pemeriksaan-kehamilan/add")}
              className="btn-primary"
              style={{ marginTop: "1rem" }}
            >
              Input Data Pertama
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {dataList.map((item) => (
            <div key={item.id} className="auth-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.125rem", marginBottom: "0.25rem" }}>
                    {item.pasien?.nama || item.nama_pasien || "Pasien"}
                  </h3>
                  <p
                    style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
                  >
                    {formatDate(item.tanggal)} • {item.jenis_kunjungan}
                  </p>
                </div>
                <StatusBadge status={item.status_verifikasi} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Umur Kehamilan
                  </p>
                  <p>{item.umur_kehamilan} minggu</p>
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    GPA
                  </p>
                  <p>{item.gpa}</p>
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Resiko Tinggi
                  </p>
                  <span
                    style={{
                      color:
                        item.resti === "TINGGI"
                          ? "#ef4444"
                          : item.resti === "SEDANG"
                            ? "#fbbf24"
                            : "#10b981",
                      fontWeight: "bold",
                    }}
                  >
                    {item.resti}
                  </span>
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Tempat Praktik
                  </p>
                  <p>{item.practice_place?.nama_praktik || "-"}</p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <button
                  onClick={() => navigate(`/pemeriksaan-kehamilan/${item.id}`)}
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
                {canEditKehamilan(user, item) && (
                  <button
                    onClick={() =>
                      navigate(`/pemeriksaan-kehamilan/${item.id}/edit`)
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
                )}
                {canDeleteKehamilan(user, item) && (
                  <button
                    onClick={() =>
                      setDeleteDialog({
                        isOpen: true,
                        dataId: item.id,
                        patientName: item.pasien?.nama || item.nama_pasien,
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
                )}
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
        title="Hapus Data"
        message={`Apakah Anda yakin ingin menghapus data pemeriksaan "${deleteDialog.patientName}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default PemeriksaanKehamilanList;
