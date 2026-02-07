import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { resetPasswordByAdmin, getUsers } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../App.css";

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
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Reset Password (Admin)</h2>
          <p className="text-muted">
            {targetUser
              ? `Reset password untuk: ${targetUser.full_name}`
              : "Reset user password"}
          </p>
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
            Cancel
          </button>
        </div>
      </div>

      <div
        className="auth-card"
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        {!isAdmin && (
          <div
            style={{
              background: "rgba(251, 191, 36, 0.2)",
              border: "1px solid rgba(251, 191, 36, 0.4)",
              color: "#fbbf24",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            ⚠️ Warning: This feature is intended for ADMIN users only.
          </div>
        )}

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="new_password">
              New Password
            </label>
            <input
              id="new_password"
              type="password"
              className="form-input"
              placeholder="Enter new password (min. 6 characters)"
              {...register("new_password", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.new_password && (
              <span className="error-message">
                {errors.new_password.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm_password">
              Confirm New Password
            </label>
            <input
              id="confirm_password"
              type="password"
              className="form-input"
              placeholder="Re-enter new password"
              {...register("confirm_password", {
                required: "Please confirm the password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
            />
            {errors.confirm_password && (
              <span className="error-message">
                {errors.confirm_password.message}
              </span>
            )}
          </div>

          <div style={{ marginTop: "2rem" }}>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </div>

          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <p style={{ fontSize: "0.875rem", margin: 0, color: "#fca5a5" }}>
              <strong>🔐 Admin Reset Password:</strong>
            </p>
            <ul
              style={{
                fontSize: "0.875rem",
                marginTop: "0.5rem",
                paddingLeft: "1.5rem",
                color: "#fca5a5",
              }}
            >
              <li>No old password required</li>
              <li>Use this when user forgets their password</li>
              <li>Minimum 6 characters</li>
              <li>Inform the user of their new password after reset</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
