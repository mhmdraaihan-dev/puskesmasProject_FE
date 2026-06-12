import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Select from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import "../../styles/design-system.css";
import "./PemeriksaanKehamilanForm.css";
import {
  createKehamilan,
  getKehamilanDetail,
  getPasienList,
  getPracticePlaces,
  updateKehamilan,
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

const PemeriksaanKehamilanForm = () => {
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

  useEffect(() => {
    if (!isBidanPraktik(user)) {
      navigate("/pemeriksaan-kehamilan");
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
      const response = await getKehamilanDetail(id);
      const data = response.data;

      const fields = [
        "practice_id",
        "pasien_id",
        "tanggal",
        "gpa",
        "umur_kehamilan",
        "status_tt",
        "jenis_kunjungan",
        "td",
        "lila",
        "bb",
        "resti",
        "catatan",
      ];

      fields.forEach((field) => setValue(field, data[field]));

      if (data.ceklab_report) {
        setValue("ceklab_report.hiv", data.ceklab_report.hiv);
        setValue("ceklab_report.hbsag", data.ceklab_report.hbsag);
        setValue("ceklab_report.sifilis", data.ceklab_report.sifilis);
        setValue("ceklab_report.hb", data.ceklab_report.hb);
        setValue(
          "ceklab_report.golongan_darah",
          data.ceklab_report.golongan_darah,
        );
      }

      if (data.tanggal) {
        setValue("tanggal", new Date(data.tanggal).toISOString().split("T")[0]);
      }
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
        tanggal: new Date(data.tanggal).toISOString(),
        umur_kehamilan: parseInt(data.umur_kehamilan, 10),
        lila: data.lila ? parseFloat(data.lila) : null,
        bb: data.bb ? parseFloat(data.bb) : null,
        ceklab_report: {
          ...data.ceklab_report,
          hb: data.ceklab_report?.hb ? parseFloat(data.ceklab_report.hb) : null,
          hiv:
            data.ceklab_report?.hiv === "true" ||
            data.ceklab_report?.hiv === true,
          hbsag:
            data.ceklab_report?.hbsag === "true" ||
            data.ceklab_report?.hbsag === true,
          sifilis:
            data.ceklab_report?.sifilis === "true" ||
            data.ceklab_report?.sifilis === true,
        },
      };

      delete payload.practice_id;

      if (isEditMode) {
        await updateKehamilan(id, payload);
        alert("Data berhasil diperbarui!");
      } else {
        await createKehamilan(payload);
        alert("Data berhasil ditambahkan!");
      }

      navigate("/pemeriksaan-kehamilan");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="pemeriksaan-kehamilan-form-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pemeriksaan-kehamilan-form-page">
      <PageHeader
        title={
          isEditMode
            ? "Edit Pemeriksaan Kehamilan"
            : "Input Pemeriksaan Kehamilan"
        }
        subtitle={
          isEditMode
            ? "Perbarui data pemeriksaan yang perlu diperbaiki"
            : "Masukkan data pemeriksaan kehamilan baru dengan lengkap dan akurat"
        }
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate("/pemeriksaan-kehamilan")}
          >
            Kembali
          </Button>
        }
      />

      {error && <div className="error-alert">{error}</div>}

      {practices.length === 0 && (
        <div className="warning-alert">
          Tempat praktik belum terdeteksi. Pastikan akun Anda sudah terhubung ke
          tempat praktik.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="form-layout">
        {/* Patient Info Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="pemeriksaan-kehamilan-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Informasi Pasien</h3>
            <p className="section-subtitle">
              Pilih pasien dan lengkapi identitas kunjungan
            </p>
          </div>

          <div className="form-grid">
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
                      patientOptions.find(
                        (option) => option.value === field.value,
                      ) || null
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

            <Input
              label="Tanggal Periksa"
              required
              type="date"
              max={new Date().toISOString().split("T")[0]}
              error={errors.tanggal?.message}
              {...register("tanggal", { required: "Tanggal wajib diisi" })}
            />

            <div className="form-group">
              <label className="form-label" htmlFor="jenis_kunjungan">
                Jenis Kunjungan <span className="required-asterisk">*</span>
              </label>
              <select
                id="jenis_kunjungan"
                className="form-select"
                {...register("jenis_kunjungan", {
                  required: "Jenis kunjungan wajib dipilih",
                })}
              >
                <option value="">Pilih jenis kunjungan</option>
                <option value="K1">K1</option>
                <option value="K2">K2</option>
                <option value="K3">K3</option>
                <option value="K4">K4</option>
                <option value="K5">K5</option>
                <option value="K6">K6</option>
              </select>
              {errors.jenis_kunjungan && (
                <span className="error-text">
                  {errors.jenis_kunjungan.message}
                </span>
              )}
            </div>

            <Input
              label="GPA"
              required
              type="text"
              placeholder="Contoh: G2P1A0"
              error={errors.gpa?.message}
              {...register("gpa", { required: "GPA wajib diisi" })}
            />

            <Input
              label="Umur Kehamilan (minggu)"
              required
              type="number"
              error={errors.umur_kehamilan?.message}
              {...register("umur_kehamilan", {
                required: "Umur kehamilan wajib diisi",
                min: {
                  value: 0,
                  message: "Umur kehamilan tidak boleh kurang dari 0",
                },
                max: {
                  value: 45,
                  message: "Umur kehamilan tidak boleh lebih dari 45 minggu",
                },
              })}
            />

            <div className="form-group">
              <label className="form-label" htmlFor="status_tt">
                Status TT <span className="required-asterisk">*</span>
              </label>
              <select
                id="status_tt"
                className="form-select"
                {...register("status_tt", {
                  required: "Status TT wajib dipilih",
                })}
              >
                <option value="">Pilih status TT</option>
                <option value="TT1">TT1</option>
                <option value="TT2">TT2</option>
                <option value="TT3">TT3</option>
                <option value="TT4">TT4</option>
                <option value="TT5">TT5</option>
              </select>
              {errors.status_tt && (
                <span className="error-text">{errors.status_tt.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="resti">
                Risiko Tinggi <span className="required-asterisk">*</span>
              </label>
              <select
                id="resti"
                className="form-select"
                {...register("resti", { required: "Risiko wajib dipilih" })}
              >
                <option value="">Pilih tingkat risiko</option>
                <option value="RENDAH">Rendah</option>
                <option value="SEDANG">Sedang</option>
                <option value="TINGGI">Tinggi</option>
              </select>
              {errors.resti && (
                <span className="error-text">{errors.resti.message}</span>
              )}
            </div>
          </div>
        </Card>

        {/* Vitals Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="pemeriksaan-kehamilan-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Pemeriksaan Fisik</h3>
            <p className="section-subtitle">
              Isi temuan pemeriksaan dasar yang dilakukan saat kunjungan
            </p>
          </div>

          <div className="form-grid">
            <Input
              label="Tekanan Darah (mmHg)"
              required
              type="text"
              placeholder="Contoh: 120/80"
              error={errors.td?.message}
              {...register("td", {
                required: "Tekanan darah wajib diisi",
                pattern: {
                  value: /^\d+\/\d+$/,
                  message: "Format harus Sistolik/Diastolik, contoh 120/80",
                },
              })}
            />

            <Input
              label="LILA (cm)"
              type="number"
              step="0.1"
              placeholder="Contoh: 25.5"
              {...register("lila")}
            />

            <Input
              label="Berat Badan (kg)"
              type="number"
              step="0.1"
              placeholder="Contoh: 55.2"
              {...register("bb")}
            />

            <div className="form-group form-group--full">
              <label className="form-label" htmlFor="catatan">
                Catatan
              </label>
              <textarea
                id="catatan"
                className="form-textarea"
                rows="4"
                placeholder="Tuliskan catatan penting pemeriksaan bila ada..."
                {...register("catatan")}
              />
            </div>
          </div>
        </Card>

        {/* Lab Results Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="pemeriksaan-kehamilan-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Cek Laboratorium</h3>
            <p className="section-subtitle">
              Bagian ini opsional dan dapat diisi bila hasil lab tersedia
            </p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="golongan_darah">
                Golongan Darah
              </label>
              <select
                id="golongan_darah"
                className="form-select"
                {...register("ceklab_report.golongan_darah")}
              >
                <option value="">Pilih golongan darah</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            <Input
              label="Hemoglobin (Hb)"
              type="number"
              step="0.1"
              placeholder="Contoh: 11.5"
              {...register("ceklab_report.hb")}
            />

            <div className="form-group">
              <label className="form-label" htmlFor="hiv">
                HIV
              </label>
              <select
                id="hiv"
                className="form-select"
                {...register("ceklab_report.hiv")}
              >
                <option value="">Belum diisi</option>
                <option value="false">Negatif</option>
                <option value="true">Positif</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hbsag">
                HBsAg
              </label>
              <select
                id="hbsag"
                className="form-select"
                {...register("ceklab_report.hbsag")}
              >
                <option value="">Belum diisi</option>
                <option value="false">Negatif</option>
                <option value="true">Positif</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sifilis">
                Sifilis
              </label>
              <select
                id="sifilis"
                className="form-select"
                {...register("ceklab_report.sifilis")}
              >
                <option value="">Belum diisi</option>
                <option value="false">Negatif</option>
                <option value="true">Positif</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/pemeriksaan-kehamilan")}
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

export default PemeriksaanKehamilanForm;
