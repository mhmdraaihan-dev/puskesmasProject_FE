import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModuleHistoryPage from './ModuleHistoryPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/history/kehamilan', search: '' }),
    useParams: () => ({ moduleKey: 'kehamilan' }),
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
}));

import { getKehamilanList } from '../../services/api';

describe('ModuleHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the refreshed light history surfaces', async () => {
    getKehamilanList.mockResolvedValue({
      data: [
        {
          id: 'kehamilan-1',
          tanggal: '2026-06-09T00:00:00.000Z',
          jenis_kunjungan: 'K1',
          umur_kehamilan: 2,
          status_verifikasi: 'APPROVED',
          pasien: { nama: 'ROSSA', nik: '3205' },
          practice_place: { nama_praktik: 'SEJAHTERA' },
        },
      ],
    });

    const { container } = render(<ModuleHistoryPage />);

    expect(await screen.findByText('Riwayat Kehamilan')).toBeInTheDocument();
    expect(await screen.findByText('ROSSA')).toBeInTheDocument();
    expect(container.querySelector('.module-history-card')).toBeInTheDocument();
    expect(container.querySelector('.module-history-filter-card')).toBeInTheDocument();
    expect(container.querySelector('.module-history-table-shell')).toBeInTheDocument();
    expect(container.querySelector('.status-badge--approved')).toBeInTheDocument();
  });
});
