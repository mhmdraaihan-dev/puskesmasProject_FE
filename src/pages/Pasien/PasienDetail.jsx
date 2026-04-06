import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
import { getPasienDetail } from "../../services/api";
import { formatDate } from "../../utils/dateFormatter";
import { isBidanPraktik } from "../../utils/roleHelpers";

const PASIEN_TABS = {
  kehamilan: {
    shortLabel: "Kehamilan",
    label: "Riwayat Kehamilan",
    emptyLabel: "Belum ada riwayat pemeriksaan kehamilan.",
    ctaLabel: "+ Input Pemeriksaan Baru",
    ctaPath: "/pemeriksaan-kehamilan/add",
    getItems: (data) => data.pemeriksaan_kehamilan || [],
    renderMeta: (item) => (
      <>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Tanggal</span>
          <span style={styles.metaValue}>{formatDate(item.tanggal)}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Umur Kehamilan</span>
          <span style={styles.metaValue}>{item.umur_kehamilan} minggu</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Kunjungan</span>
          <span style={styles.metaValue}>{item.jenis_kunjungan || "-"}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Catatan</span>
          <span style={styles.metaValue}>{item.catatan || "-"}</span>
        </div>
      </>
    ),
  },
  persalinan: {
    shortLabel: "Persalinan",
    label: "Riwayat Persalinan",
    emptyLabel: "Belum ada riwayat persalinan.",
    ctaLabel: "+ Input Persalinan Baru",
    ctaPath: "/persalinan/add",
    getItems: (data) => data.persalinan || [],
    renderMeta: (item) => (
      <>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Tanggal Partus</span>
          <span style={styles.metaValue}>{formatDate(item.tanggal_partus)}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Riwayat</span>
          <span style={styles.metaValue}>
            G{item.gravida} P{item.para} A{item.abortus}
          </span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Bayi</span>
          <span style={styles.metaValue}>
            {item.keadaan_bayi?.jenis_kelamin || "-"} /{" "}
            {item.keadaan_bayi?.bb || "-"} g
          </span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Kondisi Ibu</span>
          <span style={styles.metaValue}>
            {item.keadaan_ibu?.baik ? "Baik" : "Perlu Perhatian"}
          </span>
        </div>
      </>
    ),
  },
  kb: {
    shortLabel: "KB",
    label: "Riwayat KB",
    emptyLabel: "Belum ada riwayat KB.",
    ctaLabel: "+ Input KB Baru",
    ctaPath: "/keluarga-berencana/add",
    getItems: (data) => data.keluarga_berencana || [],
    renderMeta: (item) => (
      <>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Tanggal Kunjungan</span>
          <span style={styles.metaValue}>{formatDate(item.tanggal_kunjungan)}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Metode</span>
          <span style={styles.metaValue}>
            {item.alat_kontrasepsi?.replace(/_/g, " ") || "-"}
          </span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Anak Hidup</span>
          <span style={styles.metaValue}>
            L {item.jumlah_anak_laki} / P {item.jumlah_anak_perempuan}
          </span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Keterangan</span>
          <span style={styles.metaValue}>{item.keterangan || "-"}</span>
        </div>
      </>
    ),
  },
  imunisasi: {
    shortLabel: "Imunisasi",
    label: "Riwayat Imunisasi",
    emptyLabel: "Belum ada riwayat imunisasi.",
    ctaLabel: "+ Input Imunisasi Baru",
    ctaPath: "/imunisasi/add",
    getItems: (data) => data.imunisasi || [],
    renderMeta: (item) => (
      <>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Tanggal Imunisasi</span>
          <span style={styles.metaValue}>{formatDate(item.tgl_imunisasi)}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Jenis Imunisasi</span>
          <span style={styles.metaValue}>
            {item.jenis_imunisasi?.replace(/_/g, " ") || "-"}
          </span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Berat / Suhu</span>
          <span style={styles.metaValue}>
            {item.berat_badan} kg / {item.suhu_badan || "-"} C
          </span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Orang Tua</span>
          <span style={styles.metaValue}>{item.nama_orangtua || "-"}</span>
        </div>
      </>
    ),
  },
};

const PasienDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("kehamilan");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPasienDetail(id);
        setData(response.data);
      } catch (err) {
        setError("Gagal memuat detail pasien");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Memuat detail pasien...
      </div>
    );
  }

  if (error) {
    return <div className="error-alert">{error}</div>;
  }

  if (!data) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Data pasien tidak ditemukan
      </div>
    );
  }

  const canCreatePelayanan = isBidanPraktik(user);
  const patientInitial = data.nama?.charAt(0)?.toUpperCase() || "?";
  const tabs = Object.entries(PASIEN_TABS).map(([tabId, config]) => ({
    id: tabId,
    ...config,
    items: config.getItems(data),
  }));
  const activeConfig =
    tabs.find((tab) => tab.id === activeTab) || tabs[0] || null;

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Detail Pasien</h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            Profil pasien dan ringkasan riwayat pelayanan
          </p>
        </div>
        <button
          onClick={() => navigate("/pasien")}
          className="btn-primary"
          style={styles.backButton}
        >
          Kembali ke List
        </button>
      </div>

      <div className="auth-card" style={styles.heroCard}>
        <div style={styles.heroTop}>
          <div style={styles.identityBlock}>
            <div style={styles.avatar}>{patientInitial}</div>
            <div>
              <div style={styles.identityBadge}>Pasien</div>
              <h3 style={styles.patientName}>{data.nama}</h3>
              <p className="text-muted" style={{ margin: 0 }}>
                NIK {data.nik || "-"}
              </p>
            </div>
          </div>

          {canCreatePelayanan && activeConfig ? (
            <button
              onClick={() => navigate(activeConfig.ctaPath)}
              className="btn-primary"
              style={styles.primaryAction}
            >
              {activeConfig.ctaLabel}
            </button>
          ) : null}
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>Tanggal Lahir</span>
            <span style={styles.infoValue}>{formatDate(data.tanggal_lahir)}</span>
          </div>
          <div style={styles.infoCard}>
            <span style={styles.infoLabel}>Alamat Lengkap</span>
            <span style={styles.infoValue}>{data.alamat_lengkap || "-"}</span>
          </div>
        </div>

        <div style={styles.summaryRow}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.summaryChip,
                ...(activeTab === tab.id ? styles.summaryChipActive : {}),
              }}
            >
              <span style={styles.summaryChipLabel}>{tab.shortLabel}</span>
              <span style={styles.summaryChipValue}>{tab.items.length}</span>
            </button>
          ))}
        </div>
      </div>

      {activeConfig ? (
        <div className="auth-card" style={styles.historyCard}>
          <div style={styles.historyHeader}>
            <div>
              <h3 style={styles.sectionTitle}>{activeConfig.label}</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                {activeConfig.items.length > 0
                  ? `Total ${activeConfig.items.length} data tercatat`
                  : "Belum ada data yang tercatat untuk modul ini"}
              </p>
            </div>
          </div>

          <div style={styles.tabGrid}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === tab.id ? styles.activeTabButton : {}),
                }}
              >
                <span style={styles.tabTitle}>{tab.label}</span>
                <span style={styles.tabCount}>{tab.items.length} data</span>
              </button>
            ))}
          </div>

          {activeConfig.items.length > 0 ? (
            <div style={styles.historyList}>
              {activeConfig.items.map((item, index) => (
                <div key={item.id || `${activeConfig.id}-${index}`} style={styles.historyItem}>
                  <div style={styles.historyItemHeader}>
                    <div>
                      <h4 style={styles.historyItemTitle}>
                        {activeConfig.shortLabel} #{index + 1}
                      </h4>
                      <p className="text-muted" style={styles.historyItemSubtitle}>
                        Detail pelayanan pasien
                      </p>
                    </div>
                    {item.status_verifikasi ? (
                      <StatusBadge status={item.status_verifikasi} />
                    ) : null}
                  </div>
                  <div style={styles.historyMetaGrid}>
                    {activeConfig.renderMeta(item)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <h4 style={styles.emptyTitle}>Belum ada riwayat</h4>
              <p className="text-muted" style={styles.emptyText}>
                {activeConfig.emptyLabel}
              </p>
              {canCreatePelayanan ? (
                <button
                  onClick={() => navigate(activeConfig.ctaPath)}
                  className="btn-primary"
                  style={styles.primaryAction}
                >
                  {activeConfig.ctaLabel}
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

const styles = {
  header: {
    gap: "1rem",
    flexWrap: "wrap",
  },
  pageTitle: {
    marginBottom: "0.35rem",
  },
  pageSubtitle: {
    margin: 0,
  },
  backButton: {
    width: "auto",
    minWidth: "190px",
    paddingInline: "1.25rem",
    backgroundColor: "transparent",
    border: "1px solid var(--glass-border)",
  },
  heroCard: {
    maxWidth: "none",
    margin: "0 0 1.5rem",
    padding: "1.75rem",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  identityBlock: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  avatar: {
    width: "88px",
    height: "88px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(59,130,246,0.75))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "2.5rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  identityBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.35rem 0.75rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "0.78rem",
    color: "var(--color-text-muted)",
    marginBottom: "0.75rem",
  },
  patientName: {
    marginBottom: "0.35rem",
    fontSize: "1.85rem",
  },
  primaryAction: {
    width: "auto",
    minWidth: "220px",
    paddingInline: "1rem",
    fontSize: "0.95rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
    marginBottom: "1.25rem",
  },
  infoCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    padding: "1rem 1.1rem",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  infoLabel: {
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--color-text-muted)",
  },
  infoValue: {
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: 1.5,
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "0.85rem",
  },
  summaryChip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
    padding: "0.95rem 1rem",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  summaryChipActive: {
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.32)",
    boxShadow: "0 12px 24px rgba(59,130,246,0.12)",
  },
  summaryChipLabel: {
    fontWeight: "600",
  },
  summaryChipValue: {
    minWidth: "2rem",
    height: "2rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.1)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },
  historyCard: {
    maxWidth: "none",
    margin: 0,
    padding: "1.75rem",
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
  },
  sectionTitle: {
    marginBottom: "0.35rem",
    fontSize: "1.2rem",
  },
  sectionSubtitle: {
    margin: 0,
  },
  tabGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.85rem",
    marginBottom: "1.25rem",
  },
  tabButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.35rem",
    padding: "1rem",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
    color: "white",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  activeTabButton: {
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.32)",
  },
  tabTitle: {
    fontWeight: "700",
    lineHeight: 1.35,
  },
  tabCount: {
    fontSize: "0.82rem",
    color: "var(--color-text-muted)",
  },
  historyList: {
    display: "grid",
    gap: "1rem",
  },
  historyItem: {
    padding: "1.2rem",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  historyItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  historyItemTitle: {
    marginBottom: "0.25rem",
    fontSize: "1rem",
  },
  historyItemSubtitle: {
    margin: 0,
  },
  historyMetaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.95rem",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  metaLabel: {
    fontSize: "0.76rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--color-text-muted)",
  },
  metaValue: {
    lineHeight: 1.45,
  },
  emptyState: {
    minHeight: "240px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: "0.9rem",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "1px dashed rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.02)",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "1.05rem",
  },
  emptyText: {
    margin: 0,
    maxWidth: "420px",
  },
};

export default PasienDetail;
