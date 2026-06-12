import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DashboardKoordinator from './DashboardKoordinator';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/api', () => ({
  getDashboardApprovedFeed: vi.fn(),
}));

import { getDashboardApprovedFeed } from '../../services/api';

describe('DashboardKoordinator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders refreshed quick actions and approved table surfaces', async () => {
    getDashboardApprovedFeed.mockResolvedValue({
      data: [
        {
          id: 'fa1906bd-e9ea-431e-97b4-aea30751c6ed',
          module: 'pemeriksaan_kehamilan',
          pasien_nama: 'ROSSA',
          village_name: 'Lebak',
          practice_name: 'SEJAHTERA',
          tanggal: '2026-06-09T00:00:00.000Z',
        },
      ],
      summary: {
        kehamilan: 1,
        persalinan: 0,
        kb: 0,
        imunisasi: 0,
        total: 1,
      },
    });

    const { container } = render(<DashboardKoordinator />);

    expect(await screen.findByText('Data Approved Terbaru')).toBeInTheDocument();
    expect(await screen.findByText('ROSSA')).toBeInTheDocument();
    expect(screen.getByText('Aksi Cepat')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-koordinator__feed-section')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-koordinator__table')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-koordinator__actions-section')).toBeInTheDocument();
  });

  it('navigates to the module detail page when an approved row is clicked', async () => {
    getDashboardApprovedFeed.mockResolvedValue({
      data: [
        {
          id: 'fa1906bd-e9ea-431e-97b4-aea30751c6ed',
          module: 'pemeriksaan_kehamilan',
          pasien_nama: 'ROSSA',
          village_name: 'Lebak',
          practice_name: 'SEJAHTERA',
          tanggal: '2026-06-09T00:00:00.000Z',
        },
      ],
      summary: {
        kehamilan: 1,
        total: 1,
      },
    });

    render(<DashboardKoordinator />);

    const patientCell = await screen.findByText('ROSSA');
    fireEvent.click(patientCell.closest('tr'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/pemeriksaan-kehamilan/fa1906bd-e9ea-431e-97b4-aea30751c6ed',
      );
    });
  });
});
