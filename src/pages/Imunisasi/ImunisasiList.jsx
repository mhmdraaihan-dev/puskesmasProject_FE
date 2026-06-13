import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deleteImunisasi, getImunisasiList, getVillages, getPracticePlacesByVillage } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import {
  canDeleteImunisasi,
  canEditImunisasi,
  isBidanKoordinator,
  isBidanPraktik,
} from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Button from "../../components/Button";
import Input from "../../components/Input";
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
    bulan: "",
    village_id: "",
    practice_id: "",
  });
  const [villages, setVillages] = useState([]);
  const [practicePlaces, setPracticePlaces] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    dataId: null,
    patientName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const canAddData = isBidanPraktik(user);
  const isKoor = isBidanKoordinator(user);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  useEffect(() => {
    if (isKoor) {
      getVillages()
        .then((res) => setVillages(res.data || []))
        .catch(() => {});
    }
  }, [isKoor]);

  useEffect(() => {
    if (!isKoor || !filter.village_id) { setPracticePlaces([]); return; }
    getPracticePlacesByVillage(filter.village_id)
      .then((res) => setPracticePlaces(res.data || []))
      .catch(() => {});
  }, [isKoor, filter.village_id]);

  const handleVillageChange = (village_id) => {
    setFilter((f) => ({ ...f, village_id, practice_id: "" }));
  };

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
      bulan: "",
      village_id: "",
      practice_id: "",
    };
    setFilter(resetFilter);
    if (isKoor) setPracticePlaces([]);
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
      <div className="im-stat-row">
        <div className="im-stat-card">
          <span className="im-stat-label">Total Data</span>
          <span className="im-stat-value">{stats.total}</span>
          <span className="im-stat-note">imunisasi</span>
        </div>
        <div className="im-stat-card">
          <span className="im-stat-label">Menunggu Verifikasi</span>
          <span className="im-stat-value">{stats.pending}</span>
          <span className="im-stat-note">pending</span>
        </div>
        <div className="im-stat-card">
          <span className="im-stat-label">Disetujui</span>
          <span className="im-stat-value">{stats.approved}</span>
          <span className="im-stat-note">approved</span>
        </div>
        <div className="im-stat-card">
          <span className="im-stat-label">Data Ditolak</span>
          <span className="im-stat-value">{stats.rejected}</span>
          <span className="im-stat-note">perlu revisi</span>
        </div>
      </div>

      {/* Filter Card */}
      <div className="filter-card imunisasi-list__filter-card">
        <h3 className="filter-title">Filter Data Imunisasi</h3>
        <p className="filter-subtitle">
          Cari data berdasarkan pasien, bulan, dan tanggal layanan
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
            <label className="input-label" htmlFor="im-bulan">
              Bulan
            </label>
            <select
              id="im-bulan"
              className="form-select"
              value={filter.bulan}
              onChange={(e) => setFilter({ ...filter, bulan: e.target.value })}
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
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
          {isKoor && (
            <>
              <div className="input-wrapper">
                <label className="input-label" htmlFor="im-village">Desa</label>
                <select
                  id="im-village"
                  className="form-select"
                  value={filter.village_id}
                  onChange={(e) => handleVillageChange(e.target.value)}
                >
                  <option value="">Semua Desa</option>
                  {villages.map((v) => (
                    <option key={v.village_id} value={v.village_id}>{v.nama_desa}</option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper">
                <label className="input-label" htmlFor="im-practice">Tempat Praktik</label>
                <select
                  id="im-practice"
                  className="form-select"
                  value={filter.practice_id}
                  onChange={(e) => setFilter((f) => ({ ...f, practice_id: e.target.value }))}
                  disabled={!filter.village_id}
                >
                  <option value="">
                    {!filter.village_id ? "Pilih desa terlebih dahulu" : "Semua Tempat Praktik"}
                  </option>
                  {practicePlaces.map((p) => (
                    <option key={p.practice_id} value={p.practice_id}>{p.nama_praktik}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="filter-actions">
            <Button type="submit" variant="primary">
              Cari
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </div>

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
