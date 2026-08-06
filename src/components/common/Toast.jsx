import React from 'react';
import { IoSparkles } from 'react-icons/io5';
import './Toast.css';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast-banner">
      <IoSparkles style={{ color: '#c084fc', fontSize: 16 }} />
      <span>{message}</span>
    </div>
  );
}
