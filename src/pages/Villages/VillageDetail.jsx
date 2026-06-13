import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVillageById } from "../../services/api";
import { getPositionLabel } from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Table from "../../components/ui/Table";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import "../../styles/design-system.css";
import "./VillageDetail.css";

const getVillageMidwifeSummary = (village) => {
  const totalBidanDesa =
    typeof village?.total_bidan_desa === "number" ? village.total_bidan_desa : null;
  const totalBidanPraktik =
    typeof village?.total_bidan_praktik === "number"
      ? village.total_bidan_praktik
      : null;
  const totalBidanWilayah =
    typeof village?.total_bidan_wilayah === "number"
      ? village.total_bidan_wilayah
      : null;

  if (
    totalBidanDesa !== null ||
    totalBidanPraktik !== null ||
    totalBidanWilayah !== null
  ) {
    return {
      totalBidanDesa: totalBidanDesa || 0,
      totalBidanPraktik: totalBidanPraktik || 0,
      totalBidanWilayah:
        totalBidanWilayah ?? (totalBidanDesa || 0) + (totalBidanPraktik || 0),
    };
  }

  return {
    totalBidanDesa: village?.users?.length || 0,
    totalBidanPraktik: 0,
    totalBidanWilayah: village?.users?.length || 0,
  };
};

const VillageDetail = () => {
  const { villageId } = useParams();
  const navigate = useNavigate();
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const midwifeSummary = getVillageMidwifeSummary(village);

  useEffect(() => {
    fetchVillage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villageId]);

  const fetchVillage = async () => {
    try {
      setLoading(true);
      const response = await getVillageById(villageId);
      setVillage(response.data);
      setError("");
    } catch (err) {
      setError("Gagal memuat detail desa");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="village-detail-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !village) {
    return (
      <div className="village-detail-page">
        <div className="error-alert">{error || "Data desa tidak ditemukan"}</div>
        <Button variant="primary" onClick={() => navigate("/villages")}>
          Kembali ke Daftar Desa
        </Button>
      </div>
    );
  }

  const allBidan = [
    ...(village.users || []).map((u) => ({ ...u, practiceName: "-" })),
    ...(village.practice_places || []).flatMap((p) =>
      (p.users || []).map((u) => ({ ...u, practiceName: p.nama_praktik }))
    ),
  ];

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
      key: "position_user",
      label: "Posisi",
      render: (value) => getPositionLabel(value),
    },
    {
      key: "practiceName",
      label: "Tempat Praktik",
      render: (value) =>
        value && value !== "-" ? (
          <span className="vd-practice-tag">{value}</span>
        ) : (
          <span className="vd-practice-tag vd-practice-tag--desa">—</span>
        ),
    },
  ];

  return (
    <div className="village-detail-page">
      <PageHeader
        title={village.nama_desa}
        subtitle="Ringkasan wilayah, bidan terhubung, dan tempat praktik dalam satu tampilan."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/villages")}>
              Kembali
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/villages/${villageId}/edit`)}
            >
              Edit Desa
            </Button>
          </>
        }
      />

      {/* Summary Cards */}
      <div className="vd-stat-row">
        <div className="vd-stat-card">
          <span className="vd-stat-label">Total Bidan Wilayah</span>
          <span className="vd-stat-value">{midwifeSummary.totalBidanWilayah}</span>
          <span className="vd-stat-note">bidan terdaftar</span>
        </div>
        <div className="vd-stat-card">
          <span className="vd-stat-label">Bidan Desa</span>
          <span className="vd-stat-value">{midwifeSummary.totalBidanDesa}</span>
          <span className="vd-stat-note">bidan desa</span>
        </div>
        <div className="vd-stat-card">
          <span className="vd-stat-label">Bidan Praktik</span>
          <span className="vd-stat-value">{midwifeSummary.totalBidanPraktik}</span>
          <span className="vd-stat-note">bidan praktik</span>
        </div>
        <div className="vd-stat-card">
          <span className="vd-stat-label">Tempat Praktik</span>
          <span className="vd-stat-value">{village.practice_places?.length || 0}</span>
          <span className="vd-stat-note">lokasi praktik</span>
        </div>
      </div>

      {/* Bidan Table — all bidan (desa + praktik) */}
      <Card variant="surface-card" padding="xl" className="section-card detail-surface-card">
        <div className="vd-section-head">
          <div>
            <h3 className="section-title">Daftar Bidan</h3>
            <p className="section-subtitle">Semua bidan desa dan bidan praktik yang terdaftar pada wilayah ini</p>
          </div>
          <div className="vd-bidan-badges">
            <span className="vd-count-badge vd-count-badge--desa">
              Bidan Desa: {village.users?.length || 0}
            </span>
            <span className="vd-count-badge vd-count-badge--praktik">
              Bidan Praktik: {midwifeSummary.totalBidanPraktik}
            </span>
          </div>
        </div>

        {allBidan.length > 0 ? (
          <Table columns={userColumns} data={allBidan} className="village-detail-table" />
        ) : (
          <div className="empty-state">
            <p>Belum ada bidan di desa ini</p>
          </div>
        )}
      </Card>

      {/* Practice Places */}
      <Card variant="surface-card" padding="xl" className="section-card detail-surface-card">
        <h3 className="section-title">Tempat Praktik</h3>
        <p className="section-subtitle">Daftar praktik yang terhubung ke desa ini</p>

        {village.practice_places && village.practice_places.length > 0 ? (
          <div className="practice-grid">
            {village.practice_places.map((place) => (
              <div
                key={place.practice_id}
                className="practice-card"
                onClick={() => navigate(`/practice-places/${place.practice_id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="practice-card-header">
                  <h4 className="practice-title">{place.nama_praktik}</h4>
                  <span className="practice-count-badge">
                    {place._count?.users ?? place.users?.length ?? 0} bidan
                  </span>
                </div>
                <p className="practice-address">{place.alamat || "-"}</p>
                {Array.isArray(place.users) && place.users.length > 0 ? (
                  <ul className="practice-staff-list">
                    {place.users.map((u) => (
                      <li key={u.user_id} className="practice-staff-item">
                        <span className="practice-staff-name">{u.full_name}</span>
                        <span className="practice-staff-pos">{getPositionLabel(u.position_user)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="practice-staff empty">Belum ada bidan terhubung</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Belum ada tempat praktik di desa ini</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VillageDetail;
