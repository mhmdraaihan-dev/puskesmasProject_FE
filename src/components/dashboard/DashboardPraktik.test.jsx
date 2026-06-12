import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPraktik from './DashboardPraktik';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/api', () => ({
  getPasienList: vi.fn(),
  getKehamilanList: vi.fn(),
  getPersalinanList: vi.fn(),
  getKBList: vi.fn(),
  getImunisasiList: vi.fn(),
}));

import {
  getPasienList,
  getKehamilanList,
  getPersalinanList,
  getKBList,
  getImunisasiList,
} from '../../services/api';

describe('DashboardPraktik', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders refreshed recent submissions surfaces', async () => {
    getPasienList.mockResolvedValue({ data: [{ id: 'pasien-1' }] });
    getKehamilanList.mockResolvedValue({
      data: [
        {
          id: 'kehamilan-1',
          tanggal: '2026-06-09T00:00:00.000Z',
          status_verifikasi: 'APPROVED',
          pasien: { nama: 'ROSSA' },
        },
      ],
    });
    getPersalinanList.mockResolvedValue({ data: [] });
    getKBList.mockResolvedValue({ data: [] });
    getImunisasiList.mockResolvedValue({ data: [] });

    const { container } = render(<DashboardPraktik />);

    expect(await screen.findByText('Submisi Terbaru')).toBeInTheDocument();
    expect(await screen.findByText('ROSSA')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-praktik__recent-section')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-praktik__table--recent')).toBeInTheDocument();
    expect(container.querySelector('.status-badge--approved')).toBeInTheDocument();
  });
});
