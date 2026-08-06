import React from 'react';
import './GenderPicker.css';

const GENDER_OPTIONS = [
  { id: 'Male', label: 'Male', symbol: '♂' },
  { id: 'Female', label: 'Female', symbol: '♀' },
  { id: 'Non-Binary', label: 'Non-Binary', symbol: '⚥' },
  { id: 'Prefer Not to Say', label: 'Other', symbol: '✧' },
];

export default function GenderPicker({ value, onChange, error }) {
  return (
    <div className="gender-picker-container">
      <label className="gender-picker-label">⚥ GENDER IDENTITY</label>
      <div className="gender-options-row">
        {GENDER_OPTIONS.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`gender-option-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange(opt.id)}
            >
              <span>{opt.symbol}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {error && <span className="gender-picker-error">⚠ {error}</span>}
    </div>
  );
}
