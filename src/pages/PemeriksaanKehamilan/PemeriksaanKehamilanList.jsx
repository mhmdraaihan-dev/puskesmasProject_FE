import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deleteKehamilan, getKehamilanList } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  canDeleteKehamilan,
  canEditKehamilan,
  isAdmin,
  isBidanPraktik,
} from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Table from "../../components/ui/Table";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import "../../styles/design-system.css";
import "./PemeriksaanKehamilanList.css";

const PemeriksaanKehamilanList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    search: "",
    tanggal_start: "",
    tanggal_end: "",
    resti: "",
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
    const rejected = dataList.filter((item) => item.status_verifikasi === "REJECTED").length;

    return { total, pending, approved, rejected };
  }, [dataList]);

  const fetchData = async (overrideFilter = filter) => {
    try {
      setLoading(true);
      const params = { ...overrideFilter };
      Object.keys(params).forEach((key) => {
        if (!params[key]) {
          delete params[key];
        }
      });

      const response = await getKehamilanList(params);
      setDataList(response.data || []);
      setError("");
    } catch (err) {
      setError("Gagal memuat data pemeriksaan kehamilan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDelete = async () => {
    try {
      await deleteKehamilan(deleteDialog.dataId);
      setDeleteDialog({ isOpen: false, dataId: null, patientName: "" });
      fetchData();
      alert("Data pemeriksaan berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const columns = [
    {
      key: "patient_name",
      label: "Nama Pasien",
      sortable: true,
      render: (_, row) => {
        const patientName = row.pasien?.nama || row.nama_pasien || "Pasien";
        return (
          <span className="kehamilan-list__patient-name">{patientName}</span>
        );
      },
    },
    {
      key: "tanggal",
      label: "Tanggal Pemeriksaan",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "umur_kehamilan",
      label: "Umur Kehamilan",
      render: (value) => `${value || "-"} minggu`,
    },
    {
      key: "td",
      label: "Tekanan Darah",
      render: (value) => value || "-",
    },
    {
      key: "resti",
      label: "Risiko",
      render: (value) => {
        const riskLevel = String(value || "RENDAH").toLowerCase();
        return (
          <span
            className={`kehamilan-list__risk-badge kehamilan-list__risk-badge--${riskLevel}`}
          >
            {value || "RENDAH"}
          </span>
        );
      },
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
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button
              variant="secondary"
              size="sm"
              className="kehamilan-list__action-btn"
              onClick={() => navigate(`/pemeriksaan-kehamilan/${row.id}`)}
            >
              Detail
            </Button>
            {canEditKehamilan(user, row) && (
              <Button
                variant="warning"
                size="sm"
                className="kehamilan-list__action-btn"
                onClick={() => navigate(`/pemeriksaan-kehamilan/${row.id}/edit`)}
              >
                Edit
              </Button>
            )}
            {canDeleteKehamilan(user, row) && (
              <Button
                variant="danger"
                size="sm"
                className="kehamilan-list__action-btn"
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
    <div className="kehamilan-list-page">
      <PageHeader
        title="Pemeriksaan Kehamilan"
        subtitle={
          canAddData
            ? "Input, pantau, dan kelola pemeriksaan kehamilan pasien"
            : "Lihat data pemeriksaan kehamilan dan proses verifikasi yang masuk"
        }
        actions={
          <>
            {canAddData && (
              <Button
                variant="primary"
                onClick={() => navigate("/pemeriksaan-kehamilan/add")}
              >
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
          padding="md"
          className="kehamilan-list__summary-card"
        >
          <div className="stat-label">Total Data</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-note">pemeriksaan</div>
        </Card>
        <Card
          variant="surface-card"
          padding="md"
          className="kehamilan-list__summary-card"
        >
          <div className="stat-label">Menunggu Verifikasi</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-note">pending</div>
        </Card>
        <Card
          variant="surface-card"
          padding="md"
          className="kehamilan-list__summary-card"
        >
          <div className="stat-label">Disetujui</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-note">approved</div>
        </Card>
        <Card
          variant="surface-card"
          padding="md"
          className="kehamilan-list__summary-card"
        >
          <div className="stat-label">Ditolak</div>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-note">rejected</div>
        </Card>
      </div>

      {/* Filter Card */}
      <Card
        variant="surface-card"
        padding="xl"
        className="filter-card kehamilan-list__filter-card"
      >
        <h3 className="filter-title">Filter Pemeriksaan</h3>
        <p className="filter-subtitle">
          Persempit data berdasarkan pasien, rentang tanggal, dan level risiko
        </p>

        <form onSubmit={handleSearch} className="filter-form">
          <Input
            label="Cari Nama / NIK"
            type="text"
            placeholder="Ketik nama pasien atau NIK..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
          <div className="input-wrapper kehamilan-list__select-wrapper">
            <label className="input-label" htmlFor="resti">
              Risiko Tinggi
            </label>
            <select
              id="resti"
              name="resti"
              className="form-select"
              value={filter.resti}
              onChange={(e) => setFilter({ ...filter, resti: e.target.value })}
            >
              <option value="">Semua Level</option>
              <option value="RENDAH">Rendah</option>
              <option value="SEDANG">Sedang</option>
              <option value="TINGGI">Tinggi</option>
            </select>
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
              onClick={() => {
                const resetFilter = {
                  search: "",
                  tanggal_start: "",
                  tanggal_end: "",
                  resti: "",
                };
                setFilter(resetFilter);
                fetchData(resetFilter);
              }}
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
              ? "Belum ada data pemeriksaan. Silakan tambahkan data baru atau ubah filter pencarian."
              : "Belum ada data pemeriksaan yang bisa ditampilkan saat ini."
          }
          action={
            canAddData ? (
              <Button
                variant="primary"
                onClick={() => navigate("/pemeriksaan-kehamilan/add")}
              >
                Input Data Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table columns={columns} data={dataList} className="kehamilan-list-table" />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, dataId: null, patientName: "" })
        }
        title="Hapus Data"
      >
        <p style={{ marginBottom: "var(--spacing-4)" }}>
          Apakah Anda yakin ingin menghapus data pemeriksaan "
          {deleteDialog.patientName}"?
        </p>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() =>
              setDeleteDialog({ isOpen: false, dataId: null, patientName: "" })
            }
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default PemeriksaanKehamilanList;
