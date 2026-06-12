import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PemeriksaanKehamilanList from './PemeriksaanKehamilanList';

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
  deleteKehamilan: vi.fn(),
}));

import { getKehamilanList } from '../../services/api';

describe('PemeriksaanKehamilanList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the light table wrapper and row actions', async () => {
    getKehamilanList.mockResolvedValue({
      data: [
        {
          id: 'kehamilan-1',
          tanggal: '2026-06-09T00:00:00.000Z',
          umur_kehamilan: 2,
          td: '80/70',
          resti: 'SEDANG',
          status_verifikasi: 'APPROVED',
          pasien: { nama: 'ROSSA' },
        },
      ],
    });

    const { container } = render(<PemeriksaanKehamilanList />);

    expect(await screen.findByText('ROSSA')).toBeInTheDocument();
    expect(container.querySelector('.kehamilan-list__risk-badge--sedang')).toBeInTheDocument();
    expect(container.querySelector('.status-badge--approved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Detail' })).toBeInTheDocument();
    expect(container.querySelector('.kehamilan-list-table')).toBeInTheDocument();
  });
});
