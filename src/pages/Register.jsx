import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import '../App.css';

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
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <h2>Create Account</h2>

                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="full_name">Full Name</label>
                        <input
                            id="full_name"
                            className="form-input"
                            {...register("full_name", { required: "Full Name is required" })}
                        />
                        {errors.full_name && <span className="error-message">{errors.full_name.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                        />
                        {errors.email && <span className="error-message">{errors.email.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                        />
                        {errors.password && <span className="error-message">{errors.password.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            className="form-input"
                            {...register("address", { required: "Address is required" })}
                        />
                        {errors.address && <span className="error-message">{errors.address.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="position_user">Position</label>
                        <select
                            id="position_user"
                            className="form-input"
                            {...register("position_user", { required: "Position is required" })}
                        >
                            <option value="">Select Position</option>
                            <option value="bidan_praktik">Bidan Praktik</option>
                            <option value="bidan_desa">Bidan Desa</option>
                            <option value="bidan_koordinator">Bidan Koordinator</option>
                        </select>
                        {errors.position_user && <span className="error-message">{errors.position_user.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="phone_number">Phone Number</label>
                        <input
                            id="phone_number"
                            className="form-input"
                            {...register("phone_number")}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="link">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
