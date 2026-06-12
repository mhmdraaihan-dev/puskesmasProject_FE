import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import "../../styles/design-system.css";
import "./PersalinanDetail.css";
import {
  deletePersalinan,
  getPersalinanDetail,
  verifyPersalinan,
} from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  canDeletePersalinan,
  canEditPersalinan,
  canVerifyPersalinan,
} from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const formatGender = (gender) => {
  if (gender === "LAKI_LAKI") return "Laki-laki";
  if (gender === "PEREMPUAN") return "Perempuan";
  return "-";
};

const PersalinanDetail = () => {
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
      const response = await getPersalinanDetail(id);
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
      await verifyPersalinan(id, { status, alasan });
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
      await deletePersalinan(id);
      alert("Data berhasil dihapus");
      navigate("/persalinan");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  if (loading) {
    return (
      <div className="persalinan-detail-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="persalinan-detail-page">
        <div className="error-alert">{error}</div>
        <Button variant="primary" onClick={() => navigate("/persalinan")}>
          Kembali ke List
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="persalinan-detail-page">
        <div className="error-alert">Data tidak ditemukan</div>
        <Button variant="primary" onClick={() => navigate("/persalinan")}>
          Kembali ke List
        </Button>
      </div>
    );
  }

  const isVerifier = canVerifyPersalinan(user);
  const canEdit = canEditPersalinan(user, data);
  const canDelete = canDeletePersalinan(user, data);
  const ibu = data.keadaan_ibu_persalinan || {};
  const bayi = data.keadaan_bayi_persalinan || {};
  const patientName = data.pasien?.nama || data.nama_pasien || "-";
  const backTarget = location.state?.backTo || "/persalinan";
  const ibuIssues = [
    ibu.hap ? "Pendarahan" : null,
    ibu.partus_lama ? "Partus lama" : null,
    ibu.pre_eklamsi ? "Pre-eklamsi" : null,
    ibu.hidup === false ? "Ibu meninggal" : null,
  ].filter(Boolean);

  return (
    <div className="persalinan-detail-page">
      <PageHeader
        title="Detail Persalinan"
        subtitle={`ID ${data.id} | ${formatDate(data.tanggal_partus)}`}
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
          <div className="gpa-stats">
            <div className="gpa-stat">
              <span className="gpa-label">GPA</span>
              <span className="gpa-value">
                G{data.gravida} P{data.para} A{data.abortus}
              </span>
            </div>
            <div className="gpa-stat">
              <span className="gpa-label">Tanggal Partus</span>
              <span className="gpa-value">{formatDate(data.tanggal_partus)}</span>
            </div>
          </div>
        </div>

        <div className="check-row">
          <span className={data.vit_k ? "check-badge active" : "check-badge"}>
            Vitamin K {data.vit_k ? "Ya" : "Tidak"}
          </span>
          <span className={data.hb_0 ? "check-badge active" : "check-badge"}>
            Hepatitis B0 {data.hb_0 ? "Ya" : "Tidak"}
          </span>
          <span className={data.vit_a_bufas ? "check-badge active" : "check-badge"}>
            Vitamin A Bufas {data.vit_a_bufas ? "Ya" : "Tidak"}
          </span>
        </div>
      </Card>

      <div className="content-grid">
        {/* Kondisi Ibu Card */}
        <Card variant="surface-card" padding="xl">
          <div className="section-header">
            <h3 className="section-title">Kondisi Ibu</h3>
            <p className="section-subtitle">Ringkasan status ibu saat persalinan</p>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Kondisi Umum</span>
              <span className="detail-value">
                {ibu.baik ? "Sehat / Baik" : "Perlu perhatian"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status Hidup</span>
              <span className="detail-value">{ibu.hidup ? "Hidup" : "Meninggal"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Pendarahan (HAP)</span>
              <span className="detail-value">{ibu.hap ? "Ya" : "Tidak"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Partus Lama</span>
              <span className="detail-value">
                {ibu.partus_lama ? "Ya" : "Tidak"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Pre-eklamsi</span>
              <span className="detail-value">
                {ibu.pre_eklamsi ? "Ya" : "Tidak"}
              </span>
            </div>
          </div>

          <div className="note-card">
            <span className="detail-label">Ringkasan Masalah Ibu</span>
            <p className="note-text">
              {ibu.baik && ibu.hidup
                ? "Tidak ada komplikasi utama yang tercatat."
                : ibuIssues.length > 0
                  ? ibuIssues.join(", ")
                  : "Perlu perhatian lebih lanjut."}
            </p>
          </div>
        </Card>

        {/* Kondisi Bayi Card */}
        <Card variant="surface-card" padding="xl">
          <div className="section-header">
            <h3 className="section-title">Kondisi Bayi</h3>
            <p className="section-subtitle">
              Data bayi yang tercatat pada persalinan ini
            </p>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Jenis Kelamin</span>
              <span className="detail-value">{formatGender(bayi.jenis_kelamin)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Berat Badan</span>
              <span className="detail-value">
                {bayi.bb ? `${bayi.bb} gram` : "-"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Panjang Badan</span>
              <span className="detail-value">{bayi.pb ? `${bayi.pb} cm` : "-"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status Hidup</span>
              <span className="detail-value">{bayi.hidup ? "Hidup" : "Meninggal"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Asfiksia</span>
              <span className="detail-value">{bayi.asfiksia ? "Ya" : "Tidak"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Gangguan Nafas (RDS)</span>
              <span className="detail-value">{bayi.rds ? "Ya" : "Tidak"}</span>
            </div>
          </div>

          {bayi.cacat_bawaan && (
            <div className="note-alert-card">
              <span className="detail-label">Keterangan Cacat Bawaan</span>
              <p className="note-text">{bayi.keterangan_cacat || "-"}</p>
            </div>
          )}
        </Card>
      </div>

      <div className="content-grid">
        {/* Catatan Card */}
        <Card variant="surface-card" padding="xl">
          <div className="section-header">
            <h3 className="section-title">Catatan Persalinan</h3>
            <p className="section-subtitle">
              Catatan tambahan yang tersimpan pada data ini
            </p>
          </div>

          <div className="note-card">
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
                onClick={() => navigate(`/persalinan/${id}/edit`)}
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
                Tinjau data persalinan ini lalu setujui atau tolak dengan alasan
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
        message="Apakah Anda yakin ingin menghapus data ini? Aksi ini akan menghapus data ibu dan anak terkait."
        confirmText="Hapus Permanen"
        cancelText="Batal"
        type="danger"
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <Card variant="surface-card" padding="xl" className="modal-card">
            <h3 className="modal-title">Tolak Data Persalinan</h3>
            <p className="modal-text">
              Masukkan alasan penolakan agar bidan praktik bisa memperbaiki data
              ini.
            </p>
            <textarea
              className="form-textarea"
              rows="5"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: data ibu belum lengkap, kondisi bayi tidak konsisten, atau ada informasi yang perlu diperjelas."
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

export default PersalinanDetail;
