import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PersalinanList from './PersalinanList';

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
  getPersalinanList: vi.fn(),
  deletePersalinan: vi.fn(),
}));

import { getPersalinanList } from '../../services/api';

describe('PersalinanList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the light table wrapper and row styling', async () => {
    getPersalinanList.mockResolvedValue({
      data: [
        {
          id: 'persalinan-1',
          tanggal_partus: '2026-06-09T00:00:00.000Z',
          gravida: 2,
          para: 1,
          abortus: 0,
          status_verifikasi: 'APPROVED',
          pasien: { nama: 'ROSSA' },
          keadaan_bayi_persalinan: {
            jenis_kelamin: 'PEREMPUAN',
            bb: 3200,
            pb: 49,
          },
          keadaan_ibu_persalinan: {
            baik: true,
            hidup: true,
          },
        },
      ],
    });

    const { container } = render(<PersalinanList />);

    expect(await screen.findByText('ROSSA')).toBeInTheDocument();
    expect(container.querySelector('.persalinan-list__condition-badge--stable')).toBeInTheDocument();
    expect(container.querySelector('.status-badge--approved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Detail' })).toBeInTheDocument();
    expect(container.querySelector('.persalinan-list-table')).toBeInTheDocument();
  });
});
