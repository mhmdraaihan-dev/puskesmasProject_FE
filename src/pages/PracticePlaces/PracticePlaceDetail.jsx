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
        subtitle="Lihat detail lokasi praktik, wilayah, dan bidan yang terhubung."
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
      <div className="ppd-stat-row">
        <div className="ppd-stat-card">
          <span className="ppd-stat-label">Bidan Terhubung</span>
          <span className="ppd-stat-value">{assignedUsers.length}</span>
          <span className="ppd-stat-note">bidan praktik</span>
        </div>
        <div className="ppd-stat-card">
          <span className="ppd-stat-label">Desa</span>
          <span className="ppd-stat-value ppd-stat-value--text">{place.village?.nama_desa || "-"}</span>
          <span className="ppd-stat-note">wilayah praktik</span>
        </div>
        <div className="ppd-stat-card">
          <span className="ppd-stat-label">Riwayat Data</span>
          <span className="ppd-stat-value">{place._count?.health_data || 0}</span>
          <span className="ppd-stat-note">data tersimpan</span>
        </div>
      </div>

      {/* Practice Place Details */}
      <div className="ppd-info-card ppd-section">
        <h3 className="ppd-section-title">Informasi Tempat Praktik</h3>
        <p className="ppd-section-sub">Detail lokasi dan alamat praktik</p>
        <div className="ppd-detail-grid">
          <div className="ppd-detail-item">
            <span className="ppd-detail-label">Nama Praktik</span>
            <span className="ppd-detail-value">{place.nama_praktik}</span>
          </div>
          <div className="ppd-detail-item">
            <span className="ppd-detail-label">Desa</span>
            <span className="ppd-detail-value">{place.village?.nama_desa || "-"}</span>
          </div>
          <div className="ppd-detail-item ppd-detail-item--full">
            <span className="ppd-detail-label">Alamat Lengkap</span>
            <span className="ppd-detail-value">{place.alamat || "-"}</span>
          </div>
        </div>
      </div>

      {/* Associated Users Table */}
      <Card variant="surface-card" padding="xl" className="section-card detail-surface-card">
        <h3 className="section-title">Bidan Praktik</h3>
        <p className="section-subtitle">Tenaga yang terhubung ke tempat praktik ini</p>

        {assignedUsers.length > 0 ? (
          <Table
            columns={userColumns}
            data={assignedUsers}
            className="practice-place-detail-table"
          />
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
