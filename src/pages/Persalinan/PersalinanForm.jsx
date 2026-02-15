import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPersalinan,
  updatePersalinan,
  getPersalinanDetail,
  getPracticePlaces,
  getPasienList,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import CustomSelect from "../../components/CustomSelect";
import "../../App.css";

const PersalinanForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  // Dropdown data
  const [patients, setPatients] = useState([]);
  const [practices, setPractices] = useState([]);

  // Watch for conditional validation
  const cacatBawaan = watch("keadaan_bayi.cacat_bawaan");

  useEffect(() => {
    loadDropdowns();
    if (isEditMode) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDropdowns = async () => {
    try {
      const pasienRes = await getPasienList({ limit: 1000 });
      setPatients(pasienRes.data || []);

      const practicesRes = await getPracticePlaces();
      const myPractices = (practicesRes.data || []).filter(
        (p) => p.user_id === user.user_id,
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

      // Map API response to form structure
      // Note: API returns keadaan_ibu_persalinan, but create payload expects keadaan_ibu
      // We need to map it carefully.

      setValue("practice_id", data.practice_id);
      setValue("pasien_id", data.pasien_id);
      if (data.tanggal_partus)
        setValue(
          "tanggal_partus",
          new Date(data.tanggal_partus).toISOString().split("T")[0],
        );
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
        gravida: parseInt(data.gravida),
        para: parseInt(data.para),
        abortus: parseInt(data.abortus),

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

  if (fetching)
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>Memuat data...</div>
    );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>
            {isEditMode ? "Edit Data Persalinan" : "Input Persalinan Baru"}
          </h2>
          <p className="text-muted">
            {isEditMode
              ? "Perbaiki data yang ditolak"
              : "Masukkan data persalinan baru"}
          </p>
        </div>
      </div>

      <div
        className="auth-card"
        style={{ maxWidth: "900px", margin: "0 auto" }}
      >
        {error && (
          <div className="error-alert" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Section 1: Data Umum */}
          <div style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "0.5rem",
              }}
            >
              1. Data Umum & Ibu
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label className="form-label">Tempat Praktik *</label>
                <Controller
                  name="practice_id"
                  control={control}
                  rules={{ required: "Wajib dipilih" }}
                  render={({ field }) => (
                    <CustomSelect
                      {...field}
                      options={practices.map((p) => ({
                        value: p.practice_id,
                        label: p.nama_praktik,
                      }))}
                      onChange={(val) => field.onChange(val?.value)}
                      value={
                        practices.find((p) => p.practice_id === field.value)
                          ? {
                              value: field.value,
                              label: practices.find(
                                (p) => p.practice_id === field.value,
                              ).nama_praktik,
                            }
                          : null
                      }
                      placeholder="Pilih Tempat Praktik"
                    />
                  )}
                />
                {errors.practice_id && (
                  <span className="error-message">
                    {errors.practice_id.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Pasien *</label>
                <Controller
                  name="pasien_id"
                  control={control}
                  rules={{ required: "Wajib dipilih" }}
                  render={({ field }) => (
                    <CustomSelect
                      {...field}
                      options={patients.map((p) => ({
                        value: p.pasien_id,
                        label: `${p.nama} (${p.nik})`,
                      }))}
                      onChange={(val) => field.onChange(val?.value)}
                      value={
                        patients.find((p) => p.pasien_id === field.value)
                          ? {
                              value: field.value,
                              label: `${
                                patients.find(
                                  (p) => p.pasien_id === field.value,
                                ).nama
                              } (${
                                patients.find(
                                  (p) => p.pasien_id === field.value,
                                ).nik
                              })`,
                            }
                          : null
                      }
                      placeholder="Cari Pasien..."
                    />
                  )}
                />
                {errors.pasien_id && (
                  <span className="error-message">
                    {errors.pasien_id.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Partus *</label>
                <input
                  type="date"
                  className="form-input"
                  {...register("tanggal_partus", { required: "Wajib diisi" })}
                />
                {errors.tanggal_partus && (
                  <span className="error-message">
                    {errors.tanggal_partus.message}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <div className="form-group">
                <label className="form-label">Gravida (Kehamilan Ke-)</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("gravida", { required: true, min: 1 })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Para (Melahirkan Ke-)</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("para", { required: true, min: 0 })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Abortus (Keguguran)</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("abortus", { required: true, min: 0 })}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "2rem",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" {...register("vit_k")} /> Vitamin K
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" {...register("hb_0")} /> Hepatitis B 0
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" {...register("vit_a_bufas")} /> Vitamin A
                (Ibu Nifas)
              </label>
            </div>
          </div>

          {/* Section 2: Keadaan Ibu */}
          <div
            style={{
              marginBottom: "2rem",
              backgroundColor: "rgba(255,255,255,0.03)",
              padding: "1rem",
              borderRadius: "0.5rem",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              2. Kondisi Ibu
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" {...register("keadaan_ibu.hidup")} /> Ibu
                Hidup
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" {...register("keadaan_ibu.baik")} />{" "}
                Kondisi Sehat/Baik
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" {...register("keadaan_ibu.hap")} />{" "}
                Pendarahan (HAP)
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  {...register("keadaan_ibu.partus_lama")}
                />{" "}
                Partus Lama
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  {...register("keadaan_ibu.pre_eklamsi")}
                />{" "}
                Pre-Eklamsi
              </label>
            </div>
          </div>

          {/* Section 3: Keadaan Bayi */}
          <div style={{ marginBottom: "2rem" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                paddingBottom: "0.5rem",
              }}
            >
              3. Data Bayi
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label className="form-label">Berat Badan (gram) *</label>
                <input
                  type="number"
                  className="form-input"
                  {...register("keadaan_bayi.bb", {
                    required: "BB Wajib diisi",
                  })}
                />
                {errors.keadaan_bayi?.bb && (
                  <span className="error-message">
                    {errors.keadaan_bayi.bb.message}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Panjang Badan (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  {...register("keadaan_bayi.pb", {
                    required: "PB Wajib diisi",
                  })}
                />
                {errors.keadaan_bayi?.pb && (
                  <span className="error-message">
                    {errors.keadaan_bayi.pb.message}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Jenis Kelamin *</label>
                <select
                  className="form-input"
                  {...register("keadaan_bayi.jenis_kelamin", {
                    required: "Wajib dipilih",
                  })}
                >
                  <option value="">Pilih</option>
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
                {errors.keadaan_bayi?.jenis_kelamin && (
                  <span className="error-message">
                    {errors.keadaan_bayi.jenis_kelamin.message}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" {...register("keadaan_bayi.hidup")} />{" "}
                Bayi Lahir Hidup
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" {...register("keadaan_bayi.asfiksia")} />{" "}
                Asfiksia
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input type="checkbox" {...register("keadaan_bayi.rds")} />{" "}
                Gangguan Nafas (RDS)
              </label>
            </div>

            <div
              style={{
                marginTop: "1rem",
                backgroundColor: "rgba(255,255,255,0.03)",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  fontWeight: "bold",
                }}
              >
                <input
                  type="checkbox"
                  {...register("keadaan_bayi.cacat_bawaan")}
                />{" "}
                Cacat Bawaan
              </label>
              {cacatBawaan && (
                <div className="form-group">
                  <label className="form-label">Keterangan Cacat *</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register("keadaan_bayi.keterangan_cacat", {
                      required: "Wajib diisi jika cacat bawaan",
                    })}
                    placeholder="Jelaskan kelainan..."
                  />
                  {errors.keadaan_bayi?.keterangan_cacat && (
                    <span className="error-message">
                      {errors.keadaan_bayi.keterangan_cacat.message}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label">Catatan Tambahan</label>
            <textarea
              className="form-input"
              rows="3"
              {...register("catatan")}
            ></textarea>
          </div>

          <div style={{ display: "flex", justifyContent: "end", gap: "1rem" }}>
            <button
              type="button"
              onClick={() => navigate("/persalinan")}
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
                  : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersalinanForm;
