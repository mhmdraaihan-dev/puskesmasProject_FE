import React from "react";
import Select from "react-select";

const customStyles = {
  control: (base, state) => ({
    ...base,
    background: "rgba(255, 255, 255, 0.05)",
    borderColor: state.isFocused
      ? "var(--accent-color, #3b82f6)"
      : "rgba(255, 255, 255, 0.1)",
    color: "white",
    boxShadow: state.isFocused
      ? "0 0 0 1px var(--accent-color, #3b82f6)"
      : "none",
    padding: "2px",
    borderRadius: "0.5rem",
    "&:hover": {
      borderColor: "var(--accent-color, #3b82f6)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1f2937", // dark gray background
    color: "white",
    borderRadius: "0.5rem",
    marginTop: "0.5rem",
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: "0.5rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--accent-color, #3b82f6)"
      : state.isFocused
        ? "rgba(255, 255, 255, 0.1)"
        : "transparent",
    color: "white",
    cursor: "pointer",
    borderRadius: "0.25rem",
    "&:active": {
      backgroundColor: "var(--accent-color, #3b82f6)",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "white",
  }),
  input: (base) => ({
    ...base,
    color: "white",
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgba(255, 255, 255, 0.5)",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "white",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "white",
    ":hover": {
      backgroundColor: "rgba(239, 68, 68, 0.5)",
      color: "white",
    },
  }),
};

const CustomSelect = (props) => {
  return <Select styles={customStyles} {...props} />;
};

export default CustomSelect;
