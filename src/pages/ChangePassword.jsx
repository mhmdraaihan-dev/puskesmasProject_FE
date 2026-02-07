import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { changePassword } from '../services/api';
import '../App.css';

const ChangePassword = () => {
    const { userId } = useParams();
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const newPassword = watch('new_password');

    const onSubmit = async (data) => {
        setError('');

        // Validate password length
        if (data.new_password.length < 6) {
            setError('Password baru minimal 6 karakter');
            return;
        }

        // Validate password confirmation
        if (data.new_password !== data.confirm_password) {
            setError('Konfirmasi password tidak cocok');
            return;
        }

        setLoading(true);
        try {
            await changePassword(userId, data.old_password, data.new_password);
            alert('Password berhasil diubah!');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>Change Password</h2>
                    <p className="text-muted">Update your account password.</p>
                </div>
                <div>
                    <button onClick={() => navigate('/')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Cancel
                    </button>
                </div>
            </div>

            <div className="auth-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="old_password">Current Password</label>
                        <input
                            id="old_password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your current password"
                            {...register("old_password", { required: "Current password is required" })}
                        />
                        {errors.old_password && <span className="error-message">{errors.old_password.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="new_password">New Password</label>
                        <input
                            id="new_password"
                            type="password"
                            className="form-input"
                            placeholder="Enter new password (min. 6 characters)"
                            {...register("new_password", {
                                required: "New password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters"
                                }
                            })}
                        />
                        {errors.new_password && <span className="error-message">{errors.new_password.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="confirm_password">Confirm New Password</label>
                        <input
                            id="confirm_password"
                            type="password"
                            className="form-input"
                            placeholder="Re-enter new password"
                            {...register("confirm_password", {
                                required: "Please confirm your password",
                                validate: value => value === newPassword || "Passwords do not match"
                            })}
                        />
                        {errors.confirm_password && <span className="error-message">{errors.confirm_password.message}</span>}
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </div>

                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>
                            <strong>🔒 Password Requirements:</strong>
                        </p>
                        <ul style={{ fontSize: '0.875rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            <li>Minimum 6 characters</li>
                            <li>Must match confirmation</li>
                            <li>Current password required for verification</li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
