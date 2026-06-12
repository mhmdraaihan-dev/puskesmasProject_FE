import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import './Login.css';

/**
 * Login Page
 * 
 * Authentication page with design system styling.
 * Centered form card on cream canvas background.
 * 
 * @component
 */
const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const notice = location.state?.sessionMessage || '';

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    const result = await login(data);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-shell">
          <section className="login-showcase">
            <div className="login-showcase__badge">Portal Internal Puskesmas</div>
            <div className="login-showcase__brand">
              <div className="login-showcase__logo-wrap">
                <img
                  src="/logo.jpeg"
                  alt="Logo Puskesmas Lebakwangi"
                  className="login-showcase__logo"
                />
              </div>
              <div className="login-showcase__brand-copy">
                <span className="login-showcase__brand-label">Puskesmas Lebakwangi</span>
                <p>Sistem layanan dan verifikasi kesehatan daerah yang lebih rapi, cepat, dan terhubung.</p>
              </div>
            </div>
            <h1 className="login-showcase__title">
              Kelola pelayanan ibu, anak, dan verifikasi desa dalam satu ruang kerja.
            </h1>
            <p className="login-showcase__text">
              Antarmuka ini membantu admin, bidan praktik, bidan desa, dan bidan koordinator
              bekerja dengan alur yang lebih rapi dan cepat.
            </p>

            <div className="login-showcase__grid">
              <div className="login-showcase__card">
                <span className="login-showcase__label">Alur Utama</span>
                <strong>Pelayanan, verifikasi, histori</strong>
              </div>
              <div className="login-showcase__card">
                <span className="login-showcase__label">Akses Cepat</span>
                <strong>Role-based dashboard</strong>
              </div>
              <div className="login-showcase__card">
                <span className="login-showcase__label">Fokus</span>
                <strong>Data desa dan praktik tetap sinkron</strong>
              </div>
            </div>
          </section>

          <div className="login-card">
            <div className="login-header">
              <div className="login-logo-frame">
                <img
                  src="/logo.jpeg"
                  alt="Logo Puskesmas Lebakwangi"
                  className="login-logo"
                />
              </div>
              <div className="login-eyebrow">Puskesmas Portal</div>
              <h1 className="login-title">Masuk</h1>
              <p className="login-subtitle">
                Masuk ke dashboard untuk mengelola data pelayanan, user, dan verifikasi laporan.
              </p>
            </div>

            {error && (
              <div className="login-alert login-alert--error">
                {error}
              </div>
            )}

            {notice && (
              <div className="login-alert login-alert--info">
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="login-form__field">
                <label htmlFor="email" className="login-form__label">
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

              <div className="login-form__field">
                <label htmlFor="password" className="login-form__label">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                fullWidth
                className="login-submit"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            <div className="login-footer">
              <p className="login-footer__text">
                Belum punya akun?{' '}
                <Link to="/register" className="login-footer__link">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
