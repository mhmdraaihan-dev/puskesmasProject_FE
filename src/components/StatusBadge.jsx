import PropTypes from 'prop-types';
import './StatusBadge.css';

/**
 * StatusBadge Component - Design System
 * 
 * Displays status badges with semantic colors and badge-pill styling.
 * Uses design system colors with 15% alpha backgrounds.
 * 
 * Requirements: 2.1, 2.2, 2.9, 5.6, 9.3, 9.4
 */
const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const getStatusClass = () => {
    const normalizedStatus = status?.toUpperCase();
    
    switch (normalizedStatus) {
      case 'PENDING':
        return 'status-badge--pending';
      case 'APPROVED':
        return 'status-badge--approved';
      case 'REJECTED':
        return 'status-badge--rejected';
      case 'ACTIVE':
        return 'status-badge--active';
      case 'INACTIVE':
        return 'status-badge--inactive';
      default:
        return 'status-badge--default';
    }
  };

  const getStatusLabel = () => {
    const normalizedStatus = status?.toUpperCase();
    
    switch (normalizedStatus) {
      case 'PENDING':
        return 'Menunggu';
      case 'APPROVED':
        return 'Disetujui';
      case 'REJECTED':
        return 'Ditolak';
      case 'ACTIVE':
        return 'Aktif';
      case 'INACTIVE':
        return 'Nonaktif';
      default:
        return status;
    }
  };

  const badgeClass = [
    'status-badge',
    `status-badge--${size}`,
    getStatusClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClass}>
      {getStatusLabel()}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md']),
  className: PropTypes.string
};

export default StatusBadge;
