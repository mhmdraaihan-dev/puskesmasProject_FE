import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPasienList, deletePasien } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatDate } from "../../utils/dateFormatter";
import {
  isBidanPraktik,
  isAdmin,
  isBidanDesa,
  isBidanKoordinator,
} from "../../utils/roleHelpers";
import "../../App.css";

const PasienList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    search: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    dataId: null,
    patientName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  // Allow Admin and Bidan Praktik to manage patients
  const canManage =
    isBidanPraktik(user) || isBidanDesa(user) || isBidanKoordinator(user);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        ...filter,
      };

      const response = await getPasienList(params);
      setDataList(response.data || []);
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
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Data Pasien</h2>
          <p className="text-muted">Master data pasien Puskesmas</p>
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
          {canManage && (
            <button
              onClick={() => navigate("/pasien/add")}
              className="btn-primary"
            >
              + Pasien Baru
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
            gridTemplateColumns: "1fr auto",
            gap: "1rem",
            alignItems: "end",
          }}
        >
          <div>
            <label className="form-label">Cari Pasien</label>
            <input
              type="text"
              className="form-input"
              placeholder="Cari Nama atau NIK..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn-primary"
              style={{ minWidth: "120px" }}
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
            Belum ada data pasien. {canManage && "Silakan tambah pasien baru."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {dataList.map((item) => (
            <div key={item.pasien_id} className="auth-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "0.5rem",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                    {item.nama}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      color: "var(--text-muted)",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span>NIK: {item.nik}</span>
                    <span>•</span>
                    <span>Tgl Lahir: {formatDate(item.tanggal_lahir)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
                <p>{item.alamat_lengkap}</p>
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
                  onClick={() => navigate(`/pasien/${item.pasien_id}`)}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "rgba(59, 130, 246, 0.3)",
                    border: "1px solid #60a5fa",
                  }}
                >
                  Lihat Detail & Riwayat
                </button>
                {canManage && (
                  <>
                    <button
                      onClick={() => navigate(`/pasien/${item.pasien_id}/edit`)}
                      className="btn-primary"
                      style={{
                        flex: 0.5,
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
                          dataId: item.pasien_id,
                          patientName: item.nama,
                        })
                      }
                      className="btn-primary"
                      style={{
                        flex: 0.5,
                        padding: "0.5rem",
                        fontSize: "0.875rem",
                        backgroundColor: "rgba(239, 68, 68, 0.3)",
                        border: "1px solid #ef4444",
                      }}
                    >
                      Hapus
                    </button>
                  </>
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
        title="HAPUS DATA PASIEN?"
        message={`PERINGATAN: Menghapus pasien "${deleteDialog.patientName}" akan MENGHAPUS SELURUH RIWAYAT MEDIS (Kehamilan, Persalinan, KB, Imunisasi) terkait pasien ini. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Semua Data"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default PasienList;
