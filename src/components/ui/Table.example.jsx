import React from 'react';
import Table from './Table';
import StatusBadge from '../StatusBadge';
import Button from '../Button';

/**
 * Table Component Usage Examples
 * 
 * This file demonstrates various use cases for the Table component
 * including basic tables, custom rendering, clickable rows, and state handling.
 */

// Example 1: Basic Table with Simple Data
export const BasicTableExample = () => {
  const columns = [
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telepon' },
  ];

  const data = [
    { name: 'Budi Santoso', email: 'budi@example.com', phone: '081234567890' },
    { name: 'Siti Rahma', email: 'siti@example.com', phone: '081234567891' },
    { name: 'Ahmad Wijaya', email: 'ahmad@example.com', phone: '081234567892' },
  ];

  return <Table columns={columns} data={data} />;
};

// Example 2: Table with Custom Rendering and Status Badges
export const CustomRenderTableExample = () => {
  const columns = [
    { 
      key: 'full_name', 
      label: 'Nama Lengkap',
      width: '200px'
    },
    { 
      key: 'role', 
      label: 'Role',
      render: (value) => (
        <span style={{ 
          textTransform: 'uppercase', 
          fontWeight: 500,
          color: 'var(--color-primary)' 
        }}>
          {value}
        </span>
      )
    },
    { 
      key: 'status_user', 
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'actions',
      label: 'Aksi',
      width: '120px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant="secondary-on-dark" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              console.log('Edit', row);
            }}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  const data = [
    { 
      full_name: 'Dr. Budi Santoso', 
      role: 'ADMIN', 
      status_user: 'ACTIVE',
      user_id: '1'
    },
    { 
      full_name: 'Siti Rahma', 
      role: 'USER', 
      status_user: 'ACTIVE',
      user_id: '2'
    },
    { 
      full_name: 'Ahmad Wijaya', 
      role: 'USER', 
      status_user: 'INACTIVE',
      user_id: '3'
    },
  ];

  return <Table columns={columns} data={data} />;
};

// Example 3: Clickable Rows Table
export const ClickableRowsTableExample = () => {
  const columns = [
    { key: 'nik', label: 'NIK', sortable: true },
    { key: 'nama', label: 'Nama Pasien', sortable: true },
    { key: 'desa', label: 'Desa' },
    { 
      key: 'status_verifikasi', 
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
  ];

  const data = [
    { 
      nik: '3201010101010001', 
      nama: 'Siti Aminah',
      desa: 'Desa A',
      status_verifikasi: 'APPROVED',
      id: '1'
    },
    { 
      nik: '3201010101010002', 
      nama: 'Rini Wulandari',
      desa: 'Desa B',
      status_verifikasi: 'PENDING',
      id: '2'
    },
    { 
      nik: '3201010101010003', 
      nama: 'Dewi Lestari',
      desa: 'Desa C',
      status_verifikasi: 'REJECTED',
      id: '3'
    },
  ];

  const handleRowClick = (row) => {
    console.log('Navigating to detail page for:', row);
    // In real app: navigate(`/pasien/${row.id}`);
  };

  return (
    <Table 
      columns={columns} 
      data={data} 
      onRowClick={handleRowClick}
    />
  );
};

// Example 4: Table with Loading State
export const LoadingTableExample = () => {
  const columns = [
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <Table 
      columns={columns} 
      data={[]} 
      loading={true}
    />
  );
};

// Example 5: Table with Empty State
export const EmptyTableExample = () => {
  const columns = [
    { key: 'name', label: 'Nama' },
    { key: 'email', label: 'Email' },
  ];

  return (
    <Table 
      columns={columns} 
      data={[]} 
      emptyMessage="Belum ada data pasien yang terdaftar"
    />
  );
};

// Example 6: Complete Table Implementation with Pagination
export const CompleteTableExample = () => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  // Simulate data fetching
  React.useEffect(() => {
    setTimeout(() => {
      setData([
        { 
          id: '1',
          nik: '3201010101010001', 
          nama: 'Siti Aminah',
          umur: 28,
          desa: 'Desa A',
          status: 'APPROVED',
        },
        { 
          id: '2',
          nik: '3201010101010002', 
          nama: 'Rini Wulandari',
          umur: 25,
          desa: 'Desa B',
          status: 'PENDING',
        },
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  const columns = [
    { 
      key: 'nik', 
      label: 'NIK',
      sortable: true,
      width: '180px'
    },
    { 
      key: 'nama', 
      label: 'Nama Pasien',
      sortable: true 
    },
    { 
      key: 'umur', 
      label: 'Umur',
      render: (value) => `${value} tahun`,
      width: '100px'
    },
    { 
      key: 'desa', 
      label: 'Desa',
      sortable: true 
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
      width: '150px'
    },
    {
      key: 'actions',
      label: 'Aksi',
      width: '180px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant="secondary-on-dark"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('View', row);
            }}
          >
            Lihat
          </Button>
          <Button 
            variant="secondary-on-dark"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit', row);
            }}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  const handleRowClick = (row) => {
    console.log('Navigate to detail:', row.id);
  };

  return (
    <div>
      <Table 
        columns={columns}
        data={data}
        loading={loading}
        onRowClick={handleRowClick}
        emptyMessage="Tidak ada data pasien yang tersedia"
      />
    </div>
  );
};

// Example 7: Sortable Columns Table
export const SortableTableExample = () => {
  const columns = [
    { 
      key: 'nama', 
      label: 'Nama Lengkap',
      sortable: true
    },
    { 
      key: 'tanggal', 
      label: 'Tanggal Pemeriksaan',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('id-ID')
    },
    { 
      key: 'berat_badan', 
      label: 'Berat Badan',
      sortable: true,
      render: (value) => `${value} kg`,
      width: '120px'
    },
  ];

  const data = [
    { nama: 'Siti Aminah', tanggal: '2024-01-15', berat_badan: 65 },
    { nama: 'Rini Wulandari', tanggal: '2024-01-20', berat_badan: 58 },
    { nama: 'Dewi Lestari', tanggal: '2024-01-18', berat_badan: 62 },
  ];

  return <Table columns={columns} data={data} />;
};

export default {
  BasicTableExample,
  CustomRenderTableExample,
  ClickableRowsTableExample,
  LoadingTableExample,
  EmptyTableExample,
  CompleteTableExample,
  SortableTableExample,
};
