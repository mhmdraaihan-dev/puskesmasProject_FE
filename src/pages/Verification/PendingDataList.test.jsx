import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PendingDataList from './PendingDataList';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      role: 'USER',
      position_user: 'bidan_desa',
    },
  }),
}));

vi.mock('../../services/api', () => ({
  getKehamilanList: vi.fn(),
  getPersalinanList: vi.fn(),
  getKBList: vi.fn(),
  getImunisasiList: vi.fn(),
  verifyKehamilan: vi.fn(),
  verifyPersalinan: vi.fn(),
  verifyKB: vi.fn(),
  verifyImunisasi: vi.fn(),
}));

import {
  getImunisasiList,
  getKBList,
  getKehamilanList,
  getPersalinanList,
} from '../../services/api';

describe('PendingDataList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the refreshed verification table styling', async () => {
    getKehamilanList.mockResolvedValue({
      data: [
        {
          id: 'kehamilan-1',
          tanggal: '2026-06-09T00:00:00.000Z',
          pasien: { nama: 'ROSSA', nik: '3205' },
          creator: { full_name: 'Bidan Rina' },
          practice_place: { village: { nama_desa: 'Lebak' } },
        },
      ],
    });
    getPersalinanList.mockResolvedValue({ data: [] });
    getKBList.mockResolvedValue({ data: [] });
    getImunisasiList.mockResolvedValue({ data: [] });

    const { container } = render(<PendingDataList />);

    expect(await screen.findByText('ROSSA')).toBeInTheDocument();
    expect(screen.getAllByText('Pemeriksaan Kehamilan')).toHaveLength(2);
    expect(container.querySelector('.pending-badge')).toBeInTheDocument();
    expect(container.querySelector('.pending-data-list__table-card')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Detail' })).toBeInTheDocument();
  });
});
