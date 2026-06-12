import React from 'react';
import { useAuth } from '../context/AuthContext';
import { isAdmin, isBidanKoordinator, isBidanDesa, isBidanPraktik } from '../utils/roleHelpers';
import PageHeader from '../components/layout/PageHeader';
import DashboardAdmin from '../components/dashboard/DashboardAdmin';
import DashboardKoordinator from '../components/dashboard/DashboardKoordinator';
import DashboardDesa from '../components/dashboard/DashboardDesa';
import DashboardPraktik from '../components/dashboard/DashboardPraktik';

/**
 * Dashboard Page
 * 
 * Main dashboard that routes to role-specific dashboard components.
 * 
 * Role routing:
 * - ADMIN → DashboardAdmin
 * - Bidan Koordinator → DashboardKoordinator
 * - Bidan Desa → DashboardDesa
 * - Bidan Praktik → DashboardPraktik
 * 
 * @component
 */
const Dashboard = () => {
  const { user } = useAuth();

  // Determine which dashboard component to render based on role
  const renderDashboard = () => {
    if (isAdmin(user)) {
      return <DashboardAdmin />;
    }
    
    if (isBidanKoordinator(user)) {
      return <DashboardKoordinator />;
    }
    
    if (isBidanDesa(user)) {
      return <DashboardDesa />;
    }
    
    if (isBidanPraktik(user)) {
      return <DashboardPraktik />;
    }

    // Fallback for unknown role
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-muted)' }}>
          Role tidak dikenali. Silakan hubungi administrator.
        </p>
      </div>
    );
  };

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        subtitle={`Selamat datang, ${user?.full_name || 'User'}`}
      />
      {renderDashboard()}
    </>
  );
};

export default Dashboard;
