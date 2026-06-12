import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import './Register.css';

/**
 * Register Page
 * 
 * User registration page with design system styling.
 * Wider card with 2-column grid layout for form fields.
 * 
 * @component
 */
const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await registerUser(data);
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo-frame">
              <img
                src="/logo.jpeg"
                alt="Logo Puskesmas Lebakwangi"
                className="register-logo"
              />
            </div>
            <div className="register-eyebrow">Puskesmas Portal</div>
            <h1 className="register-title">Buat Akun</h1>
            <p className="register-subtitle">
              Lengkapi data akun untuk akses ke sistem Puskesmas
            </p>
          </div>

          {error && (
            <div className="register-alert register-alert--error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="register-form">
            <div className="register-form__grid">
              <div className="register-form__field register-form__field--span-2">
                <label htmlFor="full_name" className="register-form__label">
                  Nama Lengkap
                </label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  error={errors.full_name?.message}
                  {...register('full_name', { 
                    required: 'Nama lengkap wajib diisi' 
                  })}
                />
              </div>

              <div className="register-form__field">
                <label htmlFor="email" className="register-form__label">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Format email tidak valid'
                    }
                  })}
                />
              </div>

              <div className="register-form__field">
                <label htmlFor="password" className="register-form__label">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password wajib diisi',
                    minLength: {
                      value: 6,
                      message: 'Password minimal 6 karakter'
                    }
                  })}
                />
              </div>

              <div className="register-form__field">
                <label htmlFor="position_user" className="register-form__label">
                  Posisi
                </label>
                <select
                  id="position_user"
                  className="register-form__select"
                  {...register('position_user', { 
                    required: 'Posisi wajib dipilih' 
                  })}
                >
                  <option value="">Pilih Posisi</option>
                  <option value="bidan_praktik">Bidan Praktik</option>
                  <option value="bidan_desa">Bidan Desa</option>
                  <option value="bidan_koordinator">Bidan Koordinator</option>
                </select>
                {errors.position_user && (
                  <p className="register-form__error">{errors.position_user.message}</p>
                )}
              </div>

              <div className="register-form__field">
                <label htmlFor="phone_number" className="register-form__label">
                  Nomor Telepon
                </label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  error={errors.phone_number?.message}
                  {...register('phone_number')}
                />
              </div>

              <div className="register-form__field register-form__field--span-2">
                <label htmlFor="address" className="register-form__label">
                  Alamat
                </label>
                <textarea
                  id="address"
                  rows="3"
                  className="register-form__textarea"
                  placeholder="Masukkan alamat lengkap"
                  {...register('address', { 
                    required: 'Alamat wajib diisi' 
                  })}
                />
                {errors.address && (
                  <p className="register-form__error">{errors.address.message}</p>
                )}
              </div>
            </div>

            <div className="register-form__actions">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </Button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="register-footer">
            <p className="register-footer__text">
              Sudah punya akun?{' '}
              <Link to="/login" className="register-footer__link">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
