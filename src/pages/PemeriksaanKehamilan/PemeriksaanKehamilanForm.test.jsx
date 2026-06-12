import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PemeriksaanKehamilanForm from './PemeriksaanKehamilanForm';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
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
  createKehamilan: vi.fn(),
  getKehamilanDetail: vi.fn(),
  getPasienList: vi.fn(),
  getPracticePlaces: vi.fn(),
  updateKehamilan: vi.fn(),
}));

import { getPasienList, getPracticePlaces } from '../../services/api';

describe('PemeriksaanKehamilanForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPasienList.mockResolvedValue({ data: [] });
    getPracticePlaces.mockResolvedValue({ data: [] });
  });

  it('renders refreshed light section cards', async () => {
    const { container } = render(<PemeriksaanKehamilanForm />);

    expect(screen.getByText('Input Pemeriksaan Kehamilan')).toBeInTheDocument();
    expect(await screen.findByText('Informasi Pasien')).toBeInTheDocument();
    expect(container.querySelector('.pemeriksaan-kehamilan-form__section-card')).toBeInTheDocument();
  });
});
