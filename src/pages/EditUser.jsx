import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { updateUser, getUsers, getVillages } from "../services/api";
import "../App.css";

const EditUser = () => {
  const { userId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [villages, setVillages] = useState([]);

  // Watch form values for conditional rendering
  const watchRole = watch("role");
  const watchPosition = watch("position_user");

  useEffect(() => {
    fetchVillages();
    fetchUser();
  }, [userId]);

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

  const fetchUser = async () => {
    try {
      const response = await getUsers();
      // Backend response structure: { success: true, data: [...] }
      const users =
        response.success && Array.isArray(response.data) ? response.data : [];
      const user = users.find((u) => u.user_id === userId);

      if (user) {
        setValue("full_name", user.full_name);
        setValue("email", user.email);
        setValue("address", user.address);
        setValue("phone_number", user.phone_number || "");
        setValue("position_user", user.position_user || "");
        setValue("village_id", user.village_id || "");
        setValue("role", user.role);
      } else {
        setError("User tidak ditemukan");
      }
    } catch (err) {
      setError("Gagal memuat data user");
    } finally {
      setLoadingUser(false);
    }
  };

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    // Remove empty fields to support partial update
    const updateData = {};
    Object.keys(data).forEach((key) => {
      // Don't filter out village_id even if it's empty string, let backend handle it
      if (key === "village_id" && data[key]) {
        updateData[key] = data[key];
      } else if (
        data[key] !== "" &&
        data[key] !== null &&
        data[key] !== undefined
      ) {
        updateData[key] = data[key];
      }
    });

    // Handle position_user for ADMIN role
    // Only set to null if explicitly changing to ADMIN
    if (updateData.role === "ADMIN") {
      updateData.position_user = null;
      updateData.village_id = null;
    } else if (data.position_user && data.position_user !== "bidan_desa") {
      // Only set village_id to null if explicitly changing position to non-bidan_desa
      // Don't touch village_id if position field is not being changed
      updateData.village_id = null;
    }

    try {
      await updateUser(userId, updateData);
      alert("User berhasil diupdate!");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mengupdate user. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="dashboard">
        <p>Memuat data user...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Edit User</h2>
          <p className="text-muted">Update informasi user.</p>
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
                Nama Lengkap
              </label>
              <input
                id="full_name"
                className="form-input"
                {...register("full_name")}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                {...register("email", {
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
              <label className="form-label" htmlFor="phone_number">
                Nomor Telepon
              </label>
              <input
                id="phone_number"
                className="form-input"
                {...register("phone_number")}
              />
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Alamat
              </label>
              <textarea
                id="address"
                className="form-input"
                style={{ height: "120px", resize: "none" }}
                {...register("address")}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">
                Role
              </label>
              <select id="role" className="form-input" {...register("role")}>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {/* Conditional: Position (only for USER role) */}
            {watchRole === "USER" && (
              <div className="form-group">
                <label className="form-label" htmlFor="position_user">
                  Position
                </label>
                <select
                  id="position_user"
                  className="form-input"
                  {...register("position_user")}
                >
                  <option value="">None (for ADMIN)</option>
                  <option value="bidan_praktik">Bidan Praktik</option>
                  <option value="bidan_desa">Bidan Desa</option>
                  <option value="bidan_koordinator">Bidan Koordinator</option>
                </select>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  * Position wajib untuk role USER
                </small>
              </div>
            )}

            {/* Conditional: Village (only for bidan_desa) */}
            {watchPosition === "bidan_desa" && (
              <div className="form-group">
                <label className="form-label" htmlFor="village_id">
                  Desa
                </label>
                <select
                  id="village_id"
                  className="form-input"
                  {...register("village_id")}
                >
                  <option value="">Pilih Desa</option>
                  {villages.map((village) => (
                    <option key={village.village_id} value={village.village_id}>
                      {village.nama_desa}
                    </option>
                  ))}
                </select>
                <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                  * Desa wajib untuk Bidan Desa
                </small>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div
            style={{
              gridColumn: "span 2",
              marginTop: "1rem",
              padding: "1rem",
              background: "rgba(251, 191, 36, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(251, 191, 36, 0.3)",
            }}
          >
            <p style={{ fontSize: "0.875rem", margin: 0, color: "#fbbf24" }}>
              <strong>⚠️ Perhatian:</strong>
            </p>
            <ul
              style={{
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                paddingLeft: "1.5rem",
                color: "#fbbf24",
              }}
            >
              <li>Hanya field yang diisi akan diupdate</li>
              {watchRole === "ADMIN" && (
                <li>ADMIN tidak memerlukan position dan village</li>
              )}
              {watchPosition === "bidan_desa" && (
                <li>Bidan Desa wajib di-assign ke desa</li>
              )}
            </ul>
          </div>

          <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Mengupdate User..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
