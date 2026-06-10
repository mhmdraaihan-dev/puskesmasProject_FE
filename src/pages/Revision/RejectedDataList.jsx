import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { getRejectedData } from "../../services/api";
import { formatDateTime } from "../../utils/dateFormatter";
import { isBidanPraktik } from "../../utils/roleHelpers";
import "../../App.css";

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
    <div className="dashboard page-shell" style={styles.page}>
      <header className="dashboard-header" style={styles.header}>
        <div className="page-intro">
          <div className="page-kicker">Revision Feed</div>
          <h1 className="page-title" style={styles.title}>Revisi</h1>
          <p className="page-subtitle" style={styles.subtitle}>
            Data yang ditolak kini dibaca dari feed gabungan semua modul pelayanan.
          </p>
        </div>
        <div className="page-actions" style={styles.headerActions}>
          <button
            onClick={() => navigate("/")}
            className="btn-secondary"
            style={styles.secondaryButton}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </header>

      <section style={styles.section}>
        <div style={styles.summaryGrid}>
          {summaryCards.map((card) => (
            <div key={card.label} className="stat-card" style={styles.summaryCard}>
              <div style={styles.summaryLabel}>{card.label}</div>
              <div style={styles.summaryValue}>{card.value}</div>
              <div style={styles.summaryNote}>{card.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-card-light" style={styles.filterCard}>
        <div style={styles.sectionHead}>
          <div>
            <h3 style={styles.sectionTitle}>Daftar Data Ditolak</h3>
            <p className="text-muted" style={styles.sectionText}>
              Cari cepat berdasarkan nama pasien, NIK, modul, verifier, atau tempat
              praktik.
            </p>
          </div>
          <div style={styles.searchWrap}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari data revisi..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <div className="error-alert" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        ) : null}

        {loading ? (
          <div style={styles.loadingState}>Memuat data revisi...</div>
        ) : filteredData.length === 0 ? (
          <div className="content-card-light" style={styles.emptyStateCard}>
            {rejectedData.length === 0
              ? "Belum ada data yang ditolak."
              : "Tidak ada data yang cocok dengan pencarian."}
          </div>
        ) : (
          <div style={styles.listGrid}>
            {filteredData.map((data) => (
              <article
                key={`${data.moduleKey}-${data.id}`}
                className="content-card-light"
                style={styles.itemCard}
              >
                <div style={styles.itemHeader}>
                  <div>
                    <div style={styles.eyebrow}>{data.moduleLabel}</div>
                    <h3 style={styles.patientName}>{data.patientName}</h3>
                    <p className="text-muted" style={styles.patientMeta}>
                      NIK {data.patientNik} • {data.practiceName} • {data.villageName}
                    </p>
                  </div>
                  <StatusBadge status={data.status} />
                </div>

                <div style={styles.metaGrid}>
                  <div style={styles.metaBlock}>
                    <span style={styles.metaLabel}>Ditolak oleh</span>
                    <strong>{data.verifierName}</strong>
                  </div>
                  <div style={styles.metaBlock}>
                    <span style={styles.metaLabel}>Tanggal ditolak</span>
                    <strong>{formatDateTime(data.rejectedAt)}</strong>
                  </div>
                  <div style={styles.metaBlock}>
                    <span style={styles.metaLabel}>Aksi revisi</span>
                    <strong>
                      {data.moduleKey === "legacy"
                        ? "Form revisi lama"
                        : "Edit modul asli"}
                    </strong>
                  </div>
                </div>

                <div style={styles.rejectionBox}>
                  <div style={styles.rejectionTitle}>Alasan Penolakan</div>
                  <p style={styles.rejectionText}>
                    {data.rejectReason || "Belum ada alasan yang dikirim backend."}
                  </p>
                </div>

                <div style={styles.actionsRow}>
                  <button
                    onClick={() => data.detailRoute && navigate(data.detailRoute)}
                    className="btn-secondary"
                    style={styles.detailButton}
                    disabled={!data.detailRoute}
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => data.reviseRoute && navigate(data.reviseRoute)}
                    className="btn-primary"
                    style={styles.reviseButton}
                    disabled={!data.reviseRoute}
                  >
                    Revisi Data
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
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
