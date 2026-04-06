import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import "../../App.css";
import {
  createPracticePlace,
  getPracticePlaceById,
  getUsers,
  getVillages,
  updatePracticePlace,
} from "../../services/api";
import { POSITIONS } from "../../utils/roleHelpers";

const PracticePlaceForm = () => {
  const { practiceId } = useParams();
  const isEditMode = Boolean(practiceId);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [villages, setVillages] = useState([]);
  const [bidanPraktik, setBidanPraktik] = useState([]);

  const bidanPraktikOptions = useMemo(
    () =>
      bidanPraktik.map((user) => ({
        value: user.user_id,
        label: user.full_name,
        email: user.email,
      })),
    [bidanPraktik],
  );

  useEffect(() => {
    fetchData();
    if (isEditMode) {
      fetchPracticePlace();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceId]);

  const fetchData = async () => {
    try {
      const [villagesRes, usersRes] = await Promise.all([getVillages(), getUsers()]);

      setVillages(
        villagesRes.success && Array.isArray(villagesRes.data)
          ? villagesRes.data
          : [],
      );

      const users =
        usersRes.success && Array.isArray(usersRes.data) ? usersRes.data : [];
      setBidanPraktik(
        users.filter((user) => user.position_user === POSITIONS.BIDAN_PRAKTIK),
      );
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Gagal memuat data referensi");
    }
  };

  const fetchPracticePlace = async () => {
    try {
      setFetching(true);
      const response = await getPracticePlaceById(practiceId);
      const place = response.data;
      const assignedUserIds = Array.isArray(place.users)
        ? place.users.map((practiceUser) => practiceUser.user_id)
        : place.user_id
          ? [place.user_id]
          : [];

      setValue("nama_praktik", place.nama_praktik);
      setValue("village_id", place.village_id);
      setValue("alamat", place.alamat);
      setValue("user_ids", assignedUserIds);
      setError("");
    } catch (err) {
      setError("Gagal memuat data tempat praktik");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...data,
        user_ids: Array.isArray(data.user_ids)
          ? data.user_ids.filter(Boolean)
          : [data.user_ids].filter(Boolean),
      };

      if (isEditMode) {
        await updatePracticePlace(practiceId, payload);
        alert("Tempat praktik berhasil diupdate!");
      } else {
        await createPracticePlace(payload);
        alert("Tempat praktik berhasil ditambahkan!");
      }
      navigate("/practice-places");
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal menyimpan data tempat praktik",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Memuat data tempat praktik...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>
            {isEditMode ? "Edit Tempat Praktik" : "Tambah Tempat Praktik Baru"}
          </h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            {isEditMode
              ? "Perbarui informasi praktik, desa, dan bidan terhubung"
              : "Tambahkan tempat praktik baru dan hubungkan dengan bidan praktik"}
          </p>
        </div>
        <button
          onClick={() => navigate("/practice-places")}
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
            <h3 style={styles.sectionTitle}>Informasi Tempat Praktik</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Data ini dipakai untuk menghubungkan bidan praktik dengan wilayah kerja.
            </p>
          </div>
          <span style={styles.badge}>{isEditMode ? "Mode Edit" : "Mode Tambah"}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.formLayout}>
          <div style={styles.sectionCard}>
            <div style={styles.inputGrid}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="nama_praktik">
                  Nama Tempat Praktik *
                </label>
                <input
                  id="nama_praktik"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Praktik Bidan Siti"
                  {...register("nama_praktik", {
                    required: "Nama tempat praktik wajib diisi",
                  })}
                />
                {errors.nama_praktik ? (
                  <span className="error-message">
                    {errors.nama_praktik.message}
                  </span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="village_id">
                  Desa *
                </label>
                <select
                  id="village_id"
                  className="form-input"
                  {...register("village_id", { required: "Desa wajib dipilih" })}
                >
                  <option value="">Pilih Desa</option>
                  {villages.map((village) => (
                    <option key={village.village_id} value={village.village_id}>
                      {village.nama_desa}
                    </option>
                  ))}
                </select>
                {errors.village_id ? (
                  <span className="error-message">{errors.village_id.message}</span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
                <label className="form-label" htmlFor="user_ids">
                  Bidan Praktik *
                </label>
                <Controller
                  name="user_ids"
                  control={control}
                  rules={{
                    validate: (value) =>
                      Array.isArray(value) && value.length > 0
                        ? true
                        : "Bidan praktik wajib dipilih",
                  }}
                  render={({ field }) => (
                    <CustomSelect
                      inputId="user_ids"
                      isMulti
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      placeholder="Cari dan pilih bidan praktik..."
                      options={bidanPraktikOptions}
                      value={bidanPraktikOptions.filter((option) =>
                        (field.value || []).includes(option.value),
                      )}
                      onChange={(selectedOptions) =>
                        field.onChange(
                          (selectedOptions || []).map((option) => option.value),
                        )
                      }
                      formatOptionLabel={(option) => (
                        <div>
                          <div style={{ fontWeight: 600 }}>{option.label}</div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "rgba(255, 255, 255, 0.7)",
                            }}
                          >
                            {option.email}
                          </div>
                        </div>
                      )}
                      noOptionsMessage={() => "Tidak ada bidan praktik"}
                    />
                  )}
                />
                {errors.user_ids ? (
                  <span className="error-message">{errors.user_ids.message}</span>
                ) : null}
                <small className="text-muted" style={styles.helperText}>
                  Bisa pilih lebih dari satu bidan. Cari nama atau email, lalu hapus
                  tag jika salah pilih.
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
                <label className="form-label" htmlFor="alamat">
                  Alamat *
                </label>
                <textarea
                  id="alamat"
                  className="form-input"
                  rows="4"
                  placeholder="Alamat lengkap tempat praktik"
                  {...register("alamat", { required: "Alamat wajib diisi" })}
                />
                {errors.alamat ? (
                  <span className="error-message">{errors.alamat.message}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              onClick={() => navigate("/practice-places")}
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
                  ? "Update Tempat Praktik"
                  : "Tambah Tempat Praktik"}
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
    background: "rgba(59,130,246,0.16)",
    border: "1px solid rgba(96,165,250,0.35)",
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
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  helperText: { fontSize: "0.78rem", marginTop: "0.5rem", display: "block" },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  primaryButton: { width: "auto", minWidth: "170px", paddingInline: "1rem" },
  secondaryButton: {
    width: "auto",
    minWidth: "150px",
    paddingInline: "1rem",
    backgroundColor: "transparent",
    border: "1px solid var(--glass-border)",
  },
};

export default PracticePlaceForm;
