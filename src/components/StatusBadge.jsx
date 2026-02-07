import PropTypes from 'prop-types';
import '../App.css';

const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
        switch (status) {
            case 'PENDING':
                return {
                    backgroundColor: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                    color: '#fbbf24'
                };
            case 'APPROVED':
                return {
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#10b981'
                };
            case 'REJECTED':
                return {
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444'
                };
            case 'ACTIVE':
                return {
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#10b981'
                };
            case 'INACTIVE':
                return {
                    backgroundColor: 'rgba(107, 114, 128, 0.2)',
                    border: '1px solid rgba(107, 114, 128, 0.4)',
                    color: '#9ca3af'
                };
            default:
                return {
                    backgroundColor: 'rgba(107, 114, 128, 0.2)',
                    border: '1px solid rgba(107, 114, 128, 0.4)',
                    color: '#9ca3af'
                };
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'PENDING':
                return 'Menunggu Verifikasi';
            case 'APPROVED':
                return 'Disetujui';
            case 'REJECTED':
                return 'Ditolak';
            case 'ACTIVE':
                return 'Aktif';
            case 'INACTIVE':
                return 'Tidak Aktif';
            default:
                return status;
        }
    };

    return (
        <span
            style={{
                ...getStatusStyle(),
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'inline-block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}
        >
            {getStatusLabel()}
        </span>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.string.isRequired
};

export default StatusBadge;
