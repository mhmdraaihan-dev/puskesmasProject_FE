import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { createPracticePlace, updatePracticePlace, getPracticePlaceById, getVillages, getUsers } from '../../services/api';
import { POSITIONS } from '../../utils/roleHelpers';
import '../../App.css';

const PracticePlaceForm = () => {
    const { practiceId } = useParams();
    const isEditMode = !!practiceId;
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [villages, setVillages] = useState([]);
    const [bidanPraktik, setBidanPraktik] = useState([]);

    useEffect(() => {
        fetchData();
        if (isEditMode) {
            fetchPracticePlace();
        }
    }, [practiceId]);

    const fetchData = async () => {
        try {
            const [villagesRes, usersRes] = await Promise.all([
                getVillages(),
                getUsers()
            ]);

            setVillages(villagesRes.data || []);

            // Filter only bidan praktik
            const praktikUsers = usersRes.filter(u => u.position_user === POSITIONS.BIDAN_PRAKTIK);
            setBidanPraktik(praktikUsers);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    };

    const fetchPracticePlace = async () => {
        try {
            const response = await getPracticePlaceById(practiceId);
            const place = response.data;
            setValue('nama_praktik', place.nama_praktik);
            setValue('village_id', place.village_id);
            setValue('alamat', place.alamat);
            setValue('user_id', place.user_id);
        } catch (err) {
            setError('Gagal memuat data tempat praktik');
            console.error(err);
        }
    };

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        try {
            if (isEditMode) {
                await updatePracticePlace(practiceId, data);
                alert('Tempat praktik berhasil diupdate!');
            } else {
                await createPracticePlace(data);
                alert('Tempat praktik berhasil ditambahkan!');
            }
            navigate('/practice-places');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data tempat praktik');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>{isEditMode ? 'Edit Tempat Praktik' : 'Tambah Tempat Praktik Baru'}</h2>
                    <p className="text-muted">
                        {isEditMode ? 'Update informasi tempat praktik' : 'Tambahkan tempat praktik baru'}
                    </p>
                </div>
                <div>
                    <button onClick={() => navigate('/practice-places')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
                        Batal
                    </button>
                </div>
            </div>

            <div className="auth-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="nama_praktik">Nama Tempat Praktik *</label>
                        <input
                            id="nama_praktik"
                            type="text"
                            className="form-input"
                            placeholder="Contoh: Praktik Bidan Siti"
                            {...register("nama_praktik", { required: "Nama tempat praktik wajib diisi" })}
                        />
                        {errors.nama_praktik && <span className="error-message">{errors.nama_praktik.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="village_id">Desa *</label>
                        <select
                            id="village_id"
                            className="form-input"
                            {...register("village_id", { required: "Desa wajib dipilih" })}
                        >
                            <option value="">Pilih Desa</option>
                            {villages.map(village => (
                                <option key={village.village_id} value={village.village_id}>
                                    {village.nama_desa}
                                </option>
                            ))}
                        </select>
                        {errors.village_id && <span className="error-message">{errors.village_id.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="user_id">Bidan Praktik *</label>
                        <select
                            id="user_id"
                            className="form-input"
                            {...register("user_id", { required: "Bidan praktik wajib dipilih" })}
                        >
                            <option value="">Pilih Bidan Praktik</option>
                            {bidanPraktik.map(user => (
                                <option key={user.user_id} value={user.user_id}>
                                    {user.full_name} - {user.email}
                                </option>
                            ))}
                        </select>
                        {errors.user_id && <span className="error-message">{errors.user_id.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="alamat">Alamat *</label>
                        <textarea
                            id="alamat"
                            className="form-input"
                            rows="3"
                            placeholder="Alamat lengkap tempat praktik"
                            {...register("alamat", { required: "Alamat wajib diisi" })}
                        />
                        {errors.alamat && <span className="error-message">{errors.alamat.message}</span>}
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Menyimpan...' : (isEditMode ? 'Update Tempat Praktik' : 'Tambah Tempat Praktik')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PracticePlaceForm;
