import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import '../App.css';

const AddUser = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);
        try {
            await registerUser(data);
            alert('User created successfully!');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>Add New User</h2>
                    <p className="text-muted">Create a new user account.</p>
                </div>
                <div>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Cancel
                    </button>
                </div>
            </div>

            <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="user-grid">
                    {/* Left Column */}
                    <div>
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
                            <label className="form-label" htmlFor="phone_number">Phone Number</label>
                            <input
                                id="phone_number"
                                className="form-input"
                                {...register("phone_number")}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="address">Address</label>
                            <textarea
                                id="address"
                                className="form-input"
                                style={{ height: '120px', resize: 'none' }}
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
                            <label className="form-label" htmlFor="role">Role</label>
                            <select
                                id="role"
                                className="form-input"
                                {...register("role")}
                            >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="status_user">Status</label>
                            <select
                                id="status_user"
                                className="form-input"
                                {...register("status_user")}
                            >
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="ACTIVE">ACTIVE</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Creating User...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUser;
