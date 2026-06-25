export const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
};

export const getElapsedMinutes = (startedAt) =>
  Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatDateTime = (dt) =>
  new Date(dt).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatTime = (time) => time.slice(0, 5);

export const getInitials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const calcGamingCost = (minutes, pricePerHour) =>
  Math.round((minutes / 60) * pricePerHour);

export const deviceStatusLabel = {
  available: "Tersedia",
  booked: "Dibooking",
  in_use: "Digunakan",
  maintenance: "Perbaikan",
};
export const deviceStatusBadge = {
  available: "bg-green-100 text-green-800 ring-green-200",
  booked: "bg-blue-100 text-blue-800 ring-blue-200",
  in_use: "bg-amber-100 text-amber-800 ring-amber-200",
  maintenance: "bg-red-100 text-red-800 ring-red-200",
};
export const deviceStatusCard = {
  available: "border-green-200 bg-green-50",
  booked: "border-blue-200 bg-blue-50",
  in_use: "border-amber-200 bg-amber-50",
  maintenance: "border-red-200 bg-red-50",
};
export const bookingStatusLabel = {
  pending: "Menunggu verifikasi",
  confirmed: "Dikonfirmasi",
  in_use: "Sedang dimainkan",
  completed: "Selesai",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
};
export const bookingStatusBadge = {
  pending: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  in_use: "bg-amber-100 text-amber-800",
  completed: "bg-teal-100 text-teal-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
  expired: "bg-gray-100 text-gray-500",
};
export const paymentMethodLabel = {
  cash: "Tunai",
  qris: "QRIS",
};

export const sessionStatusLabel = {
  active: "Aktif",
  time_up: "Waktu Habis",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export const sessionStatusBadge = {
  active: "bg-amber-100 text-amber-800",
  time_up: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};
