import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import CustomSelect from "../../components/CustomSelect";
import { useAuth } from "../../context/AuthContext";
import "../../App.css";
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
      <div style={{ padding: "3rem", textAlign: "center" }}>
        Memuat data persalinan...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>
            {isEditMode ? "Edit Data Persalinan" : "Input Data Persalinan"}
          </h2>
          <p className="text-muted" style={styles.pageSubtitle}>
            {isEditMode
              ? "Perbarui data persalinan yang perlu diperbaiki"
              : "Masukkan data persalinan baru dengan struktur yang lebih rapi"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/persalinan")}
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
              Lengkapi data umum, kondisi ibu, kondisi bayi, lalu tambahkan
              catatan persalinan bila diperlukan.
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
              <h3 style={styles.sectionTitle}>Data Umum</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Informasi utama persalinan dan pasien
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
                <label className="form-label">Tanggal Partus *</label>
                <input
                  type="date"
                  className="form-input"
                  {...register("tanggal_partus", {
                    required: "Tanggal partus wajib diisi",
                  })}
                />
                {errors.tanggal_partus ? (
                  <span className="error-message">
                    {errors.tanggal_partus.message}
                  </span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Gravida *</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("gravida", {
                    required: "Gravida wajib diisi",
                    min: { value: 1, message: "Minimal 1" },
                  })}
                />
                {errors.gravida ? (
                  <span className="error-message">{errors.gravida.message}</span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Para *</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("para", {
                    required: "Para wajib diisi",
                    min: { value: 0, message: "Minimal 0" },
                  })}
                />
                {errors.para ? (
                  <span className="error-message">{errors.para.message}</span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Abortus *</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("abortus", {
                    required: "Abortus wajib diisi",
                    min: { value: 0, message: "Minimal 0" },
                  })}
                />
                {errors.abortus ? (
                  <span className="error-message">{errors.abortus.message}</span>
                ) : null}
              </div>
            </div>

            <div style={styles.checklistRow}>
              <label style={styles.checkboxItem}>
                <input type="checkbox" {...register("vit_k")} />
                Vitamin K
              </label>
              <label style={styles.checkboxItem}>
                <input type="checkbox" {...register("hb_0")} />
                Hepatitis B0
              </label>
              <label style={styles.checkboxItem}>
                <input type="checkbox" {...register("vit_a_bufas")} />
                Vitamin A Ibu Nifas
              </label>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Kondisi Ibu</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Tandai kondisi ibu saat persalinan berlangsung
              </p>
            </div>

            <div style={styles.checkboxGrid}>
              <label style={styles.checkboxCard}>
                <input type="checkbox" {...register("keadaan_ibu.hidup")} />
                Ibu hidup
              </label>
              <label style={styles.checkboxCard}>
                <input type="checkbox" {...register("keadaan_ibu.baik")} />
                Kondisi sehat / baik
              </label>
              <label style={styles.checkboxCard}>
                <input type="checkbox" {...register("keadaan_ibu.hap")} />
                Pendarahan (HAP)
              </label>
              <label style={styles.checkboxCard}>
                <input type="checkbox" {...register("keadaan_ibu.partus_lama")} />
                Partus lama
              </label>
              <label style={styles.checkboxCard}>
                <input type="checkbox" {...register("keadaan_ibu.pre_eklamsi")} />
                Pre-eklamsi
              </label>
            </div>
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Kondisi Bayi</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Lengkapi data bayi dan kondisi saat lahir
              </p>
            </div>

            <div style={styles.inputGrid}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Berat Badan (gram) *</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("keadaan_bayi.bb", {
                    required: "Berat badan wajib diisi",
                  })}
                />
                {errors.keadaan_bayi?.bb ? (
                  <span className="error-message">
                    {errors.keadaan_bayi.bb.message}
                  </span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Panjang Badan (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  {...register("keadaan_bayi.pb", {
                    required: "Panjang badan wajib diisi",
                  })}
                />
                {errors.keadaan_bayi?.pb ? (
                  <span className="error-message">
                    {errors.keadaan_bayi.pb.message}
                  </span>
                ) : null}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Jenis Kelamin *</label>
                <select
                  className="form-input"
                  {...register("keadaan_bayi.jenis_kelamin", {
                    required: "Jenis kelamin wajib dipilih",
                  })}
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
                {errors.keadaan_bayi?.jenis_kelamin ? (
                  <span className="error-message">
                    {errors.keadaan_bayi.jenis_kelamin.message}
                  </span>
                ) : null}
              </div>
            </div>

            <div style={styles.checkboxGrid}>
              <label style={styles.checkboxCard}>
                <input type="checkbox" {...register("keadaan_bayi.hidup")} />
                Bayi lahir hidup
              </label>
              <label style={styles.checkboxCard}>
                <input type="checkbox" {...register("keadaan_bayi.asfiksia")} />
                Asfiksia
              </label>
              <label style={styles.checkboxCard}>
                <input type="checkbox" {...register("keadaan_bayi.rds")} />
                Gangguan nafas (RDS)
              </label>
              <label style={styles.checkboxCard}>
                <input
                  type="checkbox"
                  {...register("keadaan_bayi.cacat_bawaan")}
                />
                Cacat bawaan
              </label>
            </div>

            {cacatBawaan ? (
              <div style={styles.alertBox}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Keterangan Cacat *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Jelaskan kelainan atau temuan yang terjadi..."
                    {...register("keadaan_bayi.keterangan_cacat", {
                      required: "Wajib diisi jika cacat bawaan dicentang",
                    })}
                  />
                  {errors.keadaan_bayi?.keterangan_cacat ? (
                    <span className="error-message">
                      {errors.keadaan_bayi.keterangan_cacat.message}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Catatan Tambahan</h3>
              <p className="text-muted" style={styles.sectionSubtitle}>
                Isi catatan penting yang perlu disimpan bersama data persalinan
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
              onClick={() => navigate("/persalinan")}
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
  checklistRow: {
    marginTop: "1rem",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  checkboxItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.65rem 0.9rem",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "0.85rem",
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
  alertBox: {
    marginTop: "1rem",
    padding: "1rem",
    borderRadius: "16px",
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(248, 113, 113, 0.24)",
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

export default PersalinanForm;
