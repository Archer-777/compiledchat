import React from 'react';
import './StepIndicator.css';

export default function StepIndicator({ currentStep = 0, totalSteps = 4 }) {
  return (
    <div className="step-indicator-container">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <React.Fragment key={index}>
            <div
              className={`step-indicator-dot ${isActive ? 'active' : ''} ${
                isCompleted ? 'completed' : ''
              }`}
            />
            {index < totalSteps - 1 && (
              <div
                className={`step-indicator-line ${
                  isCompleted ? 'active' : ''
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
