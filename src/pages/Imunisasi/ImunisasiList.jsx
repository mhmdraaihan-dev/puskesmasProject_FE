import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getImunisasiList, deleteImunisasi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatDate } from "../../utils/dateFormatter";
import {
  canEditImunisasi,
  canDeleteImunisasi,
  isBidanPraktik,
  isAdmin,
} from "../../utils/roleHelpers";
import "../../App.css";

const ImunisasiList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    search: "",
    tanggal_start: "",
    tanggal_end: "",
    jenis_imunisasi: "",
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

      const response = await getImunisasiList(params);
      setDataList(response.data || []);
    } catch (err) {
      setError("Gagal memuat data imunisasi");
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
      await deleteImunisasi(deleteDialog.dataId);
      setDeleteDialog({ isOpen: false, dataId: null, patientName: "" });
      fetchData();
      alert("Data imunisasi berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Imunisasi</h2>
          <p className="text-muted">Kelola data imunisasi anak</p>
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
              onClick={() => navigate("/imunisasi/add")}
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
            <label className="form-label">Jenis Imunisasi</label>
            <select
              className="form-input"
              value={filter.jenis_imunisasi}
              onChange={(e) =>
                setFilter({ ...filter, jenis_imunisasi: e.target.value })
              }
            >
              <option value="">Semua</option>
              {/* Dasar */}
              <option value="HB_0">HB 0</option>
              <option value="BCG">BCG</option>
              <option value="POLIO_1">POLIO 1</option>
              <option value="POLIO_2">POLIO 2</option>
              <option value="POLIO_3">POLIO 3</option>
              <option value="POLIO_4">POLIO 4</option>
              <option value="DPT_HB_HIB_1">DPT-HB-Hib 1</option>
              <option value="DPT_HB_HIB_2">DPT-HB-Hib 2</option>
              <option value="DPT_HB_HIB_3">DPT-HB-Hib 3</option>
              <option value="CAMPAK">CAMPAK</option>
              <option value="IPV">IPV</option>
              {/* Lanjutan */}
              <option value="DPT_HB_HIB_LANJUTAN">DPT-HB-Hib Lanjutan</option>
              <option value="CAMPAK_LANJUTAN">Campak Lanjutan</option>
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
          <p style={{ color: "var(--text-muted)" }}>Belum ada data imunisasi</p>
          {canAddData && (
            <button
              onClick={() => navigate("/imunisasi/add")}
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
                    {formatDate(item.tgl_imunisasi)} •{" "}
                    {item.practice_place?.nama_praktik || "-"}
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
                    Jenis Imunisasi
                  </p>
                  <p
                    style={{ fontWeight: "bold", color: "var(--accent-color)" }}
                  >
                    {item.jenis_imunisasi?.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Kondisi Anak
                  </p>
                  <p>
                    {item.berat_badan} kg / {item.suhu_badan}°C
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Orang Tua
                  </p>
                  <p>{item.nama_orangtua}</p>
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
                  onClick={() => navigate(`/imunisasi/${item.id}`)}
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
                {canEditImunisasi(user, item) && (
                  <button
                    onClick={() => navigate(`/imunisasi/${item.id}/edit`)}
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
                {canDeleteImunisasi(user, item) && (
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
        message={`Apakah Anda yakin ingin menghapus data imunisasi "${deleteDialog.patientName}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default ImunisasiList;
