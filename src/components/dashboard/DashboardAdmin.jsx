import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, FileText, MapPin, Building2 } from 'lucide-react';
import StatsCard from './StatsCard';
import Card from '../ui/Card';
import { getUsers, getVillages, getPracticePlaces } from '../../services/api';
import './DashboardAdmin.css';

const quickActions = [
  {
    label: 'Tambah User',
    path: '/add-user',
    icon: Users,
    primary: true,
  },
  {
    label: 'Kelola Desa',
    path: '/villages',
    icon: MapPin,
  },
  {
    label: 'Kelola Tempat Praktik',
    path: '/practice-places',
    icon: Building2,
  },
  {
    label: 'Daftar User',
    path: '/users',
    icon: FileText,
  },
];

/**
 * DashboardAdmin Component
 * 
 * Dashboard for ADMIN role showing user management statistics,
 * system health, and quick action buttons.
 * 
 * @component
 */
const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalVillages: 0,
    totalPracticePlaces: 0,
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersResponse, villagesResponse, practicePlacesResponse] = await Promise.all([
        getUsers(),
        getVillages(),
        getPracticePlaces(),
      ]);

      const users = usersResponse.data || [];
      const activeUsers = users.filter(u => u.status_user === 'ACTIVE').length;
      const inactiveUsers = users.filter(u => u.status_user === 'INACTIVE').length;

      setStats({
        totalUsers: users.length,
        activeUsers,
        inactiveUsers,
        totalVillages: (villagesResponse.data || []).length,
        totalPracticePlaces: (practicePlacesResponse.data || []).length,
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-admin">
        <div className="dashboard-admin__loading">Memuat data dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      {/* Stats Cards Grid */}
      <div className="dashboard-admin__stats">
        <StatsCard
          title="Total User"
          value={stats.totalUsers}
          icon={Users}
        />
        <StatsCard
          title="User Aktif"
          value={stats.activeUsers}
          icon={UserCheck}
          trend={
            stats.totalUsers > 0
              ? {
                  value: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`,
                  direction: 'up',
                }
              : undefined
          }
        />
        <StatsCard
          title="User Nonaktif"
          value={stats.inactiveUsers}
          icon={UserX}
        />
        <StatsCard
          title="Total Desa"
          value={stats.totalVillages}
          icon={MapPin}
        />
        <StatsCard
          title="Tempat Praktik"
          value={stats.totalPracticePlaces}
          icon={Building2}
        />
      </div>

      {/* Quick Actions */}
      <Card variant="surface-card" padding="xl" className="dashboard-admin__actions">
        <h3 className="dashboard-admin__actions-title">Aksi Cepat</h3>
        <p className="dashboard-admin__actions-subtitle">
          Kelola data master dan pengguna sistem
        </p>
        <div className="dashboard-admin__actions-grid">
          {quickActions.map(({ label, path, icon: Icon, primary }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={[
                'dashboard-admin__action-btn',
                primary ? 'dashboard-admin__action-btn--primary' : '',
              ].filter(Boolean).join(' ')}
            >
              <Icon size={24} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* System Info */}
      <Card variant="surface-card" padding="xl" className="dashboard-admin__system-info">
        <h3 className="dashboard-admin__system-info-title">Informasi Sistem</h3>
        <div className="dashboard-admin__system-info-grid">
          <div className="dashboard-admin__system-info-item">
            <span className="dashboard-admin__system-info-label">Total Akun Terdaftar</span>
            <span className="dashboard-admin__system-info-value">{stats.totalUsers}</span>
          </div>
          <div className="dashboard-admin__system-info-item">
            <span className="dashboard-admin__system-info-label">Wilayah Aktif</span>
            <span className="dashboard-admin__system-info-value">{stats.totalVillages}</span>
          </div>
          <div className="dashboard-admin__system-info-item">
            <span className="dashboard-admin__system-info-label">Lokasi Praktik</span>
            <span className="dashboard-admin__system-info-value">{stats.totalPracticePlaces}</span>
          </div>
          <div className="dashboard-admin__system-info-item">
            <span className="dashboard-admin__system-info-label">Status Sistem</span>
            <span className="dashboard-admin__system-info-value dashboard-admin__system-info-value--success">
              Operasional
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardAdmin;
