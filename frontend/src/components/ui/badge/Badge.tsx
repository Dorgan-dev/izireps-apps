type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =  | "primary"  | "success"  | "error"  | "warning"  | "info"  | "light"  | "dark";

interface BadgeProps {
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode; // Badge content
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {const baseStyles ="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  // Define size styles
  const sizeStyles = {
    sm: "text-theme-xs", // Smaller padding and font size
    md: "text-sm", // Default padding and font size
  };

  // Define color styles for variants
  const variants = {
    light: {
      primary:"bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
      success:"bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
      error:"bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
      warning:"bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
      info:"bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500",
      light:"bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark:"bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    },
    solid: {
      primary: "bg-brand-500 text-white dark:text-white",
      success: "bg-success-500 text-white dark:text-white",
      error: "bg-error-500 text-white dark:text-white",
      warning: "bg-warning-500 text-white dark:text-white",
      info: "bg-blue-light-500 text-white dark:text-white",
      light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
      dark: "bg-gray-700 text-white dark:text-white",
    },
  };

  // Get styles based on size and color variant
  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};


export const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export const DeviceStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: BadgeColor; label: string }> = {
    available: { color: 'success', label: 'Tersedia' },
    booked: { color: 'info', label: 'Dipesan' },
    in_use: { color: 'warning', label: 'Digunakan' },
    maintenance: { color: 'error', label: 'Perbaikan' },
  };
  const { color, label } = map[status] || { color: 'light', label: status };
  return <Badge color={color} variant="light">{label}</Badge>;
};

export const SessionStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: BadgeColor; label: string }> = {
    active: { color: 'info', label: 'Aktif' },
    completed: { color: 'success', label: 'Selesai' },
    cancelled: { color: 'error', label: 'Dibatalkan' },
  };
  const { color, label } = map[status] || { color: 'light', label: status };
  return <Badge color={color} variant="light">{label}</Badge>;
};

export const BookingStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: BadgeColor; label: string }> = {
    pending: { color: 'warning', label: 'Menunggu' },
    confirmed: { color: 'info', label: 'Dikonfirmasi' },
    in_use: { color: 'primary', label: 'Digunakan' },
    completed: { color: 'success', label: 'Selesai' },
    rejected: { color: 'error', label: 'Ditolak' },
    cancelled: { color: 'error', label: 'Dibatalkan' },
    expired: { color: 'dark', label: 'Kadaluarsa' },
  };
  const { color, label } = map[status] || { color: 'light', label: status };
  return <Badge color={color} variant="light">{label}</Badge>;
};

export default Badge;