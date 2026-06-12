import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImunisasiList from './ImunisasiList';

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
  getImunisasiList: vi.fn(),
  deleteImunisasi: vi.fn(),
}));

import { getImunisasiList } from '../../services/api';

describe('ImunisasiList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the light table wrapper and row styling', async () => {
    getImunisasiList.mockResolvedValue({
      data: [
        {
          id: 'imunisasi-1',
          tgl_imunisasi: '2026-06-09T00:00:00.000Z',
          jenis_imunisasi: 'BCG',
          berat_badan: 4.2,
          suhu_badan: 36.5,
          nama_orangtua: 'SARI',
          status_verifikasi: 'APPROVED',
          pasien: { nama: 'BAYI ROSSA' },
        },
      ],
    });

    const { container } = render(<ImunisasiList />);

    expect(await screen.findByText('BAYI ROSSA')).toBeInTheDocument();
    expect(container.querySelector('.status-badge--approved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Detail' })).toBeInTheDocument();
    expect(container.querySelector('.imunisasi-list-table')).toBeInTheDocument();
  });
});
