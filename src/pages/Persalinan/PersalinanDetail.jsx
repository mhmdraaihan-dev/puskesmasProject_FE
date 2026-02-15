import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPersalinanDetail,
  verifyPersalinan,
  deletePersalinan,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatDate } from "../../utils/dateFormatter";
import {
  canEditPersalinan,
  canDeletePersalinan,
  canVerifyPersalinan,
} from "../../utils/roleHelpers";
import "../../App.css";

const PersalinanDetail = () => {
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
      const response = await getPersalinanDetail(id);
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
      await verifyPersalinan(id, { status, alasan });
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
      await deletePersalinan(id);
      alert("Data berhasil dihapus");
      navigate("/persalinan");
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

  const isVerifier = canVerifyPersalinan(user);
  const ibu = data.keadaan_ibu_persalinan || {};
  const bayi = data.keadaan_bayi_persalinan || {};

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
            <h2 style={{ marginBottom: "0.25rem" }}>Detail Persalinan</h2>
            <p className="text-muted">
              ID: {data.id} • {formatDate(data.tanggal_partus)}
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

        {/* General Info */}
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
                Pasien
              </label>
              <p style={{ fontSize: "1.125rem", fontWeight: "500" }}>
                {data.pasien?.nama || data.nama_pasien || "-"}
              </p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Riwayat (GPA)
              </label>
              <p>
                G{data.gravida} P{data.para} A{data.abortus}
              </p>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Checklist Awal
              </label>
              <ul style={{ paddingLeft: "1.2rem", marginTop: "0.25rem" }}>
                <li>Vit K: {data.vit_k ? "Ya" : "Tidak"}</li>
                <li>Hep B0: {data.hb_0 ? "Ya" : "Tidak"}</li>
                <li>Vit A Bufas: {data.vit_a_bufas ? "Ya" : "Tidak"}</li>
              </ul>
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
            <div>
              <label className="text-muted" style={{ fontSize: "0.875rem" }}>
                Catatan
              </label>
              <p>{data.catatan || "-"}</p>
            </div>
          </div>
        </div>

        {/* Kondisi Ibu */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
            Kondisi Ibu
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Kondisi Umum</span>
              <p
                style={{
                  fontWeight: "bold",
                  color: ibu.baik ? "#10b981" : "#ef4444",
                }}
              >
                {ibu.baik ? "Sehat/Baik" : "Ada Masalah"}
              </p>
            </div>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Status Hidup</span>
              <p>
                {ibu.hidup ? (
                  "Hidup"
                ) : (
                  <span style={{ color: "#ef4444" }}>Meninggal</span>
                )}
              </p>
            </div>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Pendarahan (HAP)</span>
              <p>
                {ibu.hap ? (
                  <span style={{ color: "#ef4444" }}>Ya</span>
                ) : (
                  "Tidak"
                )}
              </p>
            </div>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Partus Lama</span>
              <p>
                {ibu.partus_lama ? (
                  <span style={{ color: "#ef4444" }}>Ya</span>
                ) : (
                  "Tidak"
                )}
              </p>
            </div>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Pre-eklamsi</span>
              <p>
                {ibu.pre_eklamsi ? (
                  <span style={{ color: "#ef4444" }}>Ya</span>
                ) : (
                  "Tidak"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Kondisi Bayi */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
            Data Bayi
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Jenis Kelamin</span>
              <p>{bayi.jenis_kelamin}</p>
            </div>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Berat Badan</span>
              <p>{bayi.bb} gram</p>
            </div>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Panjang Badan</span>
              <p>{bayi.pb} cm</p>
            </div>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Status Hidup</span>
              <p>
                {bayi.hidup ? (
                  "Hidup"
                ) : (
                  <span style={{ color: "#ef4444" }}>Meninggal</span>
                )}
              </p>
            </div>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Asfiksia</span>
              <p>
                {bayi.asfiksia ? (
                  <span style={{ color: "#ef4444" }}>Ya</span>
                ) : (
                  "Tidak"
                )}
              </p>
            </div>
            <div
              style={{
                padding: "0.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "0.25rem",
              }}
            >
              <span className="text-muted">Gangguan Nafas</span>
              <p>
                {bayi.rds ? (
                  <span style={{ color: "#ef4444" }}>RDS (Ya)</span>
                ) : (
                  "Tidak"
                )}
              </p>
            </div>
          </div>
          {bayi.cacat_bawaan && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: "0.5rem",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <h4 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>
                Cacat Bawaan
              </h4>
              <p>{bayi.keterangan_cacat}</p>
            </div>
          )}
        </div>

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
            onClick={() => navigate("/persalinan")}
            className="btn-primary"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--glass-border)",
            }}
          >
            Kembali
          </button>

          {/* Owner Actions */}
          {canEditPersalinan(user, data) && (
            <button
              onClick={() => navigate(`/persalinan/${id}/edit`)}
              className="btn-primary"
              style={{
                backgroundColor: "rgba(168, 85, 247, 0.3)",
                border: "1px solid #a855f7",
              }}
            >
              Edit
            </button>
          )}
          {canDeletePersalinan(user, data) && (
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
        message="Apakah Anda yakin ingin menghapus data ini? Aksi ini akan menghapus data ibu dan anak terkait."
        confirmText="Hapus Permanen"
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
              placeholder="Contoh: Data kurang lengkap..."
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

export default PersalinanDetail;
