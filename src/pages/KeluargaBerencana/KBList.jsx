import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deleteKB, getKBList } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  canDeleteKB,
  canEditKB,
  isAdmin,
  isBidanPraktik,
} from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import "../../styles/design-system.css";
import "./KBList.css";

const formatMethod = (value) => value?.replace(/_/g, " ") || "-";

const KBList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    search: "",
    tanggal_start: "",
    tanggal_end: "",
    alat_kontrasepsi: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    dataId: null,
    patientName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const canAddData = isBidanPraktik(user);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const stats = useMemo(() => {
    const total = dataList.length;
    const pending = dataList.filter((item) => item.status_verifikasi === "PENDING").length;
    const approved = dataList.filter((item) => item.status_verifikasi === "APPROVED").length;
    const abortusRisk = dataList.filter((item) => item.at).length;

    return { total, pending, approved, abortusRisk };
  }, [dataList]);

  const fetchData = async (overrideFilter = filter) => {
    try {
      setLoading(true);
      const params = { ...overrideFilter };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await getKBList(params);
      setDataList(response.data || []);
      setError("");
    } catch (err) {
      setError("Gagal memuat data keluarga berencana");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleReset = () => {
    const resetFilter = {
      search: "",
      tanggal_start: "",
      tanggal_end: "",
      alat_kontrasepsi: "",
    };
    setFilter(resetFilter);
    fetchData(resetFilter);
  };

  const handleDelete = async () => {
    try {
      await deleteKB(deleteDialog.dataId);
      setDeleteDialog({ isOpen: false, dataId: null, patientName: "" });
      fetchData();
      alert("Data KB berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const methodOptions = [
    { value: "", label: "Semua metode" },
    { value: "PIL", label: "PIL" },
    { value: "SUNTIK_1_BULAN", label: "Suntik 1 Bulan" },
    { value: "SUNTIK_3_BULAN", label: "Suntik 3 Bulan" },
    { value: "IMPLANT", label: "Implant" },
    { value: "IUD", label: "IUD" },
    { value: "KONDOM", label: "Kondom" },
    { value: "MOW", label: "MOW" },
    { value: "MOP", label: "MOP" },
  ];

  const columns = [
    {
      key: "patient_name",
      label: "Nama Pasien",
      sortable: true,
      render: (_, row) => {
        const patientName = row.pasien?.nama || row.nama_pasien || "Pasien";
        return <span className="kb-list__patient-name">{patientName}</span>;
      },
    },
    {
      key: "tanggal_kunjungan",
      label: "Tanggal Kunjungan",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "alat_kontrasepsi",
      label: "Metode Kontrasepsi",
      render: (value) => formatMethod(value),
    },
    {
      key: "children",
      label: "Jumlah Anak",
      render: (_, row) => (
        <span>
          L: {row.jumlah_anak_laki || 0} / P: {row.jumlah_anak_perempuan || 0}
        </span>
      ),
    },
    {
      key: "at",
      label: "Abortus Terancam",
      render: (value) => (
        <span
          className={`kb-list__risk-badge ${
            value ? "kb-list__risk-badge--alert" : "kb-list__risk-badge--safe"
          }`}
        >
          {value ? "Ya" : "Tidak"}
        </span>
      ),
    },
    {
      key: "status_verifikasi",
      label: "Status",
      render: (value) => (value ? <StatusBadge status={value} /> : null),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (_, row) => {
        const patientName = row.pasien?.nama || row.nama_pasien || "Pasien";
        return (
          <div className="kb-list__action-group">
            <Button
              variant="secondary"
              size="sm"
              className="kb-list__action-btn"
              onClick={() => navigate(`/keluarga-berencana/${row.id}`)}
            >
              Detail
            </Button>
            {canEditKB(user, row) && (
              <Button
                variant="warning"
                size="sm"
                className="kb-list__action-btn"
                onClick={() => navigate(`/keluarga-berencana/${row.id}/edit`)}
              >
                Edit
              </Button>
            )}
            {canDeleteKB(user, row) && (
              <Button
                variant="danger"
                size="sm"
                className="kb-list__action-btn"
                onClick={() =>
                  setDeleteDialog({
                    isOpen: true,
                    dataId: row.id,
                    patientName,
                  })
                }
              >
                Hapus
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="kb-list-page">
      <PageHeader
        title="Data Keluarga Berencana"
        subtitle={
          canAddData
            ? "Input dan pantau data pelayanan KB pasien"
            : "Lihat data KB pasien dan proses verifikasi yang masuk"
        }
        actions={
          <>
            {canAddData && (
              <Button
                variant="primary"
                onClick={() => navigate("/keluarga-berencana/add")}
              >
                Input Data Baru
              </Button>
            )}
          </>
        }
      />

      {/* Stats Section */}
      <div className="stats-section">
        <Card variant="surface-card" padding="lg" className="kb-list__summary-card">
          <div className="stat-label">Total Data</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-note">pelayanan KB</div>
        </Card>
        <Card variant="surface-card" padding="lg" className="kb-list__summary-card">
          <div className="stat-label">Menunggu Verifikasi</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-note">pending</div>
        </Card>
        <Card variant="surface-card" padding="lg" className="kb-list__summary-card">
          <div className="stat-label">Disetujui</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-note">approved</div>
        </Card>
        <Card variant="surface-card" padding="lg" className="kb-list__summary-card">
          <div className="stat-label">Abortus Terancam</div>
          <div className="stat-value">{stats.abortusRisk}</div>
          <div className="stat-note">perlu perhatian</div>
        </Card>
      </div>

      {/* Filter Card */}
      <Card
        variant="surface-card"
        padding="xl"
        className="filter-card kb-list__filter-card"
      >
        <h3 className="filter-title">Filter Data KB</h3>
        <p className="filter-subtitle">
          Cari data berdasarkan pasien, metode kontrasepsi, dan tanggal kunjungan
        </p>

        <form onSubmit={handleSearch} className="filter-form">
          <Input
            label="Cari Nama / NIK"
            type="text"
            placeholder="Ketik nama pasien atau NIK..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
          <div className="input-wrapper kb-list__select-wrapper">
            <label className="input-label" htmlFor="kb-method-filter">
              Metode KB
            </label>
            <Select
              inputId="kb-method-filter"
              options={methodOptions}
              value={methodOptions.find(
                (opt) => opt.value === filter.alat_kontrasepsi,
              )}
              onChange={(selectedOption) =>
                setFilter({
                  ...filter,
                  alat_kontrasepsi: selectedOption?.value || "",
                })
              }
              isClearable
              placeholder="Pilih metode..."
            />
          </div>
          <Input
            label="Dari Tanggal"
            type="date"
            value={filter.tanggal_start}
            onChange={(e) =>
              setFilter({ ...filter, tanggal_start: e.target.value })
            }
          />
          <Input
            label="Sampai Tanggal"
            type="date"
            value={filter.tanggal_end}
            onChange={(e) =>
              setFilter({ ...filter, tanggal_end: e.target.value })
            }
          />
          <div className="filter-actions">
            <Button type="submit" variant="primary">
              Cari
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {error && <div className="error-alert">{error}</div>}

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : dataList.length === 0 ? (
        <EmptyState
          message={
            canAddData
              ? "Belum ada data KB. Silakan tambahkan data baru atau ubah filter pencarian."
              : "Belum ada data KB yang dapat ditampilkan."
          }
          action={
            canAddData ? (
              <Button
                variant="primary"
                onClick={() => navigate("/keluarga-berencana/add")}
              >
                Input Data Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table columns={columns} data={dataList} className="kb-list-table" />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, dataId: null, patientName: "" })
        }
        onConfirm={handleDelete}
        title="Hapus Data"
        message={`Apakah Anda yakin ingin menghapus data KB "${deleteDialog.patientName}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default KBList;
