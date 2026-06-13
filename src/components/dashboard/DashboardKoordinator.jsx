import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Baby, Users as UsersIcon, Syringe, FileCheck } from 'lucide-react';
import StatsCard from './StatsCard';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getDashboardApprovedFeed } from '../../services/api';
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
      const summary = response.summary || {};

      setStats({
        kehamilan: summary.kehamilan || 0,
        persalinan: summary.persalinan || 0,
        kb: summary['keluarga-berencana'] || summary.kb || 0,
        imunisasi: summary.imunisasi || 0,
        totalApproved: summary.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch koordinator data:', error);
    } finally {
      setLoading(false);
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
          <button
            onClick={() => navigate('/imunisasi')}
            className="dashboard-koordinator__action-btn"
          >
            <Syringe size={24} />
            <span>Data Imunisasi</span>
          </button>
        </div>
      </Card>

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

    </div>
  );
};

export default DashboardKoordinator;
