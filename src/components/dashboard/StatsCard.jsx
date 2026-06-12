import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.css';

/**
 * StatsCard Component
 * 
 * Dashboard statistics card displaying a metric with icon and optional trend indicator.
 * Uses dark navy background with cream text for high contrast.
 * 
 * @component
 * @example
 * <StatsCard
 *   title="Total Users"
 *   value="145"
 *   icon={UsersIcon}
 *   trend={{ value: "+12%", direction: "up" }}
 * />
 */
const StatsCard = ({ title, value, icon: Icon, trend, className = '' }) => {
  return (
    <div className={`stats-card ${className}`}>
      <div className="stats-card__header">
        <div className="stats-card__icon">
          {Icon && <Icon size={24} />}
        </div>
        {trend && (
          <div className={`stats-card__trend stats-card__trend--${trend.direction}`}>
            {trend.direction === 'up' ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span className="stats-card__trend-value">{trend.value}</span>
          </div>
        )}
      </div>
      
      <div className="stats-card__content">
        <div className="stats-card__value">{value}</div>
        <div className="stats-card__title">{title}</div>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  /**
   * Card title/label (e.g., "Total Users")
   */
  title: PropTypes.string.isRequired,
  
  /**
   * Main metric value (e.g., "145" or "12.5k")
   */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  
  /**
   * Icon component from lucide-react
   */
  icon: PropTypes.elementType,
  
  /**
   * Optional trend indicator
   */
  trend: PropTypes.shape({
    value: PropTypes.string.isRequired,     // e.g., "+12%" or "-5%"
    direction: PropTypes.oneOf(['up', 'down']).isRequired,
  }),
  
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default StatsCard;
