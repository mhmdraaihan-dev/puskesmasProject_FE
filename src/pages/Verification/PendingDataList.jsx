import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import {
  getImunisasiList,
  getKBList,
  getKehamilanList,
  getPersalinanList,
  verifyImunisasi,
  verifyKB,
  verifyKehamilan,
  verifyPersalinan,
} from "../../services/api";
import { VERIFICATION_STATUS } from "../../utils/roleHelpers";
import { formatDate } from "../../utils/dateFormatter";
import "../../styles/design-system.css";
import "./PendingDataList.css";

const moduleOptions = [
  { value: "ALL", label: "Semua Modul" },
  { value: "KEHAMILAN", label: "Pemeriksaan Kehamilan" },
  { value: "PERSALINAN", label: "Persalinan" },
  { value: "KB", label: "Keluarga Berencana" },
  { value: "IMUNISASI", label: "Imunisasi" },
];

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

const getServiceDate = (type, item) => {
  switch (type) {
    case "KEHAMILAN":
      return item.tanggal;
    case "PERSALINAN":
      return item.tanggal_partus || item.tanggal;
    case "KB":
      return item.tanggal_kunjungan || item.tanggal;
    case "IMUNISASI":
      return item.tgl_imunisasi || item.tanggal;
    default:
      return item.tanggal;
  }
};

const PendingDataList = () => {
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    module: "ALL",
    search: "",
    village: "",
  });
  const [rejectDialog, setRejectDialog] = useState({
    isOpen: false,
    id: null,
    type: null,
    patientName: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [verifyLoadingId, setVerifyLoadingId] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
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

      const normalizedData = [
        ...(kehamilan?.data || []).map((item) => ({
          ...item,
          type: "KEHAMILAN",
          service_date: getServiceDate("KEHAMILAN", item),
          pasien_nama: item.pasien?.nama || "-",
          pasien_nik: item.pasien?.nik || "-",
          bidan_praktik:
            item.creator?.full_name || item.creator?.name || item.creator?.email || "-",
          lokasi_desa: item.practice_place?.village?.nama_desa || "-",
        })),
        ...(persalinan?.data || []).map((item) => ({
          ...item,
          type: "PERSALINAN",
          service_date: getServiceDate("PERSALINAN", item),
          pasien_nama: item.pasien?.nama || "-",
          pasien_nik: item.pasien?.nik || "-",
          bidan_praktik:
            item.creator?.full_name || item.creator?.name || item.creator?.email || "-",
          lokasi_desa: item.practice_place?.village?.nama_desa || "-",
        })),
        ...(kb?.data || []).map((item) => ({
          ...item,
          type: "KB",
          service_date: getServiceDate("KB", item),
          pasien_nama: item.pasien?.nama || "-",
          pasien_nik: item.pasien?.nik || "-",
          bidan_praktik:
            item.creator?.full_name || item.creator?.name || item.creator?.email || "-",
          lokasi_desa: item.practice_place?.village?.nama_desa || "-",
        })),
        ...(imunisasi?.data || []).map((item) => ({
          ...item,
          type: "IMUNISASI",
          service_date: getServiceDate("IMUNISASI", item),
          pasien_nama: item.pasien?.nama || "-",
          pasien_nik: item.pasien?.nik || "-",
          bidan_praktik:
            item.creator?.full_name || item.creator?.name || item.creator?.email || "-",
          lokasi_desa: item.practice_place?.village?.nama_desa || "-",
        })),
      ];

      normalizedData.sort(
        (a, b) => new Date(b.service_date || 0) - new Date(a.service_date || 0),
      );

      setPendingData(normalizedData);
    } catch (err) {
      setError("Gagal memuat data pending");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(
    () =>
      pendingData.filter((item) => {
        const matchesModule =
          filters.module === "ALL" || item.type === filters.module;
        const searchValue = filters.search.trim().toLowerCase();
        const matchesSearch =
          !searchValue ||
          item.pasien_nama?.toLowerCase().includes(searchValue) ||
          item.pasien_nik?.toLowerCase().includes(searchValue);
        const matchesVillage =
          !filters.village ||
          item.lokasi_desa?.toLowerCase().includes(filters.village.toLowerCase());

        return matchesModule && matchesSearch && matchesVillage;
      }),
    [filters, pendingData],
  );

  const stats = useMemo(
    () => ({
      total: filteredData.length,
      kehamilan: filteredData.filter((item) => item.type === "KEHAMILAN").length,
      persalinan: filteredData.filter((item) => item.type === "PERSALINAN").length,
      kb: filteredData.filter((item) => item.type === "KB").length,
      imunisasi: filteredData.filter((item) => item.type === "IMUNISASI").length,
    }),
    [filteredData],
  );

  const performVerification = async (id, type, status, alasan = "") => {
    const payload = { status, alasan };

    switch (type) {
      case "KEHAMILAN":
        return verifyKehamilan(id, payload);
      case "PERSALINAN":
        return verifyPersalinan(id, payload);
      case "KB":
        return verifyKB(id, payload);
      case "IMUNISASI":
        return verifyImunisasi(id, payload);
      default:
        throw new Error("Tipe data tidak dikenali");
    }
  };

  const handleApprove = async (id, type, patientName) => {
    if (!confirm(`Setujui data kesehatan pasien "${patientName}"?`)) {
      return;
    }

    try {
      setVerifyLoadingId(`${type}-${id}`);
      await performVerification(id, type, VERIFICATION_STATUS.APPROVED, "Disetujui");
      alert("Data berhasil disetujui");
      await fetchPendingData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Gagal menyetujui data");
    } finally {
      setVerifyLoadingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Alasan penolakan wajib diisi");
      return;
    }

    try {
      setVerifyLoadingId(`${rejectDialog.type}-${rejectDialog.id}`);
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
    } finally {
      setVerifyLoadingId(null);
    }
  };

  return (
    <div className="pending-data-list-page">
      <PageHeader
        title="Verifikasi Data Kesehatan"
        subtitle="Daftar pelayanan yang menunggu persetujuan verifier"
        actions={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Kembali
          </Button>
        }
      />

      <div className="stats-section">
        <Card
          variant="surface-card"
          padding="lg"
          className="pending-data-list__summary-card"
        >
          <div className="stat-label">Total Pending</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-note">menunggu verifikasi</div>
        </Card>
        <Card
          variant="surface-card"
          padding="lg"
          className="pending-data-list__summary-card"
        >
          <div className="stat-label">Kehamilan</div>
          <div className="stat-value">{stats.kehamilan}</div>
          <div className="stat-note">pemeriksaan</div>
        </Card>
        <Card
          variant="surface-card"
          padding="lg"
          className="pending-data-list__summary-card"
        >
          <div className="stat-label">Persalinan</div>
          <div className="stat-value">{stats.persalinan}</div>
          <div className="stat-note">persalinan</div>
        </Card>
        <Card
          variant="surface-card"
          padding="lg"
          className="pending-data-list__summary-card"
        >
          <div className="stat-label">KB / Imunisasi</div>
          <div className="stat-value">
            {stats.kb} / {stats.imunisasi}
          </div>
          <div className="stat-note">kb / imunisasi</div>
        </Card>
      </div>

      <Card
        variant="surface-card"
        padding="xl"
        className="filter-card pending-data-list__filter-card"
      >
        <h3 className="filter-title">Filter Verifikasi</h3>
        <p className="filter-subtitle">
          Persempit antrean verifikasi berdasarkan modul, pasien, atau desa
        </p>

        <div className="filter-form">
          <div className="form-group pending-data-list__module-field">
            <label className="input-label" htmlFor="pending-module-filter">
              Modul
            </label>
            <select
              id="pending-module-filter"
              className="form-select"
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            >
              {moduleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Cari Pasien / NIK"
            type="text"
            placeholder="Ketik nama pasien atau NIK..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Input
            label="Lokasi Desa"
            type="text"
            placeholder="Cari nama desa..."
            value={filters.village}
            onChange={(e) => setFilters({ ...filters, village: e.target.value })}
          />
        </div>
      </Card>

      {error && <div className="error-alert">{error}</div>}

      <Card
        variant="surface-card"
        padding="xl"
        className="table-card pending-data-list__table-card"
      >
        <h3 className="table-title">Antrean Verifikasi</h3>
        <p className="table-subtitle">
          {loading
            ? "Memuat data pending..."
            : `${filteredData.length} data siap direview`}
        </p>

        <div className="table-wrapper">
          {loading ? (
            <LoadingSpinner size="lg" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              className="pending-data-list__empty-state"
              message="Tidak ada data yang menunggu verifikasi"
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pasien</th>
                  <th>Modul</th>
                  <th>Tanggal</th>
                  <th>Desa</th>
                  <th>Bidan Praktik</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const rowLoading = verifyLoadingId === `${item.type}-${item.id}`;

                  return (
                    <tr key={`${item.type}-${item.id}`}>
                      <td className="patient-cell">
                        <div className="patient-name">{item.pasien_nama}</div>
                        <div className="patient-meta">NIK {item.pasien_nik}</div>
                      </td>
                      <td>{getTypeLabel(item.type)}</td>
                      <td>{formatDate(item.service_date || item.tanggal)}</td>
                      <td>{item.lokasi_desa || "-"}</td>
                      <td>{item.bidan_praktik || "-"}</td>
                      <td>
                        <span className="pending-badge">Pending</span>
                      </td>
                      <td className="action-cell">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="pending-data-list__action-btn"
                          onClick={() => navigate(getDetailPath(item.type, item.id))}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="pending-data-list__action-btn"
                          onClick={() =>
                            handleApprove(item.id, item.type, item.pasien_nama)
                          }
                          disabled={rowLoading}
                        >
                          {rowLoading ? "Proses..." : "Setujui"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="pending-data-list__action-btn"
                          onClick={() =>
                            setRejectDialog({
                              isOpen: true,
                              id: item.id,
                              type: item.type,
                              patientName: item.pasien_nama,
                            })
                          }
                          disabled={rowLoading}
                        >
                          Tolak
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal
        isOpen={rejectDialog.isOpen}
        onClose={() => {
          setRejectDialog({
            isOpen: false,
            id: null,
            type: null,
            patientName: "",
          });
          setRejectReason("");
        }}
        onConfirm={handleReject}
        title="Tolak Data Kesehatan"
        message={`Pasien: ${rejectDialog.patientName}`}
        confirmText="Tolak Data"
        cancelText="Batal"
        type="danger"
        confirmDisabled={!rejectReason.trim()}
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
              placeholder="Jelaskan alasan penolakan data ini..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </Card>
      </Modal>
    </div>
  );
};

export default PendingDataList;
