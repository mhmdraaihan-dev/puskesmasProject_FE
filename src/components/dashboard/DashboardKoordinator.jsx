import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Baby, Users as UsersIcon, Syringe, FileCheck } from 'lucide-react';
import StatsCard from './StatsCard';
import Card from '../ui/Card';
import Table from '../ui/Table';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import { getDashboardApprovedFeed } from '../../services/api';
import { formatDate } from '../../utils/dateFormatter';
import './DashboardKoordinator.css';

/**
 * DashboardKoordinator Component
 * 
 * Dashboard for Bidan Koordinator showing approved data feed across all villages,
 * summary statistics by module, and village breakdown.
 * 
 * @component
 */
const DashboardKoordinator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [approvedFeed, setApprovedFeed] = useState([]);
  const [stats, setStats] = useState({
    kehamilan: 0,
    persalinan: 0,
    kb: 0,
    imunisasi: 0,
    totalApproved: 0,
  });

  useEffect(() => {
    fetchKoordinatorData();
  }, []);

  const fetchKoordinatorData = async () => {
    setLoading(true);
    try {
      const response = await getDashboardApprovedFeed();
      const data = response.data || [];
      const summary = response.summary || {};

      setApprovedFeed(data);
      setStats({
        kehamilan: summary.kehamilan || 0,
        persalinan: summary.persalinan || 0,
        kb: summary['keluarga-berencana'] || summary.kb || 0,
        imunisasi: summary.imunisasi || 0,
        totalApproved: summary.total || data.length,
      });
    } catch (error) {
      console.error('Failed to fetch koordinator data:', error);
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

  const tableColumns = [
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
      key: 'village',
      label: 'Desa',
      render: (_, row) => row?.village_name || row?.practice_place?.village?.nama_desa || '-',
    },
    {
      key: 'practice',
      label: 'Tempat Praktik',
      render: (_, row) => row?.practice_name || row?.practice_place?.nama_praktik || '-',
    },
  ];

  const handleRowClick = (row) => {
    if (!row) return;
    
    const moduleKey = normalizeModuleKey(row.module || row.type);
    const id = row.id || row.data_id;
    if (id) {
      navigate(getModuleRoute(moduleKey, id));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-koordinator">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="dashboard-koordinator">
      {/* Stats Cards Grid */}
      <div className="dashboard-koordinator__stats">
        <StatsCard
          title="Total Approved"
          value={stats.totalApproved}
          icon={FileCheck}
        />
        <StatsCard
          title="Kehamilan"
          value={stats.kehamilan}
          icon={Heart}
        />
        <StatsCard
          title="Persalinan"
          value={stats.persalinan}
          icon={Baby}
        />
        <StatsCard
          title="KB"
          value={stats.kb}
          icon={UsersIcon}
        />
        <StatsCard
          title="Imunisasi"
          value={stats.imunisasi}
          icon={Syringe}
        />
      </div>

      {/* Approved Data Feed Table */}
      <Card
        variant="surface-card"
        padding="xl"
        className="dashboard-koordinator__feed-section"
      >
        <div className="dashboard-koordinator__feed-header">
          <div>
            <h3 className="dashboard-koordinator__feed-title">Data Approved Terbaru</h3>
            <p className="dashboard-koordinator__feed-subtitle">
              10 data terakhir yang telah disetujui dari semua desa
            </p>
          </div>
          <button
            onClick={() => navigate('/rekapitulasi')}
            className="dashboard-koordinator__view-all-btn"
          >
            Lihat Rekapitulasi
          </button>
        </div>

        {approvedFeed.length === 0 ? (
          <EmptyState message="Belum ada data approved" />
        ) : (
          <Table
            columns={tableColumns}
            data={approvedFeed.slice(0, 10)}
            onRowClick={handleRowClick}
            className="dashboard-koordinator__table"
          />
        )}
      </Card>

      {/* Quick Actions */}
      <Card
        variant="surface-card"
        padding="xl"
        className="dashboard-koordinator__actions-section"
      >
        <h3 className="dashboard-koordinator__actions-title">Aksi Cepat</h3>
        <div className="dashboard-koordinator__actions-grid">
          <button
            onClick={() => navigate('/rekapitulasi')}
            className="dashboard-koordinator__action-btn"
          >
            <Activity size={24} />
            <span>Lihat Rekapitulasi</span>
          </button>
          <button
            onClick={() => navigate('/pemeriksaan-kehamilan')}
            className="dashboard-koordinator__action-btn"
          >
            <Heart size={24} />
            <span>Data Kehamilan</span>
          </button>
          <button
            onClick={() => navigate('/persalinan')}
            className="dashboard-koordinator__action-btn"
          >
            <Baby size={24} />
            <span>Data Persalinan</span>
          </button>
          <button
            onClick={() => navigate('/keluarga-berencana')}
            className="dashboard-koordinator__action-btn"
          >
            <UsersIcon size={24} />
            <span>Data KB</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardKoordinator;
