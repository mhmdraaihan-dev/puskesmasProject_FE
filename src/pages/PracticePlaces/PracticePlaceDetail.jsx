import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RoleGuard from "../../components/RoleGuard";
import { getPracticePlaceById } from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Table from "../../components/ui/Table";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import "../../styles/design-system.css";
import "./PracticePlaceDetail.css";

const PracticePlaceDetail = () => {
  const { practiceId } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const assignedUsers =
    Array.isArray(place?.users) && place.users.length > 0
      ? place.users
      : place?.user
        ? [place.user]
        : [];

  useEffect(() => {
    fetchPracticePlace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceId]);

  const fetchPracticePlace = async () => {
    try {
      setLoading(true);
      const response = await getPracticePlaceById(practiceId);
      setPlace(response.data);
      setError("");
    } catch (err) {
      setError("Gagal memuat detail tempat praktik");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="practice-place-detail-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="practice-place-detail-page">
        <div className="error-alert">{error || "Tempat praktik tidak ditemukan"}</div>
        <Button variant="primary" onClick={() => navigate("/practice-places")}>
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  const userColumns = [
    {
      key: "full_name",
      label: "Nama",
      sortable: true,
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "phone_number",
      label: "Telepon",
      render: (value) => value || "-",
    },
  ];

  return (
    <div className="practice-place-detail-page">
      <PageHeader
        title={place.nama_praktik}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/practice-places")}>
              Kembali
            </Button>
            <RoleGuard allowedRoles={["ADMIN"]}>
              <Button
                variant="primary"
                onClick={() => navigate(`/practice-places/${practiceId}/edit`)}
              >
                Edit Tempat Praktik
              </Button>
            </RoleGuard>
          </>
        }
      />

      {/* Summary Cards */}
      <div className="stats-section">
        <Card variant="surface-dark" padding="lg">
          <div className="stat-label">Bidan Terhubung</div>
          <div className="stat-value">{assignedUsers.length}</div>
          <div className="stat-note">bidan praktik</div>
        </Card>
        <Card variant="surface-dark" padding="lg">
          <div className="stat-label">Desa</div>
          <div className="stat-value-text">{place.village?.nama_desa || "-"}</div>
          <div className="stat-note">wilayah praktik</div>
        </Card>
        <Card variant="surface-dark" padding="lg">
          <div className="stat-label">Riwayat Data</div>
          <div className="stat-value">{place._count?.health_data || 0}</div>
          <div className="stat-note">data tersimpan</div>
        </Card>
      </div>

      {/* Practice Place Details */}
      <Card variant="surface-dark" padding="xl" className="section-card">
        <h3 className="section-title">Informasi Tempat Praktik</h3>
        <p className="section-subtitle">Detail lokasi dan alamat praktik</p>

        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Nama Praktik</div>
            <div className="detail-value">{place.nama_praktik}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Desa</div>
            <div className="detail-value">{place.village?.nama_desa || "-"}</div>
          </div>
          <div className="detail-item detail-item--full">
            <div className="detail-label">Alamat Lengkap</div>
            <div className="detail-value">{place.alamat || "-"}</div>
          </div>
        </div>
      </Card>

      {/* Associated Users Table */}
      <Card variant="surface-dark" padding="xl" className="section-card">
        <h3 className="section-title">Bidan Praktik</h3>
        <p className="section-subtitle">Tenaga yang terhubung ke tempat praktik ini</p>

        {assignedUsers.length > 0 ? (
          <Table columns={userColumns} data={assignedUsers} />
        ) : (
          <div className="empty-state">
            <p>Belum ada bidan praktik yang terhubung</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PracticePlaceDetail;
