import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, updateUserStatus } from "../services/api";
import { getPositionLabel } from "../utils/roleHelpers";
import "../App.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("User List Fetch Error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateUserStatus(userId, newStatus);
      await fetchUsers();
      alert(`Status user berhasil diubah menjadi ${newStatus}`);
    } catch (error) {
      console.error("Failed to update user status:", error);
      alert("Gagal mengubah status user");
    }
  };

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      const name = user.full_name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const position = getPositionLabel(user.position_user)?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        position.includes(keyword)
      );
    });
  }, [search, users]);

  const activeUsers = users.filter((item) => item.status_user === "ACTIVE").length;

  return (
    <div className="dashboard page-shell">
      <header
        className="dashboard-header"
        style={{ alignItems: "flex-start", gap: "1rem" }}
      >
        <div className="page-intro">
          <div className="page-kicker">Management</div>
          <h1 className="page-title" style={{ marginBottom: "0.15rem" }}>User</h1>
          <p className="page-subtitle">
            Kelola seluruh akun user dari satu halaman.
          </p>
        </div>
        <div className="page-actions">
          <button
            onClick={() => navigate("/")}
            className="btn-secondary"
          >
            Kembali ke Dashboard
          </button>
          <button
            onClick={() => navigate("/add-user")}
            className="btn-primary"
            style={{ width: "auto" }}
          >
            + Add User
          </button>
        </div>
      </header>

      <section style={{ marginBottom: "2rem" }}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total User</div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-note">akun terdaftar</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">User Aktif</div>
            <div className="stat-value">{activeUsers}</div>
            <div className="stat-note">siap digunakan</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Hasil Filter</div>
            <div className="stat-value">{filteredUsers.length}</div>
            <div className="stat-note">user tampil saat ini</div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h3 className="section-title">Daftar User</h3>
            <p className="section-subtitle">
              Cari berdasarkan nama, email, atau posisi.
            </p>
          </div>
          <div className="toolbar-search">
            <input
              type="text"
              className="form-input"
              placeholder="Cari user..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div
          className="auth-card table-shell"
        >
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>Memuat data user...</div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Nama</th>
                  <th>Email</th>
                  <th>Posisi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                      Tidak ada user yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id}>
                      <td style={{ textAlign: "left", fontWeight: 600 }}>
                        {user.full_name}
                      </td>
                      <td>{user.email}</td>
                      <td>{getPositionLabel(user.position_user)}</td>
                      <td>
                        <span
                          className={`status-badge status-${user.status_user}`}
                          style={{ fontSize: "0.68rem", padding: "0.28rem 0.58rem", marginTop: 0 }}
                        >
                          {user.status_user}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <button
                            onClick={() => navigate(`/users/${user.user_id}/leaves`)}
                            className="action-icon-btn"
                          >
                            Cuti
                          </button>
                          <button
                            onClick={() => navigate(`/edit-user/${user.user_id}`)}
                            className="action-icon-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleStatusToggle(user.user_id, user.status_user)
                            }
                            className="action-icon-btn"
                          >
                            {user.status_user === "ACTIVE" ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <style>{`
        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          min-width: 880px;
        }
        .dashboard-table th {
          background: rgba(255,255,255,0.05);
          padding: 1rem;
          color: var(--color-text-muted);
          font-weight: 600;
          text-align: left;
        }
        .dashboard-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          vertical-align: middle;
        }
        .dashboard-table tr:last-child td {
          border-bottom: none;
        }
        .dashboard-table tr:hover td {
          background: rgba(255,255,255,0.02);
        }
      `}</style>
    </div>
  );
};

export default UserList;
