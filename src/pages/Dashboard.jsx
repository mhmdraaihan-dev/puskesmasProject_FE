import { useEffect, useState } from "react";
import {
  getUsers,
  updateUserStatus,
  getKehamilanList,
  getPersalinanList,
  getKBList,
  getImunisasiList,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  isAdmin,
  isBidanKoordinator,
  isBidanDesa,
  isBidanPraktik,
} from "../utils/roleHelpers";
import { formatDate } from "../utils/dateFormatter";
import "../App.css";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationRows, setVerificationRows] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminRole = isAdmin(user);
  const isKoord = isBidanKoordinator(user);
  const isDesa = isBidanDesa(user);
  const isPraktik = isBidanPraktik(user);

  const verifierRole = isKoord || isDesa;
  const praktikRole = isPraktik;
  const canSeePasienCard = isPraktik || isKoord;
  const canSeePelayananCards = isPraktik || isKoord;

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      if (adminRole) {
        const response = await getUsers();
        setUsers(response.data || []);
      }

      if (verifierRole) {
        await fetchVerificationRows();
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationRows = async () => {
    setVerificationLoading(true);

    try {
      const params = { status_verifikasi: "PENDING" };
      const [kehamilan, persalinan, kb, imunisasi] = await Promise.all([
        getKehamilanList(params),
        getPersalinanList(params),
        getKBList(params),
        getImunisasiList(params),
      ]);

      const rows = [
        ...(kehamilan?.data || []).map((item) => ({
          id: item.id,
          module: "Kehamilan",
          patientName: item.pasien?.nama || "-",
          date: item.tanggal,
          village: item.practice_place?.village?.nama_desa || "-",
          practice: item.practice_place?.nama_praktik || "-",
        })),
        ...(persalinan?.data || []).map((item) => ({
          id: item.id,
          module: "Persalinan",
          patientName: item.pasien?.nama || "-",
          date: item.tanggal || item.tanggal_partus,
          village: item.practice_place?.village?.nama_desa || "-",
          practice: item.practice_place?.nama_praktik || "-",
        })),
        ...(kb?.data || []).map((item) => ({
          id: item.id,
          module: "KB",
          patientName: item.pasien?.nama || "-",
          date: item.tanggal_kunjungan || item.tanggal,
          village: item.practice_place?.village?.nama_desa || "-",
          practice: item.practice_place?.nama_praktik || "-",
        })),
        ...(imunisasi?.data || []).map((item) => ({
          id: item.id,
          module: "Imunisasi",
          patientName: item.pasien?.nama || "-",
          date: item.tgl_imunisasi || item.tanggal,
          village: item.practice_place?.village?.nama_desa || "-",
          practice: item.practice_place?.nama_praktik || "-",
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setVerificationRows(rows);
    } catch (error) {
      console.error("Verification Fetch Error:", error);
      setVerificationRows([]);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateUserStatus(userId, newStatus);
      await fetchDashboardData();
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

      <div style={{ marginBottom: "2.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Navigasi Cepat</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {canSeePasienCard && (
            <button
              onClick={() => navigate("/pasien")}
              className="dashboard-nav-card pink"
            >
              <div className="icon">Data</div>
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
                <div className="icon">Desa</div>
                <h4>Manajemen Desa</h4>
                <p>Kelola data wilayah</p>
              </button>
              <button
                onClick={() => navigate("/practice-places")}
                className="dashboard-nav-card purple"
              >
                <div className="icon">Praktik</div>
                <h4>Tempat Praktik</h4>
                <p>Kelola tempat praktik</p>
              </button>
            </>
          )}

          {canSeePelayananCards && (
            <>
              <button
                onClick={() => navigate("/pemeriksaan-kehamilan")}
                className="dashboard-nav-card pink"
              >
                <div className="icon">ANC</div>
                <h4>Kehamilan</h4>
                <p>{isPraktik ? "Input & List Kehamilan" : "Lihat Data Kehamilan"}</p>
              </button>
              <button
                onClick={() => navigate("/persalinan")}
                className="dashboard-nav-card orange"
              >
                <div className="icon">Lahir</div>
                <h4>Persalinan</h4>
                <p>{isPraktik ? "Input & List Persalinan" : "Lihat Data Persalinan"}</p>
              </button>
              <button
                onClick={() => navigate("/keluarga-berencana")}
                className="dashboard-nav-card cyan"
              >
                <div className="icon">KB</div>
                <h4>KB</h4>
                <p>{isPraktik ? "Input & List KB" : "Lihat Data KB"}</p>
              </button>
              <button
                onClick={() => navigate("/imunisasi")}
                className="dashboard-nav-card violet"
              >
                <div className="icon">Imun</div>
                <h4>Imunisasi</h4>
                <p>{isPraktik ? "Input & List Imunisasi" : "Lihat Data Imunisasi"}</p>
              </button>
            </>
          )}

          {verifierRole && (
            <button
              onClick={() => navigate("/verification/pending")}
              className="dashboard-nav-card yellow"
            >
              <div className="icon">Verif</div>
              <h4>Verifikasi</h4>
              <p>Task Menunggu Persetujuan</p>
            </button>
          )}

          {praktikRole && (
            <button
              onClick={() => navigate("/revision/rejected")}
              className="dashboard-nav-card red"
            >
              <div className="icon">Rev</div>
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
              <div className="icon">Rekap</div>
              <h4>Rekapitulasi</h4>
              <p>Laporan Data Pelayanan</p>
            </button>
          )}
        </div>
      </div>

      {verifierRole && (
        <div className="admin-section" style={{ marginTop: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3>Data Verifikasi</h3>
            <button
              onClick={() => navigate("/verification/pending")}
              className="btn-primary"
              style={{
                width: "auto",
                padding: "0.5rem 1rem",
                fontSize: "0.8rem",
              }}
            >
              Lihat Semua
            </button>
          </div>
          <div
            className="auth-card"
            style={{ padding: 0, overflowX: "auto", maxWidth: "none" }}
          >
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Pasien</th>
                  <th>Modul</th>
                  <th>Tanggal</th>
                  <th>Desa</th>
                  <th>Tempat Praktik</th>
                </tr>
              </thead>
              <tbody>
                {verificationLoading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                      Memuat data verifikasi...
                    </td>
                  </tr>
                ) : verificationRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                      Belum ada data yang menunggu verifikasi
                    </td>
                  </tr>
                ) : (
                  verificationRows.slice(0, 10).map((row) => (
                    <tr key={`${row.module}-${row.id}`}>
                      <td style={{ textAlign: "left" }}>{row.patientName}</td>
                      <td>{row.module}</td>
                      <td>{formatDate(row.date)}</td>
                      <td>{row.village}</td>
                      <td>{row.practice}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                Memuat data user...
              </div>
            ) : (
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
                            Edit
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
                            {u.status_user === "ACTIVE" ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && users.length > 10 && (
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
        .dashboard-nav-card .icon {
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }
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
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          transition: background 0.2s;
          color: white;
        }
        .action-icon-btn:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default Dashboard;
