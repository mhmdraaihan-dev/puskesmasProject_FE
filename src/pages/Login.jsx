import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
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
      <div className="login-container login-container--compact">
        <div className="login-shell login-shell--single">
          <div className="login-card login-card--compact">
            <div className="login-header">
              <div className="login-logo-frame">
                <img
                  src="/logo.jpeg"
                  alt="Logo Puskesmas Lebakwangi"
                  className="login-logo"
                />
              </div>
              <h1 className="login-title">Masuk</h1>
              <p className="login-subtitle">
                Gunakan akun Anda untuk mengakses portal internal Puskesmas.
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
