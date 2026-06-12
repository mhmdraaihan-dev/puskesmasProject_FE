import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RejectedDataList from './RejectedDataList';

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
      position_user: 'bidan_praktik',
    },
  }),
}));

vi.mock('../../services/api', () => ({
  getRejectedData: vi.fn(),
}));

import { getRejectedData } from '../../services/api';

describe('RejectedDataList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders refreshed rejected data surfaces', async () => {
    getRejectedData.mockResolvedValue({ data: [] });

    const { container } = render(<RejectedDataList />);

    expect(await screen.findByText('Data Ditolak - Revisi')).toBeInTheDocument();
    expect(container.querySelector('.rejected-data-list__summary-card')).toBeInTheDocument();
    expect(container.querySelector('.rejected-data-list__list-card')).toBeInTheDocument();
    expect(await screen.findByText('Belum ada data yang ditolak')).toBeInTheDocument();
  });
});
