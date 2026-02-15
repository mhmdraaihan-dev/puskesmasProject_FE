import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createKB,
  updateKB,
  getKBDetail,
  getPracticePlaces,
  getPasienList,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import CustomSelect from "../../components/CustomSelect";
import "../../App.css";

const KBForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    defaultValues: {
      jumlah_anak_laki: 0,
      jumlah_anak_perempuan: 0,
      at: false,
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
      const response = await getKBDetail(id);
      const data = response.data;

      // Map API response to form
      setValue("practice_id", data.practice_id);
      setValue("pasien_id", data.pasien_id);
      if (data.tanggal_kunjungan)
        setValue(
          "tanggal_kunjungan",
          new Date(data.tanggal_kunjungan).toISOString().split("T")[0],
        );
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
        jumlah_anak_laki: parseInt(data.jumlah_anak_laki),
        jumlah_anak_perempuan: parseInt(data.jumlah_anak_perempuan),
        // at is boolean, already correct from checkbox
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

  if (fetching)
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>Memuat data...</div>
    );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>{isEditMode ? "Edit Data KB" : "Input KB Baru"}</h2>
          <p className="text-muted">
            {isEditMode
              ? "Perbaiki data KB yang ditolak"
              : "Masukkan data pelayanan KB baru"}
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
              <label className="form-label">Tanggal Kunjungan *</label>
              <input
                type="date"
                className="form-input"
                max={new Date().toISOString().split("T")[0]} // Prevent future dates
                {...register("tanggal_kunjungan", { required: "Wajib diisi" })}
              />
              {errors.tanggal_kunjungan && (
                <span className="error-message">
                  {errors.tanggal_kunjungan.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Metode Kontrasepsi *</label>
              <select
                className="form-input"
                {...register("alat_kontrasepsi", { required: "Wajib dipilih" })}
              >
                <option value="">Pilih Metode</option>
                <option value="PIL">PIL</option>
                <option value="SUNTIK_1_BULAN">SUNTIK 1 BULAN</option>
                <option value="SUNTIK_3_BULAN">SUNTIK 3 BULAN</option>
                <option value="IMPLANT">IMPLANT</option>
                <option value="IUD">IUD</option>
                <option value="KONDOM">KONDOM</option>
                <option value="MOW">MOW</option>
                <option value="MOP">MOP</option>
              </select>
              {errors.alat_kontrasepsi && (
                <span className="error-message">
                  {errors.alat_kontrasepsi.message}
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
              Data Demografi & Indikasi
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label className="form-label">Anak Laki-laki</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  {...register("jumlah_anak_laki", { required: true, min: 0 })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Anak Perempuan</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  {...register("jumlah_anak_perempuan", {
                    required: true,
                    min: 0,
                  })}
                />
              </div>
              <div
                className="form-group"
                style={{ display: "flex", alignItems: "center" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input type="checkbox" {...register("at")} /> Abortus Terancam
                  (AT)
                </label>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label">Keterangan / Keluhan</label>
            <textarea
              className="form-input"
              rows="3"
              {...register("keterangan")}
              placeholder="Tidak ada keluhan"
            ></textarea>
          </div>

          <div style={{ display: "flex", justifyContent: "end", gap: "1rem" }}>
            <button
              type="button"
              onClick={() => navigate("/keluarga-berencana")}
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

export default KBForm;
