import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

const RoleGuard = ({ children, allowedRoles = [], allowedPositions = [] }) => {
    const { user } = useAuth();

    if (!user) return null;

    // Check role
    const hasRole = allowedRoles.length === 0 || allowedRoles.includes(user.role);

    // Check position
    const hasPosition = allowedPositions.length === 0 || allowedPositions.includes(user.position_user);

    if (hasRole && hasPosition) {
        return <>{children}</>;
    }

    return null;
};

RoleGuard.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
    allowedPositions: PropTypes.arrayOf(PropTypes.string)
};

export default RoleGuard;
