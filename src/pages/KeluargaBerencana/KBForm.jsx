import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
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

const methodOptions = [
  { value: "PIL", label: "PIL" },
  { value: "SUNTIK_1_BULAN", label: "Suntik 1 Bulan" },
  { value: "SUNTIK_3_BULAN", label: "Suntik 3 Bulan" },
  { value: "IMPLANT", label: "Implant" },
  { value: "IUD", label: "IUD" },
  { value: "KONDOM", label: "Kondom" },
  { value: "MOW", label: "MOW" },
  { value: "MOP", label: "MOP" },
];

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
      setValue("alat_kontrasepsi", data.alat_kontrasepsi);
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
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Memuat data KB...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>
            {isEditMode ? "Edit Data KB" : "Input Data KB"}
          </h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            {isEditMode
              ? "Perbarui data pelayanan KB yang perlu diperbaiki"
              : "Masukkan data pelayanan KB baru dengan struktur yang lebih rapi"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/keluarga-berencana")}
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
            <h3 style={styles.sectionTitle}>Ringkasan Input</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Lengkapi data kunjungan, metode kontrasepsi, demografi anak, dan
              keterangan tambahan bila diperlukan.
            </p>
          </div>
          <div style={styles.infoPills}>
            <span style={styles.infoPill}>Pasien tersedia: {patients.length}</span>
            <span style={styles.infoPill}>
              Praktik aktif: {practices.length || 0}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.formLayout}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Data Kunjungan</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Informasi utama kunjungan KB pasien
              </p>
            </div>

            <div style={styles.inputGrid}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tempat Praktik *</label>
                <Controller
                  name="practice_id"
                  control={control}
                  rules={{ required: "Tempat praktik wajib dipilih" }}
                  render={({ field }) => (
                    <CustomSelect
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
                {errors.practice_id ? (
                  <span className="error-message">{errors.practice_id.message}</span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Pasien *</label>
                <Controller
                  name="pasien_id"
                  control={control}
                  rules={{ required: "Pasien wajib dipilih" }}
                  render={({ field }) => (
                    <CustomSelect
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
                {errors.pasien_id ? (
                  <span className="error-message">{errors.pasien_id.message}</span>
                ) : null}
                {selectedPatient ? (
                  <div style={styles.inlinePatientInfo}>
                    <span>NIK: {selectedPatient.nik}</span>
                    <span>Alamat: {selectedPatient.alamat_lengkap || "-"}</span>
                  </div>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Kunjungan *</label>
                <input
                  type="date"
                  className="form-input"
                  max={new Date().toISOString().split("T")[0]}
                  {...register("tanggal_kunjungan", {
                    required: "Tanggal kunjungan wajib diisi",
                  })}
                />
                {errors.tanggal_kunjungan ? (
                  <span className="error-message">
                    {errors.tanggal_kunjungan.message}
                  </span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Metode Kontrasepsi *</label>
                <select
                  className="form-input"
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
                {errors.alat_kontrasepsi ? (
                  <span className="error-message">
                    {errors.alat_kontrasepsi.message}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Demografi Anak dan Risiko</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Lengkapi jumlah anak hidup dan indikasi abortus terancam
              </p>
            </div>

            <div style={styles.inputGrid}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Anak Laki-laki</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  {...register("jumlah_anak_laki", {
                    required: "Jumlah anak laki-laki wajib diisi",
                    min: { value: 0, message: "Minimal 0" },
                  })}
                />
                {errors.jumlah_anak_laki ? (
                  <span className="error-message">
                    {errors.jumlah_anak_laki.message}
                  </span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Anak Perempuan</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  {...register("jumlah_anak_perempuan", {
                    required: "Jumlah anak perempuan wajib diisi",
                    min: { value: 0, message: "Minimal 0" },
                  })}
                />
                {errors.jumlah_anak_perempuan ? (
                  <span className="error-message">
                    {errors.jumlah_anak_perempuan.message}
                  </span>
                ) : null}
              </div>
            </div>

            <div style={styles.checkboxRow}>
              <label style={styles.checkboxCard}>
                <input type="checkbox" {...register("at")} />
                Abortus terancam (AT)
              </label>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Keterangan Tambahan</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Isi keluhan, catatan, atau keterangan lain yang relevan
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Keterangan / Keluhan</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Tuliskan keterangan atau keluhan pasien bila ada..."
                {...register("keterangan")}
              />
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate("/keluarga-berencana")}
              className="btn-primary"
              style={styles.secondaryButton}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? "Menyimpan..."
                : isEditMode
                  ? "Update Data"
                  : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  header: {
    gap: "1rem",
    flexWrap: "wrap",
  },
  pageTitle: {
    marginBottom: "0.35rem",
  },
  pageSubtitle: {
    margin: 0,
  },
  formCard: {
    maxWidth: "none",
    margin: 0,
    padding: "1.75rem",
  },
  formIntro: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1rem",
  },
  infoPills: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  infoPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 0.85rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "var(--color-text-muted)",
    fontSize: "0.85rem",
  },
  formLayout: {
    display: "grid",
    gap: "1rem",
  },
  sectionCard: {
    padding: "1.25rem",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  sectionHeader: {
    marginBottom: "1rem",
  },
  sectionTitle: {
    marginBottom: "0.35rem",
    fontSize: "1.1rem",
  },
  sectionSubtitle: {
    margin: 0,
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  inlinePatientInfo: {
    marginTop: "0.75rem",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    fontSize: "0.85rem",
    color: "var(--color-text-muted)",
  },
  checkboxRow: {
    marginTop: "1rem",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  checkboxCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.9rem 1rem",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginTop: "0.5rem",
  },
  primaryButton: {
    width: "auto",
    minWidth: "150px",
    paddingInline: "1rem",
  },
  secondaryButton: {
    width: "auto",
    minWidth: "150px",
    paddingInline: "1rem",
    backgroundColor: "transparent",
    border: "1px solid var(--glass-border)",
  },
};

export default KBForm;
