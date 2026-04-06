import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHealthDataById, reviseRejectedData } from "../../services/api";
import { formatDateForInput } from "../../utils/dateFormatter";
import {
  getJenisDataLabel,
  JENIS_DATA,
  isBidanPraktik,
} from "../../utils/roleHelpers";
import "../../App.css";

const RevisionForm = () => {
  const { dataId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [originalData, setOriginalData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    if (!isBidanPraktik(user)) {
      navigate("/");
      return;
    }
    fetchData();
  }, [dataId, navigate, user]);

  const fetchData = async () => {
    try {
      setInitialLoading(true);
      setError("");

      const response = await getHealthDataById(dataId);
      const data = response.data;
      setOriginalData(data);

      setValue("nama_pasien", data.nama_pasien || "");
      setValue("umur_pasien", data.umur_pasien || "");
      setValue("jenis_data", data.jenis_data || "");
      setValue("tanggal_periksa", formatDateForInput(data.tanggal_periksa));
      setValue("catatan", data.catatan || "");
    } catch (err) {
      setError("Gagal memuat data untuk revisi");
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    setError("");
    setSubmitting(true);

    try {
      await reviseRejectedData(dataId, {
        ...formData,
        umur_pasien: Number.parseInt(formData.umur_pasien, 10),
      });

      alert("Data berhasil direvisi dan dikirim ulang untuk verifikasi.");
      navigate("/revision/rejected");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal merevisi data");
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="dashboard">
        <div style={styles.loadingState}>Memuat data revisi...</div>
      </div>
    );
  }

  return (
    <div className="dashboard" style={styles.page}>
      <header className="dashboard-header" style={styles.header}>
        <div>
          <h1 style={styles.title}>Form Revisi</h1>
          <p className="text-muted" style={styles.subtitle}>
            Perbaiki data yang ditolak lalu kirim ulang untuk proses verifikasi.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate("/revision/rejected")}
            className="action-icon-btn"
            style={styles.secondaryButton}
          >
            Kembali ke List
          </button>
        </div>
      </header>

      <section style={styles.section}>
        <div style={styles.heroCard}>
          <div>
            <div style={styles.eyebrow}>Data Ditolak</div>
            <h3 style={styles.heroTitle}>{originalData?.nama_pasien || "-"}</h3>
            <p className="text-muted" style={styles.heroSubtitle}>
              {originalData?.umur_pasien || "-"} tahun |{" "}
              {getJenisDataLabel(originalData?.jenis_data)}
            </p>
          </div>
          <div style={styles.heroMeta}>
            <div style={styles.heroMetaItem}>
              <span style={styles.heroMetaLabel}>ID Data</span>
              <strong>#{dataId}</strong>
            </div>
            <div style={styles.heroMetaItem}>
              <span style={styles.heroMetaLabel}>Jenis</span>
              <strong>{getJenisDataLabel(originalData?.jenis_data)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div className="auth-card" style={styles.formCard}>
          {error && (
            <div className="error-alert" style={{ marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          {originalData?.alasan_penolakan && (
            <div style={styles.rejectionBox}>
              <h4 style={styles.rejectionTitle}>Alasan Penolakan</h4>
              <p style={styles.rejectionText}>{originalData.alasan_penolakan}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <section style={styles.formSection}>
              <div style={styles.formSectionHead}>
                <h3 style={styles.formSectionTitle}>Identitas Pasien</h3>
                <p className="text-muted" style={styles.formSectionText}>
                  Pastikan data dasar pasien sesuai sebelum dikirim ulang.
                </p>
              </div>

              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label" htmlFor="nama_pasien">
                    Nama Pasien *
                  </label>
                  <input
                    id="nama_pasien"
                    type="text"
                    className="form-input"
                    placeholder="Nama lengkap pasien"
                    {...register("nama_pasien", {
                      required: "Nama pasien wajib diisi",
                    })}
                  />
                  {errors.nama_pasien && (
                    <span className="error-message">
                      {errors.nama_pasien.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="umur_pasien">
                    Umur Pasien *
                  </label>
                  <input
                    id="umur_pasien"
                    type="number"
                    className="form-input"
                    placeholder="Umur dalam tahun"
                    {...register("umur_pasien", {
                      required: "Umur pasien wajib diisi",
                      min: { value: 0, message: "Umur tidak valid" },
                      max: { value: 150, message: "Umur tidak valid" },
                    })}
                  />
                  {errors.umur_pasien && (
                    <span className="error-message">
                      {errors.umur_pasien.message}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section style={styles.formSection}>
              <div style={styles.formSectionHead}>
                <h3 style={styles.formSectionTitle}>Data Pemeriksaan</h3>
                <p className="text-muted" style={styles.formSectionText}>
                  Sesuaikan jenis data, tanggal pemeriksaan, dan catatan bila perlu.
                </p>
              </div>

              <div style={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label" htmlFor="jenis_data">
                    Jenis Data *
                  </label>
                  <select
                    id="jenis_data"
                    className="form-input"
                    {...register("jenis_data", {
                      required: "Jenis data wajib dipilih",
                    })}
                  >
                    <option value="">Pilih Jenis Data</option>
                    <option value={JENIS_DATA.IBU_HAMIL}>Ibu Hamil</option>
                    <option value={JENIS_DATA.IBU_BERSALIN}>Ibu Bersalin</option>
                    <option value={JENIS_DATA.IBU_NIFAS}>Ibu Nifas</option>
                    <option value={JENIS_DATA.BAYI}>Bayi</option>
                    <option value={JENIS_DATA.BALITA}>Balita</option>
                  </select>
                  {errors.jenis_data && (
                    <span className="error-message">
                      {errors.jenis_data.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="tanggal_periksa">
                    Tanggal Periksa *
                  </label>
                  <input
                    id="tanggal_periksa"
                    type="date"
                    className="form-input"
                    {...register("tanggal_periksa", {
                      required: "Tanggal periksa wajib diisi",
                    })}
                  />
                  {errors.tanggal_periksa && (
                    <span className="error-message">
                      {errors.tanggal_periksa.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="catatan">
                  Catatan
                </label>
                <textarea
                  id="catatan"
                  className="form-input"
                  rows="5"
                  placeholder="Catatan pemeriksaan, kondisi pasien, dan perbaikan yang dilakukan"
                  {...register("catatan")}
                />
              </div>
            </section>

            <div style={styles.actionBar}>
              <button
                type="button"
                onClick={() => navigate("/revision/rejected")}
                className="action-icon-btn"
                style={styles.cancelButton}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={styles.submitButton}
              >
                {submitting ? "Mengirim Revisi..." : "Kirim Revisi"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <style>{`
        .action-icon-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          font-size: 0.82rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
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
    maxWidth: "1100px",
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
    marginBottom: "1.5rem",
  },
  heroCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "20px",
    padding: "1.4rem 1.5rem",
    boxShadow: "0 14px 38px rgba(0, 0, 0, 0.18)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
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
  heroTitle: {
    marginBottom: "0.35rem",
  },
  heroSubtitle: {
    margin: 0,
  },
  heroMeta: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "0.75rem",
    minWidth: "280px",
    flex: "1 1 320px",
  },
  heroMetaItem: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "14px",
    padding: "0.9rem 1rem",
    display: "grid",
    gap: "0.28rem",
  },
  heroMetaLabel: {
    fontSize: "0.78rem",
    color: "var(--color-text-muted)",
  },
  formCard: {
    maxWidth: "none",
    borderRadius: "20px",
    boxShadow: "0 14px 38px rgba(0, 0, 0, 0.18)",
  },
  rejectionBox: {
    padding: "1rem 1.05rem",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.28)",
    borderRadius: "14px",
    marginBottom: "1.5rem",
  },
  rejectionTitle: {
    color: "#fca5a5",
    marginBottom: "0.45rem",
    fontSize: "0.82rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  rejectionText: {
    margin: 0,
    color: "#fecaca",
    lineHeight: 1.6,
  },
  formSection: {
    marginBottom: "1.5rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  formSectionHead: {
    marginBottom: "1rem",
  },
  formSectionTitle: {
    marginBottom: "0.3rem",
    fontSize: "1rem",
  },
  formSectionText: {
    margin: 0,
    fontSize: "0.92rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1rem",
  },
  actionBar: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginTop: "1.5rem",
  },
  cancelButton: {
    minWidth: "140px",
  },
  submitButton: {
    minWidth: "180px",
    boxShadow: "none",
  },
  loadingState: {
    textAlign: "center",
    padding: "3rem 1rem",
    color: "var(--color-text-muted)",
  },
};

export default RevisionForm;
