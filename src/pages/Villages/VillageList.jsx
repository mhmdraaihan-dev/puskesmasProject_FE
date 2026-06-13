import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteVillage, getVillages } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { isAdmin } from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/ui/Table";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import "../../styles/design-system.css";
import "./VillageList.css";

const getVillageMidwifeTotal = (village) => {
  if (typeof village?.total_bidan_wilayah === "number") {
    return village.total_bidan_wilayah;
  }
  if (
    typeof village?.total_bidan_desa === "number" ||
    typeof village?.total_bidan_praktik === "number"
  ) {
    return (village?.total_bidan_desa || 0) + (village?.total_bidan_praktik || 0);
  }
  return village?._count?.users || 0;
};

const VillageList = () => {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    villageId: null,
    villageName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isAdmin(user)) {
      navigate("/");
      return;
    }
    fetchVillages();
  }, [user, navigate]);

  const filteredVillages = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return villages;
    return villages.filter((village) => {
      const nama = village.nama_desa?.toLowerCase() || "";
      const kode = village.village_code?.toLowerCase() || "";
      return nama.includes(keyword) || kode.includes(keyword);
    });
  }, [search, villages]);

  const summary = useMemo(() => {
    const totalVillages = villages.length;
    const totalMidwives = villages.reduce(
      (sum, village) => sum + getVillageMidwifeTotal(village),
      0,
    );
    const totalPractices = villages.reduce(
      (sum, village) => sum + (village._count?.practice_places || 0),
      0,
    );
    return { totalVillages, totalMidwives, totalPractices };
  }, [villages]);

  const fetchVillages = async () => {
    try {
      setLoading(true);
      const response = await getVillages();
      setVillages(
        response.success && Array.isArray(response.data) ? response.data : [],
      );
      setError("");
    } catch (err) {
      setError("Gagal memuat data desa");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVillage(deleteDialog.villageId);
      setDeleteDialog({ isOpen: false, villageId: null, villageName: "" });
      await fetchVillages();
      alert("Desa berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus desa");
    }
  };

  const columns = [
    {
      key: "nama_desa",
      label: "Nama Desa",
      sortable: true,
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      key: "village_code",
      label: "Kode Desa",
      sortable: true,
    },
    {
      key: "midwives",
      label: "Total Bidan",
      sortable: false,
      render: (_, row) => getVillageMidwifeTotal(row),
    },
    {
      key: "practices",
      label: "Tempat Praktik",
      sortable: false,
      render: (_, row) => row._count?.practice_places || 0,
    },
    {
      key: "actions",
      label: "Aksi",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/villages/${row.village_id}`)}
          >
            Detail
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/villages/${row.village_id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              setDeleteDialog({
                isOpen: true,
                villageId: row.village_id,
                villageName: row.nama_desa,
              })
            }
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="village-list-page">
      <PageHeader
        heading="Daftar Desa"
        subtitle="Kelola daftar desa, jumlah bidan, dan tempat praktik dalam tampilan yang lebih ringkas."
        className="village-list-header"
        actions={
          <Button variant="primary" onClick={() => navigate("/villages/add")}>
            Tambah Desa
          </Button>
        }
      />

      <div className="vl-stat-row">
        <div className="vl-stat-card">
          <span className="vl-stat-label">Total Desa</span>
          <span className="vl-stat-value">{summary.totalVillages}</span>
          <span className="vl-stat-note">desa terdaftar</span>
        </div>
        <div className="vl-stat-card">
          <span className="vl-stat-label">Total Bidan</span>
          <span className="vl-stat-value">{summary.totalMidwives}</span>
          <span className="vl-stat-note">bidan aktif</span>
        </div>
        <div className="vl-stat-card">
          <span className="vl-stat-label">Tempat Praktik</span>
          <span className="vl-stat-value">{summary.totalPractices}</span>
          <span className="vl-stat-note">lokasi praktik</span>
        </div>
        <div className="vl-stat-card">
          <span className="vl-stat-label">Hasil Filter</span>
          <span className="vl-stat-value">{filteredVillages.length}</span>
          <span className="vl-stat-note">desa tampil saat ini</span>
        </div>
      </div>

      {/* Filter Controls */}
      <Card variant="surface-card" padding="lg" className="vl-filter-card">
        <div className="filter-section">
          <Input
            type="text"
            placeholder="Cari berdasarkan nama desa atau kode desa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : filteredVillages.length === 0 ? (
        <EmptyState
          message={search ? "Tidak ada desa yang cocok dengan pencarian" : "Belum ada data desa"}
          action={
            search ? (
              <Button variant="secondary" onClick={() => setSearch("")}>
                Reset Pencarian
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate("/villages/add")}>
                Tambah Desa Pertama
              </Button>
            )
          }
        />
      ) : (
        <Table columns={columns} data={filteredVillages} className="village-list-table" />
      )}

      <Modal
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, villageId: null, villageName: "" })
        }
        title="Hapus Desa"
        size="sm"
      >
        <p>
          Apakah Anda yakin ingin menghapus desa <strong>"{deleteDialog.villageName}"</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() =>
              setDeleteDialog({ isOpen: false, villageId: null, villageName: "" })
            }
          >
            Batal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VillageList;
