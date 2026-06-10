import React from 'react';
import '../App.css';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, required = false, ...props }) => {
    return (
        <div className="form-group">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="form-input"
                {...props}
            />
        </div>
    );
};

export default Input;
