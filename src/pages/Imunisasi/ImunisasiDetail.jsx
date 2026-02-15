import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getImunisasiDetail,
  verifyImunisasi,
  deleteImunisasi,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatDate } from "../../utils/dateFormatter";
import {
  canEditImunisasi,
  canDeleteImunisasi,
  canVerifyImunisasi,
} from "../../utils/roleHelpers";
import "../../App.css";

const ImunisasiDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [verifyProcessing, setVerifyProcessing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await getImunisasiDetail(id);
      setData(response.data);
    } catch (err) {
      setError("Gagal memuat detail data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDisplay = async (status, alasan = "") => {
    try {
      setVerifyProcessing(true);
      await verifyImunisasi(id, { status, alasan });
      await fetchDetail();
      if (status === "REJECTED") setShowRejectModal(false);
      alert(`Data berhasil di-${status === "APPROVED" ? "setujui" : "tolak"}`);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memproses verifikasi");
    } finally {
      setVerifyProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteImunisasi(id);
      alert("Data berhasil dihapus");
      navigate("/imunisasi");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Memuat...</div>
    );
  if (error) return <div className="error-alert">{error}</div>;
  if (!data)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Data tidak ditemukan
      </div>
    );

  const isVerifier = canVerifyImunisasi(user);

  return (
    <div className="dashboard">
      <div
        className="auth-card"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ marginBottom: "0.25rem" }}>Detail Imunisasi</h2>
            <p className="text-muted">
              ID: {data.id} • {formatDate(data.tgl_imunisasi)}
            </p>
          </div>
          <StatusBadge status={data.status_verifikasi} />
        </div>

        {data.status_verifikasi === "REJECTED" && data.alasan_penolakan && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "1rem",
              borderRadius: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h4
              style={{
                color: "#ef4444",
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              ⚠ Ditolak
            </h4>
            <p style={{ color: "#ef4444" }}>{data.alasan_penolakan}</p>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: "1.5rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Pasien (Anak)
              </label>
              <p style={{ fontSize: "1.125rem", fontWeight: "500" }}>
                {data.pasien?.nama || data.nama_pasien || "-"}
              </p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Jenis Imunisasi
              </label>
              <p style={{ fontWeight: "bold", color: "var(--accent-color)" }}>
                {data.jenis_imunisasi?.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Orang Tua
              </label>
              <p>{data.nama_orangtua}</p>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Tempat Praktik
              </label>
              <p>{data.practice_place?.nama_praktik || "-"}</p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Berat Badan
                </label>
                <p>{data.berat_badan} kg</p>
              </div>
              <div>
                <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Suhu Badan
                </label>
                <p>{data.suhu_badan ? `${data.suhu_badan}°C` : "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label className="text-muted" style={{ fontSize: "0.875rem" }}>
            Catatan
          </label>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            {data.catatan || "Tidak ada catatan"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "1.5rem",
          }}
        >
          <button
            onClick={() => navigate("/imunisasi")}
            className="btn-primary"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--glass-border)",
            }}
          >
            Kembali
          </button>

          {canEditImunisasi(user, data) && (
            <button
              onClick={() => navigate(`/imunisasi/${id}/edit`)}
              className="btn-primary"
              style={{
                backgroundColor: "rgba(168, 85, 247, 0.3)",
                border: "1px solid #a855f7",
              }}
            >
              Edit
            </button>
          )}
          {canDeleteImunisasi(user, data) && (
            <button
              onClick={() => setDeleteDialog(true)}
              className="btn-primary"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.3)",
                border: "1px solid #ef4444",
              }}
            >
              Hapus
            </button>
          )}

          {isVerifier && data.status_verifikasi === "PENDING" && (
            <>
              <div style={{ flex: 1 }}></div>
              <button
                onClick={() => handleVerifyDisplay("APPROVED")}
                className="btn-primary"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.3)",
                  border: "1px solid #10b981",
                }}
                disabled={verifyProcessing}
              >
                {verifyProcessing ? "Proses..." : "✓ Setujui"}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="btn-primary"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.3)",
                  border: "1px solid #ef4444",
                }}
                disabled={verifyProcessing}
              >
                ✕ Tolak
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Hapus Data"
        message="Apakah Anda yakin ingin menghapus data ini?"
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />

      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="auth-card"
            style={{ width: "100%", maxWidth: "400px" }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Tolak Data</h3>
            <textarea
              className="form-input"
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
                marginTop: "1rem",
              }}
            >
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-primary"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid var(--glass-border)",
                }}
              >
                Batal
              </button>
              <button
                onClick={() => handleVerifyDisplay("REJECTED", rejectReason)}
                className="btn-primary"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.5)" }}
                disabled={!rejectReason || verifyProcessing}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImunisasiDetail;
