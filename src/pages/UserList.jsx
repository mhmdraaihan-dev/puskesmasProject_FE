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
    <div className="dashboard" style={{ maxWidth: "1280px", paddingBottom: "3rem" }}>
      <header
        className="dashboard-header"
        style={{ alignItems: "flex-start", gap: "1rem" }}
      >
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>User</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Kelola seluruh akun user dari satu halaman.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/")}
            className="action-icon-btn"
            style={{ padding: "0.75rem 1rem" }}
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div style={summaryCardStyle}>
            <div style={summaryLabelStyle}>Total User</div>
            <div style={summaryValueStyle}>{users.length}</div>
            <div style={summaryNoteStyle}>akun terdaftar</div>
          </div>
          <div style={summaryCardStyle}>
            <div style={summaryLabelStyle}>User Aktif</div>
            <div style={summaryValueStyle}>{activeUsers}</div>
            <div style={summaryNoteStyle}>siap digunakan</div>
          </div>
          <div style={summaryCardStyle}>
            <div style={summaryLabelStyle}>Hasil Filter</div>
            <div style={summaryValueStyle}>{filteredUsers.length}</div>
            <div style={summaryNoteStyle}>user tampil saat ini</div>
          </div>
        </div>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h3 style={{ marginBottom: "0.35rem" }}>Daftar User</h3>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.92rem" }}>
              Cari berdasarkan nama, email, atau posisi.
            </p>
          </div>
          <div style={{ width: "100%", maxWidth: "320px" }}>
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
          className="auth-card"
          style={{
            padding: 0,
            maxWidth: "none",
            overflowX: "auto",
            borderRadius: "20px",
            boxShadow: "0 14px 38px rgba(0, 0, 0, 0.18)",
          }}
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
        .action-icon-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0.42rem 0.75rem;
          border-radius: 8px;
          transition: background 0.2s, border-color 0.2s;
          color: white;
          box-shadow: none;
        }
        .action-icon-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          transform: none;
        }
      `}</style>
    </div>
  );
};

const summaryCardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "18px",
  padding: "1.25rem",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
};

const summaryLabelStyle = {
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--color-text-muted)",
  marginBottom: "0.65rem",
  fontWeight: 700,
};

const summaryValueStyle = {
  fontSize: "2rem",
  lineHeight: 1,
  fontWeight: 700,
};

const summaryNoteStyle = {
  fontSize: "0.9rem",
  color: "var(--color-text-muted)",
  marginTop: "0.55rem",
};

export default UserList;
