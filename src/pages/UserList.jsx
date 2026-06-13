import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, updateUserStatus } from "../services/api";
import { getPositionLabel } from "../utils/roleHelpers";
import PageHeader from "../components/layout/PageHeader";
import Table from "../components/ui/Table";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/ui/Card";
import "../styles/design-system.css";
import "./UserList.css";

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

  const columns = [
    {
      key: "full_name",
      label: "Nama Lengkap",
      sortable: true,
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
    },
    {
      key: "position_user",
      label: "Posisi",
      sortable: true,
      render: (value) => getPositionLabel(value),
    },
    {
      key: "status_user",
      label: "Status",
      sortable: true,
      render: (value) => {
        const statusMap = {
          ACTIVE: "success",
          INACTIVE: "muted",
        };
        return <StatusBadge status={statusMap[value] || "muted"} label={value} size="sm" />;
      },
    },
    {
      key: "actions",
      label: "Aksi",
      render: (_, row) => (
        <div className="user-list-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/edit-user/${row.user_id}`)}
          >
            Edit
          </Button>
          <Button
            variant={row.status_user === "ACTIVE" ? "warning" : "success"}
            size="sm"
            onClick={() => handleStatusToggle(row.user_id, row.status_user)}
          >
            {row.status_user === "ACTIVE" ? "Disable" : "Enable"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="user-list-page">
      <PageHeader
        heading="Daftar Pengguna"
        subtitle="Kelola akun, perbarui status user, dan rapikan akses master data."
        actions={
          <Button variant="primary" onClick={() => navigate("/add-user")}>
            Tambah Pengguna
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="ul-stat-row">
        <div className="ul-stat-card">
          <span className="ul-stat-label">Total User</span>
          <span className="ul-stat-value">{users.length}</span>
          <span className="ul-stat-note">akun terdaftar</span>
        </div>
        <div className="ul-stat-card">
          <span className="ul-stat-label">User Aktif</span>
          <span className="ul-stat-value">{activeUsers}</span>
          <span className="ul-stat-note">siap digunakan</span>
        </div>
        <div className="ul-stat-card">
          <span className="ul-stat-label">Hasil Filter</span>
          <span className="ul-stat-value">{filteredUsers.length}</span>
          <span className="ul-stat-note">user tampil saat ini</span>
        </div>
      </div>

      {/* Filter Controls */}
      <Card variant="surface-card" padding="lg" className="user-list-filter-card">
        <div className="filter-section">
          <Input
            type="text"
            placeholder="Cari berdasarkan nama, email, atau posisi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          message="Tidak ada user yang cocok dengan filter"
          action={
            search ? (
              <Button variant="secondary" onClick={() => setSearch("")}>
                Reset Filter
              </Button>
            ) : (
              <Button variant="primary" onClick={() => navigate("/add-user")}>
                Tambah User Pertama
              </Button>
            )
          }
        />
      ) : (
        <Table columns={columns} data={filteredUsers} className="user-list-table" />
      )}
    </div>
  );
};

export default UserList;
