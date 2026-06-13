import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DashboardAdmin from './DashboardAdmin';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/api', () => ({
  getUsers: vi.fn(),
  getVillages: vi.fn(),
  getPracticePlaces: vi.fn(),
}));

import { getPracticePlaces, getUsers, getVillages } from '../../services/api';

describe('DashboardAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getUsers.mockResolvedValue({
      data: [
        { user_id: 'user-1', status_user: 'ACTIVE' },
        { user_id: 'user-2', status_user: 'INACTIVE' },
      ],
    });
    getVillages.mockResolvedValue({
      data: [{ village_id: 'village-1' }],
    });
    getPracticePlaces.mockResolvedValue({
      data: [{ practice_id: 'practice-1' }],
    });
  });

  it('renders the admin quick actions after loading stats', async () => {
    render(<DashboardAdmin />);

    expect(await screen.findByText('Aksi Cepat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tambah User' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kelola Desa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kelola Tempat Praktik' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Daftar User' })).toBeInTheDocument();
  });

  it('navigates each admin quick action to the active route', async () => {
    render(<DashboardAdmin />);

    const buttonRoutePairs = [
      ['Tambah User', '/add-user'],
      ['Kelola Desa', '/villages'],
      ['Kelola Tempat Praktik', '/practice-places'],
      ['Daftar User', '/users'],
    ];

    await screen.findByText('Aksi Cepat');

    for (const [label, path] of buttonRoutePairs) {
      fireEvent.click(screen.getByRole('button', { name: label }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(path);
      });
    }
  });
});
