/**
 * Tests for Navigation Configuration
 * 
 * Validates that navigation configuration returns correct structure for each role
 */

import { describe, it, expect } from 'vitest';
import { getNavigationForRole } from './navigationConfig';
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
  History,
  Settings
} from 'lucide-react';

describe('getNavigationForRole', () => {
  it('should return empty array when role is null', () => {
    const navigation = getNavigationForRole(null, null);
    expect(navigation).toEqual([]);
  });

  it('should return empty array when role is undefined', () => {
    const navigation = getNavigationForRole(undefined, undefined);
    expect(navigation).toEqual([]);
  });

  describe('ADMIN role', () => {
    it('should return navigation config for ADMIN role', () => {
      const navigation = getNavigationForRole('ADMIN', null);
      
      expect(navigation).toBeDefined();
      expect(Array.isArray(navigation)).toBe(true);
      expect(navigation.length).toBeGreaterThan(0);
    });

    it('should include Dashboard group', () => {
      const navigation = getNavigationForRole('ADMIN', null);
      const dashboardGroup = navigation.find(g => g.id === 'dashboard');
      
      expect(dashboardGroup).toBeDefined();
      expect(dashboardGroup.label).toBe('Dashboard');
      expect(dashboardGroup.items).toHaveLength(1);
      expect(dashboardGroup.items[0].path).toBe('/');
      expect(dashboardGroup.items[0].icon).toBe(Home);
    });

    it('should include User Management group', () => {
      const navigation = getNavigationForRole('ADMIN', null);
      const userManagementGroup = navigation.find(g => g.id === 'user-management');
      
      expect(userManagementGroup).toBeDefined();
      expect(userManagementGroup.label).toBe('Manajemen Pengguna');
      expect(userManagementGroup.items).toHaveLength(2);
      expect(userManagementGroup.items[0].path).toBe('/users');
      expect(userManagementGroup.items[0].icon).toBe(Users);
      expect(userManagementGroup.items[1].path).toBe('/add-user');
      expect(userManagementGroup.items[1].icon).toBe(UserPlus);
    });

    it('should include Master Data group with 3 items', () => {
      const navigation = getNavigationForRole('ADMIN', null);
      const masterDataGroup = navigation.find(g => g.id === 'master-data');
      
      expect(masterDataGroup).toBeDefined();
      expect(masterDataGroup.label).toBe('Data Master');
      expect(masterDataGroup.items).toHaveLength(3);
      expect(masterDataGroup.items[0].path).toBe('/villages');
      expect(masterDataGroup.items[0].icon).toBe(Map);
      expect(masterDataGroup.items[1].path).toBe('/practice-places');
      expect(masterDataGroup.items[1].icon).toBe(Building);
      expect(masterDataGroup.items[2].path).toBe('/pasien');
      expect(masterDataGroup.items[2].icon).toBe(User);
    });

    it('should include Service Modules group with 4 items', () => {
      const navigation = getNavigationForRole('ADMIN', null);
      const serviceModulesGroup = navigation.find(g => g.id === 'service-modules');
      
      expect(serviceModulesGroup).toBeDefined();
      expect(serviceModulesGroup.label).toBe('Modul Layanan');
      expect(serviceModulesGroup.items).toHaveLength(4);
      expect(serviceModulesGroup.items[0].path).toBe('/pemeriksaan-kehamilan');
      expect(serviceModulesGroup.items[0].icon).toBe(ClipboardList);
      expect(serviceModulesGroup.items[1].path).toBe('/persalinan');
      expect(serviceModulesGroup.items[1].icon).toBe(Heart);
      expect(serviceModulesGroup.items[2].path).toBe('/keluarga-berencana');
      expect(serviceModulesGroup.items[2].icon).toBe(Shield);
      expect(serviceModulesGroup.items[3].path).toBe('/imunisasi');
      expect(serviceModulesGroup.items[3].icon).toBe(Activity);
    });

    it('should include Verification group', () => {
      const navigation = getNavigationForRole('ADMIN', null);
      const verificationGroup = navigation.find(g => g.id === 'verification');
      
      expect(verificationGroup).toBeDefined();
      expect(verificationGroup.label).toBe('Verifikasi');
      expect(verificationGroup.items).toHaveLength(1);
      expect(verificationGroup.items[0].path).toBe('/pending-data');
      expect(verificationGroup.items[0].icon).toBe(Clock);
    });

    it('should include Reports group', () => {
      const navigation = getNavigationForRole('ADMIN', null);
      const reportsGroup = navigation.find(g => g.id === 'reports');
      
      expect(reportsGroup).toBeDefined();
      expect(reportsGroup.label).toBe('Laporan');
      expect(reportsGroup.items).toHaveLength(1);
      expect(reportsGroup.items[0].path).toBe('/rekapitulasi');
      expect(reportsGroup.items[0].icon).toBe(FileText);
    });

    it('should include Settings group', () => {
      const navigation = getNavigationForRole('ADMIN', null);
      const settingsGroup = navigation.find(g => g.id === 'settings');
      
      expect(settingsGroup).toBeDefined();
      expect(settingsGroup.label).toBe('Pengaturan');
      expect(settingsGroup.items).toHaveLength(1);
      expect(settingsGroup.items[0].path).toBe('/change-password');
      expect(settingsGroup.items[0].icon).toBe(Settings);
    });
  });

  describe('Bidan Koordinator', () => {
    it('should return navigation config for Bidan Koordinator', () => {
      const navigation = getNavigationForRole('USER', 'bidan_koordinator');
      
      expect(navigation).toBeDefined();
      expect(Array.isArray(navigation)).toBe(true);
      expect(navigation.length).toBeGreaterThan(0);
    });

    it('should include Dashboard, Service Modules, Reports, and Settings groups', () => {
      const navigation = getNavigationForRole('USER', 'bidan_koordinator');
      
      expect(navigation.find(g => g.id === 'dashboard')).toBeDefined();
      expect(navigation.find(g => g.id === 'service-modules')).toBeDefined();
      expect(navigation.find(g => g.id === 'reports')).toBeDefined();
      expect(navigation.find(g => g.id === 'settings')).toBeDefined();
    });

    it('should NOT include User Management or Master Data groups', () => {
      const navigation = getNavigationForRole('USER', 'bidan_koordinator');
      
      expect(navigation.find(g => g.id === 'user-management')).toBeUndefined();
      expect(navigation.find(g => g.id === 'master-data')).toBeUndefined();
    });
  });

  describe('Bidan Desa', () => {
    it('should return navigation config for Bidan Desa', () => {
      const navigation = getNavigationForRole('USER', 'bidan_desa');
      
      expect(navigation).toBeDefined();
      expect(Array.isArray(navigation)).toBe(true);
      expect(navigation.length).toBeGreaterThan(0);
    });

    it('should include Dashboard, Service Modules, Verification, History, and Settings groups', () => {
      const navigation = getNavigationForRole('USER', 'bidan_desa');
      
      expect(navigation.find(g => g.id === 'dashboard')).toBeDefined();
      expect(navigation.find(g => g.id === 'service-modules')).toBeDefined();
      expect(navigation.find(g => g.id === 'verification')).toBeDefined();
      expect(navigation.find(g => g.id === 'history')).toBeDefined();
      expect(navigation.find(g => g.id === 'settings')).toBeDefined();
    });

    it('should include History group with correct icon', () => {
      const navigation = getNavigationForRole('USER', 'bidan_desa');
      const historyGroup = navigation.find(g => g.id === 'history');
      
      expect(historyGroup).toBeDefined();
      expect(historyGroup.label).toBe('Riwayat');
      expect(historyGroup.items).toHaveLength(1);
      expect(historyGroup.items[0].path).toBe('/history');
      expect(historyGroup.items[0].icon).toBe(History);
    });

    it('should NOT include Reports group', () => {
      const navigation = getNavigationForRole('USER', 'bidan_desa');
      
      expect(navigation.find(g => g.id === 'reports')).toBeUndefined();
    });
  });

  describe('Bidan Praktik', () => {
    it('should return navigation config for Bidan Praktik', () => {
      const navigation = getNavigationForRole('USER', 'bidan_praktik');
      
      expect(navigation).toBeDefined();
      expect(Array.isArray(navigation)).toBe(true);
      expect(navigation.length).toBeGreaterThan(0);
    });

    it('should include Dashboard, Service Modules, Revision, and Settings groups', () => {
      const navigation = getNavigationForRole('USER', 'bidan_praktik');
      
      expect(navigation.find(g => g.id === 'dashboard')).toBeDefined();
      expect(navigation.find(g => g.id === 'service-modules')).toBeDefined();
      expect(navigation.find(g => g.id === 'revision')).toBeDefined();
      expect(navigation.find(g => g.id === 'settings')).toBeDefined();
    });

    it('should include Revision group with correct icon', () => {
      const navigation = getNavigationForRole('USER', 'bidan_praktik');
      const revisionGroup = navigation.find(g => g.id === 'revision');
      
      expect(revisionGroup).toBeDefined();
      expect(revisionGroup.label).toBe('Revisi');
      expect(revisionGroup.items).toHaveLength(1);
      expect(revisionGroup.items[0].path).toBe('/rejected-data');
      expect(revisionGroup.items[0].icon).toBe(AlertCircle);
    });

    it('should NOT include Verification or Reports groups', () => {
      const navigation = getNavigationForRole('USER', 'bidan_praktik');
      
      expect(navigation.find(g => g.id === 'verification')).toBeUndefined();
      expect(navigation.find(g => g.id === 'reports')).toBeUndefined();
    });
  });

  describe('All Roles', () => {
    it('should have consistent structure for navigation groups', () => {
      const roles = [
        ['ADMIN', null],
        ['USER', 'bidan_koordinator'],
        ['USER', 'bidan_desa'],
        ['USER', 'bidan_praktik']
      ];

      roles.forEach(([role, position]) => {
        const navigation = getNavigationForRole(role, position);
        
        navigation.forEach(group => {
          expect(group).toHaveProperty('id');
          expect(group).toHaveProperty('label');
          expect(group).toHaveProperty('items');
          expect(Array.isArray(group.items)).toBe(true);
          
          group.items.forEach(item => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('label');
            expect(item).toHaveProperty('path');
            expect(item).toHaveProperty('icon');
            // Icon can be either a function or an object (React component)
            expect(['function', 'object']).toContain(typeof item.icon);
          });
        });
      });
    });

    it('should include Service Modules group with 4 items for all roles', () => {
      const roles = [
        ['ADMIN', null],
        ['USER', 'bidan_koordinator'],
        ['USER', 'bidan_desa'],
        ['USER', 'bidan_praktik']
      ];

      roles.forEach(([role, position]) => {
        const navigation = getNavigationForRole(role, position);
        const serviceModulesGroup = navigation.find(g => g.id === 'service-modules');
        
        expect(serviceModulesGroup).toBeDefined();
        expect(serviceModulesGroup.items).toHaveLength(4);
      });
    });
  });
});
