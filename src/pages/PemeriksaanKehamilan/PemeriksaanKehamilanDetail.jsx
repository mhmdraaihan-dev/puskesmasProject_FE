import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getKehamilanDetail,
  verifyKehamilan,
  deleteKehamilan,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatDate } from "../../utils/dateFormatter";
import {
  canEditKehamilan,
  canDeleteKehamilan,
  canVerifyKehamilan,
} from "../../utils/roleHelpers";
import "../../App.css";

const PemeriksaanKehamilanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Verification state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [verifyProcessing, setVerifyProcessing] = useState(false);

  // Delete state
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await getKehamilanDetail(id);
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
      await verifyKehamilan(id, { status, alasan });
      await fetchDetail(); // Refresh data
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
      await deleteKehamilan(id);
      alert("Data berhasil dihapus");
      navigate("/pemeriksaan-kehamilan");
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

  const isVerifier = canVerifyKehamilan(user);
  const report = data.ceklab_report || {};

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
            <h2 style={{ marginBottom: "0.25rem" }}>Detail Pemeriksaan</h2>
            <p className="text-muted">
              ID: {data.id} • {formatDate(data.tanggal)}
            </p>
          </div>
          <StatusBadge status={data.status_verifikasi} />
        </div>

        {/* Rejection Reason Badge */}
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
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Pasien
              </label>
              <p style={{ fontSize: "1.125rem", fontWeight: "500" }}>
                {data.pasien?.nama || data.nama_pasien || "-"}
              </p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Umur Kehamilan
              </label>
              <p>{data.umur_kehamilan} minggu</p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                GPA
              </label>
              <p>{data.gpa}</p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Tekanan Darah
              </label>
              <p>{data.td} mmHg</p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Berat Badan
              </label>
              <p>{data.bb} kg</p>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Jenis Kunjungan
              </label>
              <p>{data.jenis_kunjungan}</p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Status TT
              </label>
              <p>{data.status_tt}</p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                LILA
              </label>
              <p>{data.lila} cm</p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Resiko Tinggi
              </label>
              <p
                style={{
                  color:
                    data.resti === "TINGGI"
                      ? "#ef4444"
                      : data.resti === "SEDANG"
                        ? "#fbbf24"
                        : "#10b981",
                  fontWeight: "bold",
                }}
              >
                {data.resti}
              </p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Tempat Praktik
              </label>
              <p>{data.practice_place?.nama_praktik || "-"}</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label
            className="text-muted"
            style={{
              fontSize: "0.875rem",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Catatan
          </label>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "0.5rem",
            }}
          >
            {data.catatan || "-"}
          </div>
        </div>

        {/* Cek Lab Report */}
        {Object.keys(report).length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                marginBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "0.5rem",
              }}
            >
              Hasil Cek Lab
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Golongan Darah
                </label>
                <p>{report.golongan_darah || "-"}</p>
              </div>
              <div>
                <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Hemoglobin (Hb)
                </label>
                <p>{report.hb ? `${report.hb} g/dL` : "-"}</p>
              </div>
              <div>
                <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                  HIV
                </label>
                <p>
                  {report.hiv === true
                    ? "Positif"
                    : report.hiv === false
                      ? "Negatif"
                      : "-"}
                </p>
              </div>
              <div>
                <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                  HBsAg
                </label>
                <p>
                  {report.hbsag === true
                    ? "Positif"
                    : report.hbsag === false
                      ? "Negatif"
                      : "-"}
                </p>
              </div>
              <div>
                <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                  Sifilis
                </label>
                <p>
                  {report.sifilis === true
                    ? "Positif"
                    : report.sifilis === false
                      ? "Negatif"
                      : "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
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
            onClick={() => navigate("/pemeriksaan-kehamilan")}
            className="btn-primary"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--glass-border)",
            }}
          >
            Kembali
          </button>

          {/* Owner Actions */}
          {canEditKehamilan(user, data) && (
            <button
              onClick={() => navigate(`/pemeriksaan-kehamilan/${id}/edit`)}
              className="btn-primary"
              style={{
                backgroundColor: "rgba(168, 85, 247, 0.3)",
                border: "1px solid #a855f7",
              }}
            >
              Edit
            </button>
          )}
          {canDeleteKehamilan(user, data) && (
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

          {/* Verifier Actions */}
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Hapus Data"
        message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />

      {/* Reject Modal */}
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
            <p style={{ marginBottom: "1rem" }}>
              Silakan masukkan alasan penolakan:
            </p>
            <textarea
              className="form-input"
              rows="4"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Data kurang lengkap, hasil lab tidak terbaca..."
            ></textarea>
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
                {verifyProcessing ? "Menolak..." : "Kirim Penolakan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PemeriksaanKehamilanDetail;
