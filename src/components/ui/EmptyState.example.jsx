import React from 'react';
import EmptyState from './EmptyState';

/**
 * EmptyState Component Usage Examples
 * 
 * This file demonstrates various ways to use the EmptyState component
 * in different scenarios throughout the Puskesmas application.
 */

// Example 1: Simple empty state without action button
export const SimpleEmptyStateExample = () => (
  <EmptyState message="Belum ada data pasien" />
);

// Example 2: Empty state with action button (most common use case)
export const EmptyStateWithActionExample = () => {
  const handleAddNew = () => {
    console.log('Navigate to add form');
  };

  return (
    <EmptyState 
      message="Belum ada data pemeriksaan kehamilan" 
      action={{
        label: "Tambah Data Baru",
        onClick: handleAddNew
      }}
    />
  );
};

// Example 3: Empty state for search results
export const NoSearchResultsExample = () => (
  <EmptyState message="Tidak ada hasil pencarian yang sesuai" />
);

// Example 4: Empty state for filtered data
export const FilteredEmptyStateExample = () => {
  const handleClearFilters = () => {
    console.log('Clear all filters');
  };

  return (
    <EmptyState 
      message="Tidak ada data yang sesuai dengan filter" 
      action={{
        label: "Hapus Filter",
        onClick: handleClearFilters
      }}
    />
  );
};

// Example 5: Empty state for service modules
export const ServiceModuleEmptyStates = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
    {/* Pemeriksaan Kehamilan */}
    <EmptyState 
      message="Belum ada data pemeriksaan kehamilan" 
      action={{
        label: "Tambah Pemeriksaan",
        onClick: () => console.log('Add pemeriksaan')
      }}
    />

    {/* Persalinan */}
    <EmptyState 
      message="Belum ada data persalinan" 
      action={{
        label: "Tambah Data Persalinan",
        onClick: () => console.log('Add persalinan')
      }}
    />

    {/* Keluarga Berencana */}
    <EmptyState 
      message="Belum ada data keluarga berencana" 
      action={{
        label: "Tambah Data KB",
        onClick: () => console.log('Add KB')
      }}
    />

    {/* Imunisasi */}
    <EmptyState 
      message="Belum ada data imunisasi" 
      action={{
        label: "Tambah Data Imunisasi",
        onClick: () => console.log('Add imunisasi')
      }}
    />
  </div>
);

// Example 6: Empty state for master data
export const MasterDataEmptyStates = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
    {/* Villages */}
    <EmptyState 
      message="Belum ada data desa" 
      action={{
        label: "Tambah Desa",
        onClick: () => console.log('Add village')
      }}
    />

    {/* Practice Places */}
    <EmptyState 
      message="Belum ada data tempat praktik" 
      action={{
        label: "Tambah Tempat Praktik",
        onClick: () => console.log('Add practice place')
      }}
    />

    {/* Patients */}
    <EmptyState 
      message="Belum ada data pasien" 
      action={{
        label: "Tambah Pasien Baru",
        onClick: () => console.log('Add patient')
      }}
    />
  </div>
);

// Example 7: Empty state for user management (ADMIN role)
export const UserManagementEmptyState = () => (
  <EmptyState 
    message="Belum ada data pengguna" 
    action={{
      label: "Tambah Pengguna",
      onClick: () => console.log('Navigate to add user')
    }}
  />
);

// Example 8: Empty state for verification tasks (Bidan Desa)
export const PendingTasksEmptyState = () => (
  <EmptyState message="Tidak ada tugas verifikasi yang menunggu" />
);

// Example 9: Empty state for rejected data (Bidan Praktik)
export const RejectedDataEmptyState = () => (
  <EmptyState message="Tidak ada data yang ditolak" />
);

// Example 10: Empty state in a data table container
export const TableWithEmptyState = () => {
  const data = []; // Simulating empty data
  
  if (data.length === 0) {
    return (
      <div style={{ 
        background: 'var(--color-surface-dark)', 
        borderRadius: '12px', 
        padding: '24px' 
      }}>
        <EmptyState 
          message="Belum ada data pengguna" 
          action={{
            label: "Tambah Pengguna",
            onClick: () => console.log('Add user')
          }}
        />
      </div>
    );
  }
  
  return <table>{/* table content */}</table>;
};

// Example 11: Empty state with custom className
export const CustomStyledEmptyState = () => (
  <EmptyState 
    message="Belum ada data laporan" 
    className="custom-empty-state"
    action={{
      label: "Buat Laporan Baru",
      onClick: () => console.log('Create report')
    }}
  />
);

// Example 12: Empty state for dashboard feed (Bidan Koordinator)
export const DashboardFeedEmptyState = () => (
  <EmptyState message="Belum ada data yang disetujui dari desa" />
);

// Example 13: Empty state in React Router context
export const RouterContextExample = () => {
  // In actual usage, you would use useNavigate from react-router-dom
  const navigate = (path) => {
    console.log(`Navigate to: ${path}`);
  };

  return (
    <EmptyState 
      message="Belum ada data pemeriksaan kehamilan" 
      action={{
        label: "Tambah Data Baru",
        onClick: () => navigate('/pemeriksaan-kehamilan/add')
      }}
    />
  );
};

// Example 14: Conditional rendering pattern
export const ConditionalEmptyStateExample = ({ data, isLoading }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        message="Belum ada data persalinan" 
        action={{
          label: "Tambah Data Persalinan",
          onClick: () => console.log('Add persalinan')
        }}
      />
    );
  }
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};

// Example 15: Empty state with role-based action visibility
export const RoleBasedEmptyState = ({ userRole }) => {
  // Bidan Praktik can add data
  const canAddData = userRole === 'USER' && 
    (positionUser === 'bidan_praktik');

  return (
    <EmptyState 
      message="Belum ada data keluarga berencana" 
      action={canAddData ? {
        label: "Tambah Data KB",
        onClick: () => console.log('Add KB data')
      } : undefined}
    />
  );
};

// Example 16: Empty state in card container
export const EmptyStateInCard = () => (
  <div style={{
    background: 'var(--color-canvas)',
    borderRadius: '12px',
    padding: '32px',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <EmptyState 
      message="Belum ada data imunisasi" 
      action={{
        label: "Tambah Data Imunisasi",
        onClick: () => console.log('Add imunisasi')
      }}
    />
  </div>
);
