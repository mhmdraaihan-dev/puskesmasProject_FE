import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { createVillage, getVillageById, updateVillage } from "../../services/api";
import "../../App.css";

const VillageForm = () => {
  const { villageId } = useParams();
  const isEditMode = Boolean(villageId);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetchVillage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villageId]);

  const fetchVillage = async () => {
    try {
      setFetching(true);
      const response = await getVillageById(villageId);
      setValue("nama_desa", response.data.nama_desa);
      setError("");
    } catch (err) {
      setError("Gagal memuat data desa");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      if (isEditMode) {
        await updateVillage(villageId, data);
        alert("Desa berhasil diupdate!");
      } else {
        await createVillage(data);
        alert("Desa berhasil ditambahkan!");
      }
      navigate("/villages");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data desa");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Memuat data desa...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>
            {isEditMode ? "Edit Desa" : "Tambah Desa Baru"}
          </h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            {isEditMode
              ? "Perbarui informasi wilayah desa"
              : "Tambahkan desa baru ke dalam sistem master wilayah"}
          </p>
        </div>
        <button
          onClick={() => navigate("/villages")}
          type="button"
          className="btn-primary"
          style={styles.secondaryButton}
        >
          Kembali ke List
        </button>
      </div>

      {error ? (
        <div className="error-alert" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      ) : null}

      <div className="auth-card" style={styles.formCard}>
        <div style={styles.formIntro}>
          <div>
            <h3 style={styles.sectionTitle}>Informasi Desa</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Data ini akan dipakai sebagai acuan bidan dan tempat praktik di sistem.
            </p>
          </div>
          <span style={styles.badge}>{isEditMode ? "Mode Edit" : "Mode Tambah"}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.formLayout}>
          <div style={styles.sectionCard}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="nama_desa">
                Nama Desa *
              </label>
              <input
                id="nama_desa"
                type="text"
                className="form-input"
                placeholder="Contoh: Desa Sukamaju"
                {...register("nama_desa", { required: "Nama desa wajib diisi" })}
              />
              {errors.nama_desa ? (
                <span className="error-message">{errors.nama_desa.message}</span>
              ) : null}
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              onClick={() => navigate("/villages")}
              type="button"
              className="btn-primary"
              style={styles.secondaryButton}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={styles.primaryButton}
            >
              {loading
                ? "Menyimpan..."
                : isEditMode
                  ? "Update Desa"
                  : "Tambah Desa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  header: { gap: "1rem", flexWrap: "wrap" },
  pageTitle: { marginBottom: "0.35rem" },
  pageSubtitle: { margin: 0 },
  formCard: { maxWidth: "none", margin: 0, padding: "1.75rem" },
  formIntro: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  sectionTitle: { marginBottom: "0.35rem", fontSize: "1.1rem" },
  sectionSubtitle: { margin: 0 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.4rem 0.8rem",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.16)",
    border: "1px solid rgba(96, 165, 250, 0.35)",
    color: "#93c5fd",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  formLayout: { display: "grid", gap: "1rem" },
  sectionCard: {
    padding: "1.25rem",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  primaryButton: { width: "auto", minWidth: "150px", paddingInline: "1rem" },
  secondaryButton: {
    width: "auto",
    minWidth: "150px",
    paddingInline: "1rem",
    backgroundColor: "transparent",
    border: "1px solid var(--glass-border)",
  },
};

export default VillageForm;
