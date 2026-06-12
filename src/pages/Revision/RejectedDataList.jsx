import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { getRejectedData } from "../../services/api";
import { formatDateTime } from "../../utils/dateFormatter";
import { isBidanPraktik } from "../../utils/roleHelpers";
import "../../styles/design-system.css";
import "./RejectedDataList.css";

const MODULE_META = {
  legacy: {
    label: "Data Kesehatan",
    detailRoute: (id) => `/health-data/${id}`,
    reviseRoute: (id) => `/revision/${id}/revise`,
  },
  kehamilan: {
    label: "Pemeriksaan Kehamilan",
    detailRoute: (id) => `/pemeriksaan-kehamilan/${id}`,
    reviseRoute: (id) => `/pemeriksaan-kehamilan/${id}/edit`,
  },
  persalinan: {
    label: "Persalinan",
    detailRoute: (id) => `/persalinan/${id}`,
    reviseRoute: (id) => `/persalinan/${id}/edit`,
  },
  "keluarga-berencana": {
    label: "Keluarga Berencana",
    detailRoute: (id) => `/keluarga-berencana/${id}`,
    reviseRoute: (id) => `/keluarga-berencana/${id}/edit`,
  },
  imunisasi: {
    label: "Imunisasi",
    detailRoute: (id) => `/imunisasi/${id}`,
    reviseRoute: (id) => `/imunisasi/${id}/edit`,
  },
};

const normalizeModuleKey = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  switch (normalized) {
    case "kehamilan":
    case "pemeriksaan_kehamilan":
    case "pemeriksaan-kehamilan":
      return "kehamilan";
    case "persalinan":
      return "persalinan";
    case "kb":
    case "keluarga_berencana":
    case "keluarga-berencana":
      return "keluarga-berencana";
    case "imunisasi":
      return "imunisasi";
    case "legacy":
    case "health_data":
    case "health-data":
      return "legacy";
    default:
      return normalized || "legacy";
  }
};

const getModuleMeta = (moduleKey) => MODULE_META[moduleKey] || MODULE_META.legacy;

const normalizeRejectedItems = (items = []) =>
  items
    .map((item) => {
      const id = item.id || item.data_id;
      const moduleKey = normalizeModuleKey(item.module || item.jenis_data);
      const moduleMeta = getModuleMeta(moduleKey);
      const verifierName =
        item.verifier?.full_name ||
        item.verifier_name ||
        item.verifier?.name ||
        "-";

      return {
        id,
        moduleKey,
        moduleLabel: moduleMeta.label,
        patientName:
          item.pasien_nama ||
          item.nama_pasien ||
          item.pasien?.nama ||
          "-",
        patientNik: item.pasien_nik || item.pasien?.nik || "-",
        verifierName,
        practiceName:
          item.practice_place?.nama_praktik ||
          item.practice_place_name ||
          item.practice_name ||
          "-",
        villageName:
          item.practice_place?.village?.nama_desa ||
          item.village?.nama_desa ||
          item.village_name ||
          "-",
        status: item.status_verifikasi || "REJECTED",
        rejectReason: item.alasan_penolakan || "",
        rejectedAt: item.tanggal_verifikasi || item.tanggal_update || item.updated_at,
        detailRoute: id ? moduleMeta.detailRoute(id) : null,
        reviseRoute: id ? moduleMeta.reviseRoute(id) : null,
      };
    })
    .sort((a, b) => new Date(b.rejectedAt || 0) - new Date(a.rejectedAt || 0));

const RejectedDataList = () => {
  const [rejectedData, setRejectedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!isBidanPraktik(user)) {
      navigate("/");
      return;
    }

    fetchRejectedData();
  }, [user, navigate]);

  const fetchRejectedData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getRejectedData();
      setRejectedData(normalizeRejectedItems(response.data || []));
    } catch (err) {
      setError("Gagal memuat data yang ditolak");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return rejectedData;
    }

    return rejectedData.filter((item) =>
      [
        item.patientName,
        item.patientNik,
        item.moduleLabel,
        item.verifierName,
        item.practiceName,
        item.villageName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [rejectedData, search]);

  const summaryCards = useMemo(() => {
    const uniqueModules = new Set(rejectedData.map((item) => item.moduleLabel)).size;
    const withReasonCount = rejectedData.filter((item) => Boolean(item.rejectReason))
      .length;

    return [
      {
        label: "Total Ditolak",
        value: rejectedData.length,
        note: "siap ditindaklanjuti",
      },
      {
        label: "Hasil Filter",
        value: filteredData.length,
        note: "data yang sedang tampil",
      },
      {
        label: "Modul",
        value: uniqueModules,
        note: "asal data revisi",
      },
      {
        label: "Ada Alasan",
        value: withReasonCount,
        note: "catatan penolakan terisi",
      },
    ];
  }, [filteredData.length, rejectedData]);

  return (
    <div className="rejected-data-list-page">
      <PageHeader
        title="Data Ditolak - Revisi"
        subtitle="Data yang ditolak dari semua modul pelayanan dan memerlukan perbaikan"
        actions={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Kembali ke Dashboard
          </Button>
        }
      />

      {/* Stats Section */}
      <div className="stats-section">
        {summaryCards.map((card) => (
          <Card
            key={card.label}
            variant="surface-card"
            padding="lg"
            className="rejected-data-list__summary-card"
          >
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-note">{card.note}</div>
          </Card>
        ))}
      </div>

      {/* Filter and List Section */}
      <Card
        variant="surface-card"
        padding="xl"
        className="list-card rejected-data-list__list-card"
      >
        <div className="list-header">
          <div>
            <h3 className="list-title">Daftar Data Ditolak</h3>
            <p className="list-subtitle">
              Cari cepat berdasarkan nama pasien, NIK, modul, verifier, atau tempat
              praktik
            </p>
          </div>
          <div className="search-wrapper">
            <Input
              type="text"
              placeholder="Cari data revisi..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : filteredData.length === 0 ? (
          <EmptyState
            message={
              rejectedData.length === 0
                ? "Belum ada data yang ditolak"
                : "Tidak ada data yang cocok dengan pencarian"
            }
          />
        ) : (
          <div className="rejected-items-grid">
            {filteredData.map((data) => (
              <Card
                key={`${data.moduleKey}-${data.id}`}
                variant="surface-card"
                padding="xl"
                className="rejected-item"
              >
                <div className="item-header">
                  <div>
                    <div className="module-badge">{data.moduleLabel}</div>
                    <h3 className="patient-name">{data.patientName}</h3>
                    <p className="patient-meta">
                      NIK {data.patientNik} • {data.practiceName} • {data.villageName}
                    </p>
                  </div>
                  <StatusBadge status={data.status} />
                </div>

                <div className="meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">Ditolak oleh</span>
                    <strong className="meta-value">{data.verifierName}</strong>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Tanggal ditolak</span>
                    <strong className="meta-value">{formatDateTime(data.rejectedAt)}</strong>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Aksi revisi</span>
                    <strong className="meta-value">
                      {data.moduleKey === "legacy"
                        ? "Form revisi lama"
                        : "Edit modul asli"}
                    </strong>
                  </div>
                </div>

                <div className="rejection-reason-box">
                  <div className="rejection-title">Alasan Penolakan</div>
                  <p className="rejection-text">
                    {data.rejectReason || "Belum ada alasan yang dikirim backend."}
                  </p>
                </div>

                <div className="item-actions">
                  <Button
                    variant="secondary"
                    onClick={() => data.detailRoute && navigate(data.detailRoute)}
                    disabled={!data.detailRoute}
                  >
                    Detail
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => data.reviseRoute && navigate(data.reviseRoute)}
                    disabled={!data.reviseRoute}
                  >
                    Revisi Data
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};


const styles = {
  page: {
    maxWidth: "1240px",
    paddingBottom: "3rem",
  },
  header: {
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  title: {
    marginBottom: "0.4rem",
  },
  subtitle: {
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  secondaryButton: {
    width: "auto",
    minWidth: "170px",
    paddingInline: "1rem",
  },
  section: {
    marginBottom: "1.5rem",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  summaryCard: {
    maxWidth: "none",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  summaryLabel: {
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--color-text-muted)",
  },
  summaryValue: {
    fontSize: "1.8rem",
    lineHeight: 1.1,
  },
  summaryNote: {
    fontSize: "0.9rem",
    color: "var(--color-text-muted)",
  },
  filterCard: {
    maxWidth: "none",
    margin: 0,
    padding: "1.35rem",
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  sectionTitle: {
    marginBottom: "0.35rem",
  },
  sectionText: {
    margin: 0,
  },
  searchWrap: {
    minWidth: "280px",
    flex: "1 1 320px",
    maxWidth: "420px",
  },
  loadingState: {
    textAlign: "center",
    padding: "3rem 1rem",
  },
  emptyStateCard: {
    maxWidth: "none",
    margin: 0,
    textAlign: "center",
    padding: "2.5rem 1rem",
  },
  listGrid: {
    display: "grid",
    gap: "1rem",
  },
  itemCard: {
    maxWidth: "none",
    margin: 0,
    padding: "1.2rem",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "0.9rem",
  },
  eyebrow: {
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--color-primary-dark)",
    fontWeight: "700",
    marginBottom: "0.4rem",
  },
  patientName: {
    fontSize: "1.18rem",
    marginBottom: "0.25rem",
  },
  patientMeta: {
    margin: 0,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.85rem",
    marginBottom: "0.9rem",
  },
  metaBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "0.9rem 1rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.62)",
    border: "1px solid rgba(73, 62, 50, 0.1)",
  },
  metaLabel: {
    fontSize: "0.76rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--color-text-muted)",
  },
  rejectionBox: {
    padding: "1rem",
    borderRadius: "16px",
    background: "rgba(198, 69, 69, 0.08)",
    border: "1px solid rgba(198, 69, 69, 0.18)",
  },
  rejectionTitle: {
    fontSize: "0.88rem",
    fontWeight: "700",
    marginBottom: "0.35rem",
    color: "#9a4141",
  },
  rejectionText: {
    margin: 0,
    lineHeight: 1.6,
    color: "var(--color-text-main)",
  },
  actionsRow: {
    marginTop: "1rem",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  detailButton: {
    width: "auto",
    minWidth: "110px",
    paddingInline: "1rem",
  },
  reviseButton: {
    width: "auto",
    minWidth: "140px",
    paddingInline: "1rem",
  },
};

export default RejectedDataList;
