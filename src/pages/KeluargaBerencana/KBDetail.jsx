import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import { deleteKB, getKBDetail, verifyKB } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import { canDeleteKB, canEditKB, canVerifyKB } from "../../utils/roleHelpers";

const formatMethod = (value) => value?.replace(/_/g, " ") || "-";

const KBDetail = () => {
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
      const response = await getKBDetail(id);
      setData(response.data);
      setError("");
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
      await verifyKB(id, { status, alasan });
      await fetchDetail();
      if (status === "REJECTED") {
        setShowRejectModal(false);
        setRejectReason("");
      }
      alert(`Data berhasil di-${status === "APPROVED" ? "setujui" : "tolak"}`);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memproses verifikasi");
    } finally {
      setVerifyProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteKB(id);
      alert("Data berhasil dihapus");
      navigate("/keluarga-berencana");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Memuat...</div>;
  }

  if (error) {
    return <div className="error-alert">{error}</div>;
  }

  if (!data) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Data tidak ditemukan
      </div>
    );
  }

  const isVerifier = canVerifyKB(user);
  const canEdit = canEditKB(user, data);
  const canDelete = canDeleteKB(user, data);
  const patientName = data.pasien?.nama || data.nama_pasien || "-";

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Detail Keluarga Berencana</h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            ID {data.id} | {formatDate(data.tanggal_kunjungan)}
          </p>
        </div>
        <div style={styles.headerActions}>
          <StatusBadge status={data.status_verifikasi} />
          <button
            onClick={() => navigate("/keluarga-berencana")}
            className="btn-primary"
            style={styles.secondaryButton}
          >
            Kembali ke List
          </button>
        </div>
      </div>

      {data.status_verifikasi === "REJECTED" && data.alasan_penolakan ? (
        <div style={styles.rejectBanner}>
          <div>
            <h3 style={styles.rejectTitle}>Data Ditolak</h3>
            <p style={styles.rejectText}>{data.alasan_penolakan}</p>
          </div>
        </div>
      ) : null}

      <div className="auth-card" style={styles.heroCard}>
        <div style={styles.heroTop}>
          <div>
            <div style={styles.identityBadge}>Pasien</div>
            <h3 style={styles.patientName}>{patientName}</h3>
            <p className="text-muted" style={styles.patientMeta}>
              {data.practice_place?.nama_praktik || "Tempat praktik belum tersedia"}
            </p>
          </div>
          <span
            style={{
              ...styles.methodBadge,
              ...(data.at ? styles.methodBadgeAlert : styles.methodBadgeSafe),
            }}
          >
            {formatMethod(data.alat_kontrasepsi)}
          </span>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Metode Kontrasepsi</span>
            <span style={styles.summaryValue}>
              {formatMethod(data.alat_kontrasepsi)}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Abortus Terancam</span>
            <span style={styles.summaryValue}>
              {data.at ? "Ya, perlu perhatian" : "Tidak"}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Anak Laki-laki</span>
            <span style={styles.summaryValue}>{data.jumlah_anak_laki || 0}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Anak Perempuan</span>
            <span style={styles.summaryValue}>
              {data.jumlah_anak_perempuan || 0}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div className="auth-card" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Ringkasan Pelayanan KB</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Data utama yang tercatat pada kunjungan ini
            </p>
          </div>

          <div style={styles.detailGrid}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Tanggal Kunjungan</span>
              <span style={styles.detailValue}>
                {formatDate(data.tanggal_kunjungan)}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Tempat Praktik</span>
              <span style={styles.detailValue}>
                {data.practice_place?.nama_praktik || "-"}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Total Anak Hidup</span>
              <span style={styles.detailValue}>
                {(data.jumlah_anak_laki || 0) + (data.jumlah_anak_perempuan || 0)}
              </span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Risiko AT</span>
              <span style={styles.detailValue}>
                {data.at ? "Ada riwayat / indikasi" : "Tidak ada"}
              </span>
            </div>
          </div>

          <div style={styles.noteCard}>
            <span style={styles.detailLabel}>Keterangan / Keluhan</span>
            <p style={styles.noteText}>{data.keterangan || "Tidak ada keterangan"}</p>
          </div>
        </div>

        <div className="auth-card" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Status dan Tindak Lanjut</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Aksi tersedia mengikuti hak akses pengguna
            </p>
          </div>

          <div style={styles.actionSummary}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Status Verifikasi</span>
              <span style={styles.detailValue}>{data.status_verifikasi || "-"}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Verifier</span>
              <span style={styles.detailValue}>
                {data.verifier?.name || data.verifier?.email || "-"}
              </span>
            </div>
          </div>

          <div style={styles.actionBlock}>
            {canEdit ? (
              <button
                onClick={() => navigate(`/keluarga-berencana/${id}/edit`)}
                className="btn-primary"
                style={styles.editButton}
              >
                Edit Data
              </button>
            ) : null}
            {canDelete ? (
              <button
                onClick={() => setDeleteDialog(true)}
                className="btn-primary"
                style={styles.deleteButton}
              >
                Hapus Data
              </button>
            ) : null}
          </div>

          {isVerifier && data.status_verifikasi === "PENDING" ? (
            <div style={styles.verificationCard}>
              <h4 style={styles.verificationTitle}>Aksi Verifikasi</h4>
              <p className="text-muted" style={styles.verificationText}>
                Tinjau data KB ini lalu setujui atau tolak dengan alasan yang jelas.
              </p>
              <div style={styles.verificationActions}>
                <button
                  onClick={() => handleVerifyDisplay("APPROVED")}
                  className="btn-primary"
                  style={styles.approveButton}
                  disabled={verifyProcessing}
                >
                  {verifyProcessing ? "Memproses..." : "Setujui"}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="btn-primary"
                  style={styles.rejectButton}
                  disabled={verifyProcessing}
                >
                  Tolak
                </button>
              </div>
            </div>
          ) : null}
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

      {showRejectModal ? (
        <div style={styles.modalOverlay}>
          <div className="auth-card" style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Tolak Data KB</h3>
            <p className="text-muted" style={styles.modalText}>
              Masukkan alasan penolakan agar bidan praktik bisa memperbaiki data ini.
            </p>
            <textarea
              className="form-input"
              rows="5"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: metode KB belum sesuai, jumlah anak belum akurat, atau catatan perlu diperjelas."
            />
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn-primary"
                style={styles.secondaryButton}
              >
                Batal
              </button>
              <button
                onClick={() => handleVerifyDisplay("REJECTED", rejectReason)}
                className="btn-primary"
                style={styles.rejectButton}
                disabled={!rejectReason.trim() || verifyProcessing}
              >
                {verifyProcessing ? "Menolak..." : "Kirim Penolakan"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const styles = {
  header: {
    gap: "1rem",
    flexWrap: "wrap",
  },
  pageTitle: {
    marginBottom: "0.35rem",
  },
  pageSubtitle: {
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  secondaryButton: {
    width: "auto",
    minWidth: "150px",
    paddingInline: "1rem",
    backgroundColor: "transparent",
    border: "1px solid var(--glass-border)",
  },
  rejectBanner: {
    marginBottom: "1.5rem",
    padding: "1rem 1.1rem",
    borderRadius: "16px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(248, 113, 113, 0.28)",
  },
  rejectTitle: {
    marginBottom: "0.35rem",
    color: "#fca5a5",
  },
  rejectText: {
    margin: 0,
    color: "#fecaca",
    lineHeight: 1.55,
  },
  heroCard: {
    maxWidth: "none",
    margin: "0 0 1.5rem",
    padding: "1.75rem",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1.25rem",
  },
  identityBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.35rem 0.75rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "0.78rem",
    color: "var(--color-text-muted)",
    marginBottom: "0.75rem",
  },
  patientName: {
    marginBottom: "0.35rem",
    fontSize: "1.7rem",
  },
  patientMeta: {
    margin: 0,
  },
  methodBadge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "0.45rem 0.8rem",
    fontSize: "0.8rem",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  methodBadgeAlert: {
    background: "rgba(239, 68, 68, 0.18)",
    border: "1px solid rgba(248, 113, 113, 0.35)",
    color: "#fca5a5",
  },
  methodBadgeSafe: {
    background: "rgba(59, 130, 246, 0.16)",
    border: "1px solid rgba(96, 165, 250, 0.35)",
    color: "#93c5fd",
  },
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
  summaryValue: {
    fontWeight: "700",
    lineHeight: 1.5,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.85fr)",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  sectionCard: {
    maxWidth: "none",
    margin: 0,
    padding: "1.5rem",
  },
  sectionHeader: {
    marginBottom: "1rem",
  },
  sectionTitle: {
    marginBottom: "0.35rem",
    fontSize: "1.1rem",
  },
  sectionSubtitle: {
    margin: 0,
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "0.85rem",
    marginBottom: "1rem",
  },
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "0.95rem 1rem",
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
  detailValue: {
    lineHeight: 1.5,
    fontWeight: "600",
  },
  noteCard: {
    padding: "1rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  noteText: {
    margin: "0.45rem 0 0",
    lineHeight: 1.6,
  },
  actionSummary: {
    display: "grid",
    gap: "0.85rem",
    marginBottom: "1rem",
  },
  actionBlock: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  editButton: {
    width: "auto",
    minWidth: "130px",
    paddingInline: "1rem",
    backgroundColor: "rgba(168, 85, 247, 0.22)",
    border: "1px solid rgba(168, 85, 247, 0.45)",
  },
  deleteButton: {
    width: "auto",
    minWidth: "130px",
    paddingInline: "1rem",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    border: "1px solid rgba(248, 113, 113, 0.45)",
  },
  verificationCard: {
    padding: "1rem",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  verificationTitle: {
    marginBottom: "0.35rem",
  },
  verificationText: {
    margin: "0 0 1rem",
  },
  verificationActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  approveButton: {
    width: "auto",
    minWidth: "130px",
    paddingInline: "1rem",
    backgroundColor: "rgba(16, 185, 129, 0.22)",
    border: "1px solid rgba(52, 211, 153, 0.45)",
  },
  rejectButton: {
    width: "auto",
    minWidth: "130px",
    paddingInline: "1rem",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    border: "1px solid rgba(248, 113, 113, 0.45)",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    zIndex: 1000,
  },
  modalCard: {
    width: "100%",
    maxWidth: "520px",
  },
  modalTitle: {
    marginBottom: "0.5rem",
  },
  modalText: {
    margin: "0 0 1rem",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  },
};

export default KBDetail;
