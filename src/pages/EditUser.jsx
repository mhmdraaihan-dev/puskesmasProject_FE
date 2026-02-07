import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { updateUser, getUsers } from '../services/api';
import '../App.css';

const EditUser = () => {
    const { userId } = useParams();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const users = await getUsers();
                const user = users.find(u => u.user_id === userId);

                if (user) {
                    setValue('full_name', user.full_name);
                    setValue('email', user.email);
                    setValue('address', user.address);
                    setValue('phone_number', user.phone_number || '');
                    setValue('position_user', user.position_user || '');
                    setValue('role', user.role);
                } else {
                    setError('User tidak ditemukan');
                }
            } catch (err) {
                setError('Gagal memuat data user');
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [userId, setValue]);

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        // Remove empty fields to support partial update
        const updateData = {};
        Object.keys(data).forEach(key => {
            if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
                updateData[key] = data[key];
            }
        });

        // Handle position_user for ADMIN role
        if (updateData.role === 'ADMIN' && updateData.position_user === '') {
            updateData.position_user = null;
        }

        try {
            await updateUser(userId, updateData);
            alert('User berhasil diupdate!');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengupdate user. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingUser) {
        return (
            <div className="dashboard">
                <p>Loading user data...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>Edit User</h2>
                    <p className="text-muted">Update user information.</p>
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
                                {...register("full_name")}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                {...register("email", {
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.email && <span className="error-message">{errors.email.message}</span>}
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
                                {...register("address")}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="position_user">Position</label>
                            <select
                                id="position_user"
                                className="form-input"
                                {...register("position_user")}
                            >
                                <option value="">None (for ADMIN)</option>
                                <option value="bidan_praktik">Bidan Praktik</option>
                                <option value="bidan_desa">Bidan Desa</option>
                                <option value="bidan_koordinator">Bidan Koordinator</option>
                            </select>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                * Position is required for USER role
                            </small>
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
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Updating User...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
