import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPasien,
  updatePasien,
  getPasienDetail,
} from "../../services/api";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import "../../styles/design-system.css";
import "./PasienForm.css";

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

  if (fetching) {
    return (
      <div className="pasien-form-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pasien-form-page">
      <PageHeader
        title={isEditMode ? "Edit Data Pasien" : "Registrasi Pasien Baru"}
        subtitle={
          isEditMode
            ? "Perbaiki data identitas pasien"
            : "Masukkan data identitas pasien baru"
        }
        actions={
          <Button variant="secondary" onClick={() => navigate("/pasien")}>
            Kembali
          </Button>
        }
      />

      <Card variant="surface-dark" padding="xl">
        {serverError && <div className="error-alert">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="pasien-form-grid">
          <Input
            label="NIK (Nomor Induk Kependudukan)"
            required
            type="text"
            placeholder="16 digit angka"
            maxLength={16}
            error={errors.nik?.message}
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

          <Input
            label="Nama Lengkap"
            required
            type="text"
            placeholder="Nama sesuai KTP"
            error={errors.nama?.message}
            {...register("nama", { required: "Nama wajib diisi" })}
          />

          <Input
            label="Tanggal Lahir"
            required
            type="date"
            max={new Date().toISOString().split("T")[0]}
            error={errors.tanggal_lahir?.message}
            {...register("tanggal_lahir", {
              required: "Tanggal lahir wajib diisi",
            })}
          />

          <div className="form-group form-group--full">
            <label className="form-label" htmlFor="alamat_lengkap">
              Alamat Lengkap <span className="required-asterisk">*</span>
            </label>
            <textarea
              id="alamat_lengkap"
              className="form-textarea"
              rows="4"
              placeholder="Jalan, No Rumah, RT/RW, Desa/Kelurahan..."
              {...register("alamat_lengkap", {
                required: "Alamat wajib diisi",
              })}
            />
            {errors.alamat_lengkap && (
              <span className="error-text">{errors.alamat_lengkap.message}</span>
            )}
          </div>

          <div className="info-box">
            <p className="info-title">Catatan</p>
            <p className="info-hint">
              NIK harus 16 digit angka sesuai KTP. Data pasien digunakan untuk
              registrasi layanan kesehatan.
            </p>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/pasien")}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? "Menyimpan..."
                : isEditMode
                  ? "Update Data"
                  : "Simpan Pasien"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PasienForm;
