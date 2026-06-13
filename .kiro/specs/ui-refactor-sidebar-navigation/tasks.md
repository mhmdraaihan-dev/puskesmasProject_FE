# Implementation Plan: UI Refactor - Sidebar Navigation with Design System

## Overview

This implementation plan transforms the Puskesmas frontend from a top-navbar layout to a modern sidebar navigation system with a comprehensive Claude-inspired design system. The refactor touches every page and component while maintaining full backend API compatibility. Implementation follows a bottom-up approach: design tokens → base components → layout system → page migrations → responsive behavior → accessibility → testing.

## Tasks

- [x] 1. Foundation: Design System & Project Structure
  - Create design system CSS files with color tokens, typography, spacing, and border radius
  - Set up new folder structure for layout and UI components
  - Configure font loading strategy for serif (Copernicus/Tiempos Headline) and sans (StyreneB/Inter) fonts
  - Create utility hooks directory with base hook files
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 2.8, 15.1_

- [x] 2. Core Custom Hooks
  - [x] 2.1 Implement useSidebar hook
    - Create hook managing collapsed state (boolean) and expandedGroups (string array)
    - Implement localStorage persistence for sidebar state
    - Provide toggleCollapsed, toggleGroup, and isActive functions
    - Initialize state from localStorage on mount with fallback defaults
    - _Requirements: 1.7, 13.1, 13.3_

  - [x] 2.2 Implement useMediaQuery hook
    - Create hook detecting viewport breakpoints (mobile < 768px, tablet 768-1023px, desktop ≥ 1024px)
    - Return boolean for each breakpoint category
    - Use window.matchMedia with event listeners for responsive updates
    - Clean up listeners on unmount
    - _Requirements: 8.1, 8.2, 8.3_


- [ ] 3. Design System Base Components
  - [x] 3.1 Refactor Button component
    - Update existing Button.jsx with design system variants (primary, secondary, secondary-on-dark, text-link, icon-circular)
    - Implement size prop (sm, md, lg) with corresponding height and padding
    - Add loading state with spinner icon
    - Apply coral primary (#cc785c), canvas secondary, and dark elevated styling
    - Support icon prop for icon+text buttons
    - _Requirements: 2.2, 2.3, 9.1, 9.2_

  - [x] 3.2 Create Card component
    - Create new Card.jsx component in src/components/ui/
    - Support variant prop (canvas, surface-card, surface-dark)
    - Support padding prop (sm, md, lg, xl) and rounded prop (sm, md, lg, xl)
    - Apply appropriate background colors and text colors based on variant
    - _Requirements: 2.1, 2.2, 2.6, 9.5, 9.6_

  - [x] 3.3 Refactor Input component
    - Update existing Input.jsx with design system styling
    - Apply cream canvas background, hairline borders, 40px height
    - Implement coral focus state with 3px outer ring at 15% alpha
    - Display required asterisk in error color for required fields
    - Integrate error and helperText display with body-sm typography
    - Support disabled state with appropriate styling
    - _Requirements: 2.1, 2.2, 2.8, 6.3, 6.4, 6.5, 6.6, 9.7, 9.8_

  - [x] 3.4 Refactor CustomSelect component
    - Rename CustomSelect.jsx to Select.jsx and move to src/components/ui/
    - Apply design system styling consistent with Input component
    - Use cream background, hairline borders, coral focus state
    - Ensure react-select integration maintains design system appearance
    - _Requirements: 2.1, 2.2, 6.12_

  - [x] 3.5 Refactor StatusBadge component
    - Update existing StatusBadge.jsx with badge-pill styling (border-radius: 9999px)
    - Use semantic colors: success (#5db872), warning (#d4a017), error (#c64545), muted (#6c6a64)
    - Apply 15% alpha backgrounds for each status
    - Support size prop (sm, md) with appropriate font size and padding
    - Use uppercase text transform with 0.05em letter spacing
    - _Requirements: 2.1, 2.2, 2.9, 5.6, 9.3, 9.4_


  - [x] 3.6 Create Table component
    - Create new Table.jsx component in src/components/ui/
    - Accept columns (with key, label, sortable, render, width) and data props
    - Render table with dark navy background (#181715) and cream text (#faf9f5)
    - Apply hairline borders at 20% opacity for table headers and 10% for rows
    - Implement hover state with surface-dark-elevated background (#252320)
    - Support onRowClick callback for clickable rows with cursor pointer
    - Include loading and emptyMessage props for loading/empty states
    - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 5.5, 9.11_

  - [x] 3.7 Refactor ConfirmDialog to Modal component
    - Rename ConfirmDialog.jsx to Modal.jsx and move to src/components/ui/
    - Apply dark navy surface (#181715) with cream text (#faf9f5)
    - Use design system buttons (coral primary for confirm, secondary for cancel)
    - Add backdrop with semi-transparent dark overlay
    - Support keyboard navigation (Escape to close, focus trap)
    - _Requirements: 2.1, 2.2, 7.4, 7.5, 9.9, 9.10_

  - [x] 3.8 Create LoadingSpinner component
    - Create new LoadingSpinner.jsx in src/components/ui/
    - Use coral primary color (#cc785c) for spinner
    - Support size prop (sm, md, lg)
    - Center spinner in container with appropriate aria-label
    - _Requirements: 2.1, 2.2, 5.9_

  - [x] 3.9 Create EmptyState component
    - Create new EmptyState.jsx in src/components/ui/
    - Display message prop with muted color (#6c6a64) and body-md typography
    - Support optional action button prop for "Add New" CTAs
    - Center content vertically and horizontally in container
    - _Requirements: 2.1, 2.2, 5.10_

  - [x] 3.10 Create Tooltip component
    - Create new Tooltip.jsx in src/components/ui/
    - Position tooltip relative to trigger element
    - Use dark navy background with cream text for tooltip content
    - Show tooltip on hover with smooth fade-in animation
    - Support placement prop (top, bottom, left, right)
    - _Requirements: 1.5, 2.1, 2.2_


- [x] 4. Navigation Configuration System
  - [x] 4.1 Create navigationConfig.js utility
    - Create src/utils/navigationConfig.js file
    - Define NavigationGroup and NavigationItem structure
    - Implement getNavigationForRole function accepting role and position_user
    - Return navigation config for ADMIN role (Dashboard, User Management, Master Data, Service Modules, Verification, Reports, Settings)
    - Return navigation config for Bidan Koordinator (Dashboard, Service Modules, Reports, Settings)
    - Return navigation config for Bidan Desa (Dashboard, Service Modules, Verification, History, Settings)
    - Return navigation config for Bidan Praktik (Dashboard, Service Modules, Revision, Settings)
    - Use lucide-react icons for all navigation items
    - _Requirements: 1.2, 1.9, 4.1, 4.2, 4.3, 4.4_

- [x] 5. Sidebar Navigation Components
  - [x] 5.1 Create NavItem component
    - Create src/components/layout/NavItem.jsx
    - Accept id, label, path, icon, badge props
    - Use Link from react-router-dom for navigation
    - Detect active state using useLocation and path matching
    - Apply surface-dark-elevated background (#252320) and coral accent for active items
    - Show icon only when sidebar collapsed, icon + label when expanded
    - Support badge display for pending counts
    - Apply coral focus indicator (3px outline) for keyboard navigation
    - _Requirements: 1.3, 1.5, 1.6, 11.2, 13.1, 13.4_

  - [x] 5.2 Create NavGroup component
    - Create src/components/layout/NavGroup.jsx
    - Accept id, label, items props
    - Implement collapsible group with expand/collapse toggle
    - Use useSidebar hook to read/update expandedGroups state
    - Auto-expand group if it contains the active route
    - Apply smooth height transition for expand/collapse animation
    - Show group label only when sidebar is expanded
    - _Requirements: 1.2, 13.2, 13.3_

  - [x] 5.3 Create SidebarNav component
    - Create src/components/layout/SidebarNav.jsx
    - Accept navigationConfig prop (array of NavigationGroups)
    - Map navigationConfig to NavGroup components
    - Apply appropriate spacing between navigation groups
    - Scroll navigation area if content exceeds viewport height
    - _Requirements: 1.2, 1.9_


  - [x] 5.4 Create SidebarHeader component
    - Create src/components/layout/SidebarHeader.jsx
    - Display application logo/name with serif display typography
    - Include collapse/expand toggle button with icon (ChevronLeft/ChevronRight from lucide-react)
    - Use useSidebar hook to access and toggle collapsed state
    - Show full logo when expanded, icon only when collapsed
    - Apply appropriate padding and alignment
    - _Requirements: 1.4, 1.5, 1.6, 2.1, 2.2_

  - [x] 5.5 Create SidebarFooter component
    - Create src/components/layout/SidebarFooter.jsx
    - Accept user and onLogout props
    - Display user name and role when expanded, avatar only when collapsed
    - Include logout button with appropriate icon
    - Use dropdown menu for user settings (Change Password, Profile, Logout)
    - Apply design system button styling
    - _Requirements: 1.5, 1.6, 2.1, 2.2_

  - [x] 5.6 Create Sidebar component
    - Create src/components/layout/Sidebar.jsx
    - Combine SidebarHeader, SidebarNav, and SidebarFooter
    - Apply fixed positioning on left side with dark navy background (#181715)
    - Use useSidebar hook for collapsed state (240px expanded, 64px collapsed)
    - Use useAuth hook to get user data for navigation config
    - Call getNavigationForRole with user.role and user.position_user
    - Implement mobile behavior: transform translateX(-100%) when hidden, translateX(0) when open
    - Add backdrop overlay on mobile when sidebar is open
    - Handle backdrop click to close mobile menu
    - Apply smooth width/transform transitions (0.3s ease)
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.3_

- [x] 6. Main Layout System
  - [x] 6.1 Create PageHeader component
    - Create src/components/layout/PageHeader.jsx
    - Accept heading, actions props
    - Render h1 with serif display typography (48px on desktop, 32px on mobile)
    - Render action buttons in flex row aligned to the right
    - Apply appropriate vertical spacing
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 8.9_

  - [x] 6.2 Create Breadcrumbs component
    - Create src/components/layout/Breadcrumbs.jsx
    - Generate breadcrumb links from current route using useLocation
    - Display breadcrumbs with body-sm typography and muted color (#6c6a64)
    - Separate breadcrumb items with "/" character
    - Make non-current items clickable links
    - _Requirements: 2.1, 2.2, 13.5_


  - [x] 6.3 Create MainContent component
    - Create src/components/layout/MainContent.jsx
    - Apply cream canvas background (#faf9f5) to content area
    - Set margin-left based on sidebar state (240px when expanded, 64px when collapsed, 0 on mobile)
    - Apply responsive padding (32px on desktop, 16px on mobile)
    - Implement smooth margin-left transition (0.3s ease)
    - Render children (Outlet from react-router-dom)
    - _Requirements: 2.1, 8.1, 8.2, 8.3, 8.7_

  - [x] 6.4 Create MainLayout component
    - Create src/components/layout/MainLayout.jsx
    - Combine Sidebar and MainContent components
    - Create app-layout wrapper with flex display and min-height 100vh
    - Render mobile backdrop when sidebar is open on mobile
    - Use Outlet from react-router-dom for nested route rendering
    - _Requirements: 1.1, 1.8, 8.1, 8.2, 8.3_

  - [x] 6.5 Update App.jsx routing structure
    - Wrap all protected routes with MainLayout component
    - Keep public routes (Login, Register) outside MainLayout
    - Maintain existing ProtectedRoute wrapping for authentication
    - Maintain existing role-based access control (allowedRoles, allowedPositions)
    - Preserve all existing route paths and components
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.7_

- [x] 7. Checkpoint - Core Layout Functional
  - Ensure sidebar renders with collapse/expand functionality
  - Verify navigation items display correctly for each role
  - Test mobile hamburger menu opens and closes
  - Verify page content renders in MainContent area with correct margins
  - Ensure all tests pass, ask the user if questions arise.


- [x] 8. Role-Specific Dashboard Components
  - [x] 8.1 Create StatsCard component
    - Create src/components/dashboard/StatsCard.jsx
    - Accept title, value, icon, trend props
    - Use dark navy background (#181715) with cream text (#faf9f5)
    - Display large value with display-md typography
    - Display title with title-sm typography
    - Show icon and optional trend indicator
    - Apply 12px border radius and 32px padding
    - _Requirements: 2.1, 2.3, 4.5_

  - [x] 8.2 Create DashboardAdmin component
    - Create src/components/dashboard/DashboardAdmin.jsx
    - Display user management stats (total users, active users, inactive users, pending leave requests)
    - Display pending verifications summary across all villages
    - Display system health indicators
    - Include quick action buttons (Add User, Manage Villages, Manage Practice Places)
    - Use Card components with surface-card variant for content sections
    - Use StatsCard components for metrics display
    - Fetch data from appropriate API endpoints (users, verification summary)
    - _Requirements: 4.1, 4.5, 4.6_

  - [x] 8.3 Create DashboardKoordinator component
    - Create src/components/dashboard/DashboardKoordinator.jsx
    - Display approved data feed across all villages (recent 10 items)
    - Display summary statistics by module (Pemeriksaan Kehamilan, Persalinan, KB, Imunisasi) across villages
    - Display summary statistics by village
    - Include quick action buttons for report generation
    - Use Table component for approved data feed
    - Use StatsCard components for statistics
    - Fetch data from dashboard API endpoint filtered for Bidan Koordinator
    - _Requirements: 4.2, 4.5, 4.6_

  - [x] 8.4 Create DashboardDesa component
    - Create src/components/dashboard/DashboardDesa.jsx
    - Display pending verification tasks from assigned village
    - Display verification history (last 10 verified items)
    - Display statistics for assigned village by module
    - Include quick action button to view all pending verifications
    - Use Card components with surface-card variant for task list
    - Use StatsCard components for statistics
    - Fetch data from dashboard API endpoint filtered by user.village_id
    - _Requirements: 4.3, 4.5, 4.6_


  - [x] 8.5 Create DashboardPraktik component
    - Create src/components/dashboard/DashboardPraktik.jsx
    - Display recent submissions by the user (last 10 items)
    - Display rejected data requiring revision with rejection reasons
    - Display quick action buttons to add new health data (Pemeriksaan Kehamilan, Persalinan, KB, Imunisasi)
    - Display statistics for their practice place
    - Use Card components with surface-card variant for submission list
    - Use StatusBadge components for status display
    - Fetch data from dashboard API endpoint filtered by user.practice_id
    - _Requirements: 4.4, 4.5, 4.6_

  - [x] 8.6 Refactor Dashboard.jsx to route by role
    - Update existing src/pages/Dashboard.jsx
    - Use useAuth hook to get user role and position
    - Conditionally render appropriate dashboard component based on role/position
    - ADMIN → DashboardAdmin
    - Bidan Koordinator → DashboardKoordinator
    - Bidan Desa → DashboardDesa
    - Bidan Praktik → DashboardPraktik
    - Wrap dashboard in PageHeader with "Dashboard" heading
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Authentication Pages (Login, Register)
  - [x] 9.1 Refactor Login page
    - Update existing src/pages/Login.jsx
    - Remove any existing navbar/layout wrapping
    - Apply cream canvas background (#faf9f5) to full page
    - Center login form card with surface-card background (#efe9de)
    - Use refactored Input components with design system styling
    - Use refactored Button component with coral primary variant for submit
    - Apply serif display typography to "Login" heading
    - Maintain existing authentication logic with AuthContext
    - Display error messages with error color (#c64545)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.2, 10.3, 12.1_

  - [x] 9.2 Refactor Register page (if applicable)
    - Update existing src/pages/Register.jsx
    - Apply same design system styling as Login page
    - Use cream canvas background and surface-card form container
    - Use refactored Input and Button components
    - Apply serif display typography to "Register" heading
    - Maintain existing registration logic
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 12.1_


- [x] 10. User Management Pages
  - [x] 10.1 Refactor UserList page
    - Update existing src/pages/UserList.jsx
    - Wrap content with PageHeader component (heading: "Manajemen Pengguna", action: "Tambah Pengguna" button)
    - Replace table markup with Table component using dark navy styling
    - Define columns: full_name, email, role, position_user, status_user (with StatusBadge), actions
    - Implement row actions (View, Edit, Reset Password, Manage Leaves) with button-secondary-on-dark
    - Use LoadingSpinner for loading state
    - Use EmptyState for no users scenario
    - Apply filter controls with cream background and hairline borders above table
    - Maintain existing API integration and user management logic
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.4, 12.3_

  - [x] 10.2 Refactor AddUser page
    - Update existing src/pages/AddUser.jsx
    - Wrap content with PageHeader component (heading: "Tambah Pengguna")
    - Use Card component with dark navy surface for form grouping
    - Replace form inputs with refactored Input components
    - Use refactored Select component for role, position, village, practice place dropdowns
    - Use coral primary Button for submit, secondary Button for cancel
    - Apply 2-column grid layout on desktop, single column on mobile
    - Display validation errors inline with error color
    - Maintain existing form validation with react-hook-form
    - Maintain existing API integration for user creation
    - _Requirements: 2.1, 2.2, 6.1-6.12, 8.8, 10.4, 12.3_

  - [x] 10.3 Refactor EditUser page
    - Update existing src/pages/EditUser.jsx
    - Apply same design system styling as AddUser page
    - Pre-populate form fields with existing user data
    - Use same component structure (PageHeader, Card, Input, Select, Button)
    - Maintain existing API integration for user update
    - _Requirements: 2.1, 2.2, 6.1-6.12, 10.4, 12.3_

  - [x] 10.4 Refactor ChangePassword page
    - Update existing src/pages/ChangePassword.jsx
    - Use PageHeader with "Ubah Kata Sandi" heading
    - Use Card with dark navy surface for form
    - Use Input components for current password, new password, confirm password
    - Apply password validation (minimum length, matching confirmation)
    - Use coral primary Button for submit
    - Display success message with success color after password change
    - _Requirements: 2.1, 2.2, 6.1-6.12, 12.3_


  - [x] 10.5 Refactor ResetPassword page
    - Update existing src/pages/ResetPassword.jsx
    - Apply design system styling consistent with ChangePassword page
    - Use PageHeader, Card, Input, Button components
    - Maintain existing admin reset password logic
    - _Requirements: 2.1, 2.2, 6.1-6.12, 12.3_

  - [x] 10.6 Refactor LeavePage (user leave management)
    - Update existing src/pages/Leaves/LeavePage.jsx
    - Use PageHeader with user name and "Cuti" heading
    - Use Table component for displaying leave history
    - Use Card components for leave request form
    - Use Input components for date range selection
    - Maintain existing API integration for leave management
    - _Requirements: 2.1, 2.2, 5.1-5.10, 6.1-6.12, 12.3_

- [x] 11. Master Data Pages - Villages
  - [x] 11.1 Refactor VillageList page
    - Update existing src/pages/Villages/VillageList.jsx
    - Use PageHeader with "Daftar Desa" heading and "Tambah Desa" action button
    - Replace table with Table component (columns: village_name, village_code, actions)
    - Implement row actions (View, Edit, Delete) with appropriate button styling
    - Use Modal component for delete confirmation
    - Maintain existing API integration for village list
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.4, 12.4_

  - [x] 11.2 Refactor VillageForm page
    - Update existing src/pages/Villages/VillageForm.jsx
    - Use PageHeader with "Tambah Desa" or "Edit Desa" heading based on mode
    - Use Card with dark navy surface for form
    - Use Input components for village_name and village_code fields
    - Apply form validation (required fields, unique village_code)
    - Use coral primary Button for submit, secondary for cancel
    - Maintain existing API integration for village create/update
    - _Requirements: 2.1, 2.2, 6.1-6.12, 10.4, 12.4_

  - [x] 11.3 Refactor VillageDetail page
    - Update existing src/pages/Villages/VillageDetail.jsx
    - Use PageHeader with village name and action buttons (Edit, Delete)
    - Use Card with surface-card variant to display village details
    - Display village_name, village_code, associated users count
    - Use Table component to list users associated with this village
    - Maintain existing API integration for village details
    - _Requirements: 2.1, 2.2, 5.1-5.10, 12.4_


- [x] 12. Master Data Pages - Practice Places
  - [x] 12.1 Refactor PracticePlaceList page
    - Update existing src/pages/PracticePlaces/PracticePlaceList.jsx
    - Use PageHeader with "Daftar Tempat Praktik" heading and "Tambah Tempat Praktik" action
    - Replace table with Table component (columns: practice_name, address, village_name, actions)
    - Implement row actions (View, Edit, Delete)
    - Use Modal for delete confirmation
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.4, 12.5_

  - [x] 12.2 Refactor PracticePlaceForm page
    - Update existing src/pages/PracticePlaces/PracticePlaceForm.jsx
    - Use PageHeader with appropriate heading based on create/edit mode
    - Use Card with dark navy surface for form
    - Use Input components for practice_name and address fields
    - Use Select component for village_id dropdown
    - Apply form validation
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 6.1-6.12, 10.4, 12.5_

  - [x] 12.3 Refactor PracticePlaceDetail page
    - Update existing src/pages/PracticePlaces/PracticePlaceDetail.jsx
    - Use PageHeader with practice place name and action buttons
    - Use Card to display practice place details (name, address, village)
    - Use Table to list associated users
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.1-5.10, 12.5_

- [x] 13. Master Data Pages - Pasien
  - [x] 13.1 Refactor PasienList page
    - Update existing src/pages/Pasien/PasienList.jsx
    - Use PageHeader with "Daftar Pasien" heading and "Tambah Pasien" action
    - Replace table with Table component (columns: NIK, full_name, date_of_birth, village, actions)
    - Use JetBrains Mono font for NIK display
    - Implement search and filter controls
    - Maintain existing API integration filtered by user role
    - _Requirements: 2.1, 2.3, 2.4, 5.1-5.10, 10.8, 12.6_

  - [x] 13.2 Refactor PasienForm page
    - Update existing src/pages/Pasien/PasienForm.jsx
    - Use PageHeader with appropriate heading
    - Use Card with dark navy surface for form sections
    - Use Input components for all patient fields (NIK, full_name, date_of_birth, address, phone, etc.)
    - Use Select component for village_id
    - Apply 2-column grid layout on desktop
    - Apply comprehensive form validation (NIK format, required fields)
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 6.1-6.12, 8.7, 8.8, 10.8, 12.6_


  - [x] 13.3 Refactor PasienDetail page
    - Update existing src/pages/Pasien/PasienDetail.jsx
    - Use PageHeader with patient name and action buttons
    - Use Card to display patient information
    - Display NIK with JetBrains Mono font
    - Use Table to display related health data (pregnancy, delivery, KB, immunization records)
    - Maintain existing API integration
    - _Requirements: 2.1, 2.3, 2.4, 5.1-5.10, 12.6_

- [ ] 14. Checkpoint - Master Data and User Management Complete
  - Verify all user management pages render with design system
  - Verify all master data pages (Villages, Practice Places, Pasien) use new components
  - Test form submissions work correctly
  - Test table sorting, filtering, and pagination
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Service Module Pages - Pemeriksaan Kehamilan
  - [x] 15.1 Refactor PemeriksaanKehamilanList page
    - Update existing src/pages/PemeriksaanKehamilan/PemeriksaanKehamilanList.jsx
    - Use PageHeader with "Pemeriksaan Kehamilan" heading and "Tambah Data" action (only for Bidan Praktik)
    - Replace table with Table component
    - Define columns: patient_name, checkup_date, gestational_age, weight, blood_pressure, status (with StatusBadge), actions
    - Implement filter controls (date range, village, practice place, status)
    - Apply role-based data filtering (Bidan Praktik sees own data, Bidan Desa sees village data, etc.)
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.7, 10.8, 12.7_

  - [x] 15.2 Refactor PemeriksaanKehamilanForm page
    - Update existing src/pages/PemeriksaanKehamilan/PemeriksaanKehamilanForm.jsx
    - Use PageHeader with "Tambah Pemeriksaan Kehamilan" or "Edit Pemeriksaan Kehamilan" heading
    - Group form fields into logical Card sections (Patient Info, Checkup Details, Vitals, Notes)
    - Use Input components for all fields (checkup_date, gestational_age, weight, blood_pressure, etc.)
    - Use Select component for patient_id dropdown
    - Apply comprehensive form validation
    - Use 2-column grid layout on desktop
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 6.1-6.12, 8.7, 8.8, 10.8, 12.7_

  - [x] 15.3 Refactor PemeriksaanKehamilanDetail page
    - Update existing src/pages/PemeriksaanKehamilan/PemeriksaanKehamilanDetail.jsx
    - Use PageHeader with patient name and checkup date
    - Use Card components to display checkup details in organized sections
    - Display status with StatusBadge component
    - Include Edit action button (only for Bidan Praktik with PENDING status)
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.6, 10.8, 12.7_


- [ ] 16. Service Module Pages - Persalinan
  - [x] 16.1 Refactor PersalinanList page
    - Update existing src/pages/Persalinan/PersalinanList.jsx
    - Use PageHeader with "Persalinan" heading and "Tambah Data" action
    - Replace table with Table component
    - Define columns: patient_name, delivery_date, delivery_method, baby_weight, baby_gender, status, actions
    - Implement filter controls
    - Apply role-based data filtering
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.7, 10.8, 12.8_

  - [x] 16.2 Refactor PersalinanForm page
    - Update existing src/pages/Persalinan/PersalinanForm.jsx
    - Use PageHeader with appropriate heading
    - Group form into Card sections (Patient Info, Delivery Details, Baby Info, Complications)
    - Use Input components for all fields
    - Use Select component for dropdowns (patient, delivery_method, baby_gender)
    - Apply 2-column grid layout on desktop
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 6.1-6.12, 8.7, 8.8, 10.8, 12.8_

  - [x] 16.3 Refactor PersalinanDetail page
    - Update existing src/pages/Persalinan/PersalinanDetail.jsx
    - Use PageHeader and Card components
    - Display delivery details in organized sections
    - Include StatusBadge for status display
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.6, 10.8, 12.8_

- [ ] 17. Service Module Pages - Keluarga Berencana
  - [x] 17.1 Refactor KBList page
    - Update existing src/pages/KeluargaBerencana/KBList.jsx
    - Use PageHeader with "Keluarga Berencana" heading and "Tambah Data" action
    - Replace table with Table component
    - Define columns: patient_name, service_date, contraceptive_method, next_visit_date, status, actions
    - Implement filter controls
    - Apply role-based data filtering
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.7, 10.8, 12.9_

  - [x] 17.2 Refactor KBForm page
    - Update existing src/pages/KeluargaBerencana/KBForm.jsx
    - Use PageHeader with appropriate heading
    - Group form into Card sections (Patient Info, Service Details, Method Details, Follow-up)
    - Use Input and Select components
    - Apply 2-column grid layout on desktop
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 6.1-6.12, 8.7, 8.8, 10.8, 12.9_


  - [x] 17.3 Refactor KBDetail page
    - Update existing src/pages/KeluargaBerencana/KBDetail.jsx
    - Use PageHeader and Card components
    - Display KB service details
    - Include StatusBadge for status
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.6, 10.8, 12.9_

- [ ] 18. Service Module Pages - Imunisasi
  - [x] 18.1 Refactor ImunisasiList page
    - Update existing src/pages/Imunisasi/ImunisasiList.jsx
    - Use PageHeader with "Imunisasi" heading and "Tambah Data" action
    - Replace table with Table component
    - Define columns: patient_name, immunization_date, vaccine_type, dose_number, next_schedule, status, actions
    - Implement filter controls
    - Apply role-based data filtering
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.7, 10.8, 12.10_

  - [x] 18.2 Refactor ImunisasiForm page
    - Update existing src/pages/Imunisasi/ImunisasiForm.jsx
    - Use PageHeader with appropriate heading
    - Group form into Card sections (Patient Info, Vaccine Details, Schedule)
    - Use Input and Select components
    - Apply 2-column grid layout
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 6.1-6.12, 8.7, 8.8, 10.8, 12.10_dule)
    - Use Input and Select components
    - Apply 2-column grid layout on desktop
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 6.1-6.12, 8.7, 8.8, 10.8, 12.10_

  - [x] 18.3 Refactor ImunisasiDetail page
    - Update existing src/pages/Imunisasi/ImunisasiDetail.jsx
    - Use PageHeader and Card components
    - Display immunization details
    - Include StatusBadge for status
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.6, 10.8, 12.10_

- [x] 19. Service Module Pages - Health Data (General)
  - [x] 19.1 Refactor HealthDataList page
    - Update existing src/pages/HealthData/HealthDataList.jsx
    - Use PageHeader with "Data Kesehatan" heading
    - Replace table with Table component
    - Apply design system styling consistent with other service module lists
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.7, 10.8_

  - [x] 19.2 Refactor HealthDataForm page
    - Update existing src/pages/HealthData/HealthDataForm.jsx
    - Use PageHeader and Card components
    - Use Input and Select components with design system styling
    - Apply 2-column grid layout on desktop
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 6.1-6.12, 8.7, 8.8_

  - [x] 19.3 Refactor HealthDataDetail page
    - Update existing src/pages/HealthData/HealthDataDetail.jsx
    - Use PageHeader and Card components
    - Display health data details with StatusBadge
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.6_
    - Apply 2-column grid layout on desktop
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 6.1-6.12, 8.7, 8.8, 10.8_


  - [ ] 19.3 Refactor HealthDataDetail page
    - Update existing src/pages/HealthData/HealthDataDetail.jsx
    - Use PageHeader and Card components
    - Display health data details with appropriate formatting
    - Include StatusBadge for status
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.6, 10.8_

- [ ] 20. Checkpoint - Service Modules Complete
  - Verify all four service module list views use Table component with design system
  - Verify all form views use Card, Input, Select components with proper layout
  - Test data filtering by role and status
  - Test form validation and submission
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Verification and Revision Pages
  - [x] 21.1 Refactor PendingDataList page
    - Update existing src/pages/Verification/PendingDataList.jsx
    - Use PageHeader with "Verifikasi Data" heading
    - Group pending tasks by service module with collapsible sections
    - Display each pending item with surface-card background (#efe9de)
    - Show data preview with key fields (patient name, date, module type)
    - Include "View Details" button for each item leading to module-specific detail page
    - Add quick approve/reject actions with Modal confirmation
    - Filter data by user.village_id for Bidan Desa
    - Maintain existing API integration
    - _Requirements: 7.1, 7.2, 7.9, 10.8, 12.11_

  - [x] 21.2 Implement verification modal in detail pages
    - Update PemeriksaanKehamilanDetail, PersalinanDetail, KBDetail, ImunisasiDetail pages
    - Add "Approve" and "Reject" action buttons (only visible to Bidan Desa for PENDING items)
    - Use Button component with coral primary for Approve, error color for Reject
    - Implement rejection modal requiring rejection reason input (minimum 10 characters)
    - Use Modal component with dark navy surface
    - Use Input textarea for rejection reason with validation
    - Send verification request to API with appropriate payload
    - Display success confirmation with success color after verification
    - Redirect back to pending list after successful verification
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 10.5, 10.6, 12.11_


  - [x] 21.3 Refactor RejectedDataList page
    - Update existing src/pages/Revision/RejectedDataList.jsx
    - Use PageHeader with "Data Ditolak" heading
    - Display rejected items grouped by service module
    - Show rejection reason prominently with error color
    - Use Card components with surface-card background for each rejected item
    - Include "Revise" action button leading to revision form
    - Filter data by user ID (Bidan Praktik sees only their rejected data)
    - Maintain existing API integration
    - _Requirements: 10.8, 12.12_

  - [ ] 21.4 Refactor RevisionForm page
    - Update existing src/pages/Revision/RevisionForm.jsx
    - Use PageHeader with "Revisi Data" heading
    - Display rejection reason prominently in a Card with error accent
    - Load original form data into editable form
    - Use same form structure as original module form (Card sections, Input/Select components)
    - Mark revised fields visually (optional: highlight changed fields)
    - Submit revision to API (creates new PENDING record)
    - Display success message and redirect to rejected data list
    - _Requirements: 6.1-6.12, 10.8, 12.12_

  - [ ] 21.5 Refactor ModuleHistoryPage
    - Update existing src/pages/History/ModuleHistoryPage.jsx
    - Use PageHeader with module name and "Riwayat" heading
    - Use Table component to display verification history
    - Define columns: patient_name, date, status (with StatusBadge), verified_by, verified_date, actions
    - Implement filter controls (date range, status)
    - Filter data by user.village_id for Bidan Desa
    - Maintain existing API integration
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.8_

- [ ] 22. Reports and Rekapitulasi Page
  - [ ] 22.1 Refactor RekapitulasiPage
    - Update existing src/pages/Rekapitulasi/RekapitulasiPage.jsx
    - Use PageHeader with "Rekapitulasi" heading
    - Use Card components for filter controls (date range, village, module selection)
    - Display summary statistics with StatsCard components
    - Use Table component for detailed data display
    - Include export button (PDF/Excel) with secondary button styling
    - Maintain existing report generation and export logic
    - Filter available data by user role (Bidan Koordinator sees all, Bidan Desa sees village data)
    - _Requirements: 2.1, 2.2, 5.1-5.10, 10.8, 12.13_


- [ ] 23. Responsive Layout Refinements
  - [ ] 23.1 Implement mobile hamburger menu
    - Add hamburger menu button (visible only on mobile < 768px)
    - Position button in top-left corner of MainContent area
    - Use lucide-react Menu icon
    - Toggle mobile sidebar overlay when clicked
    - Update useSidebar hook to manage mobileMenuOpen state
    - _Requirements: 1.8, 8.3, 8.4, 8.5_

  - [ ] 23.2 Apply responsive table behavior
    - Add horizontal scroll to Table component on mobile
    - Ensure table container has overflow-x: auto
    - Reduce font size from 16px to 14px on mobile
    - Consider stacking table rows vertically on very small screens (optional enhancement)
    - _Requirements: 8.6_

  - [ ] 23.3 Apply responsive form layouts
    - Ensure all forms use single column layout on mobile (< 768px)
    - Maintain 2-column grid on desktop (≥ 1024px) for appropriate fields
    - Test all form pages (User, Village, Practice Place, Pasien, Service Modules) on mobile
    - Adjust padding and spacing for mobile (reduce from 32px to 16px)
    - _Requirements: 8.7, 8.8_

  - [ ] 23.4 Apply responsive typography scaling
    - Ensure display-xl scales from 64px (desktop) to 32px (mobile)
    - Ensure h1 scales from 48px (desktop) to 32px (mobile)
    - Adjust section spacing from 96px (desktop) to 48px (mobile)
    - Test typography readability on all breakpoints
    - _Requirements: 8.9, 8.10_

  - [ ] 23.5 Test responsive behavior across devices
    - Test sidebar collapse/expand on tablet (768-1023px)
    - Test mobile menu overlay on mobile (< 768px)
    - Test content area margins adjust correctly for each breakpoint
    - Test all pages render correctly on mobile, tablet, and desktop
    - _Requirements: 8.1, 8.2, 8.3_


- [ ] 24. Accessibility Implementation
  - [ ] 24.1 Implement keyboard navigation for sidebar
    - Ensure all sidebar navigation items are keyboard accessible via Tab key
    - Support Arrow key navigation within sidebar menu
    - Apply coral focus indicators (3px outline) for all focusable elements
    - Test navigation using keyboard only (no mouse)
    - _Requirements: 11.1, 11.2, 11.9_

  - [ ] 24.2 Implement skip-to-content link
    - Add visually-hidden skip link at top of MainLayout
    - Link should jump focus to main content area
    - Show link on keyboard focus
    - Style link with design system (coral primary button)
    - _Requirements: 11.3_

  - [ ] 24.3 Ensure semantic HTML and ARIA labels
    - Use semantic HTML elements (nav, main, header, button, form) throughout
    - Add aria-labels for icon-only buttons (collapsed sidebar navigation, hamburger menu)
    - Add aria-expanded attributes for collapsible navigation groups
    - Add role="navigation" to Sidebar component
    - Add role="main" to MainContent component
    - _Requirements: 11.4, 11.5_

  - [ ] 24.4 Implement ARIA live regions
    - Add aria-live="polite" regions for verification success messages
    - Add aria-live="assertive" regions for form validation errors
    - Add aria-live regions for loading state announcements
    - Test screen reader announcements for dynamic content updates
    - _Requirements: 11.6, 11.10_

  - [ ] 24.5 Implement focus management for forms
    - Set focus to first error field when form validation fails
    - Trap focus within modal dialogs (verification, deletion confirmation)
    - Support Escape key to close modals
    - Restore focus to trigger element after modal closes
    - _Requirements: 11.7_

  - [ ] 24.6 Verify color contrast compliance
    - Test body text on cream canvas (ink #141413 on canvas #faf9f5) meets 4.5:1 ratio
    - Test primary button text (white on coral #cc785c) meets 4.5:1 ratio
    - Test dark surface text (cream #faf9f5 on dark #181715) meets 4.5:1 ratio
    - Test error messages (error #c64545 on canvas) meet 4.5:1 ratio
    - Test status badges meet 3:1 ratio for large text
    - Use automated tools (axe DevTools) to verify WCAG 2.1 AA compliance
    - _Requirements: 11.8_


- [ ] 25. Performance Optimization
  - [ ] 25.1 Implement route-based code splitting
    - Use React.lazy() to lazy load page components
    - Wrap lazy components with Suspense boundary showing LoadingSpinner
    - Split routes by feature area (Dashboard, User Management, Master Data, Service Modules)
    - Verify reduced initial bundle size
    - _Requirements: 14.1_

  - [ ] 25.2 Optimize font loading
    - Implement font-display: swap for all custom fonts
    - Lazy load serif display fonts (Copernicus/Tiempos Headline) after initial render
    - Preload critical sans-serif font (StyreneB/Inter)
    - Use system font fallbacks while custom fonts load
    - _Requirements: 14.2_

  - [ ] 25.3 Optimize component rendering
    - Wrap expensive list components (Table, navigation groups) with React.memo
    - Memoize navigation config generation with useMemo
    - Optimize re-renders triggered by sidebar state changes
    - Profile component render times with React DevTools
    - _Requirements: 14.3_

  - [ ] 25.4 Debounce search and filter inputs
    - Add 300ms debounce to all search input fields
    - Add 300ms debounce to filter controls in list pages
    - Prevent unnecessary API calls during rapid input changes
    - Display loading indicator during debounce period
    - _Requirements: 14.4_

  - [ ] 25.5 Implement virtual scrolling for large tables (optional)
    - Evaluate tables with > 100 rows for virtual scrolling needs
    - Implement react-window or similar library if needed
    - Maintain design system table styling with virtual scrolling
    - Test performance improvement with large datasets
    - _Requirements: 14.5_

  - [ ] 25.6 Implement static data caching
    - Cache villages list in memory after initial fetch
    - Cache practice places list in memory after initial fetch
    - Cache user profile data in memory
    - Invalidate cache on relevant mutations (add/edit/delete)
    - _Requirements: 14.6_


- [ ] 26. Design System Documentation
  - [ ] 26.1 Create DESIGN_TOKENS.md
    - Document all color tokens with hex values and usage guidelines
    - Document typography tokens (font families, sizes, weights, line heights)
    - Document spacing scale (xxs to section)
    - Document border radius scale (sm to pill)
    - Include visual examples for each token category
    - _Requirements: 15.1_

  - [ ] 26.2 Create COMPONENTS.md
    - Document Button component API (props, variants, usage examples)
    - Document Card component API
    - Document Input component API
    - Document Select component API
    - Document Table component API
    - Document StatusBadge component API
    - Document Modal component API
    - Document LoadingSpinner and EmptyState component APIs
    - Include code examples for common use cases
    - _Requirements: 15.2_

  - [ ] 26.3 Add inline code comments
    - Add JSDoc comments to all component prop interfaces
    - Document design system implementation decisions in CSS files
    - Explain complex state management logic in hooks
    - Document role-based navigation logic in navigationConfig.js
    - _Requirements: 15.3_

- [ ] 27. Final Integration Testing
  - [ ] 27.1 Test authentication flows
    - Test login redirects to appropriate dashboard based on role
    - Test logout clears state and redirects to login
    - Test protected routes redirect unauthenticated users to login
    - Test role-based route access control (ADMIN, Bidan positions)
    - Test token refresh and expiration handling
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.7_

  - [ ] 27.2 Test navigation and routing
    - Test sidebar navigation for each role displays correct menu items
    - Test clicking navigation items navigates to correct routes
    - Test active navigation item highlighting
    - Test breadcrumb generation for nested routes
    - Test mobile hamburger menu on different devices
    - _Requirements: 1.1, 1.2, 1.3, 1.8, 1.9, 13.1-13.5_


  - [ ] 27.3 Test data management workflows
    - Test creating, viewing, editing, deleting users (ADMIN only)
    - Test creating, viewing, editing, deleting villages (ADMIN only)
    - Test creating, viewing, editing, deleting practice places (ADMIN only)
    - Test creating, viewing, editing pasien (all roles with appropriate filters)
    - Test role-based data filtering (Bidan Praktik sees own data, Bidan Desa sees village data, etc.)
    - _Requirements: 10.4, 10.7, 10.8, 12.3-12.6_

  - [ ] 27.4 Test service module workflows
    - Test creating health data for all four modules (Pemeriksaan Kehamilan, Persalinan, KB, Imunisasi)
    - Test viewing health data with appropriate role-based filtering
    - Test editing health data (only Bidan Praktik for PENDING status)
    - Test form validation for all service module forms
    - Test status badges display correctly (PENDING, APPROVED, REJECTED)
    - _Requirements: 5.1-5.10, 6.1-6.12, 12.7-12.10_

  - [ ] 27.5 Test verification workflow
    - Test Bidan Desa can view pending data from their village
    - Test Bidan Desa can approve pending data
    - Test Bidan Desa can reject pending data with reason (minimum 10 characters)
    - Test rejection reason validation
    - Test status updates after verification
    - Test success confirmations display correctly
    - _Requirements: 7.1-7.9, 12.11_

  - [ ] 27.6 Test revision workflow
    - Test Bidan Praktik can view their rejected data
    - Test rejection reason displays prominently
    - Test Bidan Praktik can revise rejected data
    - Test revised data creates new PENDING record
    - Test success message and redirect after revision
    - _Requirements: 12.12_

  - [ ] 27.7 Test report generation
    - Test Bidan Koordinator can access Rekapitulasi page
    - Test filtering reports by date range, village, module
    - Test report data displays correctly in tables
    - Test export functionality (PDF/Excel) works
    - Test role-based report data filtering
    - _Requirements: 12.13_


  - [ ] 27.8 Test responsive behavior
    - Test desktop layout (≥ 1024px) with expanded sidebar by default
    - Test tablet layout (768-1023px) with collapsed sidebar by default
    - Test mobile layout (< 768px) with hamburger menu
    - Test sidebar collapse/expand animations are smooth
    - Test content area margins adjust correctly for each breakpoint
    - Test forms display correctly on all device sizes
    - Test tables scroll horizontally on mobile without breaking layout
    - _Requirements: 8.1-8.10_

  - [ ] 27.9 Test accessibility features
    - Test keyboard navigation through sidebar menu
    - Test skip-to-content link with keyboard
    - Test focus indicators visible for all interactive elements
    - Test form error announcements with screen reader
    - Test modal focus trapping and Escape key closing
    - Test all interactive elements have appropriate ARIA labels
    - Run axe DevTools scan and fix any violations
    - _Requirements: 11.1-11.10_

  - [ ] 27.10 Test error handling
    - Test form validation displays errors inline
    - Test API error responses display user-friendly messages
    - Test 401 redirects to login
    - Test 403 displays access denied message
    - Test 404 displays not found message with navigation options
    - Test 500 displays error with retry option
    - Test network offline indicator (optional)
    - _Requirements: 10.5, 10.6_

- [ ] 28. Final Performance Validation
  - [ ] 28.1 Measure initial load time
    - Test initial page load completes within 3 seconds on standard broadband
    - Verify initial bundle size < 500KB gzipped
    - Verify lazy-loaded routes load within 2 seconds
    - Use Chrome DevTools Lighthouse for performance audit
    - _Requirements: 14.7_

  - [ ] 28.2 Test runtime performance
    - Test sidebar collapse/expand animation runs at 60fps without jank
    - Test form input focus states update within 100ms
    - Test page navigation feels instant (< 200ms)
    - Test data tables with 100+ rows render within 1 second
    - Profile with React DevTools and Chrome DevTools Performance panel
    - _Requirements: 14.3_


  - [ ] 28.3 Check for memory leaks
    - Test navigation between routes doesn't accumulate event listeners
    - Verify sidebar state management cleans up properly
    - Verify removed components clean up timers and subscriptions
    - Use Chrome DevTools Memory profiler to check for leaks
    - _Requirements: 14.3_

- [ ] 29. Final Checkpoint and User Acceptance
  - Verify all pages migrated to design system
  - Verify all components use design system styling
  - Verify all user roles see appropriate navigation and content
  - Verify all CRUD operations work correctly
  - Verify responsive behavior on mobile, tablet, desktop
  - Verify accessibility features work as expected
  - Verify performance targets met (initial load < 3s, bundle < 500KB)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- **This is a UI refactor only** - all backend API integrations remain unchanged
- **Design System First** - establish design tokens and base components before page migrations
- **Role-Based Testing** - test each feature with all four user roles (ADMIN, Bidan Koordinator, Bidan Desa, Bidan Praktik)
- **Responsive by Default** - test each page on mobile, tablet, and desktop as it's built
- **Accessibility Built-In** - implement ARIA labels, keyboard navigation, and focus management as components are created
- **Incremental Validation** - use checkpoints to verify functionality before moving to next phase
- **Performance Monitoring** - profile bundle size and render performance throughout implementation
- **Design tokens reference**: Colors, typography, spacing defined in src/styles/design-system.css
- **Component reference**: Reusable components in src/components/ui/ and src/components/layout/
- **Navigation config**: Role-based navigation defined in src/utils/navigationConfig.js
- **Backend API base URL**: http://localhost:9090/api (no changes to API contract)
- **Authentication**: Existing AuthContext and JWT token handling preserved
- **Dependencies**: React 19, React Router 7, react-hook-form 7, lucide-react 0.563, axios 1.13


## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1", "2.1", "2.2"]
    },
    {
      "id": 1,
      "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "4.1"]
    },
    {
      "id": 2,
      "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5"]
    },
    {
      "id": 3,
      "tasks": ["5.6", "6.1", "6.2", "6.3"]
    },
    {
      "id": 4,
      "tasks": ["6.4", "6.5"]
    },
    {
      "id": 5,
      "tasks": ["7", "8.1"]
    },
    {
      "id": 6,
      "tasks": ["8.2", "8.3", "8.4", "8.5"]
    },
    {
      "id": 7,
      "tasks": ["8.6", "9.1", "9.2"]
    },
    {
      "id": 8,
      "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6"]
    },
    {
      "id": 9,
      "tasks": ["11.1", "11.2", "11.3", "12.1", "12.2", "12.3"]
    },
    {
      "id": 10,
      "tasks": ["13.1", "13.2", "13.3"]
    },
    {
      "id": 11,
      "tasks": ["14"]
    },
    {
      "id": 12,
      "tasks": ["15.1", "15.2", "15.3"]
    },
    {
      "id": 13,
      "tasks": ["16.1", "16.2", "16.3"]
    },
    {
      "id": 14,
      "tasks": ["17.1", "17.2", "17.3"]
    },
    {
      "id": 15,
      "tasks": ["18.1", "18.2", "18.3"]
    },
    {
      "id": 16,
      "tasks": ["19.1", "19.2", "19.3"]
    },
    {
      "id": 17,
      "tasks": ["20"]
    },
    {
      "id": 18,
      "tasks": ["21.1", "21.3", "21.4", "21.5"]
    },
    {
      "id": 19,
      "tasks": ["21.2", "22.1"]
    },
    {
      "id": 20,
      "tasks": ["23.1", "23.2", "23.3", "23.4"]
    },
    {
      "id": 21,
      "tasks": ["23.5"]
    },
    {
      "id": 22,
      "tasks": ["24.1", "24.2", "24.3", "24.4", "24.5"]
    },
    {
      "id": 23,
      "tasks": ["24.6"]
    },
    {
      "id": 24,
      "tasks": ["25.1", "25.2", "25.3", "25.4", "25.5", "25.6"]
    },
    {
      "id": 25,
      "tasks": ["26.1", "26.2", "26.3"]
    },
    {
      "id": 26,
      "tasks": ["27.1", "27.2", "27.3", "27.4", "27.5", "27.6", "27.7"]
    },
    {
      "id": 27,
      "tasks": ["27.8", "27.9", "27.10"]
    },
    {
      "id": 28,
      "tasks": ["28.1", "28.2", "28.3"]
    },
    {
      "id": 29,
      "tasks": ["29"]
    }
  ]
}
```
