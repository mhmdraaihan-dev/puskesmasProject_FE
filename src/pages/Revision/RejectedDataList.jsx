import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { getRejectedData } from "../../services/api";
import { formatDate, formatDateTime } from "../../utils/dateFormatter";
import { getJenisDataLabel, isBidanPraktik } from "../../utils/roleHelpers";
import "../../App.css";

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
      setRejectedData(response.data || []);
    } catch (err) {
      setError("Gagal memuat data yang ditolak");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return rejectedData;

    return rejectedData.filter((item) => {
      const patientName = item.nama_pasien?.toLowerCase() || "";
      const jenisData = getJenisDataLabel(item.jenis_data)?.toLowerCase() || "";
      const verifier = item.verifier?.full_name?.toLowerCase() || "";

      return (
        patientName.includes(keyword) ||
        jenisData.includes(keyword) ||
        verifier.includes(keyword)
      );
    });
  }, [rejectedData, search]);

  const summaryCards = useMemo(() => {
    const uniqueJenis = new Set(
      rejectedData.map((item) => getJenisDataLabel(item.jenis_data)),
    ).size;
    const withReasonCount = rejectedData.filter(
      (item) => Boolean(item.alasan_penolakan),
    ).length;

    return [
      {
        label: "Total Ditolak",
        value: rejectedData.length,
        note: "menunggu revisi",
      },
      {
        label: "Hasil Filter",
        value: filteredData.length,
        note: "data sedang tampil",
      },
      {
        label: "Jenis Data",
        value: uniqueJenis,
        note: "kategori tercatat",
      },
      {
        label: "Ada Alasan",
        value: withReasonCount,
        note: "siap ditindaklanjuti",
      },
    ];
  }, [filteredData.length, rejectedData]);

  return (
    <div className="dashboard" style={styles.page}>
      <header className="dashboard-header" style={styles.header}>
        <div>
          <h1 style={styles.title}>Revisi</h1>
          <p className="text-muted" style={styles.subtitle}>
            Data yang ditolak dan perlu diperbaiki sebelum dikirim ulang.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate("/")}
            className="action-icon-btn"
            style={styles.secondaryButton}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </header>

      <section style={styles.section}>
        <div style={styles.summaryGrid}>
          {summaryCards.map((card) => (
            <div key={card.label} style={styles.summaryCard}>
              <div style={styles.summaryLabel}>{card.label}</div>
              <div style={styles.summaryValue}>{card.value}</div>
              <div style={styles.summaryNote}>{card.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHead}>
          <div>
            <h3 style={styles.sectionTitle}>Daftar Data Ditolak</h3>
            <p className="text-muted" style={styles.sectionText}>
              Cari cepat berdasarkan nama pasien, jenis data, atau verifier.
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

        {error && (
          <div className="error-alert" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={styles.loadingState}>Memuat data revisi...</div>
        ) : filteredData.length === 0 ? (
          <div className="auth-card" style={styles.emptyStateCard}>
            {rejectedData.length === 0
              ? "Tidak ada data yang ditolak."
              : "Tidak ada data yang cocok dengan pencarian."}
          </div>
        ) : (
          <div style={styles.listGrid}>
            {filteredData.map((data) => (
              <article key={data.data_id} className="auth-card" style={styles.itemCard}>
                <div style={styles.itemHeader}>
                  <div>
                    <div style={styles.eyebrow}>
                      {getJenisDataLabel(data.jenis_data)}
                    </div>
                    <h3 style={styles.patientName}>{data.nama_pasien}</h3>
                    <p className="text-muted" style={styles.patientMeta}>
                      {data.umur_pasien} tahun | diperiksa {formatDate(data.tanggal_periksa)}
                    </p>
                  </div>
                  <StatusBadge status={data.status_verifikasi} />
                </div>

                <div style={styles.metaGrid}>
                  <div style={styles.metaBlock}>
                    <span style={styles.metaLabel}>Ditolak oleh</span>
                    <strong>{data.verifier?.full_name || "-"}</strong>
                  </div>
                  <div style={styles.metaBlock}>
                    <span style={styles.metaLabel}>Tanggal ditolak</span>
                    <strong>{formatDateTime(data.tanggal_verifikasi)}</strong>
                  </div>
                  <div style={styles.metaBlock}>
                    <span style={styles.metaLabel}>Jenis data</span>
                    <strong>{getJenisDataLabel(data.jenis_data)}</strong>
                  </div>
                </div>

                <div style={styles.rejectionBox}>
                  <div style={styles.rejectionTitle}>Alasan Penolakan</div>
                  <p style={styles.rejectionText}>
                    {data.alasan_penolakan || "Tidak ada alasan yang diberikan."}
                  </p>
                </div>

                <div style={styles.actionsRow}>
                  <button
                    onClick={() => navigate(`/health-data/${data.data_id}`)}
                    className="action-icon-btn"
                    style={styles.detailButton}
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => navigate(`/revision/${data.data_id}/revise`)}
                    className="btn-primary"
                    style={styles.reviseButton}
                  >
                    Revisi Data
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .action-icon-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0.48rem 0.85rem;
          border-radius: 8px;
          transition: background 0.2s, border-color 0.2s;
          color: white;
          box-shadow: none;
        }
        .action-icon-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          transform: none;
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: "1280px",
    paddingBottom: "3rem",
  },
  header: {
    alignItems: "flex-start",
    gap: "1rem",
  },
  title: {
    marginBottom: "0.5rem",
  },
  subtitle: {
    margin: 0,
    fontSize: "1rem",
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  secondaryButton: {
    padding: "0.8rem 1rem",
  },
  section: {
    marginBottom: "2rem",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "1rem",
  },
  summaryCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "18px",
    padding: "1.25rem",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
  },
  summaryLabel: {
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--color-text-muted)",
    marginBottom: "0.65rem",
    fontWeight: 700,
  },
  summaryValue: {
    fontSize: "2rem",
    lineHeight: 1,
    fontWeight: 700,
  },
  summaryNote: {
    marginTop: "0.55rem",
    color: "var(--color-text-muted)",
    fontSize: "0.9rem",
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  sectionTitle: {
    marginBottom: "0.35rem",
    fontSize: "1.1rem",
  },
  sectionText: {
    margin: 0,
    fontSize: "0.92rem",
  },
  searchWrap: {
    width: "100%",
    maxWidth: "320px",
  },
  loadingState: {
    textAlign: "center",
    padding: "3rem 1rem",
    color: "var(--color-text-muted)",
  },
  emptyStateCard: {
    textAlign: "center",
    padding: "3rem",
    maxWidth: "none",
  },
  listGrid: {
    display: "grid",
    gap: "1rem",
  },
  itemCard: {
    maxWidth: "none",
    borderRadius: "20px",
    boxShadow: "0 14px 38px rgba(0, 0, 0, 0.18)",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  eyebrow: {
    fontSize: "0.76rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--color-text-muted)",
    marginBottom: "0.45rem",
    fontWeight: 700,
  },
  patientName: {
    marginBottom: "0.35rem",
    fontSize: "1.2rem",
  },
  patientMeta: {
    margin: 0,
    fontSize: "0.92rem",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0.85rem",
    marginBottom: "1rem",
  },
  metaBlock: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "14px",
    padding: "0.95rem 1rem",
    display: "grid",
    gap: "0.3rem",
  },
  metaLabel: {
    fontSize: "0.78rem",
    color: "var(--color-text-muted)",
  },
  rejectionBox: {
    padding: "1rem 1.05rem",
    background: "rgba(239, 68, 68, 0.1)",
    borderRadius: "14px",
    border: "1px solid rgba(239, 68, 68, 0.28)",
    marginBottom: "1rem",
  },
  rejectionTitle: {
    fontSize: "0.78rem",
    color: "#fca5a5",
    marginBottom: "0.45rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  rejectionText: {
    margin: 0,
    fontSize: "0.92rem",
    color: "#fecaca",
  },
  actionsRow: {
    display: "flex",
    gap: "0.75rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    flexWrap: "wrap",
  },
  detailButton: {
    flex: "1 1 180px",
    padding: "0.8rem 1rem",
  },
  reviseButton: {
    flex: "1 1 220px",
    padding: "0.8rem 1rem",
    backgroundColor: "rgba(251, 191, 36, 0.22)",
    border: "1px solid rgba(251, 191, 36, 0.4)",
    color: "#fde68a",
    boxShadow: "none",
  },
};

export default RejectedDataList;
