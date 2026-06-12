import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deletePasien, getPasienList } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  isBidanDesa,
  isBidanKoordinator,
  isBidanPraktik,
} from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Table from "../../components/ui/Table";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import "../../styles/design-system.css";
import "./PasienList.css";

const PasienList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ search: "" });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    dataId: null,
    patientName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const canManage =
    isBidanPraktik(user) || isBidanDesa(user) || isBidanKoordinator(user);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalPatients = dataList.length;
    const patientsWithAddress = dataList.filter(
      (item) => item.alamat_lengkap,
    ).length;
    const latestPatient = dataList[0]?.tanggal_lahir;

    return {
      totalPatients,
      patientsWithAddress,
      latestPatient,
    };
  }, [dataList]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getPasienList({ ...filter });
      setDataList(response.data || []);
      setError("");
    } catch (err) {
      setError("Gagal memuat data pasien");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleReset = async () => {
    const resetFilter = { search: "" };
    setFilter(resetFilter);
    try {
      setLoading(true);
      const response = await getPasienList(resetFilter);
      setDataList(response.data || []);
      setError("");
    } catch (err) {
      setError("Gagal memuat data pasien");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePasien(deleteDialog.dataId);
      setDeleteDialog({ isOpen: false, dataId: null, patientName: "" });
      fetchData();
      alert("Data pasien berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus data");
    }
  };

  const columns = [
    {
      key: "nik",
      label: "NIK",
      sortable: true,
      render: (value) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>
          {value || "-"}
        </span>
      ),
    },
    {
      key: "nama",
      label: "Nama Lengkap",
      sortable: true,
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      key: "tanggal_lahir",
      label: "Tanggal Lahir",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "alamat_lengkap",
      label: "Alamat",
      render: (value) => value || "-",
    },
    {
      key: "actions",
      label: "Aksi",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button
            variant="secondary-on-dark"
            size="sm"
            onClick={() => navigate(`/pasien/${row.pasien_id}`)}
          >
            Detail
          </Button>
          {canManage && (
            <>
              <Button
                variant="secondary-on-dark"
                size="sm"
                onClick={() => navigate(`/pasien/${row.pasien_id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="secondary-on-dark"
                size="sm"
                onClick={() =>
                  setDeleteDialog({
                    isOpen: true,
                    dataId: row.pasien_id,
                    patientName: row.nama,
                  })
                }
              >
                Hapus
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="pasien-list-page">
      <PageHeader
        title="Daftar Pasien"
        subtitle="Data pasien yang tampil mengikuti akses akun dan relasi practice place"
        actions={
          <>
            {canManage && (
              <Button variant="primary" onClick={() => navigate("/pasien/add")}>
                Tambah Pasien
              </Button>
            )}
          </>
        }
      />

      {/* Stats Section */}
      <div className="stats-section">
        <Card variant="surface-dark" padding="lg">
          <div className="stat-label">Total Pasien</div>
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-note">pasien terdaftar</div>
        </Card>
        <Card variant="surface-dark" padding="lg">
          <div className="stat-label">Data Alamat Terisi</div>
          <div className="stat-value">{stats.patientsWithAddress}</div>
          <div className="stat-note">alamat lengkap</div>
        </Card>
        <Card variant="surface-dark" padding="lg">
          <div className="stat-label">Filter Aktif</div>
          <div className="stat-value-text">
            {filter.search ? "Pencarian" : "Semua Data"}
          </div>
          <div className="stat-note">
            {filter.search || "Belum ada kata kunci"}
          </div>
        </Card>
      </div>

      {/* Search Filter */}
      <Card variant="surface-dark" padding="xl" className="filter-card">
        <h3 className="filter-title">Pencarian Pasien</h3>
        <p className="filter-subtitle">
          Cari pasien berdasarkan nama atau NIK
        </p>

        <form onSubmit={handleSearch} className="filter-form">
          <Input
            type="text"
            placeholder="Ketik nama pasien atau NIK..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
          <div className="filter-actions">
            <Button type="submit" variant="primary">
              Cari Data
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
            canManage
              ? "Belum ada data pasien. Silakan tambahkan pasien baru atau ubah kata kunci pencarian."
              : "Belum ada data pasien yang dapat ditampilkan."
          }
          action={
            canManage ? (
              <Button variant="primary" onClick={() => navigate("/pasien/add")}>
                Tambah Pasien Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table columns={columns} data={dataList} />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, dataId: null, patientName: "" })
        }
        title="Hapus Data Pasien"
      >
        <p style={{ marginBottom: "var(--spacing-4)" }}>
          Menghapus pasien "{deleteDialog.patientName}" juga akan menghapus
          riwayat layanan yang terhubung. Pastikan data ini memang sudah tidak
          diperlukan.
        </p>
        <div className="modal-actions">
          <Button
            variant="secondary-on-dark"
            onClick={() =>
              setDeleteDialog({ isOpen: false, dataId: null, patientName: "" })
            }
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            style={{
              backgroundColor: "var(--color-error)",
              borderColor: "var(--color-error)",
            }}
          >
            Hapus Data
          </Button>
        </div>
      </Modal>
    </div>
  );
};
export default PasienList;
