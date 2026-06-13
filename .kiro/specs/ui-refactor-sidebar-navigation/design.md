# Design Document: UI Refactor - Sidebar Navigation with Claude Design System

## Overview

This design document specifies the comprehensive UI refactor of the Puskesmas frontend application. The refactor transforms the current top-navbar architecture into a modern sidebar navigation system while implementing a warm editorial design system inspired by Claude's interface. This refactor addresses the complete visual and interaction layer of the application, touching every page, component, and user flow while maintaining full compatibility with the existing backend API.

### Goals

1. **Maximize screen real estate**: Replace horizontal top navbar with vertical sidebar to free horizontal space for content
2. **Implement cohesive design system**: Apply Claude-inspired warm editorial aesthetic consistently across all pages
3. **Improve navigation clarity**: Organize routes into logical groups with visual hierarchy
4. **Maintain backend compatibility**: Preserve all existing API integrations and authentication flows
5. **Enhance accessibility**: Implement WCAG 2.1 AA compliant patterns for keyboard navigation and screen readers
6. **Support role-based UI**: Render appropriate navigation and features based on user role and position
7. **Optimize performance**: Implement code splitting and lazy loading for improved load times
8. **Deliver responsive experience**: Adapt layout for desktop (≥1024px), tablet (768-1023px), and mobile (<768px)

### Scope

**In Scope:**
- Sidebar navigation component with collapse/expand functionality
- Design system implementation (colors, typography, spacing, components)
- Layout restructuring (MainLayout with sidebar + content area)
- Component library refactor (Button, Card, Input, Table, StatusBadge, etc.)
- All page refactors (Dashboard, User Management, Master Data, Service Modules, Reports)
- Form styling with validation states
- Table styling with dark surfaces
- Responsive breakpoints and mobile hamburger menu
- Accessibility features (ARIA labels, keyboard navigation, focus management)
- Role-based navigation rendering

**Out of Scope:**
- Backend API changes
- New feature development beyond UI refactor
- Database schema modifications
- Authentication/authorization logic changes (using existing AuthContext)
- Report generation logic (maintaining existing export functionality)


## Architecture

### Component Hierarchy

```
App
├── BrowserRouter
│   └── AuthProvider (existing)
│       └── Routes
│           ├── Public Routes (Login, Register)
│           └── Protected Routes (wrapped in ProtectedRoute)
│               └── MainLayout (new)
│                   ├── Sidebar (new)
│                   │   ├── SidebarHeader (logo, collapse toggle)
│                   │   ├── SidebarNav (navigation groups)
│                   │   │   ├── NavGroup (collapsible section)
│                   │   │   │   └── NavItem[] (navigation links)
│                   │   │   └── ...
│                   │   └── SidebarFooter (user menu)
│                   └── MainContent (new)
│                       ├── Breadcrumbs (new, optional)
│                       └── [Page Component]
│                           ├── PageHeader (new)
│                           │   ├── heading (h1 with serif display)
│                           │   └── actions (buttons, filters)
│                           └── PageContent
│                               ├── Dashboard (role-specific)
│                               ├── UserList / UserForm
│                               ├── VillageList / VillageForm
│                               ├── PasienList / PasienForm
│                               ├── PemeriksaanKehamilanList / Form
│                               ├── PersalinanList / Form
│                               ├── KBList / Form
│                               ├── ImunisasiList / Form
│                               ├── PendingDataList
│                               ├── RejectedDataList
│                               └── RekapitulasiPage
```

### Folder Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── MainLayout.jsx (sidebar + content wrapper)
│   │   ├── Sidebar.jsx (main sidebar component)
│   │   ├── SidebarHeader.jsx
│   │   ├── SidebarNav.jsx
│   │   ├── NavGroup.jsx
│   │   ├── NavItem.jsx
│   │   ├── SidebarFooter.jsx
│   │   ├── MainContent.jsx (content area wrapper)
│   │   ├── PageHeader.jsx
│   │   └── Breadcrumbs.jsx
│   ├── ui/
│   │   ├── Button.jsx (refactored with design system)
│   │   ├── Card.jsx (new)
│   │   ├── Input.jsx (refactored)
│   │   ├── Select.jsx (refactored CustomSelect)
│   │   ├── Table.jsx (new)
│   │   ├── StatusBadge.jsx (refactored)
│   │   ├── Modal.jsx (refactored ConfirmDialog)
│   │   ├── Tooltip.jsx (new)
│   │   ├── EmptyState.jsx (new)
│   │   └── LoadingSpinner.jsx (new)
│   ├── dashboard/
│   │   ├── DashboardAdmin.jsx
│   │   ├── DashboardKoordinator.jsx
│   │   ├── DashboardDesa.jsx
│   │   ├── DashboardPraktik.jsx
│   │   └── StatsCard.jsx
│   └── RoleGuard.jsx (existing, no changes)
├── styles/
│   ├── design-system.css (design tokens)
│   ├── layout.css (sidebar, main content)
│   ├── components.css (component styles)
│   └── responsive.css (breakpoint overrides)
├── hooks/
│   ├── useSidebar.js (sidebar state management)
│   └── useMediaQuery.js (responsive breakpoints)
├── utils/
│   ├── navigationConfig.js (role-based nav structure)
│   └── roleHelpers.js (existing)
└── [existing files...]
```


### Routing Architecture

The routing structure remains unchanged, but all protected routes will be wrapped in the new `MainLayout` component:

```jsx
// App.jsx structure (simplified)
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes - no layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes - with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><UserList /></ProtectedRoute>} />
            {/* ... all other protected routes */}
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### State Management Strategy

**Sidebar State:**
- Managed by custom `useSidebar` hook
- State stored in localStorage: `{ collapsed: boolean, expandedGroups: string[] }`
- Provides: `{ collapsed, toggleCollapsed, expandedGroups, toggleGroup, isActive }`

**Authentication State:**
- Continue using existing `AuthContext`
- No changes to authentication flow
- User role/position accessed via `useAuth()`

**Navigation State:**
- Active route determined by `useLocation()` from react-router-dom
- Breadcrumbs generated from route configuration and current path

**Form State:**
- Continue using react-hook-form for all forms
- No changes to form validation logic


## Components and Interfaces

### Sidebar Component

**Purpose:** Primary navigation component with collapse/expand functionality, role-based menu rendering, and mobile hamburger behavior.

**Props Interface:**
```typescript
interface SidebarProps {
  // No props - manages its own state via useSidebar hook
}
```

**Internal Structure:**
```jsx
<aside className="sidebar" data-collapsed={collapsed}>
  <SidebarHeader />
  <SidebarNav navigationConfig={getNavigationForRole(user.role, user.position_user)} />
  <SidebarFooter user={user} onLogout={logout} />
</aside>
```

**State Management:**
- `collapsed` (boolean): Sidebar expanded (false) or icon-only (true)
- `isMobile` (boolean): Mobile viewport detection
- `mobileMenuOpen` (boolean): Mobile overlay menu state

**Styling Classes:**
```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 240px; /* expanded */
  background: var(--color-surface-dark); /* #181715 */
  transition: width 0.3s ease;
  z-index: 1000;
}

.sidebar[data-collapsed="true"] {
  width: 64px; /* collapsed */
}

@media (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar[data-mobile-open="true"] {
    transform: translateX(0);
  }
}
```

### SidebarNav Component

**Purpose:** Renders navigation groups and items based on role-based configuration.

**Props Interface:**
```typescript
interface SidebarNavProps {
  navigationConfig: NavigationGroup[];
}

interface NavigationGroup {
  id: string;
  label: string;
  icon?: ReactNode;
  items: NavigationItem[];
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  badge?: { text: string; variant: 'primary' | 'warning' };
}
```

**Example Navigation Config:**
```javascript
// For ADMIN role
const adminNavigation = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      { id: 'home', label: 'Beranda', path: '/', icon: <HomeIcon /> }
    ]
  },
  {
    id: 'users',
    label: 'Manajemen Pengguna',
    items: [
      { id: 'user-list', label: 'Daftar Pengguna', path: '/users', icon: <UsersIcon /> },
      { id: 'add-user', label: 'Tambah Pengguna', path: '/add-user', icon: <UserPlusIcon /> }
    ]
  },
  {
    id: 'master-data',
    label: 'Data Master',
    items: [
      { id: 'villages', label: 'Desa', path: '/villages', icon: <MapIcon /> },
      { id: 'practices', label: 'Tempat Praktik', path: '/practice-places', icon: <BuildingIcon /> },
      { id: 'pasien', label: 'Pasien', path: '/pasien', icon: <UserIcon /> }
    ]
  },
  // ... service modules, reports
];
```


### MainLayout Component

**Purpose:** Wrapper component that combines Sidebar and MainContent, managing responsive behavior.

**Implementation:**
```jsx
const MainLayout = () => {
  const { collapsed, isMobile } = useSidebar();
  
  return (
    <div className="app-layout">
      <Sidebar />
      {isMobile && <MobileBackdrop />}
      <MainContent className={collapsed ? 'content-expanded' : 'content-normal'}>
        <Outlet /> {/* React Router outlet for nested routes */}
      </MainContent>
    </div>
  );
};
```

**Styling:**
```css
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-canvas); /* #faf9f5 */
}

.main-content {
  flex: 1;
  margin-left: 240px; /* sidebar width when expanded */
  padding: var(--spacing-xl); /* 32px */
  transition: margin-left 0.3s ease;
}

.main-content.content-expanded {
  margin-left: 64px; /* sidebar width when collapsed */
}

@media (max-width: 767px) {
  .main-content {
    margin-left: 0;
    padding: var(--spacing-md); /* 16px on mobile */
  }
}
```

### Button Component (Refactored)

**Purpose:** Reusable button component with design system variants.

**Props Interface:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'secondary-on-dark' | 'text-link' | 'icon-circular';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

**Variant Implementations:**

```css
/* Primary - Coral CTA */
.btn-primary {
  background: var(--color-primary); /* #cc785c */
  color: var(--color-on-primary); /* #ffffff */
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  padding: 12px 20px;
  height: 40px;
  border-radius: var(--rounded-md); /* 8px */
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-active); /* #a9583e */
}

.btn-primary:disabled {
  background: var(--color-primary-disabled); /* #e6dfd8 */
  color: var(--color-muted); /* #6c6a64 */
  cursor: not-allowed;
}

/* Secondary - Canvas button */
.btn-secondary {
  background: var(--color-canvas); /* #faf9f5 */
  color: var(--color-ink); /* #141413 */
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  padding: 12px 20px;
  height: 40px;
  border-radius: var(--rounded-md);
  border: 1px solid var(--color-hairline); /* #e6dfd8 */
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-primary);
}

/* Secondary on Dark - for dark navy surfaces */
.btn-secondary-on-dark {
  background: var(--color-surface-dark-elevated); /* #252320 */
  color: var(--color-on-dark); /* #faf9f5 */
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  padding: 12px 20px;
  height: 40px;
  border-radius: var(--rounded-md);
  border: none;
  cursor: pointer;
}
```


### Card Component (New)

**Purpose:** Container component for grouping related content with design system surface variants.

**Props Interface:**
```typescript
interface CardProps {
  variant?: 'canvas' | 'surface-card' | 'surface-dark';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  className?: string;
}
```

**Implementation:**
```jsx
const Card = ({ 
  variant = 'canvas', 
  padding = 'xl', 
  rounded = 'lg',
  children,
  className = ''
}) => {
  return (
    <div 
      className={`card card--${variant} card--padding-${padding} card--rounded-${rounded} ${className}`}
    >
      {children}
    </div>
  );
};
```

**Styling:**
```css
.card {
  display: block;
}

/* Variants */
.card--canvas {
  background: var(--color-canvas); /* #faf9f5 */
  color: var(--color-ink);
}

.card--surface-card {
  background: var(--color-surface-card); /* #efe9de */
  color: var(--color-ink);
}

.card--surface-dark {
  background: var(--color-surface-dark); /* #181715 */
  color: var(--color-on-dark); /* #faf9f5 */
}

/* Padding */
.card--padding-sm { padding: var(--spacing-sm); } /* 12px */
.card--padding-md { padding: var(--spacing-md); } /* 16px */
.card--padding-lg { padding: var(--spacing-lg); } /* 24px */
.card--padding-xl { padding: var(--spacing-xl); } /* 32px */

/* Border Radius */
.card--rounded-sm { border-radius: var(--rounded-sm); } /* 6px */
.card--rounded-md { border-radius: var(--rounded-md); } /* 8px */
.card--rounded-lg { border-radius: var(--rounded-lg); } /* 12px */
.card--rounded-xl { border-radius: var(--rounded-xl); } /* 16px */
```

### Input Component (Refactored)

**Purpose:** Form input with design system styling, validation states, and react-hook-form integration.

**Props Interface:**
```typescript
interface InputProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  register?: UseFormRegister; // from react-hook-form
  className?: string;
}
```

**Implementation:**
```jsx
const Input = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  required, 
  disabled,
  error, 
  helperText, 
  register,
  className = ''
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${error ? 'input--error' : ''}`}
        {...(register ? register(name) : {})}
      />
      {error && <p className="input-error">{error}</p>}
      {helperText && !error && <p className="input-helper">{helperText}</p>}
    </div>
  );
};
```

**Styling:**
```css
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs); /* 8px */
}

.input-label {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-ink);
}

.input-required {
  color: var(--color-error); /* #c64545 */
  margin-left: 4px;
}

.input {
  background: var(--color-canvas); /* #faf9f5 */
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.55;
  padding: 10px 14px;
  height: 40px;
  border: 1px solid var(--color-hairline); /* #e6dfd8 */
  border-radius: var(--rounded-md); /* 8px */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary); /* #cc785c */
  box-shadow: 0 0 0 3px rgba(204, 120, 92, 0.15); /* coral at 15% alpha */
}

.input--error {
  border-color: var(--color-error); /* #c64545 */
}

.input--error:focus {
  box-shadow: 0 0 0 3px rgba(198, 69, 69, 0.15);
}

.input-error {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.55;
  color: var(--color-error);
  margin: 0;
}

.input-helper {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.55;
  color: var(--color-muted); /* #6c6a64 */
  margin: 0;
}
```


### Table Component (New)

**Purpose:** Data table with dark navy surface styling, hover states, and integrated filtering/sorting.

**Props Interface:**
```typescript
interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  className?: string;
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
  width?: string;
}
```

**Implementation:**
```jsx
const Table = ({ columns, data, loading, emptyMessage, onRowClick, className = '' }) => {
  if (loading) return <LoadingSpinner />;
  if (!data || data.length === 0) return <EmptyState message={emptyMessage} />;
  
  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr 
              key={idx} 
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'table-row--clickable' : ''}
            >
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

**Styling:**
```css
.table-container {
  background: var(--color-surface-dark); /* #181715 */
  border-radius: var(--rounded-lg); /* 12px */
  padding: var(--spacing-lg); /* 24px */
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  color: var(--color-on-dark); /* #faf9f5 */
}

.table thead th {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  text-align: left;
  padding: var(--spacing-md) var(--spacing-sm);
  border-bottom: 1px solid rgba(230, 223, 216, 0.2); /* hairline at 20% on dark */
}

.table tbody td {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.55;
  padding: var(--spacing-md) var(--spacing-sm);
  border-bottom: 1px solid rgba(230, 223, 216, 0.1);
}

.table tbody tr:hover {
  background: var(--color-surface-dark-elevated); /* #252320 */
  transition: background 0.2s ease;
}

.table tbody tr.table-row--clickable {
  cursor: pointer;
}

@media (max-width: 767px) {
  .table-container {
    padding: var(--spacing-md);
  }
  
  .table {
    font-size: 14px;
  }
}
```

### StatusBadge Component (Refactored)

**Purpose:** Display verification and user status with design system badge-pill styling.

**Props Interface:**
```typescript
interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  size?: 'sm' | 'md';
  className?: string;
}
```

**Implementation:**
```jsx
const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const config = {
    PENDING: { 
      label: 'Menunggu Verifikasi', 
      color: 'var(--color-warning)', /* #d4a017 */
      bg: 'rgba(212, 160, 23, 0.15)' 
    },
    APPROVED: { 
      label: 'Disetujui', 
      color: 'var(--color-success)', /* #5db872 */
      bg: 'rgba(93, 184, 114, 0.15)' 
    },
    REJECTED: { 
      label: 'Ditolak', 
      color: 'var(--color-error)', /* #c64545 */
      bg: 'rgba(198, 69, 69, 0.15)' 
    },
    ACTIVE: { 
      label: 'Aktif', 
      color: 'var(--color-success)', 
      bg: 'rgba(93, 184, 114, 0.15)' 
    },
    INACTIVE: { 
      label: 'Tidak Aktif', 
      color: 'var(--color-muted)', /* #6c6a64 */
      bg: 'rgba(108, 106, 100, 0.15)' 
    }
  };
  
  const { label, color, bg } = config[status];
  
  return (
    <span 
      className={`badge badge--${size} ${className}`}
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
};
```

**Styling:**
```css
.badge {
  display: inline-block;
  font-family: var(--font-sans);
  font-weight: 500;
  border-radius: var(--rounded-pill); /* 9999px */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge--sm {
  font-size: 11px;
  padding: 2px 8px;
}

.badge--md {
  font-size: 13px;
  padding: 4px 12px;
}
```


## Data Models

The UI refactor maintains existing data models from the backend API. No new data models are introduced. The key models referenced in the UI are:

### User Model (from API)
```typescript
interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  address: string;
  role: 'ADMIN' | 'USER';
  status_user: 'ACTIVE' | 'INACTIVE';
  position_user?: 'bidan_praktik' | 'bidan_desa' | 'bidan_koordinator';
  village_id?: string;
  practice_id?: string;
  village?: Village;
  practice_place?: PracticePlace;
}
```

### Sidebar State Model (new, client-side only)
```typescript
interface SidebarState {
  collapsed: boolean;
  expandedGroups: string[]; // array of group IDs that are expanded
}
```

### Navigation Config Model (new, client-side only)
```typescript
interface NavigationConfig {
  groups: NavigationGroup[];
}

interface NavigationGroup {
  id: string;
  label: string;
  icon?: React.ComponentType;
  items: NavigationItem[];
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType;
  badge?: {
    text: string;
    variant: 'primary' | 'warning' | 'error';
  };
}
```

### Theme Tokens Model (new, client-side only)
```typescript
interface DesignTokens {
  colors: {
    primary: string;
    primaryActive: string;
    primaryDisabled: string;
    ink: string;
    body: string;
    muted: string;
    canvas: string;
    surfaceCard: string;
    surfaceDark: string;
    onPrimary: string;
    onDark: string;
    success: string;
    warning: string;
    error: string;
    hairline: string;
  };
  typography: {
    fontSerif: string;
    fontSans: string;
    fontMono: string;
    sizes: {
      displayLg: string;
      displayMd: string;
      titleMd: string;
      titleSm: string;
      bodyMd: string;
      bodySm: string;
      button: string;
    };
  };
  spacing: {
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    section: string;
  };
  rounded: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    pill: string;
  };
}
```


## Error Handling

### Client-Side Error Handling Strategy

**Form Validation Errors:**
- Display inline error messages below invalid fields using Input component's error prop
- Show error color (#c64545) text with body-sm typography
- Disable submit button until all required fields are valid
- Scroll to first error field on submission attempt with invalid data

**API Request Errors:**
- Display error notifications using a toast/notification component (styled with design system)
- Handle 401 Unauthorized by redirecting to login (existing AuthContext logic preserved)
- Handle 403 Forbidden by showing access denied message with coral-accent styling
- Handle 404 Not Found by showing empty state with helpful navigation options
- Handle 500 Server Error by showing retry option with secondary button

**Network Errors:**
- Display offline indicator when network connection is lost
- Queue failed requests for retry when connection is restored (optional enhancement)
- Show loading states during API calls to prevent user confusion

**Validation Error Display Pattern:**
```jsx
// In form components
const { register, handleSubmit, formState: { errors } } = useForm();

<Input
  label="Nama Lengkap"
  name="full_name"
  required
  register={register}
  error={errors.full_name?.message}
/>
```

**API Error Handling Pattern:**
```jsx
// In page components
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await api.get('/endpoint');
    setData(response.data);
  } catch (err) {
    if (err.response?.status === 404) {
      setError('Data tidak ditemukan');
    } else if (err.response?.status === 403) {
      setError('Anda tidak memiliki akses ke data ini');
    } else {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  } finally {
    setLoading(false);
  }
};

// In JSX
{error && <ErrorMessage message={error} onRetry={fetchData} />}
```

### Error States for Data Display

**Empty State:**
- Shown when data array is empty but request succeeded
- Display message: "Belum ada data" with muted color
- Provide primary action button to add new data (if user has permission)

**Loading State:**
- Show LoadingSpinner component with coral accent color
- Display centered in content area
- Use aria-live="polite" for screen reader announcement

**Error State:**
- Show error message with error color (#c64545)
- Provide "Coba Lagi" button with secondary styling
- Log detailed error to console for debugging


## Testing Strategy

### Unit Testing Approach

**Component Unit Tests:**
- Test Button component variants render correctly with expected styling classes
- Test Input component displays error messages when error prop is provided
- Test StatusBadge component renders correct label and color for each status
- Test Card component applies correct variant, padding, and rounded classes
- Test Table component renders correct number of rows and columns from data prop
- Test Sidebar component toggles collapsed state when toggle button clicked
- Test NavItem component applies active class when path matches current location

**Hook Unit Tests:**
- Test useSidebar hook returns correct initial state from localStorage
- Test useSidebar toggleCollapsed updates state and persists to localStorage
- Test useSidebar toggleGroup adds/removes group from expandedGroups array
- Test useMediaQuery hook returns correct boolean for viewport width

**Utility Function Tests:**
- Test getNavigationForRole returns correct navigation config for each role
- Test role helper functions (existing) continue to work correctly

### Integration Testing Approach

**Navigation Flow Tests:**
- Test clicking sidebar navigation item navigates to correct route
- Test active navigation item highlighted when route matches
- Test sidebar collapses on mobile and shows hamburger menu
- Test hamburger menu opens/closes mobile sidebar overlay
- Test clicking backdrop on mobile closes sidebar

**Form Submission Tests:**
- Test form validation displays errors for invalid inputs
- Test form submission calls correct API endpoint with form data
- Test form displays success message after successful submission
- Test form displays error message after failed submission
- Test form resets after successful submission (where appropriate)

**Authentication Flow Tests:**
- Test login redirects to dashboard on success
- Test login displays error message on failure
- Test logout clears user state and redirects to login
- Test protected routes redirect to login when not authenticated
- Test role-based routes redirect to dashboard when user lacks permission

### Accessibility Testing Requirements

**Keyboard Navigation Tests:**
- Test sidebar navigation items accessible via Tab key
- Test sidebar navigation items activatable via Enter/Space keys
- Test form inputs accessible and submittable via keyboard only
- Test modals trappable focus and closable via Escape key
- Test skip-to-content link allows keyboard users to bypass navigation

**Screen Reader Tests:**
- Test sidebar navigation announces current item and expanded/collapsed state
- Test form inputs announce label and error messages
- Test dynamic content updates (verification success) announced via aria-live
- Test status badges announced with meaningful text (not just color)
- Test image icons have appropriate aria-labels when needed

**Color Contrast Tests:**
- Test body text on cream canvas meets 4.5:1 contrast ratio (ink #141413 on canvas #faf9f5)
- Test primary button text meets 4.5:1 contrast ratio (white #ffffff on coral #cc785c)
- Test dark surface text meets 4.5:1 contrast ratio (cream #faf9f5 on dark #181715)
- Test error messages meet 4.5:1 contrast ratio (error #c64545 on canvas #faf9f5)
- Test status badges meet 3:1 contrast ratio for large text

### Performance Testing Considerations

**Bundle Size Tests:**
- Verify initial bundle size < 500KB gzipped after implementing code splitting
- Verify lazy-loaded route bundles load within 2 seconds on standard broadband
- Verify font loading does not block text rendering (FOIT/FOUT strategy)

**Render Performance Tests:**
- Verify data tables with 100+ rows render within 1 second
- Verify sidebar collapse/expand animation completes without janking
- Verify form input focus states update within 100ms
- Verify page navigation transitions feel instant (< 200ms)

**Memory Leak Tests:**
- Verify navigation between routes does not accumulate event listeners
- Verify removed components clean up timers and subscriptions
- Verify localStorage usage does not grow unbounded

### Manual Testing Checklist

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Device Testing:**
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (iPad, 768x1024)
- [ ] Mobile (iPhone, 375x667)

**Role-Based Feature Access:**
- [ ] ADMIN sees all navigation items and can access all routes
- [ ] Bidan Koordinator sees approved data and reports only
- [ ] Bidan Desa sees pending verifications for their village only
- [ ] Bidan Praktik sees data entry forms and their own data only


## Correctness Properties

**Property-Based Testing is NOT applicable to this feature.**

This UI refactor is primarily focused on:
- **Visual rendering**: Component layout, styling, and responsive design
- **User interaction**: Click handlers, navigation, form submissions
- **React component composition**: JSX structure and component hierarchy

Property-based testing is designed for testing **universal properties across diverse inputs** in pure functions, parsers, serializers, algorithms, and business logic. This refactor involves:

1. **UI rendering**: Testing that components render with correct CSS classes and styles is better suited to **snapshot tests** and **visual regression tests**
2. **Layout behavior**: Testing responsive breakpoints and sidebar collapse is better suited to **integration tests with viewport mocking**
3. **Navigation logic**: Testing route matching and active state is better suited to **React Testing Library integration tests**
4. **Form validation**: The validation logic uses react-hook-form's existing validation (already tested by the library)
5. **API integration**: The API calls maintain existing axios setup (no new logic to test with PBT)

**Alternative Testing Strategies:**

- **Snapshot Tests**: Capture rendered component output and detect unintended changes
- **Integration Tests**: Test user flows (click sidebar → navigate → see correct page)
- **Visual Regression Tests**: Use tools like Percy or Chromatic to catch visual bugs
- **Unit Tests**: Test specific functions (getNavigationForRole, theme token lookups)
- **Manual Testing**: Verify design system implementation matches specifications
- **Accessibility Tests**: Use axe-core or similar tools to verify WCAG 2.1 AA compliance

**Why Not PBT Here:**

Attempting to write properties like "for any valid React component props, the component renders without crashing" would not be valuable because:
- Component props are constrained by TypeScript/PropTypes (type checking already validates this)
- Visual correctness cannot be asserted with universal properties (requires visual comparison)
- Interaction behavior requires simulating user events (better suited to integration tests)

The testing strategy section above outlines the appropriate testing approaches for this UI refactor.


## Implementation Details

### Dashboard Components by Role

Each role receives a custom dashboard layout with relevant statistics, quick actions, and data feeds.

**Admin Dashboard:**
```jsx
const DashboardAdmin = () => {
  const [stats, setStats] = useState(null);
  
  // Fetch: total users, pending verifications (all villages), system health
  
  return (
    <div className="dashboard">
      <PageHeader heading="Dashboard Administrator" />
      
      <div className="stats-grid"> {/* 4 columns */}
        <StatsCard 
          title="Total Pengguna"
          value={stats?.totalUsers}
          icon={<UsersIcon />}
          variant="surface-dark"
        />
        <StatsCard 
          title="Verifikasi Pending"
          value={stats?.pendingVerifications}
          icon={<ClockIcon />}
          variant="surface-dark"
        />
        <StatsCard 
          title="Data Disetujui Bulan Ini"
          value={stats?.approvedThisMonth}
          icon={<CheckCircleIcon />}
          variant="surface-dark"
        />
        <StatsCard 
          title="Tempat Praktik Aktif"
          value={stats?.activePractices}
          icon={<BuildingIcon />}
          variant="surface-dark"
        />
      </div>
      
      <div className="dashboard-actions">
        <Card variant="surface-card" padding="lg">
          <h3 className="title-md">Aksi Cepat</h3>
          <div className="action-buttons">
            <Button variant="primary" onClick={() => navigate('/add-user')}>
              Tambah Pengguna
            </Button>
            <Button variant="secondary" onClick={() => navigate('/villages/add')}>
              Tambah Desa
            </Button>
            <Button variant="secondary" onClick={() => navigate('/practice-places/add')}>
              Tambah Tempat Praktik
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="recent-activity">
        <h3 className="display-sm">Aktivitas Terkini</h3>
        <Table 
          columns={activityColumns}
          data={recentActivity}
          onRowClick={(row) => navigate(row.detailPath)}
        />
      </div>
    </div>
  );
};
```

**Bidan Koordinator Dashboard:**
```jsx
const DashboardKoordinator = () => {
  // Fetch: approved data stats across all villages, summary by module
  
  return (
    <div className="dashboard">
      <PageHeader heading="Dashboard Koordinator" />
      
      <div className="stats-grid">
        <StatsCard title="Total Data Disetujui" value={stats?.totalApproved} />
        <StatsCard title="Pemeriksaan Kehamilan" value={stats?.pregnancyChecks} />
        <StatsCard title="Persalinan" value={stats?.deliveries} />
        <StatsCard title="KB" value={stats?.familyPlanning} />
        <StatsCard title="Imunisasi" value={stats?.immunizations} />
      </div>
      
      <div className="dashboard-grid"> {/* 2 columns */}
        <Card variant="surface-card">
          <h3 className="title-md">Data per Desa</h3>
          <BarChart data={statsByVillage} /> {/* visualization component */}
        </Card>
        
        <Card variant="surface-card">
          <h3 className="title-md">Aksi Cepat</h3>
          <Button variant="primary" onClick={() => navigate('/rekapitulasi')}>
            Buat Rekapitulasi
          </Button>
          <Button variant="secondary" onClick={() => navigate('/reports')}>
            Export Laporan
          </Button>
        </Card>
      </div>
      
      <div className="approved-feed">
        <h3 className="display-sm">Data Terbaru Disetujui</h3>
        <Table columns={approvedColumns} data={approvedData} />
      </div>
    </div>
  );
};
```

**Bidan Desa Dashboard:**
```jsx
const DashboardDesa = () => {
  const { user } = useAuth();
  // Fetch: pending tasks for user.village_id, verification history, village stats
  
  return (
    <div className="dashboard">
      <PageHeader 
        heading={`Dashboard Bidan Desa`}
        subtitle={user.village?.nama_desa}
      />
      
      <div className="stats-grid">
        <StatsCard 
          title="Menunggu Verifikasi"
          value={stats?.pendingCount}
          variant="surface-dark"
          badge={{ text: 'Perlu Tindakan', variant: 'warning' }}
        />
        <StatsCard title="Disetujui Bulan Ini" value={stats?.approvedThisMonth} />
        <StatsCard title="Ditolak Bulan Ini" value={stats?.rejectedThisMonth} />
      </div>
      
      <div className="pending-tasks">
        <h3 className="display-sm">Menunggu Verifikasi</h3>
        {pendingTasks.length > 0 ? (
          <div className="task-list">
            {pendingTasks.map(task => (
              <Card key={task.id} variant="surface-card" className="task-card">
                <div className="task-header">
                  <span className="task-module">{task.moduleName}</span>
                  <StatusBadge status="PENDING" />
                </div>
                <p className="task-info">
                  Pasien: {task.pasienNama} | Tanggal: {formatDate(task.tanggal)}
                </p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => navigate(`/verification/${task.module}/${task.id}`)}
                >
                  Review
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState message="Tidak ada data pending" />
        )}
      </div>
    </div>
  );
};
```

**Bidan Praktik Dashboard:**
```jsx
const DashboardPraktik = () => {
  const { user } = useAuth();
  // Fetch: recent submissions from user.practice_id, rejected data, practice stats
  
  return (
    <div className="dashboard">
      <PageHeader 
        heading="Dashboard Bidan Praktik"
        subtitle={user.practice_place?.nama_praktik}
      />
      
      <div className="stats-grid">
        <StatsCard title="Data Bulan Ini" value={stats?.thisMonthCount} />
        <StatsCard title="Perlu Revisi" value={stats?.rejectedCount} variant="surface-dark" />
        <StatsCard title="Menunggu Verifikasi" value={stats?.pendingCount} />
        <StatsCard title="Disetujui" value={stats?.approvedCount} />
      </div>
      
      <div className="quick-add">
        <h3 className="title-lg">Tambah Data Pelayanan</h3>
        <div className="service-buttons">
          <Button variant="primary" onClick={() => navigate('/pemeriksaan-kehamilan/add')}>
            Pemeriksaan Kehamilan
          </Button>
          <Button variant="primary" onClick={() => navigate('/persalinan/add')}>
            Persalinan
          </Button>
          <Button variant="primary" onClick={() => navigate('/keluarga-berencana/add')}>
            KB
          </Button>
          <Button variant="primary" onClick={() => navigate('/imunisasi/add')}>
            Imunisasi
          </Button>
        </div>
      </div>
      
      {rejectedData.length > 0 && (
        <div className="rejected-alert">
          <Card variant="surface-card" className="alert-card">
            <h3 className="title-md">⚠️ Data Ditolak - Perlu Revisi</h3>
            <Table 
              columns={rejectedColumns}
              data={rejectedData}
              onRowClick={(row) => navigate(`/revision/${row.id}/revise`)}
            />
          </Card>
        </div>
      )}
      
      <div className="recent-submissions">
        <h3 className="display-sm">Pengiriman Terakhir</h3>
        <Table columns={submissionColumns} data={recentSubmissions} />
      </div>
    </div>
  );
};
```


### Form Components Implementation

All service module forms follow a consistent structure with design system styling:

**Form Layout Pattern:**
```jsx
const ServiceModuleForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post('/endpoint', data);
      navigate('/success-route');
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="page">
      <PageHeader heading="Tambah Data Pelayanan" />
      
      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <Card variant="surface-card" padding="xl">
          <h3 className="title-md">Informasi Pasien</h3>
          <div className="form-grid"> {/* 2 columns on desktop */}
            <Input
              label="NIK"
              name="nik"
              required
              register={register}
              error={errors.nik?.message}
            />
            <Input
              label="Nama Pasien"
              name="nama"
              required
              register={register}
              error={errors.nama?.message}
            />
          </div>
        </Card>
        
        <Card variant="surface-dark" padding="xl">
          <h3 className="title-md" style={{ color: 'var(--color-on-dark)' }}>
            Data Pemeriksaan
          </h3>
          <div className="form-grid">
            <Input
              label="Tanggal"
              name="tanggal"
              type="date"
              required
              register={register}
              error={errors.tanggal?.message}
            />
            {/* ... more fields */}
          </div>
        </Card>
        
        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate(-1)}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
};
```

**Form Grid Styling:**
```css
.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg); /* 24px between cards */
  max-width: 1200px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg); /* 24px between fields */
  margin-top: var(--spacing-lg);
}

@media (max-width: 767px) {
  .form-grid {
    grid-template-columns: 1fr; /* single column on mobile */
  }
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
}
```

### Table Components Implementation

**List View Pattern:**
```jsx
const ServiceModuleList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', startDate: '', endDate: '' });
  
  useEffect(() => {
    fetchData();
  }, [filters]);
  
  const columns = [
    { key: 'tanggal', label: 'Tanggal', sortable: true, width: '120px' },
    { key: 'pasien_nama', label: 'Nama Pasien', sortable: true },
    { 
      key: 'status_verifikasi', 
      label: 'Status', 
      render: (value) => <StatusBadge status={value} />,
      width: '150px'
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_, row) => (
        <div className="table-actions">
          <Button 
            variant="secondary-on-dark" 
            size="sm"
            onClick={() => navigate(`/detail/${row.id}`)}
          >
            Lihat
          </Button>
          {canEdit(row) && (
            <Button 
              variant="secondary-on-dark" 
              size="sm"
              onClick={() => navigate(`/edit/${row.id}`)}
            >
              Edit
            </Button>
          )}
        </div>
      ),
      width: '180px'
    }
  ];
  
  return (
    <div className="page">
      <PageHeader 
        heading="Pemeriksaan Kehamilan"
        actions={
          <Button variant="primary" onClick={() => navigate('/add')}>
            Tambah Data
          </Button>
        }
      />
      
      <Card variant="canvas" padding="lg" className="filters-card">
        <div className="filters">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: 'all', label: 'Semua' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Disetujui' },
              { value: 'REJECTED', label: 'Ditolak' }
            ]}
          />
          <Input
            label="Dari Tanggal"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            label="Sampai Tanggal"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
      </Card>
      
      <Table 
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="Belum ada data pemeriksaan kehamilan"
        onRowClick={(row) => navigate(`/detail/${row.id}`)}
      />
    </div>
  );
};
```


### Verification Interface Implementation

**Pending Data Review Page:**
```jsx
const PendingDataList = () => {
  const { user } = useAuth();
  const [pendingData, setPendingData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyAction, setVerifyAction] = useState(null); // 'approve' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Only Bidan Desa can access this page
  // Fetch pending data filtered by user.village_id
  
  const handleVerify = async () => {
    try {
      const payload = verifyAction === 'approve' 
        ? { status_verifikasi: 'APPROVED' }
        : { status_verifikasi: 'REJECTED', alasan_penolakan: rejectionReason };
      
      await api.patch(`/api/${selectedItem.module}/${selectedItem.id}/verify`, payload);
      
      // Refresh list
      fetchPendingData();
      setShowVerifyModal(false);
      setSelectedItem(null);
      setRejectionReason('');
    } catch (error) {
      // handle error
    }
  };
  
  return (
    <div className="page">
      <PageHeader 
        heading="Verifikasi Data"
        subtitle={`Desa ${user.village?.nama_desa}`}
      />
      
      {pendingData.length === 0 ? (
        <EmptyState message="Tidak ada data yang menunggu verifikasi" />
      ) : (
        <div className="pending-groups">
          {groupedByModule.map(group => (
            <div key={group.module} className="module-group">
              <h3 className="display-sm">{group.moduleName}</h3>
              <div className="pending-cards">
                {group.items.map(item => (
                  <Card key={item.id} variant="surface-card" padding="lg">
                    <div className="pending-card-header">
                      <StatusBadge status="PENDING" />
                      <span className="caption">{formatDate(item.tanggal)}</span>
                    </div>
                    
                    <div className="pending-card-body">
                      <p className="title-md">Pasien: {item.pasien_nama}</p>
                      <p className="body-sm">Tempat Praktik: {item.practice_place?.nama_praktik}</p>
                      <p className="body-sm">Diinput oleh: {item.creator?.full_name}</p>
                    </div>
                    
                    <div className="pending-card-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/detail/${group.module}/${item.id}`)}
                      >
                        Lihat Detail
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedItem({ ...item, module: group.module });
                          setVerifyAction('approve');
                          setShowVerifyModal(true);
                        }}
                      >
                        Setujui
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => {
                          setSelectedItem({ ...item, module: group.module });
                          setVerifyAction('reject');
                          setShowVerifyModal(true);
                        }}
                      >
                        Tolak
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showVerifyModal && (
        <Modal
          title={verifyAction === 'approve' ? 'Setujui Data' : 'Tolak Data'}
          onClose={() => setShowVerifyModal(false)}
          onConfirm={handleVerify}
          confirmText={verifyAction === 'approve' ? 'Setujui' : 'Tolak'}
          confirmVariant={verifyAction === 'approve' ? 'primary' : 'secondary'}
        >
          {verifyAction === 'approve' ? (
            <p>Apakah Anda yakin ingin menyetujui data ini?</p>
          ) : (
            <div>
              <p style={{ marginBottom: 'var(--spacing-md)' }}>
                Berikan alasan penolakan:
              </p>
              <textarea
                className="textarea"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Minimal 10 karakter..."
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--color-canvas)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--rounded-md)',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px'
                }}
              />
              {rejectionReason.length < 10 && (
                <p className="input-error">
                  Alasan penolakan harus minimal 10 karakter
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
```

### Responsive Behavior Implementation

**Breakpoint Management:**
```jsx
// hooks/useMediaQuery.js
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
};

// Usage in components
const Sidebar = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Adjust sidebar behavior based on viewport
};
```

**Responsive Grid System:**
```css
/* Desktop: 4 columns */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

/* Tablet: 2 columns */
@media (max-width: 1023px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile: 1 column */
@media (max-width: 767px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
```

**Mobile Hamburger Menu:**
```jsx
const MobileMenuButton = () => {
  const { toggleSidebar, isMobile } = useSidebar();
  
  if (!isMobile) return null;
  
  return (
    <button 
      className="mobile-menu-button"
      onClick={toggleSidebar}
      aria-label="Toggle navigation menu"
    >
      <MenuIcon />
    </button>
  );
};
```


### Design System Tokens (CSS Variables)

**design-system.css:**
```css
:root {
  /* Colors - Brand & Accent */
  --color-primary: #cc785c;
  --color-primary-active: #a9583e;
  --color-primary-disabled: #e6dfd8;
  --color-accent-teal: #5db8a6;
  --color-accent-amber: #e8a55a;
  
  /* Colors - Surface */
  --color-canvas: #faf9f5;
  --color-surface-soft: #f5f0e8;
  --color-surface-card: #efe9de;
  --color-surface-cream-strong: #e8e0d2;
  --color-surface-dark: #181715;
  --color-surface-dark-elevated: #252320;
  --color-surface-dark-soft: #1f1e1b;
  
  /* Colors - Text */
  --color-ink: #141413;
  --color-body: #3d3d3a;
  --color-body-strong: #252523;
  --color-muted: #6c6a64;
  --color-muted-soft: #8e8b82;
  --color-on-primary: #ffffff;
  --color-on-dark: #faf9f5;
  --color-on-dark-soft: #a09d96;
  
  /* Colors - Borders */
  --color-hairline: #e6dfd8;
  --color-hairline-soft: #ebe6df;
  
  /* Colors - Semantic */
  --color-success: #5db872;
  --color-warning: #d4a017;
  --color-error: #c64545;
  
  /* Typography - Font Families */
  --font-serif: 'Copernicus', 'Tiempos Headline', 'Cormorant Garamond', 'Garamond', 'Times New Roman', serif;
  --font-sans: 'StyreneB', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  
  /* Typography - Display Sizes (Serif) */
  --type-display-xl-size: 64px;
  --type-display-xl-weight: 400;
  --type-display-xl-line: 1.05;
  --type-display-xl-spacing: -1.5px;
  
  --type-display-lg-size: 48px;
  --type-display-lg-weight: 400;
  --type-display-lg-line: 1.1;
  --type-display-lg-spacing: -1px;
  
  --type-display-md-size: 36px;
  --type-display-md-weight: 400;
  --type-display-md-line: 1.15;
  --type-display-md-spacing: -0.5px;
  
  --type-display-sm-size: 28px;
  --type-display-sm-weight: 400;
  --type-display-sm-line: 1.2;
  --type-display-sm-spacing: -0.3px;
  
  /* Typography - Titles (Sans) */
  --type-title-lg-size: 22px;
  --type-title-lg-weight: 500;
  --type-title-lg-line: 1.3;
  
  --type-title-md-size: 18px;
  --type-title-md-weight: 500;
  --type-title-md-line: 1.4;
  
  --type-title-sm-size: 16px;
  --type-title-sm-weight: 500;
  --type-title-sm-line: 1.4;
  
  /* Typography - Body (Sans) */
  --type-body-md-size: 16px;
  --type-body-md-weight: 400;
  --type-body-md-line: 1.55;
  
  --type-body-sm-size: 14px;
  --type-body-sm-weight: 400;
  --type-body-sm-line: 1.55;
  
  /* Typography - UI Elements */
  --type-caption-size: 13px;
  --type-caption-weight: 500;
  --type-caption-line: 1.4;
  
  --type-button-size: 14px;
  --type-button-weight: 500;
  --type-button-line: 1;
  
  --type-code-size: 14px;
  --type-code-weight: 400;
  --type-code-line: 1.6;
  
  /* Spacing */
  --spacing-xxs: 4px;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;
  --spacing-section: 96px;
  
  /* Border Radius */
  --rounded-xs: 4px;
  --rounded-sm: 6px;
  --rounded-md: 8px;
  --rounded-lg: 12px;
  --rounded-xl: 16px;
  --rounded-pill: 9999px;
  --rounded-full: 9999px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
  
  /* Z-Index Scale */
  --z-base: 1;
  --z-dropdown: 100;
  --z-sticky: 500;
  --z-sidebar: 1000;
  --z-modal-backdrop: 1500;
  --z-modal: 1600;
  --z-toast: 2000;
}

/* Typography Utility Classes */
.display-xl {
  font-family: var(--font-serif);
  font-size: var(--type-display-xl-size);
  font-weight: var(--type-display-xl-weight);
  line-height: var(--type-display-xl-line);
  letter-spacing: var(--type-display-xl-spacing);
}

.display-lg {
  font-family: var(--font-serif);
  font-size: var(--type-display-lg-size);
  font-weight: var(--type-display-lg-weight);
  line-height: var(--type-display-lg-line);
  letter-spacing: var(--type-display-lg-spacing);
}

.display-md {
  font-family: var(--font-serif);
  font-size: var(--type-display-md-size);
  font-weight: var(--type-display-md-weight);
  line-height: var(--type-display-md-line);
  letter-spacing: var(--type-display-md-spacing);
}

.display-sm {
  font-family: var(--font-serif);
  font-size: var(--type-display-sm-size);
  font-weight: var(--type-display-sm-weight);
  line-height: var(--type-display-sm-line);
  letter-spacing: var(--type-display-sm-spacing);
}

.title-lg {
  font-family: var(--font-sans);
  font-size: var(--type-title-lg-size);
  font-weight: var(--type-title-lg-weight);
  line-height: var(--type-title-lg-line);
}

.title-md {
  font-family: var(--font-sans);
  font-size: var(--type-title-md-size);
  font-weight: var(--type-title-md-weight);
  line-height: var(--type-title-md-line);
}

.title-sm {
  font-family: var(--font-sans);
  font-size: var(--type-title-sm-size);
  font-weight: var(--type-title-sm-weight);
  line-height: var(--type-title-sm-line);
}

.body-md {
  font-family: var(--font-sans);
  font-size: var(--type-body-md-size);
  font-weight: var(--type-body-md-weight);
  line-height: var(--type-body-md-line);
}

.body-sm {
  font-family: var(--font-sans);
  font-size: var(--type-body-sm-size);
  font-weight: var(--type-body-sm-weight);
  line-height: var(--type-body-sm-line);
}

.caption {
  font-family: var(--font-sans);
  font-size: var(--type-caption-size);
  font-weight: var(--type-caption-weight);
  line-height: var(--type-caption-line);
}

/* Responsive Typography Adjustments */
@media (max-width: 767px) {
  :root {
    --type-display-xl-size: 32px;
    --type-display-lg-size: 28px;
    --type-display-md-size: 24px;
    --type-display-sm-size: 20px;
    --spacing-section: 48px;
  }
}
```


### Accessibility Implementation

**Keyboard Navigation:**
```jsx
// Sidebar navigation with keyboard support
const NavItem = ({ item, isActive }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(item.path);
    }
  };
  
  return (
    <Link
      to={item.path}
      className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
      onKeyDown={handleKeyDown}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
};
```

**Focus Management:**
```css
/* Visible focus indicators */
*:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--rounded-sm);
}

.nav-item:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: -3px;
}

.btn-primary:focus-visible,
.btn-secondary:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

**Skip to Content Link:**
```jsx
const SkipToContent = () => (
  <a 
    href="#main-content" 
    className="skip-to-content"
    aria-label="Skip to main content"
  >
    Skip to content
  </a>
);

// Styling
.skip-to-content {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: var(--spacing-md);
  text-decoration: none;
  font-weight: 500;
  z-index: var(--z-toast);
}

.skip-to-content:focus {
  top: 0;
}
```

**ARIA Live Regions:**
```jsx
// For verification success/error announcements
const VerificationFeedback = ({ message, type }) => (
  <div 
    role="alert"
    aria-live="polite"
    className={`feedback feedback--${type}`}
  >
    {message}
  </div>
);
```

**Screen Reader Labels:**
```jsx
// Icon-only buttons need aria-labels
<button 
  className="btn-icon"
  onClick={handleEdit}
  aria-label="Edit pemeriksaan kehamilan untuk pasien {pasienNama}"
>
  <EditIcon aria-hidden="true" />
</button>

// Collapsed sidebar tooltips
<Tooltip content={item.label}>
  <Link to={item.path} aria-label={item.label}>
    <item.icon aria-hidden="true" />
  </Link>
</Tooltip>
```

### Performance Optimizations

**Code Splitting:**
```jsx
// App.jsx with lazy loading
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserList = lazy(() => import('./pages/UserList'));
const PasienList = lazy(() => import('./pages/Pasien/PasienList'));
// ... all page components

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UserList />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

**React.memo for List Items:**
```jsx
// Prevent unnecessary re-renders in large tables
const TableRow = React.memo(({ row, columns, onRowClick }) => (
  <tr onClick={() => onRowClick?.(row)}>
    {columns.map(col => (
      <td key={col.key}>
        {col.render ? col.render(row[col.key], row) : row[col.key]}
      </td>
    ))}
  </tr>
));
```

**Debounced Search:**
```jsx
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const SearchInput = ({ onSearch }) => {
  const debouncedSearch = useMemo(
    () => debounce((value) => onSearch(value), 300),
    [onSearch]
  );
  
  return (
    <Input
      placeholder="Cari..."
      onChange={(e) => debouncedSearch(e.target.value)}
    />
  );
};
```

**Font Loading Strategy:**
```css
/* In index.html or CSS */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap; /* Prevent FOIT, show fallback immediately */
}

@font-face {
  font-family: 'Cormorant Garamond';
  src: url('/fonts/CormorantGaramond-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

**Image/Icon Optimization:**
- Use lucide-react icons (already installed) for all UI icons
- Icons are tree-shakeable and add minimal bundle size
- Use SVG for any custom graphics


### Navigation Configuration by Role

**navigationConfig.js:**
```javascript
import { 
  Home, Users, UserPlus, Map, Building, User, 
  ClipboardList, Baby, Heart, Syringe, Shield,
  FileText, Settings, LogOut 
} from 'lucide-react';

export const getNavigationForRole = (role, position) => {
  // ADMIN gets full access
  if (role === 'ADMIN') {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        items: [
          { id: 'home', label: 'Beranda', path: '/', icon: Home }
        ]
      },
      {
        id: 'users',
        label: 'Manajemen Pengguna',
        items: [
          { id: 'user-list', label: 'Daftar Pengguna', path: '/users', icon: Users },
          { id: 'add-user', label: 'Tambah Pengguna', path: '/add-user', icon: UserPlus }
        ]
      },
      {
        id: 'master-data',
        label: 'Data Master',
        items: [
          { id: 'villages', label: 'Desa', path: '/villages', icon: Map },
          { id: 'practices', label: 'Tempat Praktik', path: '/practice-places', icon: Building },
          { id: 'pasien', label: 'Pasien', path: '/pasien', icon: User }
        ]
      },
      {
        id: 'services',
        label: 'Data Pelayanan',
        items: [
          { id: 'pregnancy', label: 'Pemeriksaan Kehamilan', path: '/pemeriksaan-kehamilan', icon: Heart },
          { id: 'delivery', label: 'Persalinan', path: '/persalinan', icon: Baby },
          { id: 'family-planning', label: 'Keluarga Berencana', path: '/keluarga-berencana', icon: Shield },
          { id: 'immunization', label: 'Imunisasi', path: '/imunisasi', icon: Syringe }
        ]
      },
      {
        id: 'verification',
        label: 'Verifikasi',
        items: [
          { id: 'pending', label: 'Data Pending', path: '/verification/pending', icon: ClipboardList }
        ]
      },
      {
        id: 'settings',
        label: 'Pengaturan',
        items: [
          { id: 'profile', label: 'Profil', path: '/profile', icon: Settings }
        ]
      }
    ];
  }
  
  // Bidan Koordinator
  if (position === 'bidan_koordinator') {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        items: [
          { id: 'home', label: 'Beranda', path: '/', icon: Home }
        ]
      },
      {
        id: 'services',
        label: 'Data Pelayanan',
        items: [
          { id: 'pregnancy', label: 'Pemeriksaan Kehamilan', path: '/pemeriksaan-kehamilan', icon: Heart },
          { id: 'delivery', label: 'Persalinan', path: '/persalinan', icon: Baby },
          { id: 'family-planning', label: 'Keluarga Berencana', path: '/keluarga-berencana', icon: Shield },
          { id: 'immunization', label: 'Imunisasi', path: '/imunisasi', icon: Syringe }
        ]
      },
      {
        id: 'reports',
        label: 'Laporan',
        items: [
          { id: 'rekapitulasi', label: 'Rekapitulasi', path: '/rekapitulasi', icon: FileText }
        ]
      },
      {
        id: 'settings',
        label: 'Pengaturan',
        items: [
          { id: 'profile', label: 'Profil', path: '/profile', icon: Settings }
        ]
      }
    ];
  }
  
  // Bidan Desa
  if (position === 'bidan_desa') {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        items: [
          { id: 'home', label: 'Beranda', path: '/', icon: Home }
        ]
      },
      {
        id: 'verification',
        label: 'Verifikasi',
        items: [
          { id: 'pending', label: 'Menunggu Verifikasi', path: '/verification/pending', icon: ClipboardList }
        ]
      },
      {
        id: 'services',
        label: 'Data Pelayanan',
        items: [
          { id: 'pregnancy', label: 'Pemeriksaan Kehamilan', path: '/pemeriksaan-kehamilan', icon: Heart },
          { id: 'delivery', label: 'Persalinan', path: '/persalinan', icon: Baby },
          { id: 'family-planning', label: 'Keluarga Berencana', path: '/keluarga-berencana', icon: Shield },
          { id: 'immunization', label: 'Imunisasi', path: '/imunisasi', icon: Syringe }
        ]
      },
      {
        id: 'master-data',
        label: 'Data Master',
        items: [
          { id: 'pasien', label: 'Pasien', path: '/pasien', icon: User }
        ]
      },
      {
        id: 'settings',
        label: 'Pengaturan',
        items: [
          { id: 'profile', label: 'Profil', path: '/profile', icon: Settings }
        ]
      }
    ];
  }
  
  // Bidan Praktik
  if (position === 'bidan_praktik') {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        items: [
          { id: 'home', label: 'Beranda', path: '/', icon: Home }
        ]
      },
      {
        id: 'add-data',
        label: 'Tambah Data',
        items: [
          { id: 'add-pregnancy', label: 'Pemeriksaan Kehamilan', path: '/pemeriksaan-kehamilan/add', icon: Heart },
          { id: 'add-delivery', label: 'Persalinan', path: '/persalinan/add', icon: Baby },
          { id: 'add-kb', label: 'Keluarga Berencana', path: '/keluarga-berencana/add', icon: Shield },
          { id: 'add-immunization', label: 'Imunisasi', path: '/imunisasi/add', icon: Syringe }
        ]
      },
      {
        id: 'my-data',
        label: 'Data Saya',
        items: [
          { id: 'pregnancy', label: 'Pemeriksaan Kehamilan', path: '/pemeriksaan-kehamilan', icon: Heart },
          { id: 'delivery', label: 'Persalinan', path: '/persalinan', icon: Baby },
          { id: 'family-planning', label: 'Keluarga Berencana', path: '/keluarga-berencana', icon: Shield },
          { id: 'immunization', label: 'Imunisasi', path: '/imunisasi', icon: Syringe }
        ]
      },
      {
        id: 'revision',
        label: 'Revisi',
        items: [
          { id: 'rejected', label: 'Data Ditolak', path: '/revision/rejected', icon: ClipboardList }
        ]
      },
      {
        id: 'master-data',
        label: 'Data Master',
        items: [
          { id: 'pasien', label: 'Pasien', path: '/pasien', icon: User }
        ]
      },
      {
        id: 'settings',
        label: 'Pengaturan',
        items: [
          { id: 'profile', label: 'Profil', path: '/profile', icon: Settings }
        ]
      }
    ];
  }
  
  // Fallback for users without position
  return [
    {
      id: 'dashboard',
      label: 'Dashboard',
      items: [
        { id: 'home', label: 'Beranda', path: '/', icon: Home }
      ]
    }
  ];
};
```


## API Integration

### Maintaining Existing API Layer

The refactor preserves the existing API integration architecture:

**Existing axios Setup (services/api.js):**
```javascript
// This file remains unchanged
import axios from 'axios';

const API_BASE_URL = 'http://localhost:9090/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Auto-attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**API Endpoint Mapping:**

All existing API endpoints are maintained:

| Feature | Endpoint | Method | Used In Component |
|---------|----------|--------|-------------------|
| Login | `/api/login` | POST | Login.jsx |
| Profile | `/api/profile` | GET | AuthContext, Sidebar |
| Users | `/api/users` | GET | UserList.jsx |
| Create User | `/api/users` | POST | AddUser.jsx |
| Update User | `/api/users/:id` | PUT | EditUser.jsx |
| Villages | `/api/villages` | GET | VillageList.jsx |
| Practice Places | `/api/practice-places` | GET | PracticePlaceList.jsx |
| Pasien | `/api/pasien` | GET | PasienList.jsx |
| Pregnancy Checkups | `/api/pemeriksaan-kehamilan` | GET/POST | PemeriksaanKehamilanList.jsx |
| Deliveries | `/api/persalinan` | GET/POST | PersalinanList.jsx |
| Family Planning | `/api/keluarga-berencana` | GET/POST | KBList.jsx |
| Immunizations | `/api/imunisasi` | GET/POST | ImunisasiList.jsx |
| Verification | `/api/{module}/:id/verify` | PATCH | PendingDataList.jsx |
| Dashboard Stats | `/api/dashboard/stats` | GET | Dashboard components |

**Role-Based Data Filtering:**

The UI continues to rely on backend role-based filtering:

```javascript
// Example: Bidan Desa sees only their village's pending data
const fetchPendingData = async () => {
  // Backend automatically filters by user.village_id
  const response = await apiClient.get('/api/verification/pending');
  setPendingData(response.data.data);
};

// Example: Bidan Praktik sees only their practice's data
const fetchMyData = async () => {
  // Backend automatically filters by user.practice_id
  const response = await apiClient.get('/api/pemeriksaan-kehamilan');
  setData(response.data.data);
};
```

**No New API Endpoints Required:**

The sidebar navigation refactor and design system implementation are **purely frontend changes**. All data fetching, authentication, and authorization logic remains unchanged.


## Migration Strategy

### Phased Implementation Approach

The refactor will be implemented in phases to minimize risk and ensure each piece works before moving forward:

**Phase 1: Design System Foundation (Week 1)**
- Create design-system.css with all CSS variables
- Set up typography utility classes
- Update global styles (body, html reset)
- Test in isolation with sample components

**Phase 2: Core Layout Components (Week 1-2)**
- Implement MainLayout component
- Implement Sidebar component with collapse/expand
- Implement useSidebar hook
- Implement useMediaQuery hook
- Implement navigation config by role
- Test sidebar behavior (desktop, tablet, mobile)
- Verify keyboard navigation and accessibility

**Phase 3: Component Library (Week 2)**
- Refactor Button component with all variants
- Refactor Input component with validation states
- Refactor StatusBadge component
- Create Card component
- Create Table component
- Create Modal component (refactor ConfirmDialog)
- Create EmptyState and LoadingSpinner components
- Test each component in Storybook or isolated test page

**Phase 4: Dashboard Refactor (Week 3)**
- Implement role-specific dashboard layouts
- Create StatsCard component
- Integrate with existing dashboard API endpoints
- Test each role's dashboard view
- Verify stats display correctly

**Phase 5: Service Module Pages (Week 3-4)**
- Refactor PemeriksaanKehamilan pages (List, Form, Detail)
- Refactor Persalinan pages
- Refactor KeluargaBerencana pages
- Refactor Imunisasi pages
- Test form submissions and data display
- Verify role-based access control

**Phase 6: Master Data & User Management (Week 4)**
- Refactor UserList, AddUser, EditUser pages
- Refactor VillageList, VillageForm, VillageDetail pages
- Refactor PracticePlaceList, PracticePlaceForm, PracticePlaceDetail pages
- Refactor PasienList, PasienForm, PasienDetail pages
- Test CRUD operations

**Phase 7: Verification & Reports (Week 5)**
- Refactor PendingDataList with verification interface
- Refactor RejectedDataList with revision interface
- Refactor RekapitulasiPage
- Test verification workflow end-to-end
- Test report generation

**Phase 8: Polish & Optimization (Week 5-6)**
- Implement code splitting for all routes
- Add loading states and error boundaries
- Optimize images and fonts
- Run accessibility audit with axe-core
- Run performance audit with Lighthouse
- Fix any issues found
- Cross-browser testing

**Phase 9: Documentation & Handoff (Week 6)**
- Create DESIGN_TOKENS.md
- Create COMPONENTS.md
- Add inline code comments
- Update README with setup instructions
- Record demo video for stakeholders

### Rollback Plan

If critical issues are discovered during or after deployment:

1. **Immediate Rollback**: Revert to previous commit via Git
2. **Partial Rollback**: Keep design system CSS but revert specific components
3. **Feature Flag**: Implement feature flag to toggle between old/new UI (if time allows)

### Testing Checklist Before Deployment

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Accessibility audit shows no critical issues
- [ ] Performance metrics meet targets (< 3s initial load, > 80 Lighthouse score)
- [ ] Manual testing completed for all 4 roles
- [ ] Manual testing completed on Chrome, Firefox, Safari, Edge
- [ ] Manual testing completed on desktop, tablet, mobile viewports
- [ ] Form submissions work correctly
- [ ] Verification workflow works end-to-end
- [ ] No console errors in production build
- [ ] API integration unchanged and working


## Open Questions and Decisions

### Font Licensing

**Question:** Are we licensing Copernicus/Tiempos Headline and StyreneB fonts, or using free alternatives?

**Options:**
1. **License commercial fonts**: Copernicus + StyreneB (~$200-500 for web license)
2. **Use free alternatives**: Cormorant Garamond + Inter (from Google Fonts)

**Recommendation:** Start with free alternatives (Cormorant Garamond + Inter) for MVP. The design system tokens make it easy to swap fonts later if budget allows for commercial licenses.

**Decision:** Use free alternatives initially.

---

### Component Library vs. UI Framework

**Question:** Should we use an existing UI component library (Material-UI, Chakra UI, Ant Design) or build custom components?

**Pros of UI Framework:**
- Faster initial development
- Built-in accessibility features
- Battle-tested components

**Cons of UI Framework:**
- Larger bundle size
- Harder to match exact design system aesthetics
- Learning curve for team

**Recommendation:** Build custom components styled with design system CSS. The refactor requires specific aesthetics (cream canvas, dark tables, coral buttons) that don't align well with any framework's default theme.

**Decision:** Build custom components.

---

### Icon Library

**Question:** Which icon library should we use?

**Recommendation:** Use lucide-react (already installed in package.json). Benefits:
- Tree-shakeable (only imports icons used)
- Consistent style
- Good documentation
- Free and open-source

**Decision:** Use lucide-react.

---

### State Management for Complex Forms

**Question:** Should we add a state management library (Redux, Zustand) for form state?

**Recommendation:** Continue using react-hook-form for form state. It's already installed and handles validation well. Only add global state management if we identify a specific need beyond forms.

**Decision:** Stick with react-hook-form. No global state library needed for MVP.

---

### Mobile Navigation: Drawer or Bottom Nav?

**Question:** On mobile, should we use:
1. **Slide-out drawer** (hamburger menu opens sidebar from left)
2. **Bottom navigation bar** (fixed nav at bottom of screen)

**Recommendation:** Slide-out drawer. Reasons:
- Maintains consistency with desktop sidebar structure
- Accommodates more navigation items
- Users expect hamburger menu on web apps
- Bottom nav is more common in native mobile apps

**Decision:** Implement slide-out drawer with hamburger menu.

---

### Animation Library

**Question:** Do we need a dedicated animation library (Framer Motion, React Spring)?

**Recommendation:** Start with CSS transitions (already defined in design-system.css with --transition-* variables). Only add animation library if we need complex animations later.

**Decision:** Use CSS transitions only.

---

### Browser Support

**Question:** Which browsers should we officially support?

**Recommendation:** Support last 2 versions of:
- Chrome
- Firefox
- Safari
- Edge

**Decision:** Last 2 versions of modern browsers. No IE11 support.


## Risk Analysis

### Technical Risks

**Risk 1: CSS Specificity Conflicts**
- **Description:** New design system CSS may conflict with existing App.css styles
- **Impact:** High - Could cause visual bugs across the application
- **Mitigation:** 
  - Incrementally migrate pages, testing each thoroughly
  - Use CSS modules or scoped styles where conflicts occur
  - Create comprehensive visual regression test suite
- **Likelihood:** Medium

**Risk 2: Performance Degradation**
- **Description:** Adding more components and styling could increase bundle size and slow down the app
- **Impact:** Medium - Poor user experience on slow connections
- **Mitigation:**
  - Implement code splitting from the start
  - Monitor bundle size with webpack-bundle-analyzer
  - Lazy load fonts with font-display: swap
  - Set performance budgets (initial load < 500KB gzipped)
- **Likelihood:** Low

**Risk 3: Accessibility Regressions**
- **Description:** Refactor could inadvertently break keyboard navigation or screen reader support
- **Impact:** High - Excludes users with disabilities
- **Mitigation:**
  - Run axe-core accessibility tests after each phase
  - Manual keyboard navigation testing for every interactive element
  - Test with screen readers (NVDA, VoiceOver)
  - Follow WCAG 2.1 AA guidelines strictly
- **Likelihood:** Medium

**Risk 4: API Integration Breakage**
- **Description:** Refactoring pages could break existing API calls or data handling
- **Impact:** Critical - Application becomes non-functional
- **Mitigation:**
  - Preserve all existing API service functions unchanged
  - Write integration tests for critical user flows
  - Test thoroughly in staging environment before production
  - Keep API interceptors and auth logic untouched
- **Likelihood:** Low

**Risk 5: Role-Based Access Control Bugs**
- **Description:** Navigation config errors could expose routes to unauthorized users
- **Impact:** High - Security vulnerability
- **Mitigation:**
  - Backend already enforces RBAC (frontend is just UI layer)
  - Test each role manually to verify correct navigation items
  - Keep existing ProtectedRoute wrapper unchanged
  - Add unit tests for getNavigationForRole function
- **Likelihood:** Low

### Schedule Risks

**Risk 6: Underestimated Complexity**
- **Description:** Refactoring all pages takes longer than 6-week estimate
- **Impact:** Medium - Delayed delivery
- **Mitigation:**
  - Phased approach allows shipping partial improvements
  - Prioritize high-traffic pages (Dashboard, Service Module Lists)
  - Low-traffic pages (User Management) can follow later
  - Build buffer time into schedule (add 1-2 weeks contingency)
- **Likelihood:** Medium

**Risk 7: Scope Creep**
- **Description:** Stakeholders request additional features during refactor
- **Impact:** High - Schedule delays, incomplete refactor
- **Mitigation:**
  - Clear scope definition in requirements document
  - Strictly limit to UI refactor only (no new features)
  - Create "Future Enhancements" backlog for new requests
  - Regular stakeholder communication on progress
- **Likelihood:** Medium

### Mitigation Summary

**High Priority Mitigations:**
1. Implement comprehensive testing at each phase
2. Keep API integration layer completely unchanged
3. Run accessibility audits continuously
4. Communicate scope boundaries clearly with stakeholders

**Monitoring During Implementation:**
- Daily visual QA checks during development
- Weekly performance benchmark runs
- Weekly accessibility audit runs
- Weekly demo to stakeholders to gather feedback early


## Conclusion

This design document specifies a comprehensive UI refactor that transforms the Puskesmas frontend application from a cramped top-navbar design into a modern, accessible, and cohesive sidebar navigation system with a warm editorial design aesthetic inspired by Claude.

### Key Achievements

1. **Maximized Screen Space**: Vertical sidebar navigation frees horizontal space for content, improving usability especially on wide-screen monitors

2. **Cohesive Visual Language**: Design system with cream canvas, coral CTAs, dark navy tables, serif headlines, and sans body text creates a professional, warm aesthetic that stands out from typical healthcare applications

3. **Role-Based UX**: Four custom dashboard layouts and role-filtered navigation ensure each user (ADMIN, Bidan Koordinator, Bidan Desa, Bidan Praktik) sees only relevant features

4. **Maintained Backend Compatibility**: Zero changes to API integration, authentication, or authorization logic preserve existing functionality

5. **Accessibility First**: WCAG 2.1 AA compliance through keyboard navigation, ARIA labels, focus management, and color contrast ensures all users can effectively use the application

6. **Performance Optimized**: Code splitting, lazy loading, React.memo, and font optimization strategies ensure fast load times and smooth interactions

7. **Responsive Design**: Breakpoint-based layout adaptations deliver optimal experience on desktop (≥1024px), tablet (768-1023px), and mobile (<768px)

8. **Maintainable Architecture**: Clear component hierarchy, design tokens, reusable components, and comprehensive documentation enable easy future enhancements

### Success Criteria

The refactor will be considered successful when:

- [ ] All existing features work identically to pre-refactor state
- [ ] Design system applied consistently across all pages
- [ ] Sidebar navigation works smoothly on all viewport sizes
- [ ] All 4 role-based dashboards display correct data
- [ ] Forms submit successfully with proper validation
- [ ] Verification workflow functions end-to-end
- [ ] Accessibility audit passes with no critical issues
- [ ] Performance metrics meet targets (< 3s load, > 80 Lighthouse score)
- [ ] Manual testing confirms correct behavior for all roles
- [ ] No console errors in production build

### Future Enhancements (Out of Scope for MVP)

Potential improvements for future iterations:

- Dark mode toggle (using design system dark surface colors)
- Customizable sidebar width/position preferences
- Advanced data visualization components (charts, graphs)
- Keyboard shortcuts for power users
- Offline mode with service workers
- Real-time notifications for verification updates
- Advanced filtering and search in tables
- Bulk operations for data management
- PDF report preview before export
- Multi-language support (i18n)

### Final Notes

This refactor prioritizes **user experience improvements** while maintaining **full backward compatibility**. The phased implementation approach allows incremental delivery of value, with each phase independently testable and deployable. The design system foundation created here will serve as the base for all future UI development, ensuring consistency and maintainability for years to come.

