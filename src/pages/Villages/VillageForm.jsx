import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { createVillage, updateVillage, getVillageById } from '../../services/api';
import '../../App.css';

const VillageForm = () => {
    const { villageId } = useParams();
    const isEditMode = !!villageId;
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchVillage();
        }
    }, [villageId]);

    const fetchVillage = async () => {
        try {
            const response = await getVillageById(villageId);
            setValue('nama_desa', response.data.nama_desa);
        } catch (err) {
            setError('Gagal memuat data desa');
            console.error(err);
        }
    };

    const onSubmit = async (data) => {
        setError('');
        setLoading(true);

        try {
            if (isEditMode) {
                await updateVillage(villageId, data);
                alert('Desa berhasil diupdate!');
            } else {
                await createVillage(data);
                alert('Desa berhasil ditambahkan!');
            }
            navigate('/villages');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data desa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>{isEditMode ? 'Edit Desa' : 'Tambah Desa Baru'}</h2>
                    <p className="text-muted">
                        {isEditMode ? 'Update informasi desa' : 'Tambahkan desa baru ke sistem'}
                    </p>
                </div>
                <div>
                    <button onClick={() => navigate('/villages')} className="btn-primary" style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
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
                        <label className="form-label" htmlFor="nama_desa">Nama Desa *</label>
                        <input
                            id="nama_desa"
                            type="text"
                            className="form-input"
                            placeholder="Contoh: Desa Sukamaju"
                            {...register("nama_desa", { required: "Nama desa wajib diisi" })}
                        />
                        {errors.nama_desa && <span className="error-message">{errors.nama_desa.message}</span>}
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Menyimpan...' : (isEditMode ? 'Update Desa' : 'Tambah Desa')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VillageForm;
