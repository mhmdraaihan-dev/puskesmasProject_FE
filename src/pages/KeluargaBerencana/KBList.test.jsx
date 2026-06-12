import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import KBList from './KBList';

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
  getKBList: vi.fn(),
  deleteKB: vi.fn(),
}));

import { getKBList } from '../../services/api';

describe('KBList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the light table wrapper and row styling', async () => {
    getKBList.mockResolvedValue({
      data: [
        {
          id: 'kb-1',
          tanggal_kunjungan: '2026-06-09T00:00:00.000Z',
          alat_kontrasepsi: 'IUD',
          jumlah_anak_laki: 1,
          jumlah_anak_perempuan: 2,
          at: true,
          status_verifikasi: 'APPROVED',
          pasien: { nama: 'ROSSA' },
        },
      ],
    });

    const { container } = render(<KBList />);

    expect(await screen.findByText('ROSSA')).toBeInTheDocument();
    expect(container.querySelector('.kb-list__risk-badge--alert')).toBeInTheDocument();
    expect(container.querySelector('.status-badge--approved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Detail' })).toBeInTheDocument();
    expect(container.querySelector('.kb-list-table')).toBeInTheDocument();
  });
});
