import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import "../../styles/design-system.css";
import "./KBDetail.css";
import { deleteKB, getKBDetail, verifyKB } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import { canDeleteKB, canEditKB, canVerifyKB } from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const formatMethod = (value) => value?.replace(/_/g, " ") || "-";

const KBDetail = () => {
  const { id } = useParams();
  const location = useLocation();
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
    return (
      <div className="kb-detail-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="kb-detail-page">
        <div className="error-alert">{error}</div>
        <Button variant="primary" onClick={() => navigate("/keluarga-berencana")}>
          Kembali ke List
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="kb-detail-page">
        <div className="error-alert">Data tidak ditemukan</div>
        <Button variant="primary" onClick={() => navigate("/keluarga-berencana")}>
          Kembali ke List
        </Button>
      </div>
    );
  }

  const isVerifier = canVerifyKB(user);
  const canEdit = canEditKB(user, data);
  const canDelete = canDeleteKB(user, data);
  const patientName = data.pasien?.nama || data.nama_pasien || "-";
  const backTarget = location.state?.backTo || "/keluarga-berencana";

  return (
    <div className="kb-detail-page">
      <PageHeader
        title="Detail Keluarga Berencana"
        subtitle={`ID ${data.id} | ${formatDate(data.tanggal_kunjungan)}`}
        actions={
          <>
            <StatusBadge status={data.status_verifikasi} />
            <Button variant="secondary" onClick={() => navigate(backTarget)}>
              Kembali
            </Button>
          </>
        }
      />

      {data.status_verifikasi === "REJECTED" && data.alasan_penolakan && (
        <div className="reject-banner">
          <h3 className="reject-title">Data Ditolak</h3>
          <p className="reject-text">{data.alasan_penolakan}</p>
        </div>
      )}

      {/* Patient Info Card */}
      <Card variant="surface-card" padding="xl" className="patient-info-card">
        <div className="patient-header">
          <div>
            <div className="patient-badge">Pasien</div>
            <h3 className="patient-name">{patientName}</h3>
            <p className="patient-meta">
              {data.practice_place?.nama_praktik || "Tempat praktik belum tersedia"}
            </p>
          </div>
          <span className={data.at ? "method-badge alert" : "method-badge safe"}>
            {formatMethod(data.alat_kontrasepsi)}
          </span>
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Metode Kontrasepsi</span>
            <span className="summary-value">
              {formatMethod(data.alat_kontrasepsi)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Abortus Terancam</span>
            <span className="summary-value">
              {data.at ? "Ya, perlu perhatian" : "Tidak"}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Anak Laki-laki</span>
            <span className="summary-value">{data.jumlah_anak_laki || 0}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Anak Perempuan</span>
            <span className="summary-value">
              {data.jumlah_anak_perempuan || 0}
            </span>
          </div>
        </div>
      </Card>

      <div className="content-grid">
        {/* Pelayanan KB Card */}
        <Card variant="surface-card" padding="xl">
          <div className="section-header">
            <h3 className="section-title">Ringkasan Pelayanan KB</h3>
            <p className="section-subtitle">
              Data utama yang tercatat pada kunjungan ini
            </p>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Tanggal Kunjungan</span>
              <span className="detail-value">
                {formatDate(data.tanggal_kunjungan)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tempat Praktik</span>
              <span className="detail-value">
                {data.practice_place?.nama_praktik || "-"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Anak Hidup</span>
              <span className="detail-value">
                {(data.jumlah_anak_laki || 0) + (data.jumlah_anak_perempuan || 0)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Risiko AT</span>
              <span className="detail-value">
                {data.at ? "Ada riwayat / indikasi" : "Tidak ada"}
              </span>
            </div>
          </div>

          <div className="note-card">
            <span className="detail-label">Keterangan / Keluhan</span>
            <p className="note-text">{data.keterangan || "Tidak ada keterangan"}</p>
          </div>
        </Card>

        {/* Actions Card */}
        <Card variant="surface-card" padding="xl">
          <div className="section-header">
            <h3 className="section-title">Status dan Tindak Lanjut</h3>
            <p className="section-subtitle">
              Aksi tersedia mengikuti hak akses pengguna
            </p>
          </div>

          <div className="action-summary">
            <div className="detail-item">
              <span className="detail-label">Status Verifikasi</span>
              <span className="detail-value">{data.status_verifikasi || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Verifier</span>
              <span className="detail-value">
                {data.verifier?.name || data.verifier?.email || "-"}
              </span>
            </div>
          </div>

          <div className="action-block">
            {canEdit && (
              <Button
                variant="warning"
                onClick={() => navigate(`/keluarga-berencana/${id}/edit`)}
              >
                Edit Data
              </Button>
            )}
            {canDelete && (
              <Button variant="danger" onClick={() => setDeleteDialog(true)}>
                Hapus Data
              </Button>
            )}
          </div>

          {isVerifier && data.status_verifikasi === "PENDING" && (
            <div className="verification-card">
              <h4 className="verification-title">Aksi Verifikasi</h4>
              <p className="verification-text">
                Tinjau data KB ini lalu setujui atau tolak dengan alasan yang jelas.
              </p>
              <div className="verification-actions">
                <Button
                  variant="success"
                  onClick={() => handleVerifyDisplay("APPROVED")}
                  disabled={verifyProcessing}
                >
                  {verifyProcessing ? "Memproses..." : "Setujui"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowRejectModal(true)}
                  disabled={verifyProcessing}
                >
                  Tolak
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Hapus Data"
        message="Apakah Anda yakin ingin menghapus data ini?"
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <Card variant="surface-card" padding="xl" className="modal-card">
            <h3 className="modal-title">Tolak Data KB</h3>
            <p className="modal-text">
              Masukkan alasan penolakan agar bidan praktik bisa memperbaiki data
              ini.
            </p>
            <textarea
              className="form-textarea"
              rows="5"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: metode KB belum sesuai, jumlah anak belum akurat, atau catatan perlu diperjelas."
            />
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={() => handleVerifyDisplay("REJECTED", rejectReason)}
                disabled={!rejectReason.trim() || verifyProcessing}
              >
                {verifyProcessing ? "Menolak..." : "Kirim Penolakan"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default KBDetail;
