/**
 * client/src/components/common/Input.jsx
 */
import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, id, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`input ${error ? 'error' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="text-xs text-red-500 mt-0.5" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
