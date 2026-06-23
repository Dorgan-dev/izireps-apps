import React from "react";
import ModalUi from "../ui/modal";

export const Badge = ({ label, className = "" }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
  >
    {label}
  </span>
);

export const Button = ({
  variant = "secondary",
  size = "md",
  loading,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gray-900 text-white border-gray-900 hover:bg-gray-700",
    secondary: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
    danger: "bg-white text-red-600 border-red-200 hover:bg-red-50",
    ghost: "bg-transparent text-gray-600 border-transparent hover:bg-gray-100",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export const Modal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900 text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Konfirmasi",
  variant = "warning",
  loading,
}) => {
  const colors = {
    danger: { icon: "text-red-600 bg-red-50", btn: "danger" },
    warning: { icon: "text-amber-600 bg-amber-50", btn: "secondary" },
    info: { icon: "text-blue-600 bg-blue-50", btn: "primary" },
  };
  const c = colors[variant];
  return (
    <ModalUi isOpen={open} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${c.icon}`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant={c.btn}
            loading={loading}
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalUi>
  );
};

export const Field = ({ label, hint, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    {children}
    {hint && <span className="text-xs text-gray-400">{hint}</span>}
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

export const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition ${className}`}
    {...props}
  />
));

export const Select = React.forwardRef(
  ({ className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition ${className}`}
      {...props}
    >
      {children}
    </select>
  ),
);

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-4xl mb-3">{icon}</span>
    <p className="font-medium text-gray-700 dark:text-gray-400">{title}</p>
    {description && (
      <p className="text-sm text-gray-400 mt-1 dark:text-gray-400">
        {description}
      </p>
    )}
  </div>
);

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export const Spinner = ({ className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
  </div>
);
