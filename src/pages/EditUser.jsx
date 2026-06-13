import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { updateUser, getUsers, getVillages } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/roleHelpers";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import "../styles/design-system.css";
import "./AddUser.css";

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
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [villages, setVillages] = useState([]);

  // Watch form values for conditional rendering
  const watchRole = watch("role");
  const watchPosition = watch("position_user");
  const noteItems = ["Hanya field yang diisi akan diupdate."];

  if (watchRole === "ADMIN") {
    noteItems.push("ADMIN tidak memerlukan position dan village.");
  }

  if (watchPosition === "bidan_desa") {
    noteItems.push("Bidan Desa wajib di-assign ke desa yang sesuai.");
  }

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [villageResponse, usersResponse] = await Promise.all([
          getVillages(),
          getUsers(),
        ]);

        setVillages(
          villageResponse.success && Array.isArray(villageResponse.data)
            ? villageResponse.data
            : [],
        );

        const users =
          usersResponse.success && Array.isArray(usersResponse.data)
            ? usersResponse.data
            : [];
        const selectedUser = users.find((item) => item.user_id === userId);

        if (selectedUser) {
          setValue("full_name", selectedUser.full_name);
          setValue("email", selectedUser.email);
          setValue("address", selectedUser.address);
          setValue("phone_number", selectedUser.phone_number || "");
          setValue("position_user", selectedUser.position_user || "");
          setValue("village_id", selectedUser.village_id || "");
          setValue("role", selectedUser.role);
        } else {
          setError("User tidak ditemukan");
        }
      } catch {
        setError("Gagal memuat data user");
      } finally {
        setLoadingUser(false);
      }
    };

    if (!isAdmin(user)) {
      alert("Akses ditolak. Halaman ini hanya untuk Admin.");
      navigate("/users");
      return;
    }
    loadFormData();
  }, [userId, user, navigate, setValue]);

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
      <div className="add-user-page master-form-page">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="add-user-page master-form-page">
      <PageHeader
        heading="Edit Pengguna"
        subtitle="Perbarui detail akun tanpa membuka modul lain di luar data master."
        actions={
          <Button variant="secondary" onClick={() => navigate("/users")}>
            Batal
          </Button>
        }
      />

      <Card variant="surface-card" padding="xl" className="master-form-card">
        {error && (
          <div className="error-alert" style={{ marginBottom: "var(--spacing-md)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="user-form-grid">
          {/* Left Column */}
          <div>
            <Input
              label="Nama Lengkap"
              placeholder="Nama lengkap user"
              {...register("full_name")}
            />

            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register("email", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Format email tidak valid",
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
                Alamat
              </label>
              <textarea
                id="address"
                className="form-textarea"
                placeholder="Alamat lengkap"
                {...register("address")}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">
                Role
              </label>
              <select id="role" className="form-select" {...register("role")}>
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
                  className="form-select"
                  {...register("position_user")}
                >
                  <option value="">Pilih Position</option>
                  <option value="bidan_praktik">Bidan Praktik</option>
                  <option value="bidan_desa">Bidan Desa</option>
                  <option value="bidan_koordinator">Bidan Koordinator</option>
                </select>
                <small className="helper-text">
                  Position wajib untuk role USER.
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
                  className="form-select"
                  {...register("village_id")}
                >
                  <option value="">Pilih Desa</option>
                  {villages.map((village) => (
                    <option
                      key={village.village_id}
                      value={village.village_id}
                    >
                      {village.nama_desa}
                    </option>
                  ))}
                </select>
                <small className="helper-text">
                  Desa wajib untuk Bidan Desa.
                </small>
              </div>
            )}
          </div>

          <div className="info-box">
            <p className="info-title">Perhatian</p>
            <ul className="info-list">
              {noteItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Mengupdate User..." : "Update User"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditUser;
