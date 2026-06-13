import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import "./PracticePlaceList.css";
import {
  deletePracticePlace,
  getPracticePlaces,
} from "../../services/api";

const getAssignedMidwivesLabel = (place) => {
  if (Array.isArray(place.users) && place.users.length > 0) {
    return place.users.map((practiceUser) => practiceUser.full_name).join(", ");
  }
  return place.user?.full_name || "-";
};

const PracticePlaceList = () => {
  const [practicePlaces, setPracticePlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    practiceId: null,
    practiceName: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isAdmin(user)) {
      navigate("/");
      return;
    }
    fetchPracticePlaces();
  }, [user, navigate]);

  const filteredPracticePlaces = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return practicePlaces;
    return practicePlaces.filter((place) => {
      const nama = place.nama_praktik?.toLowerCase() || "";
      const alamat = place.alamat?.toLowerCase() || "";
      const desa = place.village?.nama_desa?.toLowerCase() || "";
      return nama.includes(keyword) || alamat.includes(keyword) || desa.includes(keyword);
    });
  }, [search, practicePlaces]);

  const fetchPracticePlaces = async () => {
    try {
      setLoading(true);
      const response = await getPracticePlaces();
      setPracticePlaces(
        response.success && Array.isArray(response.data) ? response.data : [],
      );
      setError("");
    } catch (err) {
      setError("Gagal memuat data tempat praktik");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePracticePlace(deleteDialog.practiceId);
      setDeleteDialog({ isOpen: false, practiceId: null, practiceName: "" });
      await fetchPracticePlaces();
      alert("Tempat praktik berhasil dihapus");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus tempat praktik");
    }
  };

  const columns = [
    {
      key: "nama_praktik",
      label: "Nama Tempat Praktik",
      sortable: true,
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      key: "alamat",
      label: "Alamat",
      sortable: false,
      render: (value) => value || "-",
    },
    {
      key: "village_name",
      label: "Desa",
      sortable: true,
      render: (_, row) => row.village?.nama_desa || "-",
    },
    {
      key: "actions",
      label: "Aksi",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/practice-places/${row.practice_id}`)}
          >
            Detail
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/practice-places/${row.practice_id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              setDeleteDialog({
                isOpen: true,
                practiceId: row.practice_id,
                practiceName: row.nama_praktik,
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
    <div className="practice-place-list-page">
      <PageHeader
        title="Daftar Tempat Praktik"
        subtitle="Kelola lokasi praktik, wilayah, dan bidan yang terhubung dalam satu halaman."
        actions={
          <Button variant="primary" onClick={() => navigate("/practice-places/add")}>
            Tambah Tempat Praktik
          </Button>
        }
      />

      {/* Stat Cards */}
      <div className="ppl-stat-row">
        <div className="ppl-stat-card">
          <span className="ppl-stat-label">Total Tempat Praktik</span>
          <span className="ppl-stat-value">{practicePlaces.length}</span>
          <span className="ppl-stat-note">lokasi terdaftar</span>
        </div>
        <div className="ppl-stat-card">
          <span className="ppl-stat-label">Hasil Filter</span>
          <span className="ppl-stat-value">{filteredPracticePlaces.length}</span>
          <span className="ppl-stat-note">lokasi tampil saat ini</span>
        </div>
      </div>

      {/* Filter Controls */}
      <Card variant="surface-card" padding="lg" className="ppl-filter-card">
        <div className="filter-section">
          <Input
            type="text"
            placeholder="Cari berdasarkan nama tempat praktik, alamat, atau desa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {error && (
        <div className="error-alert" style={{ marginBottom: "var(--spacing-md)" }}>
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : filteredPracticePlaces.length === 0 ? (
        <EmptyState
          message={search ? "Tidak ada tempat praktik yang cocok dengan pencarian" : "Belum ada data tempat praktik"}
          action={
            search ? (
              <Button variant="secondary" onClick={() => setSearch("")}>
                Reset Pencarian
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate("/practice-places/add")}>
                Tambah Tempat Praktik Pertama
              </Button>
            )
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filteredPracticePlaces}
          className="practice-place-list-table"
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteDialog.isOpen}
        onClose={() =>
          setDeleteDialog({ isOpen: false, practiceId: null, practiceName: "" })
        }
        title="Hapus Tempat Praktik"
      >
        <p style={{ marginBottom: "var(--spacing-4)" }}>
          Apakah Anda yakin ingin menghapus tempat praktik "{deleteDialog.practiceName}"? 
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={() =>
              setDeleteDialog({ isOpen: false, practiceId: null, practiceName: "" })
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

export default PracticePlaceList;
