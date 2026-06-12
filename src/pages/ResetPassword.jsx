import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { resetPasswordByAdmin, getUsers } from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import "../styles/design-system.css";
import "./ChangePassword.css";

const ResetPassword = () => {
  const { userId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  // Fetch target user info on mount
  useState(() => {
    const fetchUser = async () => {
      try {
        const response = await getUsers();
        // Backend response structure: { success: true, data: [...] }
        const users =
          response.success && Array.isArray(response.data) ? response.data : [];
        const user = users.find((u) => u.user_id === userId);
        if (user) {
          setTargetUser(user);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, [userId]);

  const newPassword = watch("new_password");

  const onSubmit = async (data) => {
    setError("");

    // Validate password length
    if (data.new_password.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    // Validate password confirmation
    if (data.new_password !== data.confirm_password) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordByAdmin(userId, data.new_password);
      alert(
        `Password untuk ${targetUser?.full_name || "user"} berhasil direset!`,
      );
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mereset password. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is admin (optional, for UI only)
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="change-password-page">
      <PageHeader
        heading={`Reset Password - ${targetUser?.full_name || "User"}`}
        actions={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Batal
          </Button>
        }
      />

      <div className="password-form-container">
        <Card variant="surface-dark" padding="xl">
          {!isAdmin && (
            <div
              className="warning-alert"
              style={{
                marginBottom: "var(--spacing-5)",
                padding: "var(--spacing-4)",
                background: "rgba(212, 160, 23, 0.15)",
                border: "1px solid var(--color-warning)",
                borderRadius: "var(--border-radius-md)",
                color: "var(--color-warning)",
              }}
            >
              ⚠️ Peringatan: Fitur ini hanya untuk ADMIN.
            </div>
          )}

          {error && (
            <div
              className="error-alert"
              style={{ marginBottom: "var(--spacing-5)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Password Baru"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              error={errors.new_password?.message}
              {...register("new_password", {
                required: "Password baru wajib diisi",
                minLength: {
                  value: 6,
                  message: "Password minimal 6 karakter",
                },
              })}
            />

            <Input
              label="Konfirmasi Password Baru"
              type="password"
              required
              placeholder="Ulangi password baru"
              error={errors.confirm_password?.message}
              {...register("confirm_password", {
                required: "Konfirmasi password wajib diisi",
                validate: (value) =>
                  value === newPassword || "Password tidak cocok",
              })}
            />

            <div
              className="info-box"
              style={{
                marginTop: "var(--spacing-5)",
                background: "rgba(198, 69, 69, 0.1)",
                border: "1px solid rgba(198, 69, 69, 0.3)",
              }}
            >
              <p className="info-title" style={{ color: "var(--color-error)" }}>
                🔐 Admin Reset Password
              </p>
              <ul
                className="info-list"
                style={{ color: "var(--color-text-primary-dark)" }}
              >
                <li>Tidak memerlukan password lama</li>
                <li>Gunakan ketika user lupa password</li>
                <li>Minimal 6 karakter</li>
                <li>Informasikan password baru kepada user setelah reset</li>
              </ul>
            </div>

            <div style={{ marginTop: "var(--spacing-5)" }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Mereset Password..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
