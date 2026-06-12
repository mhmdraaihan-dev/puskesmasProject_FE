# Table Component

A comprehensive data table component with dark navy surface styling, hover states, and support for custom rendering, sorting indicators, and clickable rows.

## Features

- ✅ **Dark Navy Background**: Uses `#181715` with cream text `#faf9f5` for optimal contrast
- ✅ **Hairline Borders**: 20% opacity for headers, 10% for rows
- ✅ **Hover States**: Surface-dark-elevated background `#252320` on row hover
- ✅ **Clickable Rows**: Optional `onRowClick` callback with cursor pointer
- ✅ **Custom Rendering**: Render functions for custom cell content
- ✅ **Column Width Control**: Specify fixed or percentage widths
- ✅ **Sortable Columns**: Optional sort indicators for columns
- ✅ **Loading State**: Spinner with coral accent color
- ✅ **Empty State**: Customizable empty message
- ✅ **Responsive Design**: Horizontal scroll on mobile devices
- ✅ **Keyboard Accessible**: Clickable rows support Enter/Space keys

## Props API

### `columns` (required)

Array of column definitions. Each column object can have:

- **`key`** (string, required): Property key in data object
- **`label`** (string, required): Column header text
- **`sortable`** (boolean, optional): Show sort indicator (↕)
- **`render`** (function, optional): Custom render function `(value, row) => ReactNode`
- **`width`** (string, optional): CSS width value (e.g., `'120px'`, `'20%'`)

### `data` (required)

Array of data objects to display. Each object should have properties matching column keys.

### `loading` (optional)

Boolean indicating loading state. Shows spinner when `true`. Default: `false`

### `emptyMessage` (optional)

Message to display when data array is empty. Default: `'Tidak ada data'`

### `onRowClick` (optional)

Callback function when a row is clicked. Receives the row data object as parameter.
When provided, rows become clickable with pointer cursor.

```javascript
onRowClick={(row) => navigate(`/detail/${row.id}`)}
```

### `className` (optional)

Additional CSS classes to apply to the table container.

## Basic Usage

```jsx
import { Table } from '@/components/ui';

const columns = [
  { key: 'name', label: 'Nama' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telepon' },
];

const data = [
  { name: 'Budi Santoso', email: 'budi@example.com', phone: '081234567890' },
  { name: 'Siti Rahma', email: 'siti@example.com', phone: '081234567891' },
];

<Table columns={columns} data={data} />
```

## Custom Rendering

Use the `render` function to customize cell content:

```jsx
const columns = [
  { key: 'nama', label: 'Nama' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: 'actions',
    label: 'Aksi',
    width: '150px',
    render: (_, row) => (
      <Button onClick={() => handleEdit(row)}>Edit</Button>
    )
  }
];
```

## Clickable Rows

Enable row clicking for navigation:

```jsx
<Table 
  columns={columns}
  data={data}
  onRowClick={(row) => navigate(`/pasien/${row.id}`)}
/>
```

**Important**: When using action buttons inside rows with `onRowClick`, stop propagation to prevent row click:

```jsx
render: (_, row) => (
  <Button 
    onClick={(e) => {
      e.stopPropagation(); // Prevent row click
      handleEdit(row);
    }}
  >
    Edit
  </Button>
)
```

## Sortable Columns

Show sort indicators on columns:

```jsx
const columns = [
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'tanggal', label: 'Tanggal', sortable: true },
];
```

**Note**: The Table component displays sort indicators but does not implement sorting logic. Implement sorting in your parent component:

```jsx
const [sortKey, setSortKey] = React.useState('nama');
const [sortOrder, setSortOrder] = React.useState('asc');

const sortedData = React.useMemo(() => {
  return [...data].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}, [data, sortKey, sortOrder]);
```

## Loading State

Show loading spinner while fetching data:

```jsx
const [loading, setLoading] = React.useState(true);
const [data, setData] = React.useState([]);

React.useEffect(() => {
  fetchData().then(result => {
    setData(result);
    setLoading(false);
  });
}, []);

<Table columns={columns} data={data} loading={loading} />
```

## Empty State

Customize the empty state message:

```jsx
<Table 
  columns={columns}
  data={[]}
  emptyMessage="Belum ada data pasien yang terdaftar"
/>
```

## Column Width Control

Control column widths for better layout:

```jsx
const columns = [
  { key: 'nik', label: 'NIK', width: '180px' },
  { key: 'nama', label: 'Nama' }, // Auto width
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'actions', label: 'Aksi', width: '150px' },
];
```

## Complete Example

```jsx
import React from 'react';
import { Table } from '@/components/ui';
import { StatusBadge } from '@/components';
import { useNavigate } from 'react-router-dom';

const PasienList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    fetchPasienData()
      .then(result => setData(result))
      .finally(() => setLoading(false));
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
      key: 'desa', 
      label: 'Desa' 
    },
    { 
      key: 'status_verifikasi', 
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
      width: '150px'
    },
  ];

  return (
    <div>
      <h1>Daftar Pasien</h1>
      <Table 
        columns={columns}
        data={data}
        loading={loading}
        onRowClick={(row) => navigate(`/pasien/${row.id}`)}
        emptyMessage="Belum ada data pasien"
      />
    </div>
  );
};
```

## Responsive Behavior

- **Desktop (≥1024px)**: Full table with standard padding
- **Tablet (768-1023px)**: Slightly reduced padding
- **Mobile (<768px)**: Horizontal scroll with reduced font sizes and padding

The table automatically handles overflow with a custom scrollbar on smaller screens.

## Accessibility

- ✅ Semantic `<table>` elements for screen readers
- ✅ Clickable rows support keyboard navigation (Tab, Enter, Space)
- ✅ Focus indicators on clickable rows
- ✅ ARIA role="button" for clickable rows
- ✅ Loading and empty states announced to screen readers

## Design System Integration

The Table component uses design system tokens:

- **Colors**: `--color-surface-dark`, `--color-on-dark`, `--color-surface-dark-elevated`, `--color-primary`
- **Typography**: `--type-title-sm-*`, `--type-body-md-*`
- **Spacing**: `--spacing-sm`, `--spacing-md`, `--spacing-lg`
- **Border Radius**: `--rounded-lg`, `--rounded-md`

## Requirements Mapping

This component fulfills the following requirements:

- **2.1**: Uses dark navy (#181715) for table background
- **2.2**: Uses coral primary (#cc785c) for loading spinner
- **5.1**: Renders tables with dark navy background and cream text
- **5.2**: Displays table headers with title-sm typography
- **5.3**: Displays table cells with body-md typography
- **5.4**: Uses hairline borders at 20% opacity for headers, 10% for rows
- **5.5**: Applies surface-dark-elevated background on hover
- **9.11**: Provides Table component with dark surface styling and hover states

## Related Components

- **StatusBadge**: For rendering verification and user status in table cells
- **Button**: For action buttons in table cells
- **Card**: Can wrap Table for additional styling options

## Common Patterns

### Table with Filters

```jsx
<div>
  <div className="filters">
    <Input 
      placeholder="Cari nama..." 
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <Select 
      options={statusOptions}
      value={statusFilter}
      onChange={setStatusFilter}
    />
  </div>
  <Table columns={columns} data={filteredData} />
</div>
```

### Table with Pagination

```jsx
<div>
  <Table columns={columns} data={currentPageData} />
  <Pagination 
    currentPage={page}
    totalPages={totalPages}
    onPageChange={setPage}
  />
</div>
```

### Table with Selection

```jsx
const columns = [
  {
    key: 'select',
    label: '',
    width: '50px',
    render: (_, row) => (
      <input 
        type="checkbox"
        checked={selected.includes(row.id)}
        onChange={() => toggleSelect(row.id)}
        onClick={(e) => e.stopPropagation()}
      />
    )
  },
  // ... other columns
];
```

## Troubleshooting

### Columns not rendering correctly

Ensure each data object has properties matching the column `key` values.

### Row click not working

Check that `onRowClick` is passed and the function signature is correct: `(row) => void`

### Action buttons triggering row click

Use `e.stopPropagation()` in button onClick handlers inside render functions.

### Table overflowing on mobile

The table automatically scrolls horizontally on mobile. Ensure parent containers don't have `overflow: hidden`.

### Sort indicator not showing

Set `sortable: true` on the column definition. Note: sorting logic must be implemented separately.
