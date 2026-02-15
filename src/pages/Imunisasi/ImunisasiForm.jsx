import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createImunisasi,
  updateImunisasi,
  getImunisasiDetail,
  getPracticePlaces,
  getPasienList,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import CustomSelect from "../../components/CustomSelect";
import "../../App.css";

const ImunisasiForm = () => {
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
      const response = await getImunisasiDetail(id);
      const data = response.data;

      setValue("practice_id", data.practice_id);
      setValue("pasien_id", data.pasien_id);
      if (data.tgl_imunisasi)
        setValue(
          "tgl_imunisasi",
          new Date(data.tgl_imunisasi).toISOString().split("T")[0],
        );
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
        alert("Data Imunisasi berhasil diperbarui!");
      } else {
        await createImunisasi(payload);
        alert("Data Imunisasi berhasil ditambahkan!");
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

  if (fetching)
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>Memuat data...</div>
    );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>{isEditMode ? "Edit Data Imunisasi" : "Input Imunisasi Baru"}</h2>
          <p className="text-muted">
            {isEditMode
              ? "Perbaiki data imunisasi yang ditolak"
              : "Masukkan data imunisasi anak"}
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
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
              <label className="form-label">Pasien (Anak/Bayi) *</label>
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
              <label className="form-label">Tanggal Imunisasi *</label>
              <input
                type="date"
                className="form-input"
                max={new Date().toISOString().split("T")[0]}
                {...register("tgl_imunisasi", { required: "Wajib diisi" })}
              />
              {errors.tgl_imunisasi && (
                <span className="error-message">
                  {errors.tgl_imunisasi.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Jenis Imunisasi *</label>
              <select
                className="form-input"
                {...register("jenis_imunisasi", { required: "Wajib dipilih" })}
              >
                <option value="">Pilih Jenis</option>
                <optgroup label="Imunisasi Dasar">
                  <option value="HB_0">HB 0</option>
                  <option value="BCG">BCG</option>
                  <option value="POLIO_1">POLIO 1</option>
                  <option value="POLIO_2">POLIO 2</option>
                  <option value="POLIO_3">POLIO 3</option>
                  <option value="POLIO_4">POLIO 4</option>
                  <option value="DPT_HB_HIB_1">DPT-HB-Hib 1</option>
                  <option value="DPT_HB_HIB_2">DPT-HB-Hib 2</option>
                  <option value="DPT_HB_HIB_3">DPT-HB-Hib 3</option>
                  <option value="CAMPAK">CAMPAK</option>
                  <option value="IPV">IPV</option>
                </optgroup>
                <optgroup label="Imunisasi Lanjutan">
                  <option value="DPT_HB_HIB_LANJUTAN">
                    DPT-HB-Hib Lanjutan
                  </option>
                  <option value="CAMPAK_LANJUTAN">Campak Lanjutan</option>
                </optgroup>
              </select>
              {errors.jenis_imunisasi && (
                <span className="error-message">
                  {errors.jenis_imunisasi.message}
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              marginBottom: "1.5rem",
              backgroundColor: "rgba(255,255,255,0.03)",
              padding: "1rem",
              borderRadius: "0.5rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              Kondisi Anak & Orang Tua
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label className="form-label">Berat Badan (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  {...register("berat_badan", {
                    required: "Wajib diisi",
                    min: 0,
                  })}
                />
                {errors.berat_badan && (
                  <span className="error-message">
                    {errors.berat_badan.message}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Suhu Badan (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  {...register("suhu_badan")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Orang Tua *</label>
                <input
                  type="text"
                  className="form-input"
                  {...register("nama_orangtua", { required: "Wajib diisi" })}
                />
                {errors.nama_orangtua && (
                  <span className="error-message">
                    {errors.nama_orangtua.message}
                  </span>
                )}
              </div>
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
              onClick={() => navigate("/imunisasi")}
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

export default ImunisasiForm;
