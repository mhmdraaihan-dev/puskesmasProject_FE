import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createKehamilan,
  updateKehamilan,
  getKehamilanDetail,
  getPracticePlaces,
  getPasienList,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import CustomSelect from "../../components/CustomSelect";
import "../../App.css";

const PemeriksaanKehamilanForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  // Dropdown data
  const [patients, setPatients] = useState([]);
  const [practices, setPractices] = useState([]);

  useEffect(() => {
    loadDropdowns();
    if (isEditMode) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDropdowns = async () => {
    try {
      // Fetch potential patients (all users for now, ideally filter by role if API supports)
      // Filter only patients if possible. Assuming 'user' role or similar.
      // If getPracticePlaces returns all, we might need to filter by current user's village or assume list is small.
      // Fetch patients from Master Pasien
      const activeParams = { limit: 1000 }; // Fetch ample amount for dropdown
      const pasienRes = await getPasienList(activeParams);
      setPatients(pasienRes.data || []);

      // Fetch practices logic
      // If user is Bidan Praktik, should see their practices.
      // If API returns all, we filter by user_id if that field exists in practice place.
      // Or just show all if that's the logic.
      const practicesRes = await getPracticePlaces();

      // Filter practices owned by current user (Bidan Praktik)
      const myPractices = (practicesRes.data || []).filter(
        (p) => p.user_id === user.user_id,
      );
      setPractices(myPractices);

      // Auto-select if only one practice
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

      // Set Form Values
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

      // Nested report
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

      // Format Date
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
      // Convert types per spec
      const payload = {
        ...data,
        tanggal: new Date(data.tanggal).toISOString(),
        umur_kehamilan: parseInt(data.umur_kehamilan),
        lila: parseFloat(data.lila),
        bb: parseFloat(data.bb),
        ceklab_report: {
          ...data.ceklab_report,
          hb: data.ceklab_report?.hb ? parseFloat(data.ceklab_report.hb) : null,
          // Boolean conversion if they come as strings from select/radio
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

      // Remove practice_id as it's handled by BE automatically
      delete payload.practice_id;

      // Clean empty checklab if optional
      if (!payload.ceklab_report.golongan_darah && !payload.ceklab_report.hb) {
        // Keep minimal structure or logic
      }

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

  if (fetching)
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>Memuat data...</div>
    );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>{isEditMode ? "Edit Pemeriksaan" : "Input Pemeriksaan Baru"}</h2>
          <p className="text-muted">
            {isEditMode
              ? "Perbarui data yang ditolak"
              : "Masukkan data pemeriksaan kehamilan baru"}
          </p>
        </div>
      </div>

      <div
        className="auth-card"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        {error && (
          <div className="error-alert" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Primary Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div className="form-group">
              <label className="form-label">Pasien *</label>
              <Controller
                name="pasien_id"
                control={control}
                rules={{ required: "Pasien wajib dipilih" }}
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
                              patients.find((p) => p.pasien_id === field.value)
                                .nama
                            } (${
                              patients.find((p) => p.pasien_id === field.value)
                                .nik
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
              <label className="form-label">Tanggal Periksa *</label>
              <input
                type="date"
                className="form-input"
                {...register("tanggal", { required: "Tanggal wajib diisi" })}
              />
              {errors.tanggal && (
                <span className="error-message">{errors.tanggal.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                GPA (Gravida Partus Abortus) *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="G2P1A0"
                {...register("gpa", { required: "GPA wajib diisi" })}
              />
              {errors.gpa && (
                <span className="error-message">{errors.gpa.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Umur Kehamilan (Minggu) *</label>
              <input
                type="number"
                className="form-input"
                {...register("umur_kehamilan", {
                  required: "Umur kehamilan wajib diisi",
                  min: 0,
                  max: 45,
                })}
              />
              {errors.umur_kehamilan && (
                <span className="error-message">
                  {errors.umur_kehamilan.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Jenis Kunjungan *</label>
              <select
                className="form-input"
                {...register("jenis_kunjungan", { required: "Wajib dipilih" })}
              >
                <option value="">Pilih Jenis</option>
                <option value="K1">K1</option>
                <option value="K2">K2</option>
                <option value="K3">K3</option>
                <option value="K4">K4</option>
                <option value="K5">K5</option>
                <option value="K6">K6</option>
              </select>
              {errors.jenis_kunjungan && (
                <span className="error-message">
                  {errors.jenis_kunjungan.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Status TT (Tetanus Toksoid) *
              </label>
              <select
                className="form-input"
                {...register("status_tt", {
                  required: "Status TT wajib dipilih",
                })}
              >
                <option value="">Pilih Status</option>
                <option value="TT1">TT1</option>
                <option value="TT2">TT2</option>
                <option value="TT3">TT3</option>
                <option value="TT4">TT4</option>
                <option value="TT5">TT5</option>
              </select>
              {errors.status_tt && (
                <span className="error-message">
                  {errors.status_tt.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Resiko Tinggi *</label>
              <select
                className="form-input"
                {...register("resti", {
                  required: "Resiko Tinggi wajib dipilih",
                })}
              >
                <option value="">Pilih Resiko</option>
                <option value="RENDAH">Rendah</option>
                <option value="SEDANG">Sedang</option>
                <option value="TINGGI">Tinggi</option>
              </select>
              {errors.resti && (
                <span className="error-message">{errors.resti.message}</span>
              )}
            </div>
          </div>

          {/* Physical Check */}
          <h3
            style={{
              fontSize: "1.1rem",
              marginBottom: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: "0.5rem",
            }}
          >
            Pemeriksaan Fisik
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div className="form-group">
              <label className="form-label">Tekanan Darah (mmHg) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="120/80"
                {...register("td", {
                  required: "Wajib diisi",
                  pattern: {
                    value: /^\d+\/\d+$/,
                    message: "Format harus Sistolik/Diastolik (contoh: 120/80)",
                  },
                })}
              />
              {errors.td && (
                <span className="error-message">{errors.td.message}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">LILA (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                {...register("lila")}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Berat Badan (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                {...register("bb")}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label className="form-label">Catatan</label>
            <textarea
              className="form-input"
              rows="3"
              {...register("catatan")}
            ></textarea>
          </div>

          {/* Lab Report */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              padding: "1rem",
              borderRadius: "0.5rem",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              Data Cek Lab (Opsional)
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label className="form-label">Golongan Darah</label>
                <select
                  className="form-input"
                  {...register("ceklab_report.golongan_darah")}
                >
                  <option value="">-</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hemoglobin (Hb) g/dL</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  {...register("ceklab_report.hb")}
                />
              </div>

              {/* Boolean Selects */}
              <div className="form-group">
                <label className="form-label">HIV</label>
                <select
                  className="form-input"
                  {...register("ceklab_report.hiv")}
                >
                  <option value="">-</option>
                  <option value="false">Negatif</option>
                  <option value="true">Positif</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">HBsAg</label>
                <select
                  className="form-input"
                  {...register("ceklab_report.hbsag")}
                >
                  <option value="">-</option>
                  <option value="false">Negatif</option>
                  <option value="true">Positif</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sifilis</label>
                <select
                  className="form-input"
                  {...register("ceklab_report.sifilis")}
                >
                  <option value="">-</option>
                  <option value="false">Negatif</option>
                  <option value="true">Positif</option>
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "end",
              gap: "1rem",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/pemeriksaan-kehamilan")}
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

export default PemeriksaanKehamilanForm;
