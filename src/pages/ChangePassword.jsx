import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { changePassword } from '../services/api';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import '../styles/design-system.css';
import './ChangePassword.css';

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
        <div className="change-password-page">
            <PageHeader
                heading="Ubah Kata Sandi"
                subtitle="Perbarui kata sandi akun Anda dengan aman dan pastikan konfirmasi sesuai."
                actions={
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        Batal
                    </Button>
                }
            />

            <div className="password-form-container">
                <Card
                    variant="surface-card"
                    padding="xl"
                    className="change-password-card"
                >
                    {error && (
                        <div className="error-alert change-password-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="change-password-form">
                        <div className="change-password-form__header">
                            <h3 className="change-password-form__title">Form Kata Sandi</h3>
                            <p className="change-password-form__subtitle">
                                Masukkan password lama untuk verifikasi, lalu buat password baru
                                yang mudah Anda ingat namun tetap aman.
                            </p>
                        </div>

                        <Input
                            label="Password Lama"
                            type="password"
                            required
                            placeholder="Masukkan password lama"
                            error={errors.old_password?.message}
                            {...register("old_password", { required: "Password lama wajib diisi" })}
                        />

                        <Input
                            label="Password Baru"
                            type="password"
                            required
                            placeholder="Minimal 6 karakter"
                            error={errors.new_password?.message}
                            {...register("new_password", {
                                required: "Password baru wajib diisi",
                                minLength: {
                                    value: 6,
                                    message: "Password minimal 6 karakter"
                                }
                            })}
                        />

                        <Input
                            label="Konfirmasi Password Baru"
                            type="password"
                            required
                            placeholder="Ulangi password baru"
                            error={errors.confirm_password?.message}
                            {...register("confirm_password", {
                                required: "Konfirmasi password wajib diisi",
                                validate: value => value === newPassword || "Password tidak cocok"
                            })}
                        />

                        <div className="info-box change-password-info-box">
                            <p className="info-title">🔒 Ketentuan Password</p>
                            <ul className="info-list">
                                <li>Minimal 6 karakter</li>
                                <li>Password baru harus cocok dengan konfirmasi</li>
                                <li>Password lama diperlukan untuk verifikasi</li>
                            </ul>
                        </div>

                        <div className="change-password-actions">
                            <Button
                                type="submit"
                                variant="primary"
                                className="change-password-submit"
                                disabled={loading}
                            >
                                {loading ? 'Mengubah Password...' : 'Ubah Password'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ChangePassword;
