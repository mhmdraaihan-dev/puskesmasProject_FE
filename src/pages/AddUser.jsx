import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { registerUser, getVillages } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/roleHelpers";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import "../styles/design-system.css";
import "./AddUser.css";

const AddUser = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      role: "USER",
      status_user: "ACTIVE",
    },
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState([]);

  // Watch form values for conditional rendering
  const watchRole = watch("role");
  const watchPosition = watch("position_user");
  const noteItems = [];

  if (watchRole === "ADMIN") {
    noteItems.push("ADMIN tidak memerlukan position dan village.");
  }

  if (watchPosition === "bidan_praktik") {
    noteItems.push("Bidan Praktik harus dibuatkan tempat praktik setelah user dibuat.");
  }

  if (watchPosition === "bidan_desa") {
    noteItems.push("Bidan Desa wajib di-assign ke desa tertentu.");
  }

  if (watchPosition === "bidan_koordinator") {
    noteItems.push("Bidan Koordinator dapat melihat data lintas desa sesuai hak akses.");
  }

  useEffect(() => {
    if (!isAdmin(user)) {
      alert("Akses ditolak. Halaman ini hanya untuk Admin.");
      navigate("/");
      return;
    }
    fetchVillages();
  }, [user, navigate]);

  const fetchVillages = async () => {
    try {
      const response = await getVillages();
      setVillages(
        response.success && Array.isArray(response.data) ? response.data : [],
      );
    } catch (err) {
      console.error("Failed to fetch villages:", err);
    }
  };

  const onSubmit = async (data) => {
    setError("");

    // Validasi custom
    if (data.role === "USER" && !data.position_user) {
      setError("Position user wajib diisi untuk role USER");
      return;
    }

    if (data.position_user === "bidan_desa" && !data.village_id) {
      setError("Bidan desa wajib di-assign ke village");
      return;
    }

    // Clean data sebelum submit
    const submitData = { ...data };

    // Jika ADMIN, hapus position_user dan village_id
    if (data.role === "ADMIN") {
      delete submitData.position_user;
      delete submitData.village_id;
    }

    // Jika bukan bidan_desa, hapus village_id
    if (data.position_user !== "bidan_desa") {
      delete submitData.village_id;
    }

    // Hapus field kosong
    Object.keys(submitData).forEach((key) => {
      if (
        submitData[key] === "" ||
        submitData[key] === null ||
        submitData[key] === undefined
      ) {
        delete submitData[key];
      }
    });

    setLoading(true);
    try {
      await registerUser(submitData);
      alert("User berhasil dibuat!");

      // Jika bidan praktik, arahkan ke form create practice place
      if (data.position_user === "bidan_praktik") {
        const confirm = window.confirm(
          "User bidan praktik berhasil dibuat. Apakah Anda ingin membuat tempat praktik untuk user ini sekarang?",
        );
        if (confirm) {
          navigate("/practice-places/add");
          return;
        }
      }

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Gagal membuat user. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-page">
      <PageHeader
        heading="Tambah User Baru"
        actions={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Batal
          </Button>
        }
      />

      <Card variant="surface-dark" padding="xl">
        {error && (
          <div className="error-alert" style={{ marginBottom: "var(--spacing-5)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="user-form-grid">
          {/* Left Column */}
          <div>
            <Input
              label="Nama Lengkap"
              required
              placeholder="Nama lengkap user"
              error={errors.full_name?.message}
              {...register("full_name", {
                required: "Nama lengkap wajib diisi",
              })}
            />

            <Input
              label="Email"
              type="email"
              required
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Email wajib diisi",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Format email tidak valid",
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              error={errors.password?.message}
              {...register("password", {
                required: "Password wajib diisi",
                minLength: {
                  value: 6,
                  message: "Password minimal 6 karakter",
                },
              })}
            />

            <Input
              label="Nomor Telepon"
              placeholder="081234567890"
              {...register("phone_number")}
            />
          </div>

          {/* Right Column */}
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Alamat <span className="required-asterisk">*</span>
              </label>
              <textarea
                id="address"
                className="form-textarea"
                placeholder="Alamat lengkap"
                {...register("address", { required: "Alamat wajib diisi" })}
              />
              {errors.address && (
                <span className="error-text">{errors.address.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">
                Role <span className="required-asterisk">*</span>
              </label>
              <select
                id="role"
                className="form-select"
                {...register("role", { required: "Role wajib dipilih" })}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {errors.role && (
                <span className="error-text">{errors.role.message}</span>
              )}
            </div>

            {/* Conditional: Position (only for USER role) */}
            {watchRole === "USER" && (
              <div className="form-group">
                <label className="form-label" htmlFor="position_user">
                  Position <span className="required-asterisk">*</span>
                </label>
                <select
                  id="position_user"
                  className="form-select"
                  {...register("position_user", {
                    required:
                      watchRole === "USER"
                        ? "Position wajib dipilih untuk role USER"
                        : false,
                  })}
                >
                  <option value="">Pilih Position</option>
                  <option value="bidan_praktik">Bidan Praktik</option>
                  <option value="bidan_desa">Bidan Desa</option>
                  <option value="bidan_koordinator">Bidan Koordinator</option>
                </select>
                {errors.position_user && (
                  <span className="error-text">
                    {errors.position_user.message}
                  </span>
                )}
              </div>
            )}

            {/* Conditional: Village (only for bidan_desa) */}
            {watchPosition === "bidan_desa" && (
              <div className="form-group">
                <label className="form-label" htmlFor="village_id">
                  Desa <span className="required-asterisk">*</span>
                </label>
                <select
                  id="village_id"
                  className="form-select"
                  {...register("village_id", {
                    required:
                      watchPosition === "bidan_desa"
                        ? "Desa wajib dipilih untuk Bidan Desa"
                        : false,
                  })}
                >
                  <option value="">Pilih Desa</option>
                  {villages.map((village) => (
                    <option key={village.village_id} value={village.village_id}>
                      {village.nama_desa}
                    </option>
                  ))}
                </select>
                {errors.village_id && (
                  <span className="error-text">
                    {errors.village_id.message}
                  </span>
                )}
                {villages.length === 0 && (
                  <small className="helper-text warning-text">
                    ⚠️ Belum ada desa. Buat desa terlebih dahulu.
                  </small>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="status_user">
                Status <span className="required-asterisk">*</span>
              </label>
              <select
                id="status_user"
                className="form-select"
                {...register("status_user", {
                  required: "Status wajib dipilih",
                })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              {errors.status_user && (
                <span className="error-text">
                  {errors.status_user.message}
                </span>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="info-box">
            <p className="info-title">Catatan Penting</p>
            {noteItems.length > 0 ? (
              <ul className="info-list">
                {noteItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="info-hint">
                Pilih role dan posisi user untuk melihat aturan tambahan yang berlaku.
              </p>
            )}
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Membuat User..." : "Tambah User"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddUser;
