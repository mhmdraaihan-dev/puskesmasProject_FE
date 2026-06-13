import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
  approveStaffLeave,
  createStaffLeave,
  getLeaveBalance,
  getStaffLeaves,
  getUserById,
  rejectStaffLeave,
  updateLeaveBalance,
} from "../../services/api";
import { formatDate, formatDateTime } from "../../utils/dateFormatter";
import { getPositionLabel, isAdmin } from "../../utils/roleHelpers";
import "../../App.css";

const CURRENT_YEAR = new Date().getFullYear();

const getTodayInputValue = () => {
  return new Date().toISOString().split("T")[0];
};

const extractPayload = (response) => {
  if (response === null || response === undefined) return null;
  return response.data ?? response;
};

const extractArray = (response) => {
  const payload = extractPayload(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;

  return [];
};

const calculateCalendarDays = (startDate, endDate) => {
  if (!startDate || !endDate) return "-";

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "-";
  }

  const diffInMs = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  const diffInDays = Math.floor(diffInMs / 86400000) + 1;

  return diffInDays > 0 ? diffInDays : "-";
};

const normalizeLeave = (item) => {
  const startDate = item?.start_date || item?.startDate || "";
  const endDate = item?.end_date || item?.endDate || "";

  return {
    id: item?.leave_id || item?.id || item?.uuid || "",
    leaveType: item?.leave_type || item?.type || "annual",
    status: (item?.status || item?.leave_status || "pending").toLowerCase(),
    startDate,
    endDate,
    notes: item?.notes || "",
    autoAssignBackup:
      item?.auto_assign_backup === true || item?.autoAssignBackup === true,
    totalDays:
      item?.total_days ??
      item?.duration_days ??
      item?.days_count ??
      calculateCalendarDays(startDate, endDate),
    createdAt: item?.created_at || item?.createdAt || "",
    updatedAt: item?.updated_at || item?.updatedAt || "",
  };
};

const getLeaveTypeLabel = (leaveType) => {
  if (leaveType === "annual") return "Cuti Tahunan";
  return leaveType || "-";
};

const getLeaveStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "Menunggu Persetujuan";
    case "approved":
      return "Disetujui";
    case "rejected":
      return "Ditolak";
    default:
      return status || "-";
  }
};

const LeavePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const targetStaffId = userId;
  const currentUserIsAdmin = isAdmin(user);

  const [staffInfo, setStaffInfo] = useState(null);
  const [staffLoading, setStaffLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [statusFilter, setStatusFilter] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [leaveForm, setLeaveForm] = useState({
    start_date: getTodayInputValue(),
    end_date: getTodayInputValue(),
    notes: "",
    auto_assign_backup: true,
  });
  const [quotaForm, setQuotaForm] = useState({
    quota_days: "",
    notes: "",
  });

  const activeStaff = staffInfo;

  const fetchStaffInfo = useCallback(async () => {
    if (!targetStaffId) return;

    try {
      setStaffLoading(true);
      const response = await getUserById(targetStaffId);
      setStaffInfo(extractPayload(response));
    } catch (err) {
      console.error("Failed to fetch target user:", err);
      setError(
        err.response?.data?.message || "Gagal memuat detail user untuk cuti.",
      );
      setStaffInfo(null);
    } finally {
      setStaffLoading(false);
    }
  }, [targetStaffId]);

  const fetchLeaveData = useCallback(async () => {
    if (!targetStaffId) return;

    try {
      setPageLoading(true);
      setError("");

      const params = { year };
      if (statusFilter) {
        params.status = statusFilter;
      }

      const [balanceResponse, leavesResponse] = await Promise.all([
        getLeaveBalance(targetStaffId, year),
        getStaffLeaves(targetStaffId, params),
      ]);

      const balancePayload = extractPayload(balanceResponse);
      const normalizedLeaves = extractArray(leavesResponse).map(normalizeLeave);

      setBalance(balancePayload);
      setQuotaForm({
        quota_days:
          balancePayload?.quota_days !== null &&
          balancePayload?.quota_days !== undefined
            ? String(balancePayload.quota_days)
            : "",
        notes: balancePayload?.notes || "",
      });
      setLeaves(normalizedLeaves);
    } catch (err) {
      console.error("Failed to fetch leave data:", err);
      setError(
        err.response?.data?.message || "Gagal memuat saldo dan daftar cuti.",
      );
      setBalance(null);
      setLeaves([]);
    } finally {
      setPageLoading(false);
    }
  }, [statusFilter, targetStaffId, year]);

  useEffect(() => {
    if (!currentUserIsAdmin || !targetStaffId) {
      navigate("/", { replace: true });
      return;
    }

    fetchStaffInfo();
  }, [currentUserIsAdmin, fetchStaffInfo, navigate, targetStaffId]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const stats = useMemo(() => {
    return {
      total: leaves.length,
      pending: leaves.filter((item) => item.status === "pending").length,
      approved: leaves.filter((item) => item.status === "approved").length,
      rejected: leaves.filter((item) => item.status === "rejected").length,
    };
  }, [leaves]);

  const yearOptions = useMemo(() => {
    return [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2];
  }, []);

  const handleLeaveInputChange = (field, value) => {
    setLeaveForm((prev) => {
      const next = { ...prev, [field]: value };

      if (
        field === "start_date" &&
        next.end_date &&
        value &&
        next.end_date < value
      ) {
        next.end_date = value;
      }

      return next;
    });
  };

  const handleCreateLeave = async (event) => {
    event.preventDefault();

    if (!targetStaffId) return;

    if (!leaveForm.start_date || !leaveForm.end_date) {
      alert("Tanggal mulai dan tanggal selesai wajib diisi.");
      return;
    }

    if (leaveForm.end_date < leaveForm.start_date) {
      alert("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      return;
    }

    try {
      setFormLoading(true);
      await createStaffLeave(targetStaffId, {
        leave_type: "annual",
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        notes: leaveForm.notes.trim(),
        auto_assign_backup: leaveForm.auto_assign_backup,
      });

      alert("Pengajuan cuti berhasil disimpan.");
      setLeaveForm({
        start_date: getTodayInputValue(),
        end_date: getTodayInputValue(),
        notes: "",
        auto_assign_backup: true,
      });
      await fetchLeaveData();
    } catch (err) {
      console.error("Failed to create leave:", err);
      alert(err.response?.data?.message || "Gagal membuat pengajuan cuti.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateQuota = async (event) => {
    event.preventDefault();

    const quotaValue = Number(quotaForm.quota_days);

    if (Number.isNaN(quotaValue) || quotaValue < 0) {
      alert("Quota tahunan harus berupa angka 0 atau lebih.");
      return;
    }

    try {
      setQuotaLoading(true);
      await updateLeaveBalance(targetStaffId, {
        year,
        quota_days: quotaValue,
        notes: quotaForm.notes.trim(),
      });

      alert("Quota cuti berhasil diperbarui.");
      await fetchLeaveData();
    } catch (err) {
      console.error("Failed to update leave balance:", err);
      alert(err.response?.data?.message || "Gagal memperbarui quota cuti.");
    } finally {
      setQuotaLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    if (!confirm("Setujui pengajuan cuti ini?")) {
      return;
    }

    try {
      setActionLoadingId(`approve-${leaveId}`);
      await approveStaffLeave(leaveId);
      alert("Pengajuan cuti berhasil disetujui.");
      await fetchLeaveData();
    } catch (err) {
      console.error("Failed to approve leave:", err);
      alert(
        err.response?.data?.message ||
          "Gagal menyetujui pengajuan cuti karena ada validasi dari backend.",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const handleReject = async (leaveId) => {
    if (!confirm("Tolak pengajuan cuti ini?")) {
      return;
    }

    try {
      setActionLoadingId(`reject-${leaveId}`);
      await rejectStaffLeave(leaveId);
      alert("Pengajuan cuti berhasil ditolak.");
      await fetchLeaveData();
    } catch (err) {
      console.error("Failed to reject leave:", err);
      alert(err.response?.data?.message || "Gagal menolak pengajuan cuti.");
    } finally {
      setActionLoadingId("");
    }
  };

  const showSkeleton = pageLoading || staffLoading;

  return (
    <div className="dashboard" style={{ maxWidth: "1280px", paddingBottom: "3rem" }}>
      <div className="dashboard-header" style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Kelola Cuti Karyawan</h1>
          <p className="text-muted" style={styles.pageSubtitle}>
            {activeStaff?.full_name || "Memuat data staff..."}
            {activeStaff?.position_user
              ? ` | ${getPositionLabel(activeStaff.position_user)}`
              : ""}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate("/users")}
            className="btn-primary"
            style={styles.secondaryButton}
          >
            Kembali ke User
          </button>
        </div>
      </div>

      {error ? <div className="error-alert">{error}</div> : null}

      <div style={styles.filterRow}>
        <div className="auth-card" style={styles.filterCard}>
          <div style={styles.filterGrid}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tahun</label>
              <select
                className="form-input"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {yearOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.summaryGrid}>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Quota Tahunan</span>
          <strong style={styles.summaryValue}>
            {showSkeleton ? "..." : balance?.quota_days ?? "-"}
          </strong>
          <span className="text-muted" style={styles.summaryNote}>
            Tahun {year}
          </span>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Cuti Terpakai</span>
          <strong style={styles.summaryValue}>
            {showSkeleton ? "..." : balance?.used_days ?? "-"}
          </strong>
          <span className="text-muted" style={styles.summaryNote}>
            Hanya status approved
          </span>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Sisa Cuti</span>
          <strong style={styles.summaryValue}>
            {showSkeleton ? "..." : balance?.remaining_days ?? "-"}
          </strong>
          <span className="text-muted" style={styles.summaryNote}>
            Saldo aktif tahun berjalan
          </span>
        </div>
        <div className="auth-card" style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Daftar Tampil</span>
          <strong style={styles.summaryValue}>
            {showSkeleton ? "..." : stats.total}
          </strong>
          <span className="text-muted" style={styles.summaryNote}>
            {stats.pending} pending | {stats.approved} approved
          </span>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div className="auth-card" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Pengajuan Cuti Tahunan</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Form ini mengirim `annual leave` dan memakai hitungan hari kalender.
            </p>
          </div>

          <form onSubmit={handleCreateLeave}>
            <div style={styles.formGrid}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Mulai</label>
                <input
                  type="date"
                  className="form-input"
                  value={leaveForm.start_date}
                  onChange={(event) =>
                    handleLeaveInputChange("start_date", event.target.value)
                  }
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Selesai</label>
                <input
                  type="date"
                  className="form-input"
                  value={leaveForm.end_date}
                  min={leaveForm.start_date}
                  onChange={(event) =>
                    handleLeaveInputChange("end_date", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Catatan</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Contoh: Cuti keluarga"
                value={leaveForm.notes}
                onChange={(event) =>
                  handleLeaveInputChange("notes", event.target.value)
                }
              />
            </div>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={leaveForm.auto_assign_backup}
                onChange={(event) =>
                  handleLeaveInputChange(
                    "auto_assign_backup",
                    event.target.checked,
                  )
                }
              />
              <span>Aktifkan auto assign backup</span>
            </label>

            <div style={styles.inlineNote}>
              Durasi kalender:{" "}
              <strong>
                {calculateCalendarDays(
                  leaveForm.start_date,
                  leaveForm.end_date,
                )}{" "}
                hari
              </strong>
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                disabled={formLoading || !targetStaffId}
                className="btn-primary"
                style={styles.primaryButton}
              >
                {formLoading ? "Menyimpan..." : "Ajukan Cuti"}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-card" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Quota Tahunan</h3>
            <p className="text-muted" style={styles.sectionSubtitle}>
              Admin dapat mengatur quota cuti per staff per tahun.
            </p>
          </div>

          <form onSubmit={handleUpdateQuota}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Quota Hari</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={quotaForm.quota_days}
                onChange={(event) =>
                  setQuotaForm((prev) => ({
                    ...prev,
                    quota_days: event.target.value,
                  }))
                }
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Catatan Quota</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Contoh: Quota khusus tahun ini"
                value={quotaForm.notes}
                onChange={(event) =>
                  setQuotaForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
              />
            </div>

            <button
              type="submit"
              disabled={quotaLoading || !targetStaffId}
              className="btn-primary"
              style={styles.primaryButton}
            >
              {quotaLoading ? "Menyimpan..." : "Simpan Quota"}
            </button>
          </form>
        </div>
      </div>

      <div className="auth-card" style={styles.tableCard}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Riwayat Pengajuan Cuti</h3>
          <p className="text-muted" style={styles.sectionSubtitle}>
            Menampilkan pengajuan sesuai filter tahun dan status.
          </p>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHead}>Periode</th>
                <th style={styles.tableHead}>Jenis</th>
                <th style={styles.tableHead}>Durasi</th>
                <th style={styles.tableHead}>Status</th>
                <th style={styles.tableHead}>Catatan</th>
                <th style={styles.tableHead}>Dibuat</th>
                <th style={styles.tableHead}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {showSkeleton ? (
                <tr>
                  <td colSpan={7} style={styles.emptyRow}>
                    Memuat data cuti...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={styles.emptyRow}>
                    Belum ada pengajuan cuti pada filter ini.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => {
                  const isPending = leave.status === "pending";
                  const approveLoading = actionLoadingId === `approve-${leave.id}`;
                  const rejectLoading = actionLoadingId === `reject-${leave.id}`;

                  return (
                    <tr key={leave.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </td>
                      <td style={styles.tableCell}>
                        {getLeaveTypeLabel(leave.leaveType)}
                      </td>
                      <td style={styles.tableCell}>{leave.totalDays} hari</td>
                      <td style={styles.tableCell}>
                        <div style={styles.statusCell}>
                          <StatusBadge status={leave.status} />
                          <span className="text-muted" style={styles.statusText}>
                            {getLeaveStatusLabel(leave.status)}
                          </span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.noteBlock}>
                          <span>{leave.notes || "-"}</span>
                          <span className="text-muted" style={styles.smallText}>
                            Backup otomatis:{" "}
                            {leave.autoAssignBackup ? "Ya" : "Tidak"}
                          </span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        {formatDateTime(leave.createdAt)}
                      </td>
                      <td style={styles.tableCell}>
                        {isPending ? (
                          <div style={styles.actionRow}>
                            <button
                              type="button"
                              onClick={() => handleApprove(leave.id)}
                              className="btn-primary"
                              style={styles.approveButton}
                              disabled={approveLoading || rejectLoading}
                            >
                              {approveLoading ? "Proses..." : "Approve"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(leave.id)}
                              className="btn-primary"
                              style={styles.rejectButton}
                              disabled={approveLoading || rejectLoading}
                            >
                              {rejectLoading ? "Proses..." : "Reject"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">Tidak ada aksi</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
  },
  pageTitle: {
    marginBottom: "0.35rem",
  },
  pageSubtitle: {
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  secondaryButton: {
    width: "auto",
    minWidth: "150px",
    paddingInline: "1rem",
    backgroundColor: "transparent",
    border: "1px solid var(--glass-border)",
  },
  filterRow: {
    marginBottom: "1.5rem",
  },
  filterCard: {
    maxWidth: "none",
    margin: 0,
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  summaryCard: {
    maxWidth: "none",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  summaryLabel: {
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--color-text-muted)",
  },
  summaryValue: {
    fontSize: "1.55rem",
    lineHeight: 1.1,
  },
  summaryNote: {
    fontSize: "0.88rem",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  sectionCard: {
    maxWidth: "none",
    margin: 0,
  },
  sectionHeader: {
    marginBottom: "1rem",
  },
  sectionTitle: {
    marginBottom: "0.35rem",
    fontSize: "1.1rem",
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: "0.92rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  checkboxRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.65rem",
    marginTop: "0.2rem",
    fontSize: "0.95rem",
  },
  inlineNote: {
    marginTop: "1rem",
    color: "var(--color-text-muted)",
    fontSize: "0.92rem",
  },
  formActions: {
    marginTop: "1rem",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  primaryButton: {
    width: "auto",
    minWidth: "150px",
    paddingInline: "1rem",
  },
  tableCard: {
    maxWidth: "none",
    margin: 0,
    padding: "1.25rem",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1040px",
  },
  tableHead: {
    padding: "0.9rem 0.85rem",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "var(--color-text-muted)",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: "rgba(255,255,255,0.02)",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tableCell: {
    padding: "1rem 0.85rem",
    verticalAlign: "top",
  },
  statusCell: {
    display: "grid",
    gap: "0.35rem",
  },
  statusText: {
    fontSize: "0.8rem",
  },
  noteBlock: {
    display: "grid",
    gap: "0.35rem",
  },
  smallText: {
    fontSize: "0.8rem",
  },
  actionRow: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  approveButton: {
    width: "auto",
    minWidth: "90px",
    paddingInline: "0.9rem",
    backgroundColor: "rgba(16, 185, 129, 0.22)",
    border: "1px solid rgba(52, 211, 153, 0.45)",
  },
  rejectButton: {
    width: "auto",
    minWidth: "90px",
    paddingInline: "0.9rem",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    border: "1px solid rgba(248, 113, 113, 0.45)",
  },
  emptyRow: {
    textAlign: "center",
    padding: "3rem 1rem",
    color: "var(--color-text-muted)",
  },
};

export default LeavePage;
