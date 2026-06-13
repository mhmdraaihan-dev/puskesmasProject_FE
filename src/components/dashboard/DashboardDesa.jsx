import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Clock, CheckCircle, XCircle, Activity, Heart, Baby, Users as UsersIcon, Syringe } from 'lucide-react';
import StatsCard from './StatsCard';
import Card from '../ui/Card';
import Table from '../ui/Table';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import StatusBadge from '../StatusBadge';
import { getDashboardPendingTasks, getDashboardHistory } from '../../services/api';
import { formatDate } from '../../utils/dateFormatter';
import './DashboardDesa.css';

/**
 * DashboardDesa Component
 * 
 * Dashboard for Bidan Desa showing pending verification tasks,
 * verification history, and statistics for assigned village.
 * 
 * @component
 */
const DashboardDesa = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalHistory: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchDesaData();
  }, []);

  const fetchDesaData = async () => {
    setLoading(true);
    try {
      const [pendingResponse, historyResponse] = await Promise.all([
        getDashboardPendingTasks(),
        getDashboardHistory(),
      ]);

      const pending = pendingResponse.data || [];
      const history = historyResponse.data || [];

      setPendingTasks(pending);
      setVerificationHistory(history);

      const approved = history.filter(h => h.status_verifikasi === 'APPROVED' || h.status === 'APPROVED').length;
      const rejected = history.filter(h => h.status_verifikasi === 'REJECTED' || h.status === 'REJECTED').length;

      setStats({
        totalPending: pendingResponse.summary?.total || pending.length,
        totalHistory: historyResponse.summary?.total || history.length,
        approved,
        rejected,
      });
    } catch (error) {
      console.error('Failed to fetch desa data:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeModuleKey = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    switch (normalized) {
      case 'kehamilan':
      case 'pemeriksaan_kehamilan':
      case 'pemeriksaan-kehamilan':
        return 'kehamilan';
      case 'persalinan':
        return 'persalinan';
      case 'kb':
      case 'keluarga_berencana':
      case 'keluarga-berencana':
        return 'kb';
      case 'imunisasi':
        return 'imunisasi';
      default:
        return normalized;
    }
  };

  const getModuleRoute = (moduleKey, id) => {
    const routes = {
      kehamilan: `/pemeriksaan-kehamilan/${id}`,
      persalinan: `/persalinan/${id}`,
      kb: `/keluarga-berencana/${id}`,
      imunisasi: `/imunisasi/${id}`,
    };
    return routes[moduleKey] || '#';
  };

  const pendingColumns = [
    {
      key: 'pasien',
      label: 'Pasien',
      render: (_, row) => row?.pasien_nama || row?.pasien?.nama || '-',
    },
    {
      key: 'module',
      label: 'Modul',
      render: (_, row) => {
        const moduleKey = normalizeModuleKey(row?.module || row?.type);
        const labels = {
          kehamilan: 'Kehamilan',
          persalinan: 'Persalinan',
          kb: 'KB',
          imunisasi: 'Imunisasi',
        };
        return labels[moduleKey] || moduleKey;
      },
    },
    {
      key: 'date',
      label: 'Tanggal',
      render: (_, row) => formatDate(row?.tanggal || row?.service_date || row?.created_at),
    },
    {
      key: 'practice',
      label: 'Tempat Praktik',
      render: (_, row) => row?.practice_name || row?.practice_place?.nama_praktik || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <StatusBadge 
          status={row?.status_verifikasi || row?.status || value || 'PENDING'} 
          size="sm"
        />
      ),
    },
  ];

  const historyColumns = [
    ...pendingColumns.slice(0, -1), // Remove status column
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <StatusBadge 
          status={row?.status_verifikasi || row?.status || value || 'PENDING'} 
          size="sm"
        />
      ),
    },
    {
      key: 'verified_date',
      label: 'Tgl Verifikasi',
      render: (_, row) => formatDate(row?.tanggal_verifikasi || row?.verified_at),
    },
  ];

  const handlePendingRowClick = (row) => {
    if (row) {
      navigate('/verification/pending');
    }
  };

  const handleHistoryRowClick = (row) => {
    if (!row) return;
    
    const moduleKey = normalizeModuleKey(row.module || row.type);
    const id = row.id || row.data_id;
    if (id) {
      navigate(getModuleRoute(moduleKey, id));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-desa">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="dashboard-desa">
      {/* Quick Actions */}
      <Card variant="surface-card" padding="lg" className="dashboard-desa__actions-card">
        <h3 className="dashboard-desa__actions-title">Aksi Cepat</h3>
        <div className="dashboard-desa__actions-grid">
          <button
            onClick={() => navigate('/rekapitulasi')}
            className="dashboard-desa__action-btn dashboard-desa__action-btn--primary"
          >
            <Activity size={20} />
            <span>Lihat Rekapitulasi</span>
          </button>
          <button
            onClick={() => navigate('/pemeriksaan-kehamilan')}
            className="dashboard-desa__action-btn"
          >
            <Heart size={20} />
            <span>Data Kehamilan</span>
          </button>
          <button
            onClick={() => navigate('/persalinan')}
            className="dashboard-desa__action-btn"
          >
            <Baby size={20} />
            <span>Data Persalinan</span>
          </button>
          <button
            onClick={() => navigate('/keluarga-berencana')}
            className="dashboard-desa__action-btn"
          >
            <UsersIcon size={20} />
            <span>Data KB</span>
          </button>
          <button
            onClick={() => navigate('/imunisasi')}
            className="dashboard-desa__action-btn"
          >
            <Syringe size={20} />
            <span>Data Imunisasi</span>
          </button>
        </div>
      </Card>

      {/* Stats Cards Grid */}
      <div className="dashboard-desa__stats">
        <StatsCard
          title="Perlu Verifikasi"
          value={stats.totalPending}
          icon={Clock}
        />
        <StatsCard
          title="Total Histori"
          value={stats.totalHistory}
          icon={FileCheck}
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
        />
      </div>

      {/* Pending Verification Tasks */}
      <Card variant="surface-card" padding="xl">
        <div className="dashboard-desa__section-header">
          <div>
            <h3 className="dashboard-desa__section-title">Antrian Verifikasi</h3>
            <p className="dashboard-desa__section-subtitle">
              Data yang menunggu verifikasi dari desa Anda
            </p>
          </div>
          <button
            onClick={() => navigate('/verification/pending')}
            className="dashboard-desa__view-all-btn"
          >
            Lihat Semua
          </button>
        </div>

        {pendingTasks.length === 0 ? (
          <EmptyState message="Tidak ada data yang menunggu verifikasi" />
        ) : (
          <Table
            columns={pendingColumns}
            data={pendingTasks.slice(0, 5)}
            onRowClick={handlePendingRowClick}
            className="dashboard-desa__table"
          />
        )}
      </Card>

      {/* Verification History */}
      <Card variant="surface-card" padding="xl">
        <div className="dashboard-desa__section-header">
          <div>
            <h3 className="dashboard-desa__section-title">
              Riwayat Verifikasi
            </h3>
            <p className="dashboard-desa__section-subtitle">
              10 data terakhir yang telah Anda verifikasi
            </p>
          </div>
        </div>

        {verificationHistory.length === 0 ? (
          <EmptyState message="Belum ada riwayat verifikasi" />
        ) : (
          <Table
            columns={historyColumns}
            data={verificationHistory.slice(0, 10)}
            onRowClick={handleHistoryRowClick}
            className="dashboard-desa__table"
          />
        )}
      </Card>
    </div>
  );
};

export default DashboardDesa;
