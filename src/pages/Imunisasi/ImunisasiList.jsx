import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deleteImunisasi, getImunisasiList } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  canDeleteImunisasi,
  canEditImunisasi,
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
import "./ImunisasiList.css";

const formatImmunizationType = (value) => value?.replace(/_/g, " ") || "-";

const ImunisasiList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    search: "",
    tanggal_start: "",
    tanggal_end: "",
    jenis_imunisasi: "",
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
    const withTemperature = dataList.filter(
      (item) => item.suhu_badan !== null && item.suhu_badan !== undefined,
    ).length;

    return { total, pending, approved, withTemperature };
  }, [dataList]);

  const fetchData = async (overrideFilter = filter) => {
    try {
      setLoading(true);
      const params = { ...overrideFilter };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await getImunisasiList(params);
      setDataList(response.data || []);
      setError("");
    } catch (err) {
      setError("Gagal memuat data imunisasi");
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
      jenis_imunisasi: "",
    };
    setFilter(resetFilter);
    fetchData(resetFilter);
  };

  const handleDelete = async () => {
    try {
      await deleteImunisasi(deleteDialog.dataId);
      setDeleteDialog({ isOpen: false, dataId: null, patientName: "" });
      fetchData();
      alert("Data imunisasi berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const immunizationOptions = [
    { value: "", label: "Semua jenis" },
    { value: "HB_0", label: "HB 0" },
    { value: "BCG", label: "BCG" },
    { value: "POLIO_1", label: "POLIO 1" },
    { value: "POLIO_2", label: "POLIO 2" },
    { value: "POLIO_3", label: "POLIO 3" },
    { value: "POLIO_4", label: "POLIO 4" },
    { value: "DPT_HB_HIB_1", label: "DPT-HB-Hib 1" },
    { value: "DPT_HB_HIB_2", label: "DPT-HB-Hib 2" },
    { value: "DPT_HB_HIB_3", label: "DPT-HB-Hib 3" },
    { value: "CAMPAK", label: "Campak" },
    { value: "IPV", label: "IPV" },
    { value: "DPT_HB_HIB_LANJUTAN", label: "DPT-HB-Hib Lanjutan" },
    { value: "CAMPAK_LANJUTAN", label: "Campak Lanjutan" },
  ];

  const columns = [
    {
      key: "patient_name",
      label: "Nama Pasien",
      sortable: true,
      render: (_, row) => {
        const patientName = row.pasien?.nama || row.nama_pasien || "Pasien";
        return <span className="imunisasi-list__patient-name">{patientName}</span>;
      },
    },
    {
      key: "tgl_imunisasi",
      label: "Tanggal Imunisasi",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "jenis_imunisasi",
      label: "Jenis Imunisasi",
      render: (value) => formatImmunizationType(value),
    },
    {
      key: "child_condition",
      label: "Kondisi Anak",
      render: (_, row) => (
        <span>
          {row.berat_badan || "-"} kg / {row.suhu_badan ?? "-"}°C
        </span>
      ),
    },
    {
      key: "nama_orangtua",
      label: "Nama Orang Tua",
      render: (value) => value || "-",
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
          <div className="imunisasi-list__action-group">
            <Button
              variant="secondary"
              size="sm"
              className="imunisasi-list__action-btn"
              onClick={() => navigate(`/imunisasi/${row.id}`)}
            >
              Detail
            </Button>
            {canEditImunisasi(user, row) && (
              <Button
                variant="warning"
                size="sm"
                className="imunisasi-list__action-btn"
                onClick={() => navigate(`/imunisasi/${row.id}/edit`)}
              >
                Edit
              </Button>
            )}
            {canDeleteImunisasi(user, row) && (
              <Button
                variant="danger"
                size="sm"
                className="imunisasi-list__action-btn"
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
    <div className="imunisasi-list-page">
      <PageHeader
        title="Data Imunisasi"
        subtitle={
          canAddData
            ? "Input dan pantau data imunisasi anak"
            : "Lihat data imunisasi anak dan proses verifikasinya"
        }
        actions={
          <>
            {canAddData && (
              <Button variant="primary" onClick={() => navigate("/imunisasi/add")}>
                Input Data Baru
              </Button>
            )}
          </>
        }
      />

      {/* Stats Section */}
      <div className="stats-section">
        <Card
          variant="surface-card"
          padding="lg"
          className="imunisasi-list__summary-card"
        >
          <div className="stat-label">Total Data</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-note">imunisasi</div>
        </Card>
        <Card
          variant="surface-card"
          padding="lg"
          className="imunisasi-list__summary-card"
        >
          <div className="stat-label">Menunggu Verifikasi</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-note">pending</div>
        </Card>
        <Card
          variant="surface-card"
          padding="lg"
          className="imunisasi-list__summary-card"
        >
          <div className="stat-label">Disetujui</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-note">approved</div>
        </Card>
        <Card
          variant="surface-card"
          padding="lg"
          className="imunisasi-list__summary-card"
        >
          <div className="stat-label">Dengan Suhu Tercatat</div>
          <div className="stat-value">{stats.withTemperature}</div>
          <div className="stat-note">suhu tercatat</div>
        </Card>
      </div>

      {/* Filter Card */}
      <Card
        variant="surface-card"
        padding="xl"
        className="filter-card imunisasi-list__filter-card"
      >
        <h3 className="filter-title">Filter Data Imunisasi</h3>
        <p className="filter-subtitle">
          Cari data berdasarkan pasien, jenis imunisasi, dan tanggal layanan
        </p>

        <form onSubmit={handleSearch} className="filter-form">
          <Input
            label="Cari Nama / NIK"
            type="text"
            placeholder="Ketik nama pasien atau NIK..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
          <div className="input-wrapper imunisasi-list__select-wrapper">
            <label className="input-label" htmlFor="imunisasi-type-filter">
              Jenis Imunisasi
            </label>
            <Select
              inputId="imunisasi-type-filter"
              options={immunizationOptions}
              value={immunizationOptions.find(
                (opt) => opt.value === filter.jenis_imunisasi,
              )}
              onChange={(selectedOption) =>
                setFilter({
                  ...filter,
                  jenis_imunisasi: selectedOption?.value || "",
                })
              }
              isClearable
              placeholder="Pilih jenis imunisasi..."
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
            <Button type="button" variant="secondary" onClick={handleReset}>
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
              ? "Belum ada data imunisasi. Silakan tambahkan data baru atau ubah filter pencarian."
              : "Belum ada data imunisasi yang dapat ditampilkan."
          }
          action={
            canAddData ? (
              <Button variant="primary" onClick={() => navigate("/imunisasi/add")}>
                Input Data Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table
          columns={columns}
          data={dataList}
          className="imunisasi-list-table"
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, dataId: null, patientName: "" })
        }
        onConfirm={handleDelete}
        title="Hapus Data"
        message={`Apakah Anda yakin ingin menghapus data imunisasi "${deleteDialog.patientName}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default ImunisasiList;
