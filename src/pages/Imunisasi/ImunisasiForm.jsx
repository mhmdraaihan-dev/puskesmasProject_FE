import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
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
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Memuat data imunisasi...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>
            {isEditMode ? "Edit Data Imunisasi" : "Input Data Imunisasi"}
          </h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            {isEditMode
              ? "Perbarui data imunisasi yang perlu diperbaiki"
              : "Masukkan data imunisasi anak dengan struktur yang lebih rapi"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/imunisasi")}
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
              Lengkapi data kunjungan, jenis imunisasi, kondisi anak, dan data
              orang tua pada satu alur yang rapi.
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
                Informasi utama kunjungan imunisasi anak
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
                <label className="form-label">Pasien (Anak/Bayi) *</label>
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
                <label className="form-label">Tanggal Imunisasi *</label>
                <input
                  type="date"
                  className="form-input"
                  max={new Date().toISOString().split("T")[0]}
                  {...register("tgl_imunisasi", {
                    required: "Tanggal imunisasi wajib diisi",
                  })}
                />
                {errors.tgl_imunisasi ? (
                  <span className="error-message">
                    {errors.tgl_imunisasi.message}
                  </span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Jenis Imunisasi *</label>
                <select
                  className="form-input"
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
                {errors.jenis_imunisasi ? (
                  <span className="error-message">
                    {errors.jenis_imunisasi.message}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Kondisi Anak dan Orang Tua</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Lengkapi data fisik anak dan identitas pendamping
              </p>
            </div>

            <div style={styles.inputGrid}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Berat Badan (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  {...register("berat_badan", {
                    required: "Berat badan wajib diisi",
                    min: { value: 0, message: "Minimal 0" },
                  })}
                />
                {errors.berat_badan ? (
                  <span className="error-message">{errors.berat_badan.message}</span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Suhu Badan (C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  {...register("suhu_badan")}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nama Orang Tua *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register("nama_orangtua", {
                    required: "Nama orang tua wajib diisi",
                  })}
                />
                {errors.nama_orangtua ? (
                  <span className="error-message">
                    {errors.nama_orangtua.message}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Catatan Tambahan</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Isi catatan penting bila ada reaksi, keluhan, atau kebutuhan
                observasi lanjutan
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Catatan</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Tuliskan catatan tambahan bila ada..."
                {...register("catatan")}
              />
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate("/imunisasi")}
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

export default ImunisasiForm;
