/**
 * Navigation Configuration
 * 
 * Defines the sidebar navigation structure for each role and position.
 * Returns an array of navigation groups with items based on user permissions.
 * 
 * _Requirements: 1.2, 1.9, 4.1, 4.2, 4.3, 4.4_
 */

import { 
  Home,
  Users,
  UserPlus,
  Map,
  Building,
  User,
  ClipboardList,
  Heart,
  Shield,
  Activity,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  History,
  Settings
} from 'lucide-react';

import { 
  isAdmin, 
  isBidanKoordinator, 
  isBidanDesa, 
  isBidanPraktik 
} from './roleHelpers';

/**
 * @typedef {Object} NavigationItem
 * @property {string} id - Unique identifier for the navigation item
 * @property {string} label - Display label for the navigation item
 * @property {string} path - Route path for the navigation item
 * @property {React.ComponentType} icon - Lucide icon component
 * @property {Object} [badge] - Optional badge for the navigation item
 * @property {string} badge.text - Badge text
 * @property {'primary'|'warning'|'error'} badge.variant - Badge variant
 */

/**
 * @typedef {Object} NavigationGroup
 * @property {string} id - Unique identifier for the navigation group
 * @property {string} label - Display label for the navigation group
 * @property {NavigationItem[]} items - Array of navigation items in this group
 */

/**
 * Get navigation configuration based on user role and position
 * @param {string} role - User role (ADMIN or USER)
 * @param {string} [position_user] - User position (bidan_praktik, bidan_desa, bidan_koordinator)
 * @param {number} [userId] - User ID for dynamic routes (e.g., change password)
 * @returns {NavigationGroup[]} Navigation groups array
 */
export const getNavigationForRole = (role, position_user, userId) => {
  // Construct a user-like object for role helpers
  const user = role ? { role, position_user } : null;
  
  if (!user) return [];

  // Build change password path with userId
  const changePasswordPath = userId ? `/change-password/${userId}` : '/change-password';

  // ADMIN role navigation
  if (isAdmin(user)) {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        items: [
          {
            id: 'home',
            label: 'Beranda',
            path: '/',
            icon: Home
          }
        ]
      },
      {
        id: 'user-management',
        label: 'Manajemen Pengguna',
        items: [
          {
            id: 'users',
            label: 'Daftar Pengguna',
            path: '/users',
            icon: Users
          },
          {
            id: 'add-user',
            label: 'Tambah Pengguna',
            path: '/add-user',
            icon: UserPlus
          }
        ]
      },
      {
        id: 'master-data',
        label: 'Data Master',
        items: [
          {
            id: 'villages',
            label: 'Desa',
            path: '/villages',
            icon: Map
          },
          {
            id: 'practice-places',
            label: 'Tempat Praktik',
            path: '/practice-places',
            icon: Building
          },
          {
            id: 'pasien',
            label: 'Pasien',
            path: '/pasien',
            icon: User
          }
        ]
      },
      {
        id: 'service-modules',
        label: 'Modul Layanan',
        items: [
          {
            id: 'pemeriksaan-kehamilan',
            label: 'Pemeriksaan Kehamilan',
            path: '/pemeriksaan-kehamilan',
            icon: ClipboardList
          },
          {
            id: 'persalinan',
            label: 'Persalinan',
            path: '/persalinan',
            icon: Heart
          },
          {
            id: 'keluarga-berencana',
            label: 'Keluarga Berencana',
            path: '/keluarga-berencana',
            icon: Shield
          },
          {
            id: 'imunisasi',
            label: 'Imunisasi',
            path: '/imunisasi',
            icon: Activity
          }
        ]
      },
      {
        id: 'verification',
        label: 'Verifikasi',
        items: [
          {
            id: 'pending-data',
            label: 'Data Menunggu',
            path: '/verification/pending',
            icon: Clock
          }
        ]
      },
      {
        id: 'reports',
        label: 'Laporan',
        items: [
          {
            id: 'rekapitulasi',
            label: 'Rekapitulasi',
            path: '/rekapitulasi',
            icon: FileText
          }
        ]
      },
      {
        id: 'settings',
        label: 'Pengaturan',
        items: [
          {
            id: 'change-password',
            label: 'Ubah Password',
            path: changePasswordPath,
            icon: Settings
          }
        ]
      }
    ];
  }

  // Bidan Koordinator navigation
  if (isBidanKoordinator(user)) {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        items: [
          {
            id: 'home',
            label: 'Beranda',
            path: '/',
            icon: Home
          }
        ]
      },
      {
        id: 'service-modules',
        label: 'Modul Layanan',
        items: [
          {
            id: 'pemeriksaan-kehamilan',
            label: 'Pemeriksaan Kehamilan',
            path: '/pemeriksaan-kehamilan',
            icon: ClipboardList
          },
          {
            id: 'persalinan',
            label: 'Persalinan',
            path: '/persalinan',
            icon: Heart
          },
          {
            id: 'keluarga-berencana',
            label: 'Keluarga Berencana',
            path: '/keluarga-berencana',
            icon: Shield
          },
          {
            id: 'imunisasi',
            label: 'Imunisasi',
            path: '/imunisasi',
            icon: Activity
          }
        ]
      },
      {
        id: 'reports',
        label: 'Laporan',
        items: [
          {
            id: 'rekapitulasi',
            label: 'Rekapitulasi',
            path: '/rekapitulasi',
            icon: FileText
          }
        ]
      },
      {
        id: 'settings',
        label: 'Pengaturan',
        items: [
          {
            id: 'change-password',
            label: 'Ubah Password',
            path: changePasswordPath,
            icon: Settings
          }
        ]
      }
    ];
  }

  // Bidan Desa navigation
  if (isBidanDesa(user)) {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        items: [
          {
            id: 'home',
            label: 'Beranda',
            path: '/',
            icon: Home
          }
        ]
      },
      {
        id: 'service-modules',
        label: 'Modul Layanan',
        items: [
          {
            id: 'pemeriksaan-kehamilan',
            label: 'Pemeriksaan Kehamilan',
            path: '/pemeriksaan-kehamilan',
            icon: ClipboardList
          },
          {
            id: 'persalinan',
            label: 'Persalinan',
            path: '/persalinan',
            icon: Heart
          },
          {
            id: 'keluarga-berencana',
            label: 'Keluarga Berencana',
            path: '/keluarga-berencana',
            icon: Shield
          },
          {
            id: 'imunisasi',
            label: 'Imunisasi',
            path: '/imunisasi',
            icon: Activity
          }
        ]
      },
      {
        id: 'verification',
        label: 'Verifikasi',
        items: [
          {
            id: 'pending-data',
            label: 'Data Menunggu',
            path: '/verification/pending',
            icon: Clock
          }
        ]
      },
      {
        id: 'history',
        label: 'Riwayat',
        items: [
          {
            id: 'history',
            label: 'Riwayat Verifikasi',
            path: '/history',
            icon: History
          }
        ]
      },
      {
        id: 'settings',
        label: 'Pengaturan',
        items: [
          {
            id: 'change-password',
            label: 'Ubah Password',
            path: changePasswordPath,
            icon: Settings
          }
        ]
      }
    ];
  }

  // Bidan Praktik navigation
  if (isBidanPraktik(user)) {
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        items: [
          {
            id: 'home',
            label: 'Beranda',
            path: '/',
            icon: Home
          }
        ]
      },
      {
        id: 'service-modules',
        label: 'Modul Layanan',
        items: [
          {
            id: 'pemeriksaan-kehamilan',
            label: 'Pemeriksaan Kehamilan',
            path: '/pemeriksaan-kehamilan',
            icon: ClipboardList
          },
          {
            id: 'persalinan',
            label: 'Persalinan',
            path: '/persalinan',
            icon: Heart
          },
          {
            id: 'keluarga-berencana',
            label: 'Keluarga Berencana',
            path: '/keluarga-berencana',
            icon: Shield
          },
          {
            id: 'imunisasi',
            label: 'Imunisasi',
            path: '/imunisasi',
            icon: Activity
          }
        ]
      },
      {
        id: 'revision',
        label: 'Revisi',
        items: [
          {
            id: 'rejected-data',
            label: 'Data Ditolak',
            path: '/revision/rejected',
            icon: AlertCircle
          }
        ]
      },
      {
        id: 'settings',
        label: 'Pengaturan',
        items: [
          {
            id: 'change-password',
            label: 'Ubah Password',
            path: changePasswordPath,
            icon: Settings
          }
        ]
      }
    ];
  }

  // Default: empty navigation if role/position not recognized
  return [];
};
