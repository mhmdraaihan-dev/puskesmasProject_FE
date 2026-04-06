import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPracticePlace,
  updatePracticePlace,
  getPracticePlaceById,
  getVillages,
  getUsers,
} from "../../services/api";
import { POSITIONS } from "../../utils/roleHelpers";
import CustomSelect from "../../components/CustomSelect";
import "../../App.css";

const PracticePlaceForm = () => {
  const { practiceId } = useParams();
  const isEditMode = !!practiceId;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [villages, setVillages] = useState([]);
  const [bidanPraktik, setBidanPraktik] = useState([]);
  const bidanPraktikOptions = bidanPraktik.map((user) => ({
    value: user.user_id,
    label: user.full_name,
    email: user.email,
  }));

  useEffect(() => {
    fetchData();
    if (isEditMode) {
      fetchPracticePlace();
    }
  }, [practiceId]);

  const fetchData = async () => {
    try {
      const [villagesRes, usersRes] = await Promise.all([
        getVillages(),
        getUsers(),
      ]);

      // Backend response structure: { success: true, data: [...] }
      setVillages(
        villagesRes.success && Array.isArray(villagesRes.data)
          ? villagesRes.data
          : [],
      );

      // Filter only bidan praktik
      const users =
        usersRes.success && Array.isArray(usersRes.data) ? usersRes.data : [];
      const praktikUsers = users.filter(
        (u) => u.position_user === POSITIONS.BIDAN_PRAKTIK,
      );
      setBidanPraktik(praktikUsers);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const fetchPracticePlace = async () => {
    try {
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
    } catch (err) {
      setError("Gagal memuat data tempat praktik");
      console.error(err);
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>
            {isEditMode ? "Edit Tempat Praktik" : "Tambah Tempat Praktik Baru"}
          </h2>
          <p className="text-muted">
            {isEditMode
              ? "Update informasi tempat praktik"
              : "Tambahkan tempat praktik baru"}
          </p>
        </div>
      </div>

      <div
        className="auth-card"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
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
            {errors.nama_praktik && (
              <span className="error-message">
                {errors.nama_praktik.message}
              </span>
            )}
          </div>

          <div className="form-group">
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
            {errors.village_id && (
              <span className="error-message">{errors.village_id.message}</span>
            )}
          </div>

          <div className="form-group">
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
            {errors.user_ids && (
              <span className="error-message">{errors.user_ids.message}</span>
            )}
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              Bisa pilih lebih dari satu bidan, cari nama/email, lalu hapus tag
              jika salah pilih.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="alamat">
              Alamat *
            </label>
            <textarea
              id="alamat"
              className="form-input"
              rows="3"
              placeholder="Alamat lengkap tempat praktik"
              {...register("alamat", { required: "Alamat wajib diisi" })}
            />
            {errors.alamat && (
              <span className="error-message">{errors.alamat.message}</span>
            )}
          </div>

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "end",
              gap: "1rem",
            }}
          >
            <button
              onClick={() => navigate("/practice-places")}
              type="button"
              className="btn-primary"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--glass-border)",
                minWidth: "150px",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ minWidth: "150px" }}
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

export default PracticePlaceForm;
