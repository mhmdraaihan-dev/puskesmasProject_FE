import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
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
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Memuat data pemeriksaan...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>
            {isEditMode ? "Edit Pemeriksaan Kehamilan" : "Input Pemeriksaan Kehamilan"}
          </h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            {isEditMode
              ? "Perbarui data pemeriksaan yang perlu diperbaiki"
              : "Masukkan data pemeriksaan kehamilan baru dengan struktur yang rapi"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/pemeriksaan-kehamilan")}
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
              Pilih pasien, lengkapi data utama, lalu isi pemeriksaan fisik dan cek
              laboratorium bila tersedia.
            </p>
          </div>
          <div style={styles.infoPills}>
            <span style={styles.infoPill}>
              Pasien tersedia: {patients.length}
            </span>
            <span style={styles.infoPill}>
              Praktik aktif: {practices.length || 0}
            </span>
          </div>
        </div>

        {practices.length > 0 ? (
          <div style={styles.noticeBox}>
            Tempat praktik aktif akan mengikuti akun bidan praktik yang sedang
            login.
          </div>
        ) : (
          <div style={{ ...styles.noticeBox, ...styles.noticeWarning }}>
            Tempat praktik belum terdeteksi. Pastikan akun Anda sudah terhubung ke
            tempat praktik.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.formLayout}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Data Utama</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Informasi inti pemeriksaan dan identitas kunjungan
              </p>
            </div>

            <div style={styles.inputGrid}>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
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
                <label className="form-label">Tanggal Periksa *</label>
                <input
                  type="date"
                  className="form-input"
                  {...register("tanggal", { required: "Tanggal wajib diisi" })}
                />
                {errors.tanggal ? (
                  <span className="error-message">{errors.tanggal.message}</span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Jenis Kunjungan *</label>
                <select
                  className="form-input"
                  {...register("jenis_kunjungan", { required: "Jenis kunjungan wajib dipilih" })}
                >
                  <option value="">Pilih jenis kunjungan</option>
                  <option value="K1">K1</option>
                  <option value="K2">K2</option>
                  <option value="K3">K3</option>
                  <option value="K4">K4</option>
                  <option value="K5">K5</option>
                  <option value="K6">K6</option>
                </select>
                {errors.jenis_kunjungan ? (
                  <span className="error-message">
                    {errors.jenis_kunjungan.message}
                  </span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">GPA *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: G2P1A0"
                  {...register("gpa", { required: "GPA wajib diisi" })}
                />
                {errors.gpa ? (
                  <span className="error-message">{errors.gpa.message}</span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Umur Kehamilan (minggu) *</label>
                <input
                  type="number"
                  className="form-input"
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
                {errors.umur_kehamilan ? (
                  <span className="error-message">
                    {errors.umur_kehamilan.message}
                  </span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status TT *</label>
                <select
                  className="form-input"
                  {...register("status_tt", { required: "Status TT wajib dipilih" })}
                >
                  <option value="">Pilih status TT</option>
                  <option value="TT1">TT1</option>
                  <option value="TT2">TT2</option>
                  <option value="TT3">TT3</option>
                  <option value="TT4">TT4</option>
                  <option value="TT5">TT5</option>
                </select>
                {errors.status_tt ? (
                  <span className="error-message">{errors.status_tt.message}</span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Risiko Tinggi *</label>
                <select
                  className="form-input"
                  {...register("resti", { required: "Risiko wajib dipilih" })}
                >
                  <option value="">Pilih tingkat risiko</option>
                  <option value="RENDAH">Rendah</option>
                  <option value="SEDANG">Sedang</option>
                  <option value="TINGGI">Tinggi</option>
                </select>
                {errors.resti ? (
                  <span className="error-message">{errors.resti.message}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Pemeriksaan Fisik</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Isi temuan pemeriksaan dasar yang dilakukan saat kunjungan
              </p>
            </div>

            <div style={styles.inputGrid}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tekanan Darah (mmHg) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: 120/80"
                  {...register("td", {
                    required: "Tekanan darah wajib diisi",
                    pattern: {
                      value: /^\d+\/\d+$/,
                      message: "Format harus Sistolik/Diastolik, contoh 120/80",
                    },
                  })}
                />
                {errors.td ? (
                  <span className="error-message">{errors.td.message}</span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">LILA (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Contoh: 25.5"
                  {...register("lila")}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Berat Badan (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Contoh: 55.2"
                  {...register("bb")}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
                <label className="form-label">Catatan</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Tuliskan catatan penting pemeriksaan bila ada..."
                  {...register("catatan")}
                />
              </div>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Cek Laboratorium</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Bagian ini opsional dan dapat diisi bila hasil lab tersedia
              </p>
            </div>

            <div style={styles.inputGrid}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Golongan Darah</label>
                <select
                  className="form-input"
                  {...register("ceklab_report.golongan_darah")}
                >
                  <option value="">Pilih golongan darah</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Hemoglobin (Hb)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Contoh: 11.5"
                  {...register("ceklab_report.hb")}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">HIV</label>
                <select
                  className="form-input"
                  {...register("ceklab_report.hiv")}
                >
                  <option value="">Belum diisi</option>
                  <option value="false">Negatif</option>
                  <option value="true">Positif</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">HBsAg</label>
                <select
                  className="form-input"
                  {...register("ceklab_report.hbsag")}
                >
                  <option value="">Belum diisi</option>
                  <option value="false">Negatif</option>
                  <option value="true">Positif</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sifilis</label>
                <select
                  className="form-input"
                  {...register("ceklab_report.sifilis")}
                >
                  <option value="">Belum diisi</option>
                  <option value="false">Negatif</option>
                  <option value="true">Positif</option>
                </select>
              </div>
            </div>
          </div>

          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate("/pemeriksaan-kehamilan")}
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
  noticeBox: {
    marginBottom: "1.25rem",
    padding: "0.9rem 1rem",
    borderRadius: "14px",
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(96,165,250,0.25)",
    color: "#bfdbfe",
    lineHeight: 1.5,
  },
  noticeWarning: {
    background: "rgba(251,191,36,0.12)",
    border: "1px solid rgba(251,191,36,0.28)",
    color: "#fde68a",
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

export default PemeriksaanKehamilanForm;
