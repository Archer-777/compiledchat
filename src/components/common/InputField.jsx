import React from 'react';
import './InputField.css';

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  type = 'text',
  maxLength,
  autoCapitalize = 'none',
  disabled = false,
  multiline = false,
  rows = 3
}) {
  return (
    <div className={`input-field-group ${error ? 'input-field-error' : ''}`}>
      {label && <label className="input-field-label">{label}</label>}
      {multiline ? (
        <textarea
          className="input-field-control"
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          className="input-field-control"
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoCapitalize={autoCapitalize}
        />
      )}
      {error && <span className="input-field-error-text">⚠ {error}</span>}
    </div>
  );
}
