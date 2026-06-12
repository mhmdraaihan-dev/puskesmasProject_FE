import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import "../../styles/design-system.css";
import "./ImunisasiDetail.css";
import {
  deleteImunisasi,
  getImunisasiDetail,
  verifyImunisasi,
} from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  canDeleteImunisasi,
  canEditImunisasi,
  canVerifyImunisasi,
} from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const formatImmunizationType = (value) => value?.replace(/_/g, " ") || "-";

const ImunisasiDetail = () => {
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
      const response = await getImunisasiDetail(id);
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
    if (status === "REJECTED" && alasan.trim().length < 10) {
      alert("Alasan penolakan minimal 10 karakter");
      return;
    }

    try {
      setVerifyProcessing(true);
      await verifyImunisasi(id, { status, alasan });
      await fetchDetail();
      if (status === "REJECTED") {
        setShowRejectModal(false);
        setRejectReason("");
      }
      alert(`Data berhasil di-${status === "APPROVED" ? "setujui" : "tolak"}`);
      
      // Redirect to pending list after successful verification
      navigate("/verification/pending");
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

  if (loading) {
    return (
      <div className="imunisasi-detail-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="imunisasi-detail-page">
        <div className="error-alert">{error}</div>
        <Button variant="primary" onClick={() => navigate("/imunisasi")}>
          Kembali ke List
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="imunisasi-detail-page">
        <div className="error-alert">Data tidak ditemukan</div>
        <Button variant="primary" onClick={() => navigate("/imunisasi")}>
          Kembali ke List
        </Button>
      </div>
    );
  }

  const isVerifier = canVerifyImunisasi(user);
  const canEdit = canEditImunisasi(user, data);
  const canDelete = canDeleteImunisasi(user, data);
  const patientName = data.pasien?.nama || data.nama_pasien || "-";
  const backTarget = location.state?.backTo || "/imunisasi";

  return (
    <div className="imunisasi-detail-page">
      <PageHeader
        title="Detail Imunisasi"
        subtitle={`ID ${data.id} | ${formatDate(data.tgl_imunisasi)}`}
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
          <span className="method-badge vaccine">
            {formatImmunizationType(data.jenis_imunisasi)}
          </span>
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Jenis Imunisasi</span>
            <span className="summary-value">
              {formatImmunizationType(data.jenis_imunisasi)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Berat Badan</span>
            <span className="summary-value">{data.berat_badan} kg</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Suhu Badan</span>
            <span className="summary-value">
              {data.suhu_badan !== null && data.suhu_badan !== undefined
                ? `${data.suhu_badan}°C`
                : "-"}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Nama Orang Tua</span>
            <span className="summary-value">{data.nama_orangtua || "-"}</span>
          </div>
        </div>
      </Card>

      <div className="content-grid">
        {/* Imunisasi Details Card */}
        <Card variant="surface-card" padding="xl">
          <div className="section-header">
            <h3 className="section-title">Ringkasan Pelayanan Imunisasi</h3>
            <p className="section-subtitle">
              Data utama yang tercatat pada kunjungan imunisasi ini
            </p>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Tanggal Imunisasi</span>
              <span className="detail-value">{formatDate(data.tgl_imunisasi)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tempat Praktik</span>
              <span className="detail-value">
                {data.practice_place?.nama_praktik || "-"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Kondisi Anak</span>
              <span className="detail-value">
                {data.berat_badan} kg / {data.suhu_badan ?? "-"}°C
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Orang Tua</span>
              <span className="detail-value">{data.nama_orangtua || "-"}</span>
            </div>
          </div>

          <div className="note-card">
            <span className="detail-label">Catatan</span>
            <p className="note-text">{data.catatan || "Tidak ada catatan"}</p>
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
                onClick={() => navigate(`/imunisasi/${id}/edit`)}
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
                Tinjau data imunisasi ini lalu setujui atau tolak dengan alasan
                yang jelas.
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
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
        }}
        onConfirm={() => handleVerifyDisplay("REJECTED", rejectReason)}
        title="Tolak Data Imunisasi"
        message="Masukkan alasan penolakan agar bidan praktik bisa memperbaiki data ini."
        confirmText={verifyProcessing ? "Menolak..." : "Kirim Penolakan"}
        cancelText="Batal"
        type="danger"
        confirmDisabled={!rejectReason.trim() || verifyProcessing}
      >
        <Card variant="surface-card" padding="md">
          <div className="form-group">
            <label className="form-label" htmlFor="reject-reason">
              Alasan Penolakan <span className="required-asterisk">*</span>
            </label>
            <textarea
              id="reject-reason"
              className="form-textarea"
              rows="5"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: jenis imunisasi belum sesuai, data orang tua belum lengkap, atau kondisi anak perlu diperjelas."
            />
            <p className="form-hint">Minimal 10 karakter untuk menjelaskan alasan penolakan.</p>
          </div>
        </Card>
      </Modal>
    </div>
  );
};

export default ImunisasiDetail;
