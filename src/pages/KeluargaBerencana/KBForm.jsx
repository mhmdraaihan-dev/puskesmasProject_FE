import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Select from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import "../../styles/design-system.css";
import "./KBForm.css";
import {
  createKB,
  getKBDetail,
  getPasienList,
  getPracticePlaces,
  updateKB,
} from "../../services/api";
import {
  isAssignedToPractice,
  isBidanPraktik,
} from "../../utils/roleHelpers";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const methodOptions = [
  { value: "PIL", label: "PIL" },
  { value: "SUNTIK", label: "Suntik" },
  { value: "SUNTIK 1 BULAN", label: "Suntik 1 Bulan" },
  { value: "SUNTIK 3 BULAN", label: "Suntik 3 Bulan" },
  { value: "IMPLANT", label: "Implant" },
  { value: "IUD", label: "IUD" },
  { value: "KONDOM", label: "Kondom" },
  { value: "MOW", label: "MOW" },
  { value: "MOP", label: "MOP" },
  { value: "MAL", label: "MAL" },
];

const normalizeMethodValue = (value) => {
  const normalized = String(value || "").trim().toUpperCase();

  if (normalized === "SUNTIK_1_BULAN") {
    return "SUNTIK 1 BULAN";
  }

  if (normalized === "SUNTIK_3_BULAN") {
    return "SUNTIK 3 BULAN";
  }

  return normalized;
};

const KBForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm({
    defaultValues: {
      jumlah_anak_laki: 0,
      jumlah_anak_perempuan: 0,
      at: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [practices, setPractices] = useState([]);

  const selectedPatientId = watch("pasien_id");
  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.pasien_id === selectedPatientId),
    [patients, selectedPatientId],
  );

  const patientOptions = useMemo(
    () =>
      patients.map((patient) => ({
        value: patient.pasien_id,
        label: `${patient.nama} (${patient.nik})`,
      })),
    [patients],
  );

  const practiceOptions = useMemo(
    () =>
      practices.map((practice) => ({
        value: practice.practice_id,
        label: practice.nama_praktik,
      })),
    [practices],
  );

  useEffect(() => {
    if (!isBidanPraktik(user)) {
      navigate("/keluarga-berencana");
      return;
    }

    loadDropdowns();
    if (isEditMode) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const loadDropdowns = async () => {
    try {
      const pasienRes = await getPasienList({ limit: 1000 });
      setPatients(pasienRes.data || []);

      const practicesRes = await getPracticePlaces();
      const myPractices = (practicesRes.data || []).filter((practice) =>
        isAssignedToPractice(practice, user),
      );
      setPractices(myPractices);

      if (myPractices.length === 1) {
        setValue("practice_id", myPractices[0].practice_id);
      }
    } catch (err) {
      console.error("Error loading dropdowns:", err);
      setError("Gagal memuat data referensi");
    }
  };

  const fetchData = async () => {
    setFetching(true);
    try {
      const response = await getKBDetail(id);
      const data = response.data;

      setValue("practice_id", data.practice_id);
      setValue("pasien_id", data.pasien_id);
      if (data.tanggal_kunjungan) {
        setValue(
          "tanggal_kunjungan",
          new Date(data.tanggal_kunjungan).toISOString().split("T")[0],
        );
      }
      setValue("jumlah_anak_laki", data.jumlah_anak_laki);
      setValue("jumlah_anak_perempuan", data.jumlah_anak_perempuan);
      setValue("at", data.at);
      setValue("alat_kontrasepsi", normalizeMethodValue(data.alat_kontrasepsi));
      setValue("keterangan", data.keterangan);
    } catch (err) {
      setError("Gagal memuat data untuk diedit");
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
        tanggal_kunjungan: new Date(data.tanggal_kunjungan).toISOString(),
        jumlah_anak_laki: parseInt(data.jumlah_anak_laki, 10),
        jumlah_anak_perempuan: parseInt(data.jumlah_anak_perempuan, 10),
      };

      if (isEditMode) {
        await updateKB(id, payload);
        alert("Data KB berhasil diperbarui!");
      } else {
        await createKB(payload);
        alert("Data KB berhasil ditambahkan!");
      }
      navigate("/keluarga-berencana");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Gagal menyimpan data",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="kb-form-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="kb-form-page">
      <PageHeader
        title={isEditMode ? "Edit Data KB" : "Input Data KB"}
        subtitle={
          isEditMode
            ? "Perbarui data pelayanan KB yang perlu diperbaiki"
            : "Masukkan data pelayanan KB baru dengan struktur yang rapi"
        }
        actions={
          <Button variant="secondary" onClick={() => navigate("/keluarga-berencana")}>
            Kembali
          </Button>
        }
      />

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="form-layout">
        {/* Patient Info Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="kb-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Informasi Pasien</h3>
            <p className="section-subtitle">
              Pilih tempat praktik dan pasien yang akan menerima pelayanan KB
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="practice_id">
                Tempat Praktik <span className="required-asterisk">*</span>
              </label>
              <Controller
                name="practice_id"
                control={control}
                rules={{ required: "Tempat praktik wajib dipilih" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={practiceOptions}
                    onChange={(option) => field.onChange(option?.value)}
                    value={
                      practiceOptions.find((option) => option.value === field.value) ||
                      null
                    }
                    placeholder="Pilih tempat praktik"
                  />
                )}
              />
              {errors.practice_id && (
                <span className="error-text">{errors.practice_id.message}</span>
              )}
            </div>

            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="pasien_id">
                Pasien <span className="required-asterisk">*</span>
              </label>
              <Controller
                name="pasien_id"
                control={control}
                rules={{ required: "Pasien wajib dipilih" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={patientOptions}
                    onChange={(option) => field.onChange(option?.value)}
                    value={
                      patientOptions.find((option) => option.value === field.value) ||
                      null
                    }
                    placeholder="Cari pasien berdasarkan nama atau NIK..."
                  />
                )}
              />
              {errors.pasien_id && (
                <span className="error-text">{errors.pasien_id.message}</span>
              )}
              {selectedPatient && (
                <div className="inline-patient-info">
                  <span>NIK: {selectedPatient.nik}</span>
                  <span>Alamat: {selectedPatient.alamat_lengkap || "-"}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Service Details Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="kb-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Detail Pelayanan KB</h3>
            <p className="section-subtitle">
              Informasi kunjungan dan metode kontrasepsi yang dipilih
            </p>
          </div>

          <div className="form-grid">
            <Input
              label="Tanggal Kunjungan"
              required
              type="date"
              max={new Date().toISOString().split("T")[0]}
              error={errors.tanggal_kunjungan?.message}
              {...register("tanggal_kunjungan", {
                required: "Tanggal kunjungan wajib diisi",
              })}
            />

            <div className="form-group">
              <label className="form-label" htmlFor="alat_kontrasepsi">
                Metode Kontrasepsi <span className="required-asterisk">*</span>
              </label>
              <select
                id="alat_kontrasepsi"
                className="form-select"
                {...register("alat_kontrasepsi", {
                  required: "Metode kontrasepsi wajib dipilih",
                })}
              >
                <option value="">Pilih metode kontrasepsi</option>
                {methodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.alat_kontrasepsi && (
                <span className="error-text">
                  {errors.alat_kontrasepsi.message}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Method Details Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="kb-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Demografi Anak dan Risiko</h3>
            <p className="section-subtitle">
              Lengkapi jumlah anak hidup dan indikasi abortus terancam
            </p>
          </div>

          <div className="form-grid">
            <Input
              label="Jumlah Anak Laki-laki"
              required
              type="number"
              min="0"
              error={errors.jumlah_anak_laki?.message}
              {...register("jumlah_anak_laki", {
                required: "Jumlah anak laki-laki wajib diisi",
                min: { value: 0, message: "Minimal 0" },
              })}
            />

            <Input
              label="Jumlah Anak Perempuan"
              required
              type="number"
              min="0"
              error={errors.jumlah_anak_perempuan?.message}
              {...register("jumlah_anak_perempuan", {
                required: "Jumlah anak perempuan wajib diisi",
                min: { value: 0, message: "Minimal 0" },
              })}
            />
          </div>

          <div className="checkbox-row">
            <label className="checkbox-card">
              <input type="checkbox" {...register("at")} />
              <span>Abortus Terancam (AT)</span>
            </label>
          </div>
        </Card>

        {/* Follow-up / Notes Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="kb-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Keterangan Tambahan</h3>
            <p className="section-subtitle">
              Isi keluhan, catatan, atau keterangan lain yang relevan
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="keterangan">
              Keterangan / Keluhan
            </label>
            <textarea
              id="keterangan"
              className="form-textarea"
              rows="4"
              placeholder="Tuliskan keterangan atau keluhan pasien bila ada..."
              {...register("keterangan")}
            />
          </div>
        </Card>

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/keluarga-berencana")}
          >
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading
              ? "Menyimpan..."
              : isEditMode
                ? "Update Data"
                : "Simpan Data"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default KBForm;
