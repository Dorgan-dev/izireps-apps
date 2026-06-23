const Button = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  className = "",
  disabled = false,
  loading = false,
  type = "button",
  ...rest
}) => {
  // Size styles
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
  };

  // Variant styles
  const variantClasses = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300",

    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]",

    secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400",

    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",

    warning:
      "bg-yellow-500 text-black hover:bg-yellow-600 disabled:bg-yellow-300",

    info: "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-colors
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled || loading ? "cursor-not-allowed opacity-60" : ""}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {startIcon && <span>{startIcon}</span>}
          {children}
          {endIcon && <span>{endIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
