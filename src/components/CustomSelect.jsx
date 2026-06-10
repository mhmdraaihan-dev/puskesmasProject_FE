import React from "react";
import Select from "react-select";

const customStyles = {
  control: (base, state) => ({
    ...base,
    background: "rgba(255, 255, 255, 0.84)",
    borderColor: state.isFocused
      ? "var(--color-primary, #cc785c)"
      : "rgba(73, 62, 50, 0.12)",
    color: "var(--color-text-main, #252523)",
    boxShadow: state.isFocused
      ? "0 0 0 1px var(--color-primary, #cc785c)"
      : "none",
    padding: "2px",
    borderRadius: "0.75rem",
    minHeight: "48px",
    "&:hover": {
      borderColor: "var(--color-primary, #cc785c)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#fffdf9",
    color: "var(--color-text-main, #252523)",
    borderRadius: "0.75rem",
    marginTop: "0.5rem",
    zIndex: 9999,
    border: "1px solid rgba(73, 62, 50, 0.12)",
    boxShadow: "0 18px 36px rgba(76, 63, 48, 0.14)",
  }),
  menuList: (base) => ({
    ...base,
    padding: "0.5rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgba(204, 120, 92, 0.16)"
      : state.isFocused
        ? "rgba(204, 120, 92, 0.08)"
        : "transparent",
    color: "var(--color-text-main, #252523)",
    cursor: "pointer",
    borderRadius: "0.5rem",
    "&:active": {
      backgroundColor: "rgba(204, 120, 92, 0.18)",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--color-text-main, #252523)",
  }),
  input: (base) => ({
    ...base,
    color: "var(--color-text-main, #252523)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(61, 61, 58, 0.5)",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(204, 120, 92, 0.14)",
    borderRadius: "999px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--color-primary-dark, #a9583e)",
    fontWeight: 600,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--color-primary-dark, #a9583e)",
    ":hover": {
      backgroundColor: "rgba(198, 69, 69, 0.18)",
      color: "white",
    },
  }),
};

const CustomSelect = (props) => {
  return <Select styles={customStyles} {...props} />;
};

export default CustomSelect;
