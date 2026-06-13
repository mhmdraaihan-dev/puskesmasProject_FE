import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/layout/PageHeader";
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

const MONTH_OPTIONS = [
  { value: "", label: "Semua Bulan" },
  { value: "1", label: "Januari" }, { value: "2", label: "Februari" },
  { value: "3", label: "Maret" }, { value: "4", label: "April" },
  { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
  { value: "7", label: "Juli" }, { value: "8", label: "Agustus" },
  { value: "9", label: "September" }, { value: "10", label: "Oktober" },
  { value: "11", label: "November" }, { value: "12", label: "Desember" },
];

const getTypeLabel = (type) => {
  switch (type) {
    case "KEHAMILAN": return "Pemeriksaan Kehamilan";
    case "PERSALINAN": return "Persalinan";
    case "KB": return "Keluarga Berencana";
    case "IMUNISASI": return "Imunisasi";
    default: return type;
  }
};

const getDetailPath = (type, id) => {
  switch (type) {
    case "KEHAMILAN": return `/pemeriksaan-kehamilan/${id}`;
    case "PERSALINAN": return `/persalinan/${id}`;
    case "KB": return `/keluarga-berencana/${id}`;
    case "IMUNISASI": return `/imunisasi/${id}`;
    default: return "#";
  }
};

const getServiceDate = (type, item) => {
  switch (type) {
    case "KEHAMILAN": return item.tanggal;
    case "PERSALINAN": return item.tanggal_partus || item.tanggal;
    case "KB": return item.tanggal_kunjungan || item.tanggal;
    case "IMUNISASI": return item.tgl_imunisasi || item.tanggal;
    default: return item.tanggal;
  }
};

const PendingDataList = () => {
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    module: "ALL",
    search: "",
    bulan: "",
    tanggal_start: "",
    tanggal_end: "",
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

      const normalize = (items, type) =>
        (items?.data || []).map((item) => ({
          ...item,
          type,
          service_date: getServiceDate(type, item),
          pasien_nama: item.pasien?.nama || "-",
          pasien_nik: item.pasien?.nik || "-",
          bidan_praktik: item.creator?.full_name || item.creator?.name || item.creator?.email || "-",
          tempat_praktik: item.practice_place?.nama_praktik || "-",
          lokasi_desa: item.practice_place?.village?.nama_desa || "-",
        }));

      const normalizedData = [
        ...normalize(kehamilan, "KEHAMILAN"),
        ...normalize(persalinan, "PERSALINAN"),
        ...normalize(kb, "KB"),
        ...normalize(imunisasi, "IMUNISASI"),
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

  const handleReset = () => {
    setFilters({ module: "ALL", search: "", bulan: "", tanggal_start: "", tanggal_end: "" });
  };

  const filteredData = useMemo(
    () =>
      pendingData.filter((item) => {
        if (filters.module !== "ALL" && item.type !== filters.module) return false;

        const searchValue = filters.search.trim().toLowerCase();
        if (searchValue &&
          !item.pasien_nama?.toLowerCase().includes(searchValue) &&
          !item.pasien_nik?.toLowerCase().includes(searchValue)) return false;

        if (filters.bulan) {
          const month = item.service_date ? new Date(item.service_date).getMonth() + 1 : null;
          if (month !== parseInt(filters.bulan, 10)) return false;
        }

        if (filters.tanggal_start) {
          if (item.service_date && new Date(item.service_date) < new Date(filters.tanggal_start)) return false;
        }

        if (filters.tanggal_end) {
          if (item.service_date && new Date(item.service_date) > new Date(filters.tanggal_end + "T23:59:59")) return false;
        }

        return true;
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
      case "KEHAMILAN": return verifyKehamilan(id, payload);
      case "PERSALINAN": return verifyPersalinan(id, payload);
      case "KB": return verifyKB(id, payload);
      case "IMUNISASI": return verifyImunisasi(id, payload);
      default: throw new Error("Tipe data tidak dikenali");
    }
  };

  const handleApprove = async (id, type, patientName) => {
    if (!confirm(`Setujui data kesehatan pasien "${patientName}"?`)) return;
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
      await performVerification(rejectDialog.id, rejectDialog.type, VERIFICATION_STATUS.REJECTED, rejectReason);
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

      {/* Stat Cards */}
      <div className="pdl-stat-row">
        <div className="pdl-stat-card">
          <span className="pdl-stat-label">Total Pending</span>
          <span className="pdl-stat-value">{stats.total}</span>
          <span className="pdl-stat-note">menunggu verifikasi</span>
        </div>
        <div className="pdl-stat-card">
          <span className="pdl-stat-label">Kehamilan</span>
          <span className="pdl-stat-value">{stats.kehamilan}</span>
          <span className="pdl-stat-note">pemeriksaan</span>
        </div>
        <div className="pdl-stat-card">
          <span className="pdl-stat-label">Persalinan</span>
          <span className="pdl-stat-value">{stats.persalinan}</span>
          <span className="pdl-stat-note">persalinan</span>
        </div>
        <div className="pdl-stat-card">
          <span className="pdl-stat-label">Keluarga Berencana</span>
          <span className="pdl-stat-value">{stats.kb}</span>
          <span className="pdl-stat-note">kb</span>
        </div>
        <div className="pdl-stat-card">
          <span className="pdl-stat-label">Imunisasi</span>
          <span className="pdl-stat-value">{stats.imunisasi}</span>
          <span className="pdl-stat-note">imunisasi</span>
        </div>
      </div>

      {/* Filter */}
      <div className="pdl-filter-box">
        <h3 className="pdl-filter-title">Filter Verifikasi</h3>
        <p className="pdl-filter-sub">Persempit antrean berdasarkan modul, pasien, bulan, atau rentang tanggal</p>
        <div className="pdl-filter-grid">
          <div className="input-wrapper">
            <label className="input-label" htmlFor="pdl-module">Modul</label>
            <select
              id="pdl-module"
              className="pdl-filter-select"
              value={filters.module}
              onChange={(e) => setFilters({ ...filters, module: e.target.value })}
            >
              {moduleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
          <div className="input-wrapper">
            <label className="input-label" htmlFor="pdl-bulan">Bulan</label>
            <select
              id="pdl-bulan"
              className="pdl-filter-select"
              value={filters.bulan}
              onChange={(e) => setFilters({ ...filters, bulan: e.target.value })}
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Dari Tanggal"
            type="date"
            value={filters.tanggal_start}
            onChange={(e) => setFilters({ ...filters, tanggal_start: e.target.value })}
          />
          <Input
            label="Sampai Tanggal"
            type="date"
            value={filters.tanggal_end}
            onChange={(e) => setFilters({ ...filters, tanggal_end: e.target.value })}
          />
          <div className="filter-actions">
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Table */}
      <div className="pdl-table-box">
        <h3 className="pdl-table-title">Antrean Verifikasi</h3>
        <p className="pdl-table-sub">
          {loading ? "Memuat data pending..." : `${filteredData.length} data siap direview`}
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
                  <th>Tempat Praktik</th>
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
                      <td>{item.tempat_praktik}</td>
                      <td>{item.lokasi_desa}</td>
                      <td>{item.bidan_praktik}</td>
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
                          onClick={() => handleApprove(item.id, item.type, item.pasien_nama)}
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
      </div>

      <Modal
        isOpen={rejectDialog.isOpen}
        onClose={() => {
          setRejectDialog({ isOpen: false, id: null, type: null, patientName: "" });
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
      </Modal>
    </div>
  );
};

export default PendingDataList;
