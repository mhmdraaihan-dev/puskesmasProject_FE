import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import "../../styles/design-system.css";
import "./PemeriksaanKehamilanDetail.css";
import {
  deleteKehamilan,
  getKehamilanDetail,
  verifyKehamilan,
} from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  canDeleteKehamilan,
  canEditKehamilan,
  canVerifyKehamilan,
} from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const formatBooleanLab = (value) => {
  if (value === true) return "Positif";
  if (value === false) return "Negatif";
  return "-";
};

const PemeriksaanKehamilanDetail = () => {
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
      const response = await getKehamilanDetail(id);
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
      await verifyKehamilan(id, { status, alasan });
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
      await deleteKehamilan(id);
      alert("Data berhasil dihapus");
      navigate("/pemeriksaan-kehamilan");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const report = useMemo(() => data?.ceklab_report || {}, [data?.ceklab_report]);
  const hasReport = useMemo(() => Object.keys(report).length > 0, [report]);

  if (loading) {
    return (
      <div className="pemeriksaan-kehamilan-detail-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pemeriksaan-kehamilan-detail-page">
        <div className="error-alert">{error}</div>
        <Button variant="primary" onClick={() => navigate("/pemeriksaan-kehamilan")}>
          Kembali ke List
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pemeriksaan-kehamilan-detail-page">
        <div className="error-alert">Data tidak ditemukan</div>
        <Button variant="primary" onClick={() => navigate("/pemeriksaan-kehamilan")}>
          Kembali ke List
        </Button>
      </div>
    );
  }

  const isVerifier = canVerifyKehamilan(user);
  const canEdit = canEditKehamilan(user, data);
  const canDelete = canDeleteKehamilan(user, data);
  const patientName = data.pasien?.nama || data.nama_pasien || "-";
  const backTarget = location.state?.backTo || "/pemeriksaan-kehamilan";

  const restiColorMap = {
    TINGGI: "error",
    SEDANG: "warning",
    RENDAH: "success",
  };

  return (
    <div className="pemeriksaan-kehamilan-detail-page">
      <PageHeader
        title="Detail Pemeriksaan Kehamilan"
        subtitle={`ID ${data.id} | ${formatDate(data.tanggal)}`}
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
              {data.pasien?.nik ? `NIK ${data.pasien.nik}` : "Data pasien terhubung"}
            </p>
          </div>
          <StatusBadge
            status={data.resti}
            variant={restiColorMap[data.resti] || "muted"}
          />
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Jenis Kunjungan</span>
            <span className="summary-value">{data.jenis_kunjungan || "-"}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Umur Kehamilan</span>
            <span className="summary-value">
              {data.umur_kehamilan || "-"} minggu
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Status TT</span>
            <span className="summary-value">{data.status_tt || "-"}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Tempat Praktik</span>
            <span className="summary-value">
              {data.practice_place?.nama_praktik || "-"}
            </span>
          </div>
        </div>
      </Card>

      <div className="content-grid">
        {/* Checkup Data Card */}
        <Card variant="surface-card" padding="xl">
          <div className="section-header">
            <h3 className="section-title">Data Pemeriksaan</h3>
            <p className="section-subtitle">
              Ringkasan hasil pemeriksaan utama
            </p>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">GPA</span>
              <span className="detail-value">{data.gpa || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tekanan Darah</span>
              <span className="detail-value">{data.td || "-"} mmHg</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Berat Badan</span>
              <span className="detail-value">
                {data.bb !== null && data.bb !== undefined ? `${data.bb} kg` : "-"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">LILA</span>
              <span className="detail-value">
                {data.lila !== null && data.lila !== undefined
                  ? `${data.lila} cm`
                  : "-"}
              </span>
            </div>
          </div>

          <div className="note-card">
            <span className="detail-label">Catatan</span>
            <p className="note-text">{data.catatan || "-"}</p>
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
                onClick={() => navigate(`/pemeriksaan-kehamilan/${id}/edit`)}
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
                Tinjau data ini lalu setujui atau tolak dengan alasan yang jelas.
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

      {/* Lab Results Card */}
      {hasReport && (
        <Card variant="surface-card" padding="xl">
          <div className="section-header">
            <h3 className="section-title">Hasil Cek Lab</h3>
            <p className="section-subtitle">
              Informasi laboratorium yang terlampir pada pemeriksaan ini
            </p>
          </div>

          <div className="lab-grid">
            <div className="detail-item">
              <span className="detail-label">Golongan Darah</span>
              <span className="detail-value">{report.golongan_darah || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Hemoglobin (Hb)</span>
              <span className="detail-value">
                {report.hb ? `${report.hb} g/dL` : "-"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">HIV</span>
              <span className="detail-value">{formatBooleanLab(report.hiv)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">HBsAg</span>
              <span className="detail-value">{formatBooleanLab(report.hbsag)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sifilis</span>
              <span className="detail-value">
                {formatBooleanLab(report.sifilis)}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
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
        <div className="modal-overlay">
          <Card variant="surface-card" padding="xl" className="modal-card">
            <h3 className="modal-title">Tolak Data Pemeriksaan</h3>
            <p className="modal-text">
              Masukkan alasan penolakan agar bidan praktik bisa memperbaiki data
              ini.
            </p>
            <textarea
              className="form-textarea"
              rows="5"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Tekanan darah belum sesuai format, hasil lab belum lengkap, atau ada data yang tidak konsisten."
            />
            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
              >
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

export default PemeriksaanKehamilanDetail;
