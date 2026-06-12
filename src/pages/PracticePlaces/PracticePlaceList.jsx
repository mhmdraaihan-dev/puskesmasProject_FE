import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isAdmin } from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Table from "../../components/ui/Table";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/Button";
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
            variant="secondary-on-dark"
            size="sm"
            onClick={() => navigate(`/practice-places/${row.practice_id}`)}
          >
            Detail
          </Button>
          <Button
            variant="secondary-on-dark"
            size="sm"
            onClick={() => navigate(`/practice-places/${row.practice_id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="secondary-on-dark"
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
        actions={
          <Button variant="primary" onClick={() => navigate("/practice-places/add")}>
            Tambah Tempat Praktik
          </Button>
        }
      />

      {error && (
        <div className="error-alert" style={{ marginBottom: "var(--spacing-5)" }}>
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : practicePlaces.length === 0 ? (
        <EmptyState
          message="Belum ada data tempat praktik"
          action={
            <Button variant="primary" onClick={() => navigate("/practice-places/add")}>
              Tambah Tempat Praktik Pertama
            </Button>
          }
        />
      ) : (
        <Table columns={columns} data={practicePlaces} />
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
            variant="secondary-on-dark"
            onClick={() =>
              setDeleteDialog({ isOpen: false, practiceId: null, practiceName: "" })
            }
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            style={{ 
              backgroundColor: "var(--color-error)",
              borderColor: "var(--color-error)"
            }}
          >
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PracticePlaceList;
