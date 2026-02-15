import { useEffect, useState } from "react";
import { getUsers, updateUserStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  isAdmin,
  isBidanKoordinator,
  isBidanDesa,
  isBidanPraktik,
  getJenisDataLabel,
} from "../utils/roleHelpers";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminRole = isAdmin(user);
  const isKoord = isBidanKoordinator(user);
  const isDesa = isBidanDesa(user);
  const isPraktik = isBidanPraktik(user);

  const bidanRole = isKoord || isDesa || isPraktik;
  const verifierRole = isKoord || isDesa;
  const praktikRole = isPraktik;

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    if (!adminRole) return;
    setLoading(true);
    setErrorStatus(null);
    try {
      const results = await Promise.allSettled([getUsers()]);

      // Handle Users (Admin only)
      if (results[0]?.status === "fulfilled") {
        setUsers(results[0].value.data || []);
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateUserStatus(userId, newStatus);
      fetchAllData();
      alert(`Status user berhasil diubah menjadi ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Gagal mengubah status user");
    }
  };

  if (errorStatus === 403) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <button
            onClick={logout}
            className="btn-primary"
            style={{ width: "auto" }}
          >
            Logout
          </button>
        </header>
        <div
          className="auth-card"
          style={{
            textAlign: "center",
            padding: "4rem",
            border: "1px solid #ef4444",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🚫</div>
          <h2 style={{ color: "#ef4444" }}>Akses Terbatas</h2>
          <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
            Maaf, <strong>{user?.full_name}</strong>. Anda belum ditugaskan ke
            Desa atau Tempat Praktik manapun oleh Admin.
          </p>
          <p className="text-muted" style={{ marginTop: "0.5rem" }}>
            Silakan hubungi administrator puskesmas untuk melakukan aktivasi
            wilayah tugas Anda agar dapat mengakses data kesehatan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Selamat datang, {user?.full_name}</p>
        </div>
        <div className="header-user-info">
          <div style={{ textAlign: "right", marginRight: "1rem" }}>
            <div style={{ fontWeight: "bold" }}>{user?.email}</div>
            <div
              className="role-badge"
              style={{ fontSize: "0.7rem", marginTop: "2px" }}
            >
              {user?.position_user?.replace("_", " ").toUpperCase()}
            </div>
          </div>
          <button
            onClick={logout}
            className="btn-primary"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid var(--glass-border)",
              width: "auto",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Quick Navigation Menu */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Navigasi Cepat</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {bidanRole && (
            <button
              onClick={() => navigate("/pasien")}
              className="dashboard-nav-card pink"
            >
              <div className="icon">👥</div>
              <h4>Data Pasien</h4>
              <p>Master & Riwayat Medis</p>
            </button>
          )}

          {adminRole && (
            <>
              <button
                onClick={() => navigate("/villages")}
                className="dashboard-nav-card blue"
              >
                <div className="icon">🏘️</div>
                <h4>Manajemen Desa</h4>
                <p>Kelola data wilayah</p>
              </button>
              <button
                onClick={() => navigate("/practice-places")}
                className="dashboard-nav-card purple"
              >
                <div className="icon">🏥</div>
                <h4>Tempat Praktik</h4>
                <p>Kelola tempat praktik</p>
              </button>
            </>
          )}

          {bidanRole && (
            <>
              <button
                onClick={() => navigate("/pemeriksaan-kehamilan")}
                className="dashboard-nav-card pink"
              >
                <div className="icon">🤰</div>
                <h4>Kehamilan</h4>
                <p>Input & List Kehamilan</p>
              </button>
              <button
                onClick={() => navigate("/persalinan")}
                className="dashboard-nav-card orange"
              >
                <div className="icon">👶</div>
                <h4>Persalinan</h4>
                <p>Input & List Persalinan</p>
              </button>
              <button
                onClick={() => navigate("/keluarga-berencana")}
                className="dashboard-nav-card cyan"
              >
                <div className="icon">💊</div>
                <h4>KB</h4>
                <p>Input & List KB</p>
              </button>
              <button
                onClick={() => navigate("/imunisasi")}
                className="dashboard-nav-card violet"
              >
                <div className="icon">💉</div>
                <h4>Imunisasi</h4>
                <p>Input & List Imunisasi</p>
              </button>
            </>
          )}

          {verifierRole && (
            <button
              onClick={() => navigate("/verification/pending")}
              className="dashboard-nav-card yellow"
            >
              <div className="icon">✓</div>
              <h4>Verifikasi</h4>
              <p>Task Menunggu Persetujuan</p>
            </button>
          )}

          {praktikRole && (
            <button
              onClick={() => navigate("/revision/rejected")}
              className="dashboard-nav-card red"
            >
              <div className="icon">🔄</div>
              <h4>Revisi</h4>
              <p>Data Perlu Perbaikan</p>
            </button>
          )}

          {isKoord && (
            <button
              onClick={() => navigate("/rekapitulasi")}
              className="dashboard-nav-card green"
              style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}
            >
              <div className="icon">📊</div>
              <h4>Rekapitulasi</h4>
              <p>Laporan Data Pelayanan</p>
            </button>
          )}
        </div>
      </div>
      {/* User Management Section - Only Admin */}
      {adminRole && (
        <div className="admin-section" style={{ marginTop: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3>Manajemen Akses User</h3>
            <button
              onClick={() => navigate("/add-user")}
              className="btn-primary"
              style={{
                width: "auto",
                padding: "0.5rem 1rem",
                fontSize: "0.8rem",
              }}
            >
              + Add User
            </button>
          </div>
          <div
            className="auth-card"
            style={{ padding: 0, overflowX: "auto", maxWidth: "none" }}
          >
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Nama</th>
                  <th>Posisi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map((u) => (
                  <tr key={u.user_id}>
                    <td style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: "500" }}>{u.full_name}</div>
                      <div
                        style={{ fontSize: "0.7rem" }}
                        className="text-muted"
                      >
                        {u.email}
                      </div>
                    </td>
                    <td>{u.position_user?.replace("_", " ")}</td>
                    <td>
                      <span
                        className={`status-badge status-${u.status_user}`}
                        style={{
                          fontSize: "0.65rem",
                          padding: "0.2rem 0.5rem",
                        }}
                      >
                        {u.status_user}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => navigate(`/edit-user/${u.user_id}`)}
                          className="action-icon-btn"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            handleStatusToggle(u.user_id, u.status_user)
                          }
                          className="action-icon-btn"
                          title={
                            u.status_user === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          {u.status_user === "ACTIVE" ? "❌" : "✅"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length > 10 && (
              <div
                style={{
                  padding: "0.75rem",
                  textAlign: "center",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <p
                  className="text-muted"
                  style={{ fontSize: "0.8rem", margin: 0 }}
                >
                  Dan {users.length - 10} user lainnya...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Styles for the new components (to be added to App.css if not exists) */}
      <style>{`
        .dashboard-nav-card {
          padding: 1.25rem;
          text-align: left;
          cursor: pointer;
          border-radius: 1rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.03);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .dashboard-nav-card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }
        .dashboard-nav-card .icon { fontSize: 1.75rem; margin-bottom: 0.5rem; }
        .dashboard-nav-card h4 { margin: 0; font-size: 1rem; }
        .dashboard-nav-card p { margin: 0; font-size: 0.75rem; color: var(--text-muted); }
        
        .dashboard-nav-card.pink { border-color: rgba(236, 72, 153, 0.3); }
        .dashboard-nav-card.pink:hover { box-shadow: 0 0 15px rgba(236, 72, 153, 0.2); }
        
        .dashboard-nav-card.blue { border-color: rgba(59, 130, 246, 0.3); }
        .dashboard-nav-card.blue:hover { box-shadow: 0 0 15px rgba(59, 130, 246, 0.2); }
        
        .dashboard-nav-card.purple { border-color: rgba(168, 85, 247, 0.3); }
        .dashboard-nav-card.purple:hover { box-shadow: 0 0 15px rgba(168, 85, 247, 0.2); }
        
        .dashboard-nav-card.orange { border-color: rgba(249, 115, 22, 0.3); }
        .dashboard-nav-card.orange:hover { box-shadow: 0 0 15px rgba(249, 115, 22, 0.2); }
        
        .dashboard-nav-card.cyan { border-color: rgba(6, 182, 212, 0.3); }
        .dashboard-nav-card.cyan:hover { box-shadow: 0 0 15px rgba(6, 182, 212, 0.2); }
        
        .dashboard-nav-card.violet { border-color: rgba(139, 92, 246, 0.3); }
        .dashboard-nav-card.violet:hover { box-shadow: 0 0 15px rgba(139, 92, 246, 0.2); }

        .dashboard-nav-card.yellow { border-color: rgba(251, 191, 36, 0.3); }
        .dashboard-nav-card.yellow:hover { box-shadow: 0 0 15px rgba(251, 191, 36, 0.2); }

        .dashboard-nav-card.red { border-color: rgba(239, 68, 68, 0.3); }
        .dashboard-nav-card.red:hover { box-shadow: 0 0 15px rgba(239, 68, 68, 0.2); }
        
        .dashboard-nav-card.green:hover { box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          min-width: 800px;
        }
        .dashboard-table th {
          background: rgba(255,255,255,0.05);
          padding: 1rem;
          color: var(--text-muted);
          font-weight: 500;
          text-align: left;
        }
        .dashboard-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          vertical-align: middle;
        }
        .dashboard-table tr:last-child td { border-bottom: none; }
        .dashboard-table tr:hover td { background: rgba(255,255,255,0.02); }

        .action-icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .action-icon-btn:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default Dashboard;
