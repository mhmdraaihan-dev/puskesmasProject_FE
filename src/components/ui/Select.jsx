import React from 'react';
import ReactSelect from 'react-select';

/**
 * Select Component - Design System
 * 
 * Wrapper for react-select with design system styling.
 * Uses cream background, hairline borders, and coral focus state.
 * 
 * @component
 */
const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    background: 'var(--color-canvas)', // #faf9f5 - cream
    borderColor: state.isFocused
      ? 'var(--color-primary)' // #cc785c - coral
      : 'var(--color-hairline)', // #e6dfd8
    borderRadius: 'var(--rounded-sm)', // 6px
    boxShadow: state.isFocused
      ? '0 0 0 3px rgba(204, 120, 92, 0.15)' // coral focus ring
      : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      borderColor: 'var(--color-primary)',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 var(--spacing-md)', // 0 16px
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: 'var(--color-body)', // #252523
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--type-body-md-size)', // 16px
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--color-muted)', // #6c6a64
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--type-body-md-size)',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--color-body)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--type-body-md-size)',
  }),
  menu: (base) => ({
    ...base,
    background: 'var(--color-canvas)',
    borderRadius: 'var(--rounded-sm)',
    marginTop: '4px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    border: '1px solid var(--color-hairline)',
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? 'rgba(204, 120, 92, 0.15)' // coral 15% alpha
      : state.isFocused
        ? 'rgba(204, 120, 92, 0.08)' // coral 8% alpha
        : 'transparent',
    color: state.isSelected
      ? 'var(--color-primary)' // coral
      : 'var(--color-body)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--type-body-md-size)',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    '&:active': {
      background: 'rgba(204, 120, 92, 0.2)',
    },
  }),
  multiValue: (base) => ({
    ...base,
    background: 'rgba(204, 120, 92, 0.15)',
    borderRadius: 'var(--rounded-pill)', // 9999px
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--type-body-sm-size)',
    fontWeight: 500,
    padding: '2px 8px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'var(--color-primary)',
    borderRadius: 'var(--rounded-pill)',
    '&:hover': {
      background: 'var(--color-error)',
      color: 'white',
    },
  }),
  indicatorSeparator: (base) => ({
    ...base,
    background: 'var(--color-hairline)',
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? 'var(--color-primary)' : 'var(--color-muted)',
    '&:hover': {
      color: 'var(--color-primary)',
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'var(--color-muted)',
    '&:hover': {
      color: 'var(--color-error)',
    },
  }),
};

const Select = (props) => {
  return <ReactSelect styles={customStyles} {...props} />;
};

export default Select;
