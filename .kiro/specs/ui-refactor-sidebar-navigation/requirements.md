# Requirements Document

## Introduction

This document specifies the requirements for refactoring the entire UI of the Puskesmas frontend application. The refactor will transform the current cramped top-navbar design into a modern sidebar navigation system while implementing a comprehensive design system inspired by Claude's warm editorial interface. The refactor aims to maximize screen space, improve navigation clarity, maintain alignment with the existing backend API, and deliver a cohesive, accessible user experience across all four user roles (ADMIN, Bidan Koordinator, Bidan Desa, Bidan Praktik) and four service modules (Pemeriksaan Kehamilan, Persalinan, Keluarga Berencana, Imunisasi).

## Glossary

- **Sidebar_Navigation**: A vertical navigation menu positioned on the left side of the screen that replaces the top navbar
- **Design_System**: The visual language and component library defined in DESIGN.md, featuring cream canvas (#faf9f5), coral primary (#cc785c), dark navy surfaces (#181715), serif display headlines, and sans body text
- **Frontend_Application**: The React-based Puskesmas health information system that manages maternal and child healthcare data
- **Backend_API**: The RESTful API at http://localhost:9090/api providing authentication, user management, dashboard, service modules, master data, and reports
- **User_Roles**: The four access levels: ADMIN (super user), Bidan Koordinator (coordinator viewing approved data), Bidan Desa (village-level verifier), Bidan Praktik (data inputter)
- **Service_Modules**: The four health data modules: Pemeriksaan Kehamilan (pregnancy checkup), Persalinan (delivery), Keluarga Berencana (family planning), Imunisasi (immunization)
- **Verification_Workflow**: The approval process where data moves from PENDING → APPROVED/REJECTED status
- **WCAG_2_1_AA**: Web Content Accessibility Guidelines Level AA compliance standard for accessible web applications

## Requirements

### Requirement 1: Implement Sidebar Navigation System

**User Story:** As a user of any role, I want to navigate the application using a sidebar menu instead of a top navbar, so that I have more horizontal screen space and clearer navigation structure.

#### Acceptance Criteria

1. THE Sidebar_Navigation SHALL be positioned on the left side of the screen with fixed positioning
2. THE Sidebar_Navigation SHALL display navigation links organized by functional groups (Dashboard, User Management, Master Data, Service Modules, Reports, Settings)
3. WHEN a user clicks a navigation link, THE Frontend_Application SHALL navigate to the corresponding route and highlight the active link
4. THE Sidebar_Navigation SHALL support collapse/expand functionality to maximize content area when needed
5. WHEN the sidebar is collapsed, THE Sidebar_Navigation SHALL display icon-only navigation with tooltips on hover
6. WHEN the sidebar is expanded, THE Sidebar_Navigation SHALL display both icons and text labels
7. THE Sidebar_Navigation SHALL maintain its collapsed/expanded state in browser storage across sessions
8. WHILE viewing on mobile devices (viewport < 768px), THE Sidebar_Navigation SHALL transform into a hamburger menu overlay
9. THE Sidebar_Navigation SHALL render role-based navigation items based on the authenticated user's role and position

### Requirement 2: Apply Design System Colors and Surfaces

**User Story:** As a user, I want the application to use the warm editorial design system, so that the interface feels cohesive, professional, and comfortable to use.

#### Acceptance Criteria

1. THE Frontend_Application SHALL use cream canvas (#faf9f5) as the base background color for all main content areas
2. THE Frontend_Application SHALL use coral primary (#cc785c) for all primary CTA buttons and accent elements
3. THE Frontend_Application SHALL use dark navy (#181715) for the Sidebar_Navigation background and card surfaces containing data tables
4. THE Frontend_Application SHALL use ink (#141413) for all headline and primary text on cream backgrounds
5. THE Frontend_Application SHALL use on-dark cream-tinted white (#faf9f5) for text on dark navy surfaces
6. THE Frontend_Application SHALL use surface-card (#efe9de) for feature cards and content containers
7. THE Frontend_Application SHALL use hairline (#e6dfd8) for 1px borders on cream surfaces
8. WHEN rendering form inputs, THE Frontend_Application SHALL use canvas background (#faf9f5) with hairline borders
9. WHEN rendering status badges, THE Frontend_Application SHALL use semantic colors: success (#5db872), warning (#d4a017), error (#c64545)
10. THE Frontend_Application SHALL avoid using pure white or cool grays as background colors

### Requirement 3: Implement Typography System

**User Story:** As a user, I want consistent, readable typography throughout the application, so that content hierarchy is clear and reading is comfortable.

#### Acceptance Criteria

1. THE Frontend_Application SHALL use serif fonts (Copernicus, Tiempos Headline, or Cormorant Garamond as fallback) for all display headlines (h1, h2, h3)
2. THE Frontend_Application SHALL use sans-serif fonts (StyreneB, Inter as fallback) for all body text, navigation, buttons, and form labels
3. THE Frontend_Application SHALL use JetBrains Mono for code blocks and technical identifiers (NIK, user IDs)
4. WHEN rendering h1 headlines, THE Frontend_Application SHALL apply 48px font size with 400 weight and -1px letter spacing
5. WHEN rendering h2 headlines, THE Frontend_Application SHALL apply 36px font size with 400 weight and -0.5px letter spacing
6. WHEN rendering body text, THE Frontend_Application SHALL apply 16px font size with 400 weight and 1.55 line height
7. WHEN rendering button labels, THE Frontend_Application SHALL apply 14px font size with 500 weight
8. THE Frontend_Application SHALL use weight 400 for regular body text and weight 500 for emphasized labels

### Requirement 4: Create Role-Based Dashboard Layouts

**User Story:** As a user with a specific role, I want to see a dashboard tailored to my responsibilities, so that I can quickly access relevant information and actions.

#### Acceptance Criteria

1. WHEN an ADMIN user logs in, THE Frontend_Application SHALL display a dashboard showing user management stats, pending verifications across all villages, system health, and quick actions for user and master data management
2. WHEN a Bidan Koordinator logs in, THE Frontend_Application SHALL display a dashboard showing approved data feed across all villages, summary statistics by module and village, and report generation quick actions
3. WHEN a Bidan Desa logs in, THE Frontend_Application SHALL display a dashboard showing pending verification tasks from their assigned village, verification history, and statistics for their village
4. WHEN a Bidan Praktik logs in, THE Frontend_Application SHALL display a dashboard showing their recent submissions, rejected data requiring revision, quick actions to add new health data, and statistics for their practice place
5. THE Frontend_Application SHALL display dashboard statistics cards with dark navy background (#181715) and cream text (#faf9f5)
6. THE Frontend_Application SHALL display data feed items with surface-card background (#efe9de) and appropriate status badges

### Requirement 5: Refactor Service Module List Views

**User Story:** As a user viewing health data, I want consistent, well-designed list views for all service modules, so that I can efficiently browse and filter data.

#### Acceptance Criteria

1. THE Frontend_Application SHALL render data tables with dark navy background (#181715) and cream text (#faf9f5)
2. THE Frontend_Application SHALL display table headers with title-sm typography (16px / 500 weight)
3. THE Frontend_Application SHALL display table cells with body-md typography (16px / 400 weight)
4. THE Frontend_Application SHALL use hairline borders (#e6dfd8 at 20% opacity on dark) to separate table rows
5. WHEN a table row is hovered, THE Frontend_Application SHALL apply a subtle surface-dark-elevated background (#252320)
6. THE Frontend_Application SHALL display status badges (PENDING, APPROVED, REJECTED) with appropriate semantic colors and badge-pill styling
7. THE Frontend_Application SHALL provide filter controls above tables with cream background and hairline borders
8. THE Frontend_Application SHALL display action buttons (View, Edit, Delete, Verify) as button-secondary-on-dark style
9. WHEN data is loading, THE Frontend_Application SHALL display a loading state with coral accent color
10. WHEN no data is available, THE Frontend_Application SHALL display an empty state message with body-md typography

### Requirement 6: Refactor Service Module Form Views

**User Story:** As a Bidan Praktik entering health data, I want well-designed, accessible forms, so that data entry is efficient and error-free.

#### Acceptance Criteria

1. THE Frontend_Application SHALL render form containers with cream canvas background (#faf9f5)
2. THE Frontend_Application SHALL use dark navy cards (#181715) for grouping related form sections
3. THE Frontend_Application SHALL render text inputs with canvas background (#faf9f5), hairline borders (#e6dfd8), and 40px height
4. WHEN a text input receives focus, THE Frontend_Application SHALL apply a coral border (#cc785c) with 3px outer ring at 15% alpha
5. THE Frontend_Application SHALL display field labels with title-sm typography (16px / 500 weight) above inputs
6. THE Frontend_Application SHALL display validation error messages in error color (#c64545) with body-sm typography (14px)
7. THE Frontend_Application SHALL use coral primary buttons (#cc785c) for submit actions with on-primary white text
8. THE Frontend_Application SHALL use secondary buttons with canvas background for cancel actions
9. THE Frontend_Application SHALL apply 8px border radius to all form inputs and buttons
10. THE Frontend_Application SHALL display required field indicators with error color asterisks
11. THE Frontend_Application SHALL organize form fields with 24px vertical spacing between fields
12. THE Frontend_Application SHALL render select dropdowns using the custom CustomSelect component styled with design system colors

### Requirement 7: Implement Verification Interface

**User Story:** As a Bidan Desa, I want a clear interface to review and verify pending data submissions, so that I can efficiently approve or reject data with proper justification.

#### Acceptance Criteria

1. THE Frontend_Application SHALL display a pending tasks list with surface-card background (#efe9de) items
2. WHEN viewing a pending data item, THE Frontend_Application SHALL display all submitted data fields in a dark navy detail card (#181715)
3. THE Frontend_Application SHALL provide "Approve" and "Reject" action buttons with coral primary (#cc785c) and error (#c64545) colors respectively
4. WHEN a Bidan Desa clicks "Reject", THE Frontend_Application SHALL display a modal dialog requiring rejection reason input
5. THE rejection reason input SHALL be a textarea with canvas background and hairline border
6. THE Frontend_Application SHALL disable the submit button until rejection reason has at least 10 characters
7. WHEN verification is submitted, THE Frontend_Application SHALL send the appropriate API request and update the UI status
8. THE Frontend_Application SHALL display success confirmation with success color (#5db872) after successful verification
9. THE Frontend_Application SHALL group pending tasks by service module with collapsible sections

### Requirement 8: Implement Responsive Layout System

**User Story:** As a user on different devices, I want the application to adapt to my screen size, so that I can use it effectively on desktop, tablet, and mobile.

#### Acceptance Criteria

1. WHEN viewport width is >= 1024px (desktop), THE Frontend_Application SHALL display the sidebar expanded by default with 240px width
2. WHEN viewport width is between 768px and 1023px (tablet), THE Frontend_Application SHALL display the sidebar collapsed by default with 64px width
3. WHEN viewport width is < 768px (mobile), THE Frontend_Application SHALL hide the sidebar and display a hamburger menu button
4. WHEN a mobile user taps the hamburger menu, THE Frontend_Application SHALL overlay the full sidebar with a backdrop
5. WHEN the sidebar is visible on mobile, THE Frontend_Application SHALL dismiss it when the backdrop is tapped
6. THE Frontend_Application SHALL display data tables with horizontal scroll on small screens to prevent layout breaking
7. WHEN viewport width is < 768px, THE Frontend_Application SHALL stack form fields vertically with full width
8. WHEN viewport width is >= 1024px, THE Frontend_Application SHALL display form fields in a 2-column grid where appropriate
9. THE Frontend_Application SHALL scale display-xl typography from 64px (desktop) to 32px (mobile)
10. THE Frontend_Application SHALL maintain 96px section spacing on desktop and reduce to 48px on mobile

### Requirement 9: Implement Component Library with Design System

**User Story:** As a developer, I want reusable components built with the design system, so that the UI is consistent and maintainable.

#### Acceptance Criteria

1. THE Frontend_Application SHALL provide a Button component supporting variants: primary (coral), secondary (canvas), secondary-on-dark, text-link
2. THE Button component SHALL apply appropriate typography (14px / 500 weight), padding (12px × 20px), and border radius (8px)
3. THE Frontend_Application SHALL provide a StatusBadge component for rendering PENDING, APPROVED, REJECTED badges
4. THE StatusBadge component SHALL use badge-pill styling with appropriate semantic colors
5. THE Frontend_Application SHALL provide a Card component supporting surface variants: canvas, surface-card, surface-dark
6. THE Card component SHALL apply 12px border radius and 32px internal padding
7. THE Frontend_Application SHALL provide an Input component with label, error state, and focus styling
8. THE Input component SHALL integrate with react-hook-form for validation
9. THE Frontend_Application SHALL provide a ConfirmDialog component for confirmation modals
10. THE ConfirmDialog component SHALL use dark navy surface (#181715) with cream text
11. THE Frontend_Application SHALL provide a Table component with dark surface styling and hover states
12. THE Frontend_Application SHALL provide a Sidebar component managing collapse/expand state and role-based navigation

### Requirement 10: Maintain Backend API Integration

**User Story:** As a developer, I want the refactored UI to maintain all existing API integrations, so that functionality is preserved during the refactor.

#### Acceptance Criteria

1. THE Frontend_Application SHALL continue using the existing axios configuration with base URL http://localhost:9090/api
2. THE Frontend_Application SHALL continue using JWT bearer token authentication in request headers
3. THE Frontend_Application SHALL continue using the existing AuthContext for authentication state management
4. THE Frontend_Application SHALL maintain all existing API endpoints for login, profile, user management, master data, service modules, verification, and reports
5. THE Frontend_Application SHALL continue handling 401 responses by redirecting to login and clearing stored tokens
6. THE Frontend_Application SHALL continue displaying appropriate error messages from API error responses
7. THE Frontend_Application SHALL continue supporting role-based access control by checking user.role and user.position_user
8. THE Frontend_Application SHALL continue filtering data based on user.village_id for Bidan Desa and user.practice_id for Bidan Praktik

### Requirement 11: Implement Accessibility Features

**User Story:** As a user with accessibility needs, I want the application to support keyboard navigation and screen readers, so that I can use it effectively.

#### Acceptance Criteria

1. THE Sidebar_Navigation SHALL support keyboard navigation with Tab and Arrow keys
2. THE Sidebar_Navigation SHALL display focus indicators with coral outline (#cc785c) at 3px width
3. THE Frontend_Application SHALL provide skip-to-content link for keyboard users
4. THE Frontend_Application SHALL use semantic HTML elements (nav, main, header, button, form)
5. THE Frontend_Application SHALL provide aria-labels for icon-only buttons in collapsed sidebar
6. THE Frontend_Application SHALL provide aria-live regions for dynamic content updates (verification success, errors)
7. WHEN a form has validation errors, THE Frontend_Application SHALL set focus to the first error field
8. THE Frontend_Application SHALL ensure color contrast ratios meet WCAG_2_1_AA standards (4.5:1 for body text, 3:1 for large text)
9. THE Frontend_Application SHALL provide visible focus indicators for all interactive elements
10. THE Frontend_Application SHALL support screen reader announcements for status changes

### Requirement 12: Migrate Existing Components to Design System

**User Story:** As a user, I want all existing pages to use the new design system, so that the entire application has a consistent look and feel.

#### Acceptance Criteria

1. THE Frontend_Application SHALL refactor the Login page with cream canvas background, coral primary button, and design system typography
2. THE Frontend_Application SHALL refactor the Dashboard page for all four roles with role-specific layouts and design system styling
3. THE Frontend_Application SHALL refactor UserList, AddUser, EditUser pages with design system tables, forms, and buttons
4. THE Frontend_Application SHALL refactor VillageList, VillageForm, VillageDetail pages with design system styling
5. THE Frontend_Application SHALL refactor PracticePlaceList, PracticePlaceForm, PracticePlaceDetail pages with design system styling
6. THE Frontend_Application SHALL refactor PasienList, PasienForm, PasienDetail pages with design system styling
7. THE Frontend_Application SHALL refactor PemeriksaanKehamilanList, PemeriksaanKehamilanForm, PemeriksaanKehamilanDetail pages with design system styling
8. THE Frontend_Application SHALL refactor PersalinanList, PersalinanForm, PersalinanDetail pages with design system styling
9. THE Frontend_Application SHALL refactor KBList, KBForm, KBDetail pages with design system styling
10. THE Frontend_Application SHALL refactor ImunisasiList, ImunisasiForm, ImunisasiDetail pages with design system styling
11. THE Frontend_Application SHALL refactor PendingDataList and verification interfaces with design system styling
12. THE Frontend_Application SHALL refactor RejectedDataList and revision interfaces with design system styling
13. THE Frontend_Application SHALL refactor RekapitulasiPage with design system styling
14. THE Frontend_Application SHALL update the existing Button, ConfirmDialog, CustomSelect, Input, StatusBadge components to match design system specifications

### Requirement 13: Implement Navigation State Management

**User Story:** As a user navigating the application, I want the sidebar to show my current location and maintain navigation state, so that I always know where I am.

#### Acceptance Criteria

1. THE Sidebar_Navigation SHALL highlight the active navigation item with surface-dark-elevated background (#252320) and coral accent
2. WHEN a navigation group contains the active route, THE Sidebar_Navigation SHALL expand that group automatically
3. THE Sidebar_Navigation SHALL persist the expanded/collapsed state of navigation groups in localStorage
4. WHEN navigating to a detail page (e.g., /pasien/123), THE Sidebar_Navigation SHALL highlight the parent list item (e.g., "Pasien")
5. THE Sidebar_Navigation SHALL display breadcrumbs for nested routes using body-sm typography and muted color (#6c6a64)

### Requirement 14: Optimize Performance and Bundle Size

**User Story:** As a user, I want the application to load quickly and run smoothly, so that I have a responsive experience.

#### Acceptance Criteria

1. THE Frontend_Application SHALL implement code splitting for route-level components to reduce initial bundle size
2. THE Frontend_Application SHALL lazy load non-critical design system fonts (Copernicus, Tiempos Headline)
3. THE Frontend_Application SHALL use React.memo for complex list components to prevent unnecessary re-renders
4. THE Frontend_Application SHALL debounce search and filter inputs with 300ms delay
5. THE Frontend_Application SHALL implement virtual scrolling for data tables with more than 100 rows
6. THE Frontend_Application SHALL cache static data (villages, practice places) in memory after initial fetch
7. WHEN initial page load occurs, THE Frontend_Application SHALL display the interactive content within 3 seconds on standard broadband connection

### Requirement 15: Provide Design System Documentation

**User Story:** As a developer maintaining the application, I want documentation for the design system, so that I can build new features consistently.

#### Acceptance Criteria

1. THE Frontend_Application SHALL include a DESIGN_TOKENS.md file documenting all colors, typography, spacing, and border radius values
2. THE Frontend_Application SHALL include a COMPONENTS.md file documenting all reusable component APIs and usage examples
3. THE Frontend_Application SHALL include code comments in component files explaining design system implementation
4. THE Frontend_Application SHALL include a Storybook or similar component showcase for visual reference (optional enhancement)
