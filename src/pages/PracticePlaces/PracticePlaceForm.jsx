import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPracticePlace,
  getPracticePlaceById,
  getUsers,
  getVillages,
  updatePracticePlace,
} from "../../services/api";
import { POSITIONS } from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/ui/Select";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import "../../styles/design-system.css";
import "./PracticePlaceForm.css";

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
      <div className="practice-place-form-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="practice-place-form-page master-form-page">
      <PageHeader
        title={isEditMode ? "Edit Tempat Praktik" : "Tambah Tempat Praktik"}
        subtitle={
          isEditMode
            ? "Perbarui informasi praktik, desa, dan bidan terhubung"
            : "Tambahkan tempat praktik baru dan hubungkan dengan bidan praktik"
        }
        actions={
          <Button variant="secondary" onClick={() => navigate("/practice-places")}>
            Kembali
          </Button>
        }
      />

      <Card
        variant="surface-card"
        padding="xl"
        className="master-form-card practice-place-form-card"
      >
        {error && (
          <div className="error-alert" style={{ marginBottom: "var(--spacing-md)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="practice-form-grid">
          <Input
            label="Nama Tempat Praktik"
            required
            placeholder="Contoh: Praktik Bidan Siti"
            error={errors.nama_praktik?.message}
            {...register("nama_praktik", {
              required: "Nama tempat praktik wajib diisi",
            })}
          />

          <div className="form-group">
            <label className="form-label" htmlFor="village_id">
              Desa <span className="required-asterisk">*</span>
            </label>
            <select
              id="village_id"
              className="form-select"
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
              <span className="error-text">{errors.village_id.message}</span>
            )}
            {villages.length === 0 && (
              <small className="helper-text warning-text">
                ⚠️ Belum ada desa. Buat desa terlebih dahulu.
              </small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user_ids">
              Bidan Praktik <span className="required-asterisk">*</span>
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
                <Select
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
                          color: "var(--color-text-muted)",
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
              <span className="error-text">{errors.user_ids.message}</span>
            )}
            <small className="helper-text">
              Bisa pilih lebih dari satu bidan. Cari nama atau email, lalu hapus tag jika salah pilih.
            </small>
          </div>

          <div className="form-group form-group--full">
            <label className="form-label" htmlFor="alamat">
              Alamat <span className="required-asterisk">*</span>
            </label>
            <textarea
              id="alamat"
              className="form-textarea"
              rows="4"
              placeholder="Alamat lengkap tempat praktik"
              {...register("alamat", { required: "Alamat wajib diisi" })}
            />
            {errors.alamat && (
              <span className="error-text">{errors.alamat.message}</span>
            )}
          </div>

          <div className="info-box">
            <p className="info-title">Catatan</p>
            <p className="info-hint">
              Data tempat praktik digunakan untuk menghubungkan bidan praktik dengan wilayah kerja mereka.
            </p>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/practice-places")}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? "Menyimpan..."
                : isEditMode
                  ? "Update Tempat Praktik"
                  : "Tambah Tempat Praktik"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PracticePlaceForm;
