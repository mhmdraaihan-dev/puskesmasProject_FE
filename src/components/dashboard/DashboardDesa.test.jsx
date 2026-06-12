import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DashboardDesa from './DashboardDesa';
import { getDashboardPendingTasks, getDashboardHistory } from '../../services/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/api', () => ({
  getDashboardPendingTasks: vi.fn(),
  getDashboardHistory: vi.fn(),
}));

describe('DashboardDesa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders verification history values from the full row object', async () => {
    getDashboardPendingTasks.mockResolvedValue({
      data: [],
      summary: { total: 0 },
    });

    getDashboardHistory.mockResolvedValue({
      data: [
        {
          id: 'fa1906bd-e9ea-431e-97b4-aea30751c6ed',
          module: 'pemeriksaan_kehamilan',
          pasien_nama: 'ROSSA',
          practice_name: 'SEJAHTERA',
          status_verifikasi: 'APPROVED',
          tanggal: '2026-06-09T00:00:00.000Z',
          tanggal_verifikasi: '2026-06-10T00:00:00.000Z',
        },
      ],
      summary: { total: 1 },
    });

    render(<DashboardDesa />);

    expect(await screen.findByText('ROSSA')).toBeInTheDocument();
    expect(screen.getByText('Kehamilan')).toBeInTheDocument();
    expect(screen.getByText('SEJAHTERA')).toBeInTheDocument();
    expect(screen.getByText('Disetujui')).toBeInTheDocument();
    expect(screen.getByText('9 Jun 2026')).toBeInTheDocument();
    expect(screen.getByText('10 Jun 2026')).toBeInTheDocument();
  });

  it('navigates to the module detail page when a history row is clicked', async () => {
    getDashboardPendingTasks.mockResolvedValue({
      data: [],
      summary: { total: 0 },
    });

    getDashboardHistory.mockResolvedValue({
      data: [
        {
          id: 'fa1906bd-e9ea-431e-97b4-aea30751c6ed',
          module: 'pemeriksaan_kehamilan',
          pasien_nama: 'ROSSA',
          practice_name: 'SEJAHTERA',
          status_verifikasi: 'APPROVED',
          tanggal: '2026-06-09T00:00:00.000Z',
          tanggal_verifikasi: '2026-06-10T00:00:00.000Z',
        },
      ],
      summary: { total: 1 },
    });

    render(<DashboardDesa />);

    const patientCell = await screen.findByText('ROSSA');
    fireEvent.click(patientCell.closest('tr'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/pemeriksaan-kehamilan/fa1906bd-e9ea-431e-97b4-aea30751c6ed',
      );
    });
  });

  it('opens verification history from the quick action button', async () => {
    getDashboardPendingTasks.mockResolvedValue({
      data: [],
      summary: { total: 0 },
    });

    getDashboardHistory.mockResolvedValue({
      data: [],
      summary: { total: 0 },
    });

    render(<DashboardDesa />);

    const historyButton = await screen.findByRole('button', { name: /lihat histori/i });
    fireEvent.click(historyButton);

    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });
});
