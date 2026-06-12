import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Select from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import "../../styles/design-system.css";
import "./ImunisasiForm.css";
import {
  createImunisasi,
  getImunisasiDetail,
  getPasienList,
  getPracticePlaces,
  updateImunisasi,
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

const immunizationOptions = [
  { value: "HB_0", label: "HB 0" },
  { value: "BCG", label: "BCG" },
  { value: "POLIO_1", label: "Polio 1" },
  { value: "POLIO_2", label: "Polio 2" },
  { value: "POLIO_3", label: "Polio 3" },
  { value: "POLIO_4", label: "Polio 4" },
  { value: "DPT_HB_HIB_1", label: "DPT-HB-Hib 1" },
  { value: "DPT_HB_HIB_2", label: "DPT-HB-Hib 2" },
  { value: "DPT_HB_HIB_3", label: "DPT-HB-Hib 3" },
  { value: "CAMPAK", label: "Campak" },
  { value: "IPV", label: "IPV" },
  { value: "DPT_HB_HIB_LANJUTAN", label: "DPT-HB-Hib Lanjutan" },
  { value: "CAMPAK_LANJUTAN", label: "Campak Lanjutan" },
];

const ImunisasiForm = () => {
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
  } = useForm();

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
      navigate("/imunisasi");
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
      const response = await getImunisasiDetail(id);
      const data = response.data;

      setValue("practice_id", data.practice_id);
      setValue("pasien_id", data.pasien_id);
      if (data.tgl_imunisasi) {
        setValue(
          "tgl_imunisasi",
          new Date(data.tgl_imunisasi).toISOString().split("T")[0],
        );
      }
      setValue("berat_badan", data.berat_badan);
      setValue("suhu_badan", data.suhu_badan);
      setValue("nama_orangtua", data.nama_orangtua);
      setValue("jenis_imunisasi", data.jenis_imunisasi);
      setValue("catatan", data.catatan);
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
        tgl_imunisasi: new Date(data.tgl_imunisasi).toISOString(),
        berat_badan: parseFloat(data.berat_badan),
        suhu_badan: data.suhu_badan ? parseFloat(data.suhu_badan) : null,
      };

      if (isEditMode) {
        await updateImunisasi(id, payload);
        alert("Data imunisasi berhasil diperbarui!");
      } else {
        await createImunisasi(payload);
        alert("Data imunisasi berhasil ditambahkan!");
      }
      navigate("/imunisasi");
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
      <div className="imunisasi-form-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="imunisasi-form-page">
      <PageHeader
        title={isEditMode ? "Edit Data Imunisasi" : "Input Data Imunisasi"}
        subtitle={
          isEditMode
            ? "Perbarui data imunisasi yang perlu diperbaiki"
            : "Masukkan data imunisasi anak dengan struktur yang rapi"
        }
        actions={
          <Button variant="secondary" onClick={() => navigate("/imunisasi")}>
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
          className="imunisasi-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Informasi Pasien</h3>
            <p className="section-subtitle">
              Pilih tempat praktik dan pasien yang akan menerima imunisasi
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
                Pasien (Anak/Bayi) <span className="required-asterisk">*</span>
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

        {/* Vaccine Details Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="imunisasi-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Detail Imunisasi</h3>
            <p className="section-subtitle">
              Informasi jadwal dan jenis imunisasi yang diberikan
            </p>
          </div>

          <div className="form-grid">
            <Input
              label="Tanggal Imunisasi"
              required
              type="date"
              max={new Date().toISOString().split("T")[0]}
              error={errors.tgl_imunisasi?.message}
              {...register("tgl_imunisasi", {
                required: "Tanggal imunisasi wajib diisi",
              })}
            />

            <div className="form-group">
              <label className="form-label" htmlFor="jenis_imunisasi">
                Jenis Imunisasi <span className="required-asterisk">*</span>
              </label>
              <select
                id="jenis_imunisasi"
                className="form-select"
                {...register("jenis_imunisasi", {
                  required: "Jenis imunisasi wajib dipilih",
                })}
              >
                <option value="">Pilih jenis imunisasi</option>
                {immunizationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.jenis_imunisasi && (
                <span className="error-text">
                  {errors.jenis_imunisasi.message}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Schedule / Child Condition Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="imunisasi-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Kondisi Anak dan Orang Tua</h3>
            <p className="section-subtitle">
              Lengkapi data fisik anak dan identitas pendamping
            </p>
          </div>

          <div className="form-grid">
            <Input
              label="Berat Badan (kg)"
              required
              type="number"
              step="0.1"
              min="0"
              error={errors.berat_badan?.message}
              {...register("berat_badan", {
                required: "Berat badan wajib diisi",
                min: { value: 0, message: "Minimal 0" },
              })}
            />

            <Input
              label="Suhu Badan (°C)"
              type="number"
              step="0.1"
              {...register("suhu_badan")}
            />

            <Input
              label="Nama Orang Tua"
              required
              type="text"
              error={errors.nama_orangtua?.message}
              {...register("nama_orangtua", {
                required: "Nama orang tua wajib diisi",
              })}
            />
          </div>
        </Card>

        {/* Notes Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="imunisasi-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Catatan Tambahan</h3>
            <p className="section-subtitle">
              Isi catatan penting bila ada reaksi, keluhan, atau kebutuhan observasi
              lanjutan
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="catatan">
              Catatan
            </label>
            <textarea
              id="catatan"
              className="form-textarea"
              rows="4"
              placeholder="Tuliskan catatan tambahan bila ada..."
              {...register("catatan")}
            />
          </div>
        </Card>

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/imunisasi")}
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

export default ImunisasiForm;
