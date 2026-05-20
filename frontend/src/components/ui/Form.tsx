import React from 'react';
import Button from './button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';

export function Field({ label, required, hint, children, className }: { label: string; required?: boolean; hint?: string; children: React.ReactNode, className?: string }) {
  return (
    <div className={`space-y-1.5 ${className || ''}`}>
      <Label>
        {label}{required && <span className="text-error-500 ml-1">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

export { Button, Input };
