# EmptyState Component

A reusable component for displaying empty state messages with optional action buttons. Used when data lists are empty or no results are found.

## Features

- **Centered layout**: Content is centered both vertically and horizontally
- **Muted typography**: Uses body-md typography with muted color (#6c6a64)
- **Optional action button**: Supports coral primary CTA for "Add New" actions
- **Flexible messaging**: Customizable message text for different contexts
- **Responsive design**: Adapts padding and font sizes for mobile devices
- **Design system compliant**: Uses CSS custom properties from design-system.css

## Installation

The EmptyState component is located in `src/components/ui/EmptyState.jsx` and can be imported:

```jsx
import EmptyState from '@/components/ui/EmptyState';
// or
import { EmptyState } from '@/components/ui';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | - | Message to display (required) |
| `action` | `object` | `undefined` | Optional action button configuration |
| `action.label` | `string` | - | Button label text (required if action provided) |
| `action.onClick` | `function` | - | Click handler (required if action provided) |
| `className` | `string` | `''` | Additional CSS classes |

## Usage Examples

### Simple Empty State (No Action)
```jsx
<EmptyState message="Belum ada data pasien" />
```

### Empty State with Action Button
```jsx
import { useNavigate } from 'react-router-dom';

function PatientList() {
  const navigate = useNavigate();
  
  return (
    <EmptyState 
      message="Belum ada data pasien" 
      action={{
        label: "Tambah Pasien Baru",
        onClick: () => navigate('/pasien/add')
      }}
    />
  );
}
```

### In a Table Component
```jsx
import { Table, EmptyState } from '@/components/ui';

function UserTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        message="Belum ada data pengguna" 
        action={{
          label: "Tambah Pengguna",
          onClick: handleAddUser
        }}
      />
    );
  }
  
  return <Table data={data} columns={columns} />;
}
```

### Search Results Empty State
```jsx
<EmptyState message="Tidak ada hasil pencarian yang sesuai" />
```

### Empty Service Module Data
```jsx
<EmptyState 
  message="Belum ada data pemeriksaan kehamilan" 
  action={{
    label: "Tambah Data Baru",
    onClick: () => navigate('/pemeriksaan-kehamilan/add')
  }}
/>
```

### With Custom ClassName
```jsx
<EmptyState 
  message="Belum ada data persalinan" 
  className="my-custom-empty-state"
  action={{
    label: "Tambah Data Persalinan",
    onClick: handleAddData
  }}
/>
```

### Filtered Results Empty State
```jsx
function FilteredList({ filteredData, clearFilters }) {
  if (filteredData.length === 0) {
    return (
      <EmptyState 
        message="Tidak ada data yang sesuai dengan filter" 
        action={{
          label: "Hapus Filter",
          onClick: clearFilters
        }}
      />
    );
  }
  
  return <DataList data={filteredData} />;
}
```

## Visual Design

### Layout
- **Display**: Flexbox column layout
- **Alignment**: Center both horizontally and vertically
- **Min Height**: 200px (160px on mobile)
- **Padding**: 48px (32px on mobile)
- **Gap**: 24px between message and button

### Typography
- **Font Family**: Sans-serif (Manrope)
- **Font Size**: 16px (14px on mobile)
- **Font Weight**: 400 (regular)
- **Line Height**: 1.55
- **Color**: Muted (#6c6a64)

### Action Button
- **Background**: Coral primary (#cc785c)
- **Hover**: Dark coral (#a9583e)
- **Text Color**: White
- **Font Size**: 14px
- **Font Weight**: 500
- **Padding**: 12px × 20px
- **Height**: 40px
- **Border Radius**: 8px
- **Focus Ring**: 3px coral at 15% alpha

## Responsive Behavior

On mobile devices (viewport < 768px):
- Padding reduces from 48px to 32px
- Message font size reduces from 16px to 14px
- Min height reduces from 200px to 160px

## Design System Integration

The EmptyState component uses CSS custom properties from `design-system.css`:

- **Colors**: `--color-text-muted`, `--color-primary`, `--color-primary-dark`
- **Typography**: `--font-sans`
- **Spacing**: `--spacing-xs`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`

## Accessibility

- **Semantic HTML**: Uses appropriate paragraph and button elements
- **Keyboard Navigation**: Action button is fully keyboard accessible
- **Focus Indicators**: Visible focus ring on button
- **Screen Reader**: Message text is properly announced
- **Button Type**: Explicitly set to "button" to prevent form submission

## Testing

The component includes comprehensive unit tests covering:
- Message rendering
- Action button rendering (conditional)
- Click handler execution
- Custom className application
- Typography and styling
- Both message-only and message-with-action scenarios

Run tests with:
```bash
npm test -- src/components/ui/EmptyState.test.jsx
```

## Requirements Addressed

This component fulfills the following requirements from the UI Refactor spec:

- **Requirement 2.1**: Uses design system colors (muted #6c6a64, primary #cc785c)
- **Requirement 3.6**: Uses body-md typography (16px / 400 weight)
- **Requirement 5.10**: Displays empty state message with body-md typography
- **Requirement 9.9**: Provides EmptyState component for empty data states

## Common Use Cases

1. **Empty Data Lists**: When service module data (Pemeriksaan Kehamilan, Persalinan, KB, Imunisasi) is empty
2. **No Search Results**: When user search returns no matches
3. **Filtered Results**: When applied filters produce no results
4. **Master Data Empty**: When villages, practice places, or patients list is empty
5. **Pending Tasks**: When Bidan Desa has no pending verification tasks
6. **Rejected Data**: When Bidan Praktik has no rejected items requiring revision

## Files

- `EmptyState.jsx` - Main component implementation
- `EmptyState.css` - Component styles with design system tokens
- `EmptyState.test.jsx` - Unit tests (10 tests, all passing)
- `EmptyState.example.jsx` - Usage examples
- `EmptyState.README.md` - This documentation file

## Browser Support

Works in all modern browsers supporting CSS custom properties and Flexbox:
- Chrome/Edge 88+
- Firefox 89+
- Safari 14+
