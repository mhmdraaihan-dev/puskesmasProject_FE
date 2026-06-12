import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deletePersalinan, getPersalinanList } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  canDeletePersalinan,
  canEditPersalinan,
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
import "./PersalinanList.css";

const getIbuSummary = (ibu) => {
  if (!ibu) return "-";
  if (ibu.baik) return "Baik";

  const issues = [];
  if (ibu.hap) issues.push("Pendarahan");
  if (ibu.partus_lama) issues.push("Partus lama");
  if (ibu.pre_eklamsi) issues.push("Pre-eklamsi");
  if (ibu.hidup === false) issues.push("Ibu meninggal");

  return issues.length > 0 ? issues.join(", ") : "Perlu perhatian";
};

const getBayiSummary = (bayi) => {
  if (!bayi) return "-";
  const gender =
    bayi.jenis_kelamin === "LAKI_LAKI"
      ? "L"
      : bayi.jenis_kelamin === "PEREMPUAN"
        ? "P"
        : "-";
  return `${gender} / ${bayi.bb || "-"} g / ${bayi.pb || "-"} cm`;
};

const PersalinanList = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    search: "",
    tanggal_start: "",
    tanggal_end: "",
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
    const pending = dataList.filter(
      (item) => item.status_verifikasi === "PENDING",
    ).length;
    const approved = dataList.filter(
      (item) => item.status_verifikasi === "APPROVED",
    ).length;
    const withComplication = dataList.filter((item) => {
      const ibu = item.keadaan_ibu_persalinan;
      return (
        ibu &&
        (!ibu.baik || !ibu.hidup || ibu.hap || ibu.partus_lama || ibu.pre_eklamsi)
      );
    }).length;

    return { total, pending, approved, withComplication };
  }, [dataList]);

  const fetchData = async (overrideFilter = filter) => {
    try {
      setLoading(true);
      const params = { ...overrideFilter };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await getPersalinanList(params);
      setDataList(response.data || []);
      setError("");
    } catch (err) {
      setError("Gagal memuat data persalinan");
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
      await deletePersalinan(deleteDialog.dataId);
      setDeleteDialog({ isOpen: false, dataId: null, patientName: "" });
      fetchData();
      alert("Data persalinan berhasil dihapus");
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
          <span className="persalinan-list__patient-name">{patientName}</span>
        );
      },
    },
    {
      key: "tanggal_partus",
      label: "Tanggal Persalinan",
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: "gravida",
      label: "Riwayat GPA",
      render: (_, row) => (
        <span>
          G{row.gravida} P{row.para} A{row.abortus}
        </span>
      ),
    },
    {
      key: "keadaan_bayi",
      label: "Data Bayi",
      render: (_, row) => getBayiSummary(row.keadaan_bayi_persalinan),
    },
    {
      key: "keadaan_ibu",
      label: "Kondisi Ibu",
      render: (_, row) => {
        const ibu = row.keadaan_ibu_persalinan;
        const ibuCritical =
          ibu &&
          (!ibu.baik || !ibu.hidup || ibu.hap || ibu.partus_lama || ibu.pre_eklamsi);
        const summary = getIbuSummary(ibu);

        return (
          <span
            className={`persalinan-list__condition-badge ${
              ibuCritical
                ? "persalinan-list__condition-badge--critical"
                : "persalinan-list__condition-badge--stable"
            }`}
          >
            {summary}
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
              className="persalinan-list__action-btn"
              onClick={() => navigate(`/persalinan/${row.id}`)}
            >
              Detail
            </Button>
            {canEditPersalinan(user, row) && (
              <Button
                variant="warning"
                size="sm"
                className="persalinan-list__action-btn"
                onClick={() => navigate(`/persalinan/${row.id}/edit`)}
              >
                Edit
              </Button>
            )}
            {canDeletePersalinan(user, row) && (
              <Button
                variant="danger"
                size="sm"
                className="persalinan-list__action-btn"
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
    <div className="persalinan-list-page">
      <PageHeader
        title="Data Persalinan"
        subtitle={
          canAddData
            ? "Input dan pantau seluruh data persalinan pasien"
            : "Lihat data persalinan lintas pasien dan proses verifikasinya"
        }
        actions={
          <>
            {canAddData && (
              <Button variant="primary" onClick={() => navigate("/persalinan/add")}>
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
          className="persalinan-list__summary-card"
        >
          <div className="stat-label">Total Data</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-note">persalinan</div>
        </Card>
        <Card
          variant="surface-card"
          padding="md"
          className="persalinan-list__summary-card"
        >
          <div className="stat-label">Menunggu Verifikasi</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-note">pending</div>
        </Card>
        <Card
          variant="surface-card"
          padding="md"
          className="persalinan-list__summary-card"
        >
          <div className="stat-label">Disetujui</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-note">approved</div>
        </Card>
        <Card
          variant="surface-card"
          padding="md"
          className="persalinan-list__summary-card"
        >
          <div className="stat-label">Kondisi Perlu Perhatian</div>
          <div className="stat-value">{stats.withComplication}</div>
          <div className="stat-note">komplikasi</div>
        </Card>
      </div>

      {/* Filter Card */}
      <Card
        variant="surface-card"
        padding="xl"
        className="filter-card persalinan-list__filter-card"
      >
        <h3 className="filter-title">Filter Persalinan</h3>
        <p className="filter-subtitle">
          Cari data berdasarkan pasien dan rentang tanggal persalinan
        </p>

        <form onSubmit={handleSearch} className="filter-form">
          <Input
            label="Cari Nama / NIK"
            type="text"
            placeholder="Ketik nama pasien atau NIK..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
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
            onChange={(e) => setFilter({ ...filter, tanggal_end: e.target.value })}
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
              ? "Belum ada data persalinan. Silakan tambahkan data baru atau ubah filter pencarian."
              : "Belum ada data persalinan yang dapat ditampilkan."
          }
          action={
            canAddData ? (
              <Button variant="primary" onClick={() => navigate("/persalinan/add")}>
                Input Data Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table columns={columns} data={dataList} className="persalinan-list-table" />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, dataId: null, patientName: "" })
        }
        onConfirm={handleDelete}
        title="Hapus Data"
        message={`Apakah Anda yakin ingin menghapus data persalinan "${deleteDialog.patientName}"?\n\nPERINGATAN: Menghapus data ini juga akan menghapus data ibu dan anak yang terkait!`}
        confirmText="Hapus Permanen"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
};

export default PersalinanList;
