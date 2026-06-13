import React from 'react';
import '../App.css';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    className = '',
    ...props
}) => {
    const variantClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${variantClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
