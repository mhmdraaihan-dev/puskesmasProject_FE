import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../App.css';

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
        <div className="auth-container">
            <div className="auth-shell">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-eyebrow">Puskesmas Portal</div>
                        <h2 className="auth-title">Sign in</h2>
                        <p className="auth-subtitle">
                            Masuk ke dashboard untuk mengelola data pelayanan, user, dan verifikasi laporan.
                        </p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}

                    {notice && (
                        <div className="info-alert">
                            {notice}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                {...register("email", { required: "Email is required" })}
                            />
                            {errors.email && <span className="error-message">{errors.email.message}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                {...register("password", { required: "Password is required" })}
                            />
                            {errors.password && <span className="error-message">{errors.password.message}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-muted">
                                Don't have an account?{' '}
                                <Link to="/register" className="link">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
