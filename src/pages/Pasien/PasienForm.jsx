import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPasien,
  updatePasien,
  getPasienDetail,
} from "../../services/api";
import "../../App.css";

const PasienForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setFetching(true);
    try {
      const response = await getPasienDetail(id);
      const data = response.data;

      // Populate form
      setValue("nik", data.nik);
      setValue("nama", data.nama);
      setValue("alamat_lengkap", data.alamat_lengkap);
      if (data.tanggal_lahir) {
        setValue(
          "tanggal_lahir",
          new Date(data.tanggal_lahir).toISOString().split("T")[0],
        );
      }
    } catch (err) {
      setServerError("Gagal memuat data pasien");
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);

    try {
      const payload = {
        ...data,
        tanggal_lahir: new Date(data.tanggal_lahir).toISOString(),
      };

      if (isEditMode) {
        await updatePasien(id, payload);
        alert("Data Pasien berhasil diperbarui!");
      } else {
        await createPasien(payload);
        alert("Pasien Baru Berhasil Ditambahkan!");
      }
      navigate("/pasien");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || err.message || "Gagal menyimpan data";

      // Handle NIK duplication error specifically if possible
      if (
        msg.toLowerCase().includes("nik") &&
        msg.toLowerCase().includes("exist")
      ) {
        setError("nik", { type: "server", message: "NIK sudah terdaftar" });
      } else {
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Memuat Data Pasien...
      </div>
    );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>{isEditMode ? "Edit Data Pasien" : "Registrasi Pasien Baru"}</h2>
          <p className="text-muted">
            {isEditMode
              ? "Perbaiki data identitas pasien"
              : "Masukkan data identitas pasien baru"}
          </p>
        </div>
      </div>

      <div
        className="auth-card"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        {serverError && (
          <div className="error-alert" style={{ marginBottom: "1rem" }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">
              NIK (Nomor Induk Kependudukan) *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="16 digit angka"
              maxLength={16}
              {...register("nik", {
                required: "NIK wajib diisi",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Hanya angka diperbolehkan",
                },
                minLength: {
                  value: 16,
                  message: "NIK harus 16 digit",
                },
                maxLength: {
                  value: 16,
                  message: "NIK harus 16 digit",
                },
              })}
            />
            {errors.nik && (
              <span className="error-message">{errors.nik.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Nama Lengkap *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama sesuai KTP"
              {...register("nama", { required: "Nama wajib diisi" })}
            />
            {errors.nama && (
              <span className="error-message">{errors.nama.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal Lahir *</label>
            <input
              type="date"
              className="form-input"
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
              {...register("tanggal_lahir", {
                required: "Tanggal lahir wajib diisi",
              })}
            />
            {errors.tanggal_lahir && (
              <span className="error-message">
                {errors.tanggal_lahir.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Lengkap *</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Jalan, No Rumah, RT/RW, Desa/Kelurahan..."
              {...register("alamat_lengkap", {
                required: "Alamat wajib diisi",
              })}
            ></textarea>
            {errors.alamat_lengkap && (
              <span className="error-message">
                {errors.alamat_lengkap.message}
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "end",
              marginTop: "1.5rem",
              gap: "1rem",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/pasien")}
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
              className="btn-primary"
              disabled={loading}
              style={{ minWidth: "150px" }}
            >
              {loading
                ? "Menyimpan..."
                : isEditMode
                  ? "Update Data"
                  : "Simpan Pasien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasienForm;
