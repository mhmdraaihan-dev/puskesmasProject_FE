import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { registerUser, getVillages } from "../services/api";
import "../App.css";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState([]);

  // Watch form values for conditional rendering
  const watchRole = watch("role");
  const watchPosition = watch("position_user");

  useEffect(() => {
    fetchVillages();
  }, []);

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
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Tambah User Baru</h2>
          <p className="text-muted">Buat akun user baru untuk sistem.</p>
        </div>
        <div>
          <button
            onClick={() => navigate("/")}
            className="btn-primary"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--glass-border)",
            }}
          >
            Batal
          </button>
        </div>
      </div>

      <div
        className="auth-card"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="user-grid">
          {/* Left Column */}
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">
                Nama Lengkap *
              </label>
              <input
                id="full_name"
                className="form-input"
                placeholder="Nama lengkap user"
                {...register("full_name", {
                  required: "Nama lengkap wajib diisi",
                })}
              />
              {errors.full_name && (
                <span className="error-message">
                  {errors.full_name.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email *
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="email@example.com"
                {...register("email", {
                  required: "Email wajib diisi",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Format email tidak valid",
                  },
                })}
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password *
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Minimal 6 karakter"
                {...register("password", {
                  required: "Password wajib diisi",
                  minLength: {
                    value: 6,
                    message: "Password minimal 6 karakter",
                  },
                })}
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone_number">
                Nomor Telepon
              </label>
              <input
                id="phone_number"
                className="form-input"
                placeholder="081234567890"
                {...register("phone_number")}
              />
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Alamat *
              </label>
              <textarea
                id="address"
                className="form-input"
                style={{ height: "120px", resize: "none" }}
                placeholder="Alamat lengkap"
                {...register("address", { required: "Alamat wajib diisi" })}
              />
              {errors.address && (
                <span className="error-message">{errors.address.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">
                Role *
              </label>
              <select
                id="role"
                className="form-input"
                {...register("role", { required: "Role wajib dipilih" })}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {errors.role && (
                <span className="error-message">{errors.role.message}</span>
              )}
            </div>

            {/* Conditional: Position (only for USER role) */}
            {watchRole === "USER" && (
              <div className="form-group">
                <label className="form-label" htmlFor="position_user">
                  Position *
                </label>
                <select
                  id="position_user"
                  className="form-input"
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
                  <span className="error-message">
                    {errors.position_user.message}
                  </span>
                )}
              </div>
            )}

            {/* Conditional: Village (only for bidan_desa) */}
            {watchPosition === "bidan_desa" && (
              <div className="form-group">
                <label className="form-label" htmlFor="village_id">
                  Desa *
                </label>
                <select
                  id="village_id"
                  className="form-input"
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
                  <span className="error-message">
                    {errors.village_id.message}
                  </span>
                )}
                {villages.length === 0 && (
                  <small
                    className="text-muted"
                    style={{ fontSize: "0.75rem", color: "#fbbf24" }}
                  >
                    ⚠️ Belum ada desa. Buat desa terlebih dahulu.
                  </small>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="status_user">
                Status *
              </label>
              <select
                id="status_user"
                className="form-input"
                {...register("status_user", {
                  required: "Status wajib dipilih",
                })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              {errors.status_user && (
                <span className="error-message">
                  {errors.status_user.message}
                </span>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div
            style={{
              gridColumn: "span 2",
              marginTop: "1rem",
              padding: "1rem",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <p style={{ fontSize: "0.875rem", margin: 0, color: "#93c5fd" }}>
              <strong>ℹ️ Catatan Penting:</strong>
            </p>
            <ul
              style={{
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                paddingLeft: "1.5rem",
                color: "#93c5fd",
              }}
            >
              {watchRole === "ADMIN" && (
                <li>ADMIN tidak memerlukan position dan village</li>
              )}
              {watchPosition === "bidan_praktik" && (
                <li>
                  Bidan Praktik harus dibuatkan tempat praktik setelah user
                  dibuat
                </li>
              )}
              {watchPosition === "bidan_desa" && (
                <li>Bidan Desa wajib di-assign ke desa tertentu</li>
              )}
              {watchPosition === "bidan_koordinator" && (
                <li>Bidan Koordinator dapat melihat semua data</li>
              )}
            </ul>
          </div>

          <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Membuat User..." : "Tambah User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
