import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, XCircle, Activity, Heart, Baby, UserCheck, Syringe } from 'lucide-react';
import StatsCard from './StatsCard';
import Card from '../ui/Card';
import Table from '../ui/Table';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import StatusBadge from '../StatusBadge';
import {
  getPasienList,
  getKehamilanList,
  getPersalinanList,
  getKBList,
  getImunisasiList,
} from '../../services/api';
import { formatDate } from '../../utils/dateFormatter';
import './DashboardPraktik.css';

/**
 * DashboardPraktik Component
 * 
 * Dashboard for Bidan Praktik showing recent submissions,
 * rejected data requiring revision, and quick action buttons.
 * 
 * @component
 */
const DashboardPraktik = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [rejectedData, setRejectedData] = useState([]);
  const [stats, setStats] = useState({
    totalPasien: 0,
    totalSubmissions: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchPraktikData();
  }, []);

  const fetchPraktikData = async () => {
    setLoading(true);
    try {
      const [pasienResponse, kehamilanResponse, persalinanResponse, kbResponse, imunisasiResponse] = 
        await Promise.all([
          getPasienList(),
          getKehamilanList(),
          getPersalinanList(),
          getKBList(),
          getImunisasiList(),
        ]);

      // Normalize all module data
      const allData = [
        ...(kehamilanResponse.data || []).map(item => ({
          ...item,
          moduleType: 'kehamilan',
          moduleName: 'Kehamilan',
          route: `/pemeriksaan-kehamilan/${item.id}`,
        })),
        ...(persalinanResponse.data || []).map(item => ({
          ...item,
          moduleType: 'persalinan',
          moduleName: 'Persalinan',
          route: `/persalinan/${item.id}`,
        })),
        ...(kbResponse.data || []).map(item => ({
          ...item,
          moduleType: 'kb',
          moduleName: 'KB',
          route: `/keluarga-berencana/${item.id}`,
        })),
        ...(imunisasiResponse.data || []).map(item => ({
          ...item,
          moduleType: 'imunisasi',
          moduleName: 'Imunisasi',
          route: `/imunisasi/${item.id}`,
        })),
      ];

      // Sort by date (most recent first)
      allData.sort((a, b) => {
        const dateA = new Date(a.tanggal || a.tanggal_partus || a.tanggal_kunjungan || a.tgl_imunisasi || a.created_at || 0);
        const dateB = new Date(b.tanggal || b.tanggal_partus || b.tanggal_kunjungan || b.tgl_imunisasi || b.created_at || 0);
        return dateB - dateA;
      });

      const pending = allData.filter(d => d.status_verifikasi === 'PENDING');
      const rejected = allData.filter(d => d.status_verifikasi === 'REJECTED');

      setRecentSubmissions(allData);
      setRejectedData(rejected);
      setStats({
        totalPasien: (pasienResponse.data || []).length,
        totalSubmissions: allData.length,
        pending: pending.length,
        rejected: rejected.length,
      });
    } catch (error) {
      console.error('Failed to fetch praktik data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentColumns = [
    {
      key: 'pasien',
      label: 'Pasien',
      render: (_, row) => row?.pasien?.nama || '-',
    },
    {
      key: 'module',
      label: 'Modul',
      render: (value, row) => row?.moduleName || value || '-',
    },
    {
      key: 'date',
      label: 'Tanggal',
      render: (_, row) => formatDate(row?.tanggal || row?.tanggal_partus || row?.tanggal_kunjungan || row?.tgl_imunisasi),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <StatusBadge 
          status={row?.status_verifikasi || value || 'PENDING'} 
          size="sm"
        />
      ),
    },
  ];

  const rejectedColumns = [
    ...recentColumns,
    {
      key: 'reason',
      label: 'Alasan Penolakan',
      render: (_, row) => row?.alasan_penolakan || '-',
    },
  ];

  const handleRowClick = (row) => {
    if (row?.route) {
      navigate(row.route);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-praktik">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="dashboard-praktik">
      {/* Stats Cards Grid */}
      <div className="dashboard-praktik__stats">
        <StatsCard
          title="Total Pasien"
          value={stats.totalPasien}
          icon={Users}
        />
        <StatsCard
          title="Total Pelayanan"
          value={stats.totalSubmissions}
          icon={Activity}
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
        />
        <StatsCard
          title="Perlu Revisi"
          value={stats.rejected}
          icon={XCircle}
        />
      </div>

      {/* Rejected Data (Priority Section) */}
      {rejectedData.length > 0 && (
        <Card variant="surface-card" padding="xl" className="dashboard-praktik__rejected-section">
          <div className="dashboard-praktik__section-header">
            <div>
              <h3 className="dashboard-praktik__section-title dashboard-praktik__section-title--error">
                <XCircle size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                Data Perlu Revisi
              </h3>
              <p className="dashboard-praktik__section-subtitle">
                Data yang ditolak dan perlu diperbaiki
              </p>
            </div>
            <button
              onClick={() => navigate('/revision/rejected')}
              className="dashboard-praktik__view-all-btn dashboard-praktik__view-all-btn--error"
            >
              Lihat Semua
            </button>
          </div>

          <Table
            columns={rejectedColumns}
            data={rejectedData.slice(0, 5)}
            onRowClick={handleRowClick}
            className="dashboard-praktik__table dashboard-praktik__table--rejected"
          />
        </Card>
      )}

      {/* Recent Submissions */}
      <Card
        variant="surface-card"
        padding="xl"
        className="dashboard-praktik__recent-section"
      >
        <div className="dashboard-praktik__section-header">
          <div>
            <h3 className="dashboard-praktik__section-title">
              Submisi Terbaru
            </h3>
            <p className="dashboard-praktik__section-subtitle">
              10 data pelayanan terakhir yang Anda input
            </p>
          </div>
        </div>

        {recentSubmissions.length === 0 ? (
          <EmptyState message="Belum ada data pelayanan" />
        ) : (
          <Table
            columns={recentColumns}
            data={recentSubmissions.slice(0, 10)}
            onRowClick={handleRowClick}
            className="dashboard-praktik__table dashboard-praktik__table--recent"
          />
        )}
      </Card>

      {/* Quick Actions */}
      <Card variant="surface-card" padding="xl">
        <h3 className="dashboard-praktik__actions-title">Tambah Data Pelayanan</h3>
        <p className="dashboard-praktik__actions-subtitle">
          Pilih jenis pelayanan untuk menambah data baru
        </p>
        <div className="dashboard-praktik__actions-grid">
          <button
            onClick={() => navigate('/pasien')}
            className="dashboard-praktik__action-btn"
          >
            <Users size={24} />
            <span>Data Pasien</span>
          </button>
          <button
            onClick={() => navigate('/pemeriksaan-kehamilan/add')}
            className="dashboard-praktik__action-btn dashboard-praktik__action-btn--kehamilan"
          >
            <Heart size={24} />
            <span>Kehamilan</span>
          </button>
          <button
            onClick={() => navigate('/persalinan/add')}
            className="dashboard-praktik__action-btn dashboard-praktik__action-btn--persalinan"
          >
            <Baby size={24} />
            <span>Persalinan</span>
          </button>
          <button
            onClick={() => navigate('/keluarga-berencana/add')}
            className="dashboard-praktik__action-btn dashboard-praktik__action-btn--kb"
          >
            <UserCheck size={24} />
            <span>KB</span>
          </button>
          <button
            onClick={() => navigate('/imunisasi/add')}
            className="dashboard-praktik__action-btn dashboard-praktik__action-btn--imunisasi"
          >
            <Syringe size={24} />
            <span>Imunisasi</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPraktik;
