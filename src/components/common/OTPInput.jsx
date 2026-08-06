import React, { useRef } from 'react';
import './OTPInput.css';

export default function OTPInput({ value = '', onChange, length = 6 }) {
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (val.length > 1) {
      // Handle paste
      const pasted = val.slice(0, length);
      onChange(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      if (inputs.current[nextIndex]) {
        inputs.current[nextIndex].focus();
      }
      return;
    }

    const currentChars = value.split('');
    currentChars[index] = val;
    const newOTP = currentChars.join('');
    onChange(newOTP);

    if (val && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="otp-container">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength={length}
          className={`otp-box ${value[i] ? 'filled' : ''}`}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
