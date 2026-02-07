import { useEffect, useState } from "react";
import { getUsers, updateUserStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      // Backend response structure: { success: true, data: [...] }
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("Invalid response format:", response);
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateUserStatus(userId, newStatus);
      // Refresh user list after status update
      await fetchUsers();
      alert(`Status user berhasil diubah menjadi ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Gagal mengubah status user");
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.full_name}</p>
        </div>
        <div className="header-user-info">
          <span>{user?.email}</span>
          <button
            onClick={logout}
            className="btn-primary"
            style={{
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--glass-border)",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Quick Navigation Menu */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Menu Utama</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Villages - All users can view */}
          <button
            onClick={() => navigate("/villages")}
            className="auth-card"
            style={{
              padding: "1.5rem",
              textAlign: "left",
              cursor: "pointer",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏘️</div>
            <h4 style={{ marginBottom: "0.25rem" }}>Manajemen Desa</h4>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Kelola data desa
            </p>
          </button>

          {/* Practice Places - All users can view */}
          <button
            onClick={() => navigate("/practice-places")}
            className="auth-card"
            style={{
              padding: "1.5rem",
              textAlign: "left",
              cursor: "pointer",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05))",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏥</div>
            <h4 style={{ marginBottom: "0.25rem" }}>Tempat Praktik</h4>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Kelola tempat praktik bidan
            </p>
          </button>

          {/* Health Data - All users */}
          <button
            onClick={() => navigate("/health-data")}
            className="auth-card"
            style={{
              padding: "1.5rem",
              textAlign: "left",
              cursor: "pointer",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              background:
                "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
            <h4 style={{ marginBottom: "0.25rem" }}>Data Kesehatan</h4>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Kelola data kesehatan pasien
            </p>
          </button>

          {/* Verification - Bidan Desa only */}
          {user?.position_user === "bidan_desa" && (
            <button
              onClick={() => navigate("/verification/pending")}
              className="auth-card"
              style={{
                padding: "1.5rem",
                textAlign: "left",
                cursor: "pointer",
                border: "1px solid rgba(251, 191, 36, 0.3)",
                background:
                  "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
              <h4 style={{ marginBottom: "0.25rem" }}>Verifikasi Data</h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                Data menunggu verifikasi
              </p>
            </button>
          )}

          {/* Revision - Bidan Praktik only */}
          {user?.position_user === "bidan_praktik" && (
            <button
              onClick={() => navigate("/revision/rejected")}
              className="auth-card"
              style={{
                padding: "1.5rem",
                textAlign: "left",
                cursor: "pointer",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔄</div>
              <h4 style={{ marginBottom: "0.25rem" }}>Data Ditolak</h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                Data yang perlu direvisi
              </p>
            </button>
          )}
        </div>
      </div>

      {/* User Management Section */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div className="stats-container">
          <h3>User Management</h3>
          <p className="text-muted">Total Users: {users.length}</p>
        </div>
        <button
          onClick={() => navigate("/add-user")}
          className="btn-primary"
          style={{ width: "auto" }}
        >
          + Add New User
        </button>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="user-grid">
          {users.map((u) => (
            <div key={u.user_id} className="user-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <h4 style={{ margin: 0 }}>{u.full_name}</h4>
                <span className={`status-badge status-${u.status_user}`}>
                  {u.status_user}
                </span>
              </div>

              <div style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
                <p className="text-muted" style={{ marginBottom: "0.5rem" }}>
                  <span style={{ display: "inline-block", width: "20px" }}>
                    📧
                  </span>{" "}
                  {u.email}
                </p>
                <p className="text-muted" style={{ marginBottom: "0.5rem" }}>
                  <span style={{ display: "inline-block", width: "20px" }}>
                    📍
                  </span>{" "}
                  {u.address}
                </p>
                <p className="text-muted" style={{ marginBottom: "0.5rem" }}>
                  <span style={{ display: "inline-block", width: "20px" }}>
                    💼
                  </span>{" "}
                  {u.position_user?.replace("_", " ") || "-"}
                </p>
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <span className="role-badge">{u.role}</span>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <button
                    onClick={() => navigate(`/edit-user/${u.user_id}`)}
                    className="btn-primary"
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.75rem",
                      width: "auto",
                      backgroundColor: "rgba(59, 130, 246, 0.3)",
                      border: "1px solid #60a5fa",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/change-password/${u.user_id}`)}
                    className="btn-primary"
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.75rem",
                      width: "auto",
                      backgroundColor: "rgba(168, 85, 247, 0.3)",
                      border: "1px solid #a855f7",
                    }}
                  >
                    🔒 Password
                  </button>
                  <button
                    onClick={() => navigate(`/reset-password/${u.user_id}`)}
                    className="btn-primary"
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.75rem",
                      width: "auto",
                      backgroundColor: "rgba(251, 191, 36, 0.3)",
                      border: "1px solid #fbbf24",
                    }}
                  >
                    🔓 Reset
                  </button>
                  <button
                    onClick={() => handleStatusToggle(u.user_id, u.status_user)}
                    className="btn-primary"
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.75rem",
                      width: "auto",
                      backgroundColor:
                        u.status_user === "ACTIVE"
                          ? "rgba(239, 68, 68, 0.3)"
                          : "rgba(16, 185, 129, 0.3)",
                      border: `1px solid ${u.status_user === "ACTIVE" ? "#f87171" : "#34d399"}`,
                    }}
                  >
                    {u.status_user === "ACTIVE" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
