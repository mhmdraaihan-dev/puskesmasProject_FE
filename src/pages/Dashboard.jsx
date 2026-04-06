import { useEffect, useMemo, useState } from "react";
import {
  getUsers,
  updateUserStatus,
  getKehamilanList,
  getPersalinanList,
  getKBList,
  getImunisasiList,
  getPasienList,
  getPracticePlaces,
  getVillages,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getPositionLabel,
  isAdmin,
  isBidanKoordinator,
  isBidanDesa,
  isBidanPraktik,
} from "../utils/roleHelpers";
import { formatDate } from "../utils/dateFormatter";
import ConfirmDialog from "../components/ConfirmDialog";
import "../App.css";

const normalizeModuleRows = (responses) => {
  const [kehamilan, persalinan, kb, imunisasi] = responses;

  return [
    ...(kehamilan?.data || []).map((item) => ({
      id: item.id,
      module: "Kehamilan",
      patientName: item.pasien?.nama || "-",
      date: item.tanggal,
      village: item.practice_place?.village?.nama_desa || "-",
      practice: item.practice_place?.nama_praktik || "-",
      status: item.status_verifikasi || "-",
      route: `/pemeriksaan-kehamilan/${item.id}`,
    })),
    ...(persalinan?.data || []).map((item) => ({
      id: item.id,
      module: "Persalinan",
      patientName: item.pasien?.nama || "-",
      date: item.tanggal || item.tanggal_partus,
      village: item.practice_place?.village?.nama_desa || "-",
      practice: item.practice_place?.nama_praktik || "-",
      status: item.status_verifikasi || "-",
      route: `/persalinan/${item.id}`,
    })),
    ...(kb?.data || []).map((item) => ({
      id: item.id,
      module: "KB",
      patientName: item.pasien?.nama || "-",
      date: item.tanggal_kunjungan || item.tanggal,
      village: item.practice_place?.village?.nama_desa || "-",
      practice: item.practice_place?.nama_praktik || "-",
      status: item.status_verifikasi || "-",
      route: `/keluarga-berencana/${item.id}`,
    })),
    ...(imunisasi?.data || []).map((item) => ({
      id: item.id,
      module: "Imunisasi",
      patientName: item.pasien?.nama || "-",
      date: item.tgl_imunisasi || item.tanggal,
      village: item.practice_place?.village?.nama_desa || "-",
      practice: item.practice_place?.nama_praktik || "-",
      status: item.status_verifikasi || "-",
      route: `/imunisasi/${item.id}`,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
};

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationRows, setVerificationRows] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [praktikRows, setPraktikRows] = useState([]);
  const [praktikLoading, setPraktikLoading] = useState(false);
  const [adminStats, setAdminStats] = useState({
    villages: 0,
    practicePlaces: 0,
  });
  const [praktikStats, setPraktikStats] = useState({
    pasien: 0,
    pending: 0,
    rejected: 0,
    totalPelayanan: 0,
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminRole = isAdmin(user);
  const isKoord = isBidanKoordinator(user);
  const isDesa = isBidanDesa(user);
  const isPraktik = isBidanPraktik(user);

  const verifierRole = isKoord || isDesa;
  const canSeePasienCard = isPraktik || isKoord;
  const canSeePelayananCards = isPraktik || isKoord;

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const tasks = [];

      if (adminRole) {
        tasks.push(fetchAdminStats());
      }

      if (verifierRole) {
        tasks.push(fetchVerificationRows());
      }

      if (isPraktik) {
        tasks.push(fetchPraktikRows());
      }

      await Promise.all(tasks);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const [userResponse, villageResponse, practiceResponse] = await Promise.all([
        getUsers(),
        getVillages(),
        getPracticePlaces(),
      ]);

      setUsers(userResponse.data || []);
      setAdminStats({
        villages: (villageResponse.data || []).length,
        practicePlaces: (practiceResponse.data || []).length,
      });
    } catch (error) {
      console.error("Admin Stats Fetch Error:", error);
      setUsers([]);
      setAdminStats({
        villages: 0,
        practicePlaces: 0,
      });
    }
  };

  const fetchVerificationRows = async () => {
    setVerificationLoading(true);

    try {
      const params = { status_verifikasi: "PENDING" };
      const responses = await Promise.all([
        getKehamilanList(params),
        getPersalinanList(params),
        getKBList(params),
        getImunisasiList(params),
      ]);

      setVerificationRows(normalizeModuleRows(responses));
    } catch (error) {
      console.error("Verification Fetch Error:", error);
      setVerificationRows([]);
    } finally {
      setVerificationLoading(false);
    }
  };

  const fetchPraktikRows = async () => {
    setPraktikLoading(true);

    try {
      const [pasienResponse, ...responses] = await Promise.all([
        getPasienList(),
        getKehamilanList(),
        getPersalinanList(),
        getKBList(),
        getImunisasiList(),
      ]);

      const rows = normalizeModuleRows(responses);
      setPraktikRows(rows);
      setPraktikStats({
        pasien: (pasienResponse.data || []).length,
        pending: rows.filter((row) => row.status === "PENDING").length,
        rejected: rows.filter((row) => row.status === "REJECTED").length,
        totalPelayanan: rows.length,
      });
    } catch (error) {
      console.error("Praktik Rows Fetch Error:", error);
      setPraktikRows([]);
      setPraktikStats({
        pasien: 0,
        pending: 0,
        rejected: 0,
        totalPelayanan: 0,
      });
    } finally {
      setPraktikLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateUserStatus(userId, newStatus);
      await fetchAdminStats();
      alert(`Status user berhasil diubah menjadi ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Gagal mengubah status user");
    }
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  const summaryCards = useMemo(() => {
    if (adminRole) {
      const activeUsers = users.filter((item) => item.status_user === "ACTIVE").length;
      return [
        { label: "Total User", value: users.length, note: "akun terdaftar" },
        { label: "User Aktif", value: activeUsers, note: "siap digunakan" },
        { label: "Total Desa", value: adminStats.villages, note: "wilayah aktif" },
        {
          label: "Tempat Praktik",
          value: adminStats.practicePlaces,
          note: "lokasi terdaftar",
        },
      ];
    }

    if (verifierRole) {
      return [
        {
          label: "Perlu Verifikasi",
          value: verificationRows.length,
          note: isKoord ? "lintas desa" : "antrian aktif",
        },
        {
          label: "Kehamilan",
          value: verificationRows.filter((row) => row.module === "Kehamilan").length,
          note: "data pending",
        },
        {
          label: "Persalinan",
          value: verificationRows.filter((row) => row.module === "Persalinan").length,
          note: "data pending",
        },
        {
          label: "KB + Imunisasi",
          value: verificationRows.filter(
            (row) => row.module === "KB" || row.module === "Imunisasi",
          ).length,
          note: "perlu review",
        },
      ];
    }

    if (isPraktik) {
      return [
        { label: "Total Pasien", value: praktikStats.pasien, note: "pasien aktif" },
        {
          label: "Pelayanan",
          value: praktikStats.totalPelayanan,
          note: "semua modul",
        },
        {
          label: "Pending",
          value: praktikStats.pending,
          note: "menunggu verifikasi",
        },
        {
          label: "Revisi",
          value: praktikStats.rejected,
          note: "perlu diperbaiki",
        },
      ];
    }

    return [];
  }, [adminRole, adminStats.practicePlaces, adminStats.villages, isKoord, isPraktik, users, verificationRows, verifierRole, praktikStats]);

  return (
    <div className="dashboard" style={{ maxWidth: "1280px", paddingBottom: "3rem" }}>
      <header
        className="dashboard-header"
        style={{ alignItems: "flex-start", gap: "1.5rem" }}
      >
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>Dashboard</h1>
          <p className="text-muted" style={{ margin: 0, fontSize: "1rem" }}>
            Selamat datang, {user?.full_name}
          </p>
        </div>
        <div
          className="header-user-info"
          style={{ marginLeft: "auto", alignItems: "flex-start", gap: "0.75rem" }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              {user?.full_name}
            </div>
            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
              {user?.email}
            </div>
            <div
              className="role-badge"
              style={{
                fontSize: "0.72rem",
                marginTop: "0.55rem",
                marginLeft: 0,
                borderRadius: "999px",
                padding: "0.4rem 0.85rem",
                display: "inline-flex",
              }}
            >
              {getPositionLabel(user?.position_user) || "Admin"}
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="btn-primary"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid var(--glass-border)",
              width: "auto",
              padding: "0.8rem 1.1rem",
              boxShadow: "none",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {summaryCards.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ marginBottom: "0.35rem", fontSize: "1.1rem" }}>
              Ringkasan
            </h3>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.92rem" }}>
              Blok ringkas untuk melihat kondisi utama tanpa buka halaman lain.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "1rem",
            }}
          >
            {summaryCards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "18px",
                  padding: "1.25rem",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.65rem",
                    fontWeight: 700,
                  }}
                >
                  {card.label}
                </div>
                <div style={{ fontSize: "2rem", lineHeight: 1, fontWeight: 700 }}>
                  {card.value}
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--color-text-muted)",
                    marginTop: "0.55rem",
                  }}
                >
                  {card.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ marginBottom: "0.35rem", fontSize: "1.1rem" }}>
            Navigasi Cepat
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: "0.92rem" }}>
            Menu utama disusun sesuai hak akses masing-masing role.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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

          {isPraktik && (
            <button
              onClick={() => navigate("/revision/rejected")}
              className="dashboard-nav-card red"
            >
              <div className="icon">Rev</div>
              <h4>Revisi</h4>
              <p>Data perlu perbaikan</p>
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
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h3 style={{ marginBottom: "0.35rem" }}>Antrian Verifikasi</h3>
              <p
                className="text-muted"
                style={{ margin: 0, fontSize: "0.92rem" }}
              >
                Preview data `PENDING` terbaru dari empat modul pelayanan.
              </p>
            </div>
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
            style={{
              padding: 0,
              overflowX: "auto",
              maxWidth: "none",
              borderRadius: "20px",
              boxShadow: "0 14px 38px rgba(0, 0, 0, 0.18)",
            }}
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
                  verificationRows.slice(0, 8).map((row) => (
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
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h3 style={{ marginBottom: "0.35rem" }}>Manajemen Akses User</h3>
              <p
                className="text-muted"
                style={{ margin: 0, fontSize: "0.92rem" }}
              >
                Preview user terbaru. Kelola penuh tetap dilakukan dari halaman user.
              </p>
            </div>
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
            style={{
              padding: 0,
              overflowX: "auto",
              maxWidth: "none",
              borderRadius: "20px",
              boxShadow: "0 14px 38px rgba(0, 0, 0, 0.18)",
            }}
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
                  {users.slice(0, 6).map((u) => (
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
                      <td>{getPositionLabel(u.position_user)}</td>
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

            {!loading && users.length > 6 && (
              <div
                style={{
                  padding: "0.9rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <p className="text-muted" style={{ margin: 0, fontSize: "0.8rem" }}>
                  Dan {users.length - 6} user lainnya...
                </p>
                <button
                  className="action-icon-btn"
                  onClick={() => navigate("/users")}
                >
                  Lihat Semua
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isPraktik && (
        <div className="admin-section" style={{ marginTop: "2.5rem" }}>
          <div
            className="dashboard-praktik-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(260px, 0.9fr) minmax(0, 1.4fr)",
              gap: "1rem",
            }}
          >
            <div
              className="auth-card"
              style={{
                maxWidth: "none",
                borderRadius: "20px",
                boxShadow: "0 14px 38px rgba(0, 0, 0, 0.18)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                  fontWeight: 700,
                }}
              >
                Tindak Lanjut
              </div>
              <h3 style={{ marginBottom: "1rem" }}>Fokus Hari Ini</h3>
              <div style={{ display: "grid", gap: "0.8rem" }}>
                <button
                  type="button"
                  onClick={() => navigate("/revision/rejected")}
                  style={praktikMetricButtonStyle}
                >
                  <span>Data perlu revisi</span>
                  <strong>{praktikStats.rejected}</strong>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/pemeriksaan-kehamilan")}
                  style={praktikMetricButtonStyle}
                >
                  <span>Data menunggu verifikasi</span>
                  <strong>{praktikStats.pending}</strong>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/pasien")}
                  style={praktikMetricButtonStyle}
                >
                  <span>Total pasien aktif</span>
                  <strong>{praktikStats.pasien}</strong>
                </button>
              </div>
            </div>

            <div
              className="auth-card"
              style={{
                maxWidth: "none",
                borderRadius: "20px",
                boxShadow: "0 14px 38px rgba(0, 0, 0, 0.18)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.35rem",
                  fontWeight: 700,
                }}
              >
                Riwayat
              </div>
              <h3 style={{ marginBottom: "1rem" }}>Entri Terbaru</h3>

              {praktikLoading ? (
                <div className="text-muted">Memuat aktivitas...</div>
              ) : praktikRows.length === 0 ? (
                <div className="text-muted">
                  Belum ada aktivitas pelayanan yang tercatat.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {praktikRows.slice(0, 6).map((row) => (
                    <button
                      key={`${row.module}-${row.id}`}
                      type="button"
                      onClick={() => navigate(row.route)}
                      style={praktikTimelineButtonStyle}
                    >
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                          {row.patientName}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {row.module} | {formatDate(row.date)}
                        </div>
                      </div>
                      <span
                        className={`status-badge status-${row.status}`}
                        style={{
                          fontSize: "0.68rem",
                          padding: "0.28rem 0.58rem",
                          marginTop: 0,
                        }}
                      >
                        {row.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-nav-card {
          min-height: 138px;
          padding: 1.25rem;
          text-align: left;
          cursor: pointer;
          border-radius: 1rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.25rem;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.03);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
        }
        .dashboard-nav-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.16);
        }
        .dashboard-nav-card .icon {
          font-size: 0.8rem;
          margin-bottom: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-text-muted);
          font-weight: 700;
        }
        .dashboard-nav-card h4 { margin: 0; font-size: 1.5rem; line-height: 1.1; }
        .dashboard-nav-card p { margin: 0; font-size: 0.88rem; color: var(--color-text-muted); }

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
          color: var(--color-text-muted);
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
          box-shadow: none;
        }
        .action-icon-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          transform: none;
        }

        @media (max-width: 900px) {
          .dashboard-nav-card {
            min-height: 120px;
          }
        }

        @media (max-width: 860px) {
          .dashboard-praktik-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
        message="Yakin ingin keluar dari sesi sekarang?"
        confirmText="Logout"
        cancelText="Batal"
        type="warning"
      />
    </div>
  );
};

const praktikMetricButtonStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "14px",
  padding: "0.95rem 1rem",
  boxShadow: "none",
};

const praktikTimelineButtonStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "0.75rem",
  width: "100%",
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "14px",
  padding: "0.95rem 1rem",
  boxShadow: "none",
  textAlign: "left",
};

export default Dashboard;

