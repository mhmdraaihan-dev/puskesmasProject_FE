import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getKehamilanList,
  getPersalinanList,
  getKBList,
  getImunisasiList,
  verifyKehamilan,
  verifyPersalinan,
  verifyKB,
  verifyImunisasi,
} from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { formatDate } from "../../utils/dateFormatter";
import {
  isBidanKoordinator,
  isBidanDesa,
  VERIFICATION_STATUS,
} from "../../utils/roleHelpers";
import "../../App.css";

const PendingDataList = () => {
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectDialog, setRejectDialog] = useState({
    isOpen: false,
    id: null,
    type: null,
    patientName: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const isVerifier = isBidanKoordinator(user) || isBidanDesa(user);
    if (!isVerifier) {
      navigate("/");
      return;
    }
    fetchPendingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { status_verifikasi: "PENDING" };

      const [kehamilan, persalinan, kb, imunisasi] = await Promise.all([
        getKehamilanList(params),
        getPersalinanList(params),
        getKBList(params),
        getImunisasiList(params),
      ]);

      // Aggregate and transform data to a common format
      const allData = [
        ...(kehamilan?.data || []).map((db) => ({
          ...db,
          type: "KEHAMILAN",
          pasien_nama: db.pasien?.nama,
          pasien_nik: db.pasien?.nik,
          bidan_praktik: db.creator?.full_name,
          lokasi_desa: db.practice_place?.village?.nama_desa,
        })),
        ...(persalinan?.data || []).map((db) => ({
          ...db,
          type: "PERSALINAN",
          pasien_nama: db.pasien?.nama,
          pasien_nik: db.pasien?.nik,
          bidan_praktik: db.creator?.full_name,
          lokasi_desa: db.practice_place?.village?.nama_desa,
        })),
        ...(kb?.data || []).map((db) => ({
          ...db,
          type: "KB",
          pasien_nama: db.pasien?.nama,
          pasien_nik: db.pasien?.nik,
          bidan_praktik: db.creator?.full_name,
          lokasi_desa: db.practice_place?.village?.nama_desa,
        })),
        ...(imunisasi?.data || []).map((db) => ({
          ...db,
          type: "IMUNISASI",
          pasien_nama: db.pasien?.nama,
          pasien_nik: db.pasien?.nik,
          bidan_praktik: db.creator?.full_name,
          lokasi_desa: db.practice_place?.village?.nama_desa,
        })),
      ];

      // Sort by date descending
      allData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      setPendingData(allData);
    } catch (err) {
      setError("Gagal memuat data pending");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "KEHAMILAN":
        return "Pemeriksaan Kehamilan";
      case "PERSALINAN":
        return "Persalinan";
      case "KB":
        return "Keluarga Berencana";
      case "IMUNISASI":
        return "Imunisasi";
      default:
        return type;
    }
  };

  const getDetailPath = (type, id) => {
    switch (type) {
      case "KEHAMILAN":
        return `/pemeriksaan-kehamilan/${id}`;
      case "PERSALINAN":
        return `/persalinan/${id}`;
      case "KB":
        return `/keluarga-berencana/${id}`;
      case "IMUNISASI":
        return `/imunisasi/${id}`;
      default:
        return "#";
    }
  };

  const performVerification = async (id, type, status, alasan = "") => {
    const payload = { status, alasan };
    switch (type) {
      case "KEHAMILAN":
        return await verifyKehamilan(id, payload);
      case "PERSALINAN":
        return await verifyPersalinan(id, payload);
      case "KB":
        return await verifyKB(id, payload);
      case "IMUNISASI":
        return await verifyImunisasi(id, payload);
      default:
        throw new Error("Tipe data tidak dikenali");
    }
  };

  const handleApprove = async (id, type, patientName) => {
    if (!confirm(`Setujui data kesehatan pasien "${patientName}"?`)) return;

    try {
      await performVerification(
        id,
        type,
        VERIFICATION_STATUS.APPROVED,
        "Disetujui",
      );
      alert("Data berhasil disetujui!");
      await fetchPendingData();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || err.message || "Gagal menyetujui data",
      );
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Alasan penolakan wajib diisi");
      return;
    }

    try {
      await performVerification(
        rejectDialog.id,
        rejectDialog.type,
        VERIFICATION_STATUS.REJECTED,
        rejectReason,
      );
      alert("Data berhasil ditolak");
      setRejectDialog({ isOpen: false, id: null, type: null, patientName: "" });
      setRejectReason("");
      await fetchPendingData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Gagal menolak data");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Verifikasi Data Kesehatan</h2>
          <p className="text-muted">Data pelayanan yang menunggu verifikasi</p>
        </div>
        <div>
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
        </div>
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
      ) : pendingData.length === 0 ? (
        <div
          className="auth-card"
          style={{ textAlign: "center", padding: "3rem" }}
        >
          <p style={{ color: "var(--text-muted)" }}>
            Tidak ada data yang menunggu verifikasi
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {pendingData.map((data) => (
            <div key={data.id} className="auth-card">
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
                    {data.pasien_nama}
                  </h3>
                  <p
                    style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
                  >
                    NIK: {data.pasien_nik} • {getTypeLabel(data.type)}
                  </p>
                </div>
                <StatusBadge
                  status={data.status || VERIFICATION_STATUS.PENDING}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                    Tanggal Pelayanan
                  </p>
                  <p>{formatDate(data.tanggal)}</p>
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Lokasi Desa
                  </p>
                  <p>{data.lokasi_desa || "-"}</p>
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Bidan Praktik
                  </p>
                  <p>{data.bidan_praktik || "-"}</p>
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
                  onClick={() => navigate(getDetailPath(data.type, data.id))}
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
                <button
                  onClick={() =>
                    handleApprove(data.id, data.type, data.pasien_nama)
                  }
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    fontSize: "0.875rem",
                    backgroundColor: "rgba(16, 185, 129, 0.3)",
                    border: "1px solid #10b981",
                  }}
                >
                  ✓ Setujui
                </button>
                <button
                  onClick={() =>
                    setRejectDialog({
                      isOpen: true,
                      id: data.id,
                      type: data.type,
                      patientName: data.pasien_nama,
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
                  ✗ Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialog.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="auth-card"
            style={{ maxWidth: "500px", margin: "1rem" }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Tolak Data Kesehatan</h3>
            <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
              Pasien: <strong>{rejectDialog.patientName}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Alasan Penolakan *</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Jelaskan alasan penolakan data ini..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => {
                  setRejectDialog({
                    isOpen: false,
                    id: null,
                    type: null,
                    patientName: "",
                  });
                  setRejectReason("");
                }}
                className="btn-primary"
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  border: "1px solid var(--glass-border)",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="btn-primary"
                style={{
                  flex: 1,
                  backgroundColor: "rgba(239, 68, 68, 0.3)",
                  border: "1px solid #ef4444",
                }}
              >
                Tolak Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingDataList;
