import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Select from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import "../../styles/design-system.css";
import "./PersalinanForm.css";
import {
  createPersalinan,
  getPasienList,
  getPersalinanDetail,
  getPracticePlaces,
  updatePersalinan,
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

const PersalinanForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm({
    defaultValues: {
      keadaan_ibu: {
        hidup: true,
        baik: true,
        hap: false,
        partus_lama: false,
        pre_eklamsi: false,
      },
      keadaan_bayi: {
        hidup: true,
        asfiksia: false,
        rds: false,
        cacat_bawaan: false,
        keterangan_cacat: "",
      },
      vit_k: false,
      hb_0: false,
      vit_a_bufas: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [practices, setPractices] = useState([]);

  const selectedPatientId = watch("pasien_id");
  const cacatBawaan = watch("keadaan_bayi.cacat_bawaan");

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
      navigate("/persalinan");
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
      const response = await getPersalinanDetail(id);
      const data = response.data;

      setValue("practice_id", data.practice_id);
      setValue("pasien_id", data.pasien_id);
      if (data.tanggal_partus) {
        setValue(
          "tanggal_partus",
          new Date(data.tanggal_partus).toISOString().split("T")[0],
        );
      }
      setValue("gravida", data.gravida);
      setValue("para", data.para);
      setValue("abortus", data.abortus);
      setValue("vit_k", data.vit_k);
      setValue("hb_0", data.hb_0);
      setValue("vit_a_bufas", data.vit_a_bufas);
      setValue("catatan", data.catatan);

      if (data.keadaan_ibu_persalinan) {
        setValue("keadaan_ibu", {
          hidup: data.keadaan_ibu_persalinan.hidup,
          baik: data.keadaan_ibu_persalinan.baik,
          hap: data.keadaan_ibu_persalinan.hap,
          partus_lama: data.keadaan_ibu_persalinan.partus_lama,
          pre_eklamsi: data.keadaan_ibu_persalinan.pre_eklamsi,
        });
      }

      if (data.keadaan_bayi_persalinan) {
        setValue("keadaan_bayi", {
          pb: data.keadaan_bayi_persalinan.pb,
          bb: data.keadaan_bayi_persalinan.bb,
          jenis_kelamin: data.keadaan_bayi_persalinan.jenis_kelamin,
          hidup: data.keadaan_bayi_persalinan.hidup,
          asfiksia: data.keadaan_bayi_persalinan.asfiksia,
          rds: data.keadaan_bayi_persalinan.rds,
          cacat_bawaan: data.keadaan_bayi_persalinan.cacat_bawaan,
          keterangan_cacat: data.keadaan_bayi_persalinan.keterangan_cacat,
        });
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
        tanggal_partus: new Date(data.tanggal_partus).toISOString(),
        gravida: parseInt(data.gravida, 10),
        para: parseInt(data.para, 10),
        abortus: parseInt(data.abortus, 10),
        keadaan_bayi: {
          ...data.keadaan_bayi,
          pb: parseFloat(data.keadaan_bayi.pb),
          bb: parseFloat(data.keadaan_bayi.bb),
        },
      };

      if (isEditMode) {
        await updatePersalinan(id, payload);
        alert("Data berhasil diperbarui!");
      } else {
        await createPersalinan(payload);
        alert("Data berhasil ditambahkan!");
      }
      navigate("/persalinan");
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
      <div className="persalinan-form-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="persalinan-form-page">
      <PageHeader
        title={isEditMode ? "Edit Data Persalinan" : "Input Data Persalinan"}
        subtitle={
          isEditMode
            ? "Perbarui data persalinan yang perlu diperbaiki"
            : "Masukkan data persalinan baru dengan lengkap dan akurat"
        }
        actions={
          <Button variant="secondary" onClick={() => navigate("/persalinan")}>
            Kembali
          </Button>
        }
      />

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="form-layout">
        {/* Data Umum Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="persalinan-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Data Umum</h3>
            <p className="section-subtitle">
              Informasi utama persalinan dan pasien
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
                      practiceOptions.find(
                        (option) => option.value === field.value,
                      ) || null
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
              label="Tanggal Partus"
              required
              type="date"
              max={new Date().toISOString().split("T")[0]}
              error={errors.tanggal_partus?.message}
              {...register("tanggal_partus", {
                required: "Tanggal partus wajib diisi",
              })}
            />

            <Input
              label="Gravida"
              required
              type="number"
              error={errors.gravida?.message}
              {...register("gravida", {
                required: "Gravida wajib diisi",
                min: { value: 1, message: "Minimal 1" },
              })}
            />

            <Input
              label="Para"
              required
              type="number"
              error={errors.para?.message}
              {...register("para", {
                required: "Para wajib diisi",
                min: { value: 0, message: "Minimal 0" },
              })}
            />

            <Input
              label="Abortus"
              required
              type="number"
              error={errors.abortus?.message}
              {...register("abortus", {
                required: "Abortus wajib diisi",
                min: { value: 0, message: "Minimal 0" },
              })}
            />
          </div>

          <div className="checkbox-row">
            <label className="checkbox-item">
              <input type="checkbox" {...register("vit_k")} />
              <span>Vitamin K</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" {...register("hb_0")} />
              <span>Hepatitis B0</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" {...register("vit_a_bufas")} />
              <span>Vitamin A Ibu Nifas</span>
            </label>
          </div>
        </Card>

        {/* Kondisi Ibu Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="persalinan-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Kondisi Ibu</h3>
            <p className="section-subtitle">
              Tandai kondisi ibu saat persalinan berlangsung
            </p>
          </div>

          <div className="checkbox-grid">
            <label className="checkbox-card">
              <input type="checkbox" {...register("keadaan_ibu.hidup")} />
              <span>Ibu hidup</span>
            </label>
            <label className="checkbox-card">
              <input type="checkbox" {...register("keadaan_ibu.baik")} />
              <span>Kondisi sehat / baik</span>
            </label>
            <label className="checkbox-card">
              <input type="checkbox" {...register("keadaan_ibu.hap")} />
              <span>Pendarahan (HAP)</span>
            </label>
            <label className="checkbox-card">
              <input type="checkbox" {...register("keadaan_ibu.partus_lama")} />
              <span>Partus lama</span>
            </label>
            <label className="checkbox-card">
              <input type="checkbox" {...register("keadaan_ibu.pre_eklamsi")} />
              <span>Pre-eklamsi</span>
            </label>
          </div>
        </Card>

        {/* Kondisi Bayi Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="persalinan-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Kondisi Bayi</h3>
            <p className="section-subtitle">
              Lengkapi data bayi dan kondisi saat lahir
            </p>
          </div>

          <div className="form-grid">
            <Input
              label="Berat Badan (gram)"
              required
              type="number"
              error={errors.keadaan_bayi?.bb?.message}
              {...register("keadaan_bayi.bb", {
                required: "Berat badan wajib diisi",
              })}
            />

            <Input
              label="Panjang Badan (cm)"
              required
              type="number"
              step="0.1"
              error={errors.keadaan_bayi?.pb?.message}
              {...register("keadaan_bayi.pb", {
                required: "Panjang badan wajib diisi",
              })}
            />

            <div className="form-group">
              <label className="form-label" htmlFor="jenis_kelamin">
                Jenis Kelamin <span className="required-asterisk">*</span>
              </label>
              <select
                id="jenis_kelamin"
                className="form-select"
                {...register("keadaan_bayi.jenis_kelamin", {
                  required: "Jenis kelamin wajib dipilih",
                })}
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
              {errors.keadaan_bayi?.jenis_kelamin && (
                <span className="error-text">
                  {errors.keadaan_bayi.jenis_kelamin.message}
                </span>
              )}
            </div>
          </div>

          <div className="checkbox-grid">
            <label className="checkbox-card">
              <input type="checkbox" {...register("keadaan_bayi.hidup")} />
              <span>Bayi lahir hidup</span>
            </label>
            <label className="checkbox-card">
              <input type="checkbox" {...register("keadaan_bayi.asfiksia")} />
              <span>Asfiksia</span>
            </label>
            <label className="checkbox-card">
              <input type="checkbox" {...register("keadaan_bayi.rds")} />
              <span>Gangguan nafas (RDS)</span>
            </label>
            <label className="checkbox-card">
              <input
                type="checkbox"
                {...register("keadaan_bayi.cacat_bawaan")}
              />
              <span>Cacat bawaan</span>
            </label>
          </div>

          {cacatBawaan && (
            <div className="alert-box">
              <Input
                label="Keterangan Cacat"
                required
                type="text"
                placeholder="Jelaskan kelainan atau temuan yang terjadi..."
                error={errors.keadaan_bayi?.keterangan_cacat?.message}
                {...register("keadaan_bayi.keterangan_cacat", {
                  required: "Wajib diisi jika cacat bawaan dicentang",
                })}
              />
            </div>
          )}
        </Card>

        {/* Catatan Section */}
        <Card
          variant="surface-card"
          padding="xl"
          className="persalinan-form__section-card"
        >
          <div className="section-header">
            <h3 className="section-title">Catatan Tambahan</h3>
            <p className="section-subtitle">
              Isi catatan penting yang perlu disimpan bersama data persalinan
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
            onClick={() => navigate("/persalinan")}
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

export default PersalinanForm;
