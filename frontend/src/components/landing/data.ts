import {
  Gamepad2, CalendarCheck, UtensilsCrossed, BarChart3,
  CreditCard, Users,
} from 'lucide-react';

export const FEATURES = [
  { icon: Gamepad2,       color: 'bg-emerald-900/40 text-emerald-400', title: 'Monitor sesi real-time',   desc: 'Pantau status semua perangkat dan durasi sesi yang sedang berjalan.' },
  { icon: CalendarCheck,  color: 'bg-indigo-900/40 text-indigo-400',   title: 'Sistem booking & DP',      desc: 'Pelanggan bisa booking online, kasir konfirmasi bukti transfer DP.' },
  { icon: UtensilsCrossed,color: 'bg-yellow-900/40 text-yellow-400',   title: 'FnB terintegrasi',         desc: 'Order makanan dan minuman langsung dicatat dalam satu transaksi.' },
  { icon: BarChart3,      color: 'bg-blue-900/40 text-blue-400',       title: 'Laporan & ekspor',         desc: 'Lihat tren pendapatan, sesi per perangkat, dan ekspor ke Excel/PDF.' },
  { icon: CreditCard,     color: 'bg-red-900/40 text-red-400',         title: 'Checkout fleksibel',       desc: 'Mendukung tunai, transfer bank, dan QRIS dalam satu checkout.' },
  { icon: Users,          color: 'bg-teal-900/40 text-teal-400',       title: 'Multi-role akses',         desc: 'Owner dan kasir memiliki dasbor dan akses yang berbeda.' },
];

export const STEPS = [
  { num: 1, title: 'Booking masuk',  desc: 'Pelanggan booking + bayar DP, kasir konfirmasi' },
  { num: 2, title: 'Mulai sesi',     desc: 'Kasir klik tombol mulai, perangkat langsung aktif' },
  { num: 3, title: 'Order FnB',      desc: 'Tambahkan item FnB kapan saja selama sesi' },
  { num: 4, title: 'Checkout',       desc: 'Sesi selesai, tagihan otomatis terhitung' },
];

export const OWNER_FEATURES = [
  'Manajemen perangkat & tarif',
  'Tambah & kelola kasir',
  'Menu FnB & kategori',
  'Laporan & ekspor data',
  'Lihat semua booking',
];

export const CASHIER_FEATURES = [
  'Monitor perangkat live',
  'Konfirmasi booking & DP',
  'Mulai & kelola sesi',
  'Order FnB dalam sesi',
  'Proses checkout & pembayaran',
];

export const DEVICES = [
  { name: 'PS5 – Unit 1', type: 'PS5', status: 'available',   timer: null },
  { name: 'PS4 – Unit 2', type: 'PS4', status: 'in_use',      timer: '01:24:07' },
  { name: 'PS4 – Unit 3', type: 'PS4', status: 'in_use',      timer: '00:47:32' },
  { name: 'PS4 – Unit 4', type: 'PS4', status: 'processing',  timer: null },
  { name: 'PS5 – Unit 5', type: 'PS5', status: 'available',   timer: null },
  { name: 'PS4 – Unit 6', type: 'PS4', status: 'in_use',      timer: '02:10:55' },
  { name: 'PS3 – Unit 7', type: 'PS3', status: 'maintenance', timer: null },
  { name: 'PS5 – Unit 8', type: 'PS5', status: 'available',   timer: null },
];

export const statusConfig: Record<string, { label: string; color: string; border: string }> = {
  available:   { label: 'Tersedia',   color: 'text-emerald-400', border: 'border-emerald-800' },
  in_use:      { label: 'Digunakan',  color: 'text-indigo-400',  border: 'border-indigo-800' },
  processing:  { label: 'Diproses',   color: 'text-yellow-400',  border: 'border-yellow-800' },
  maintenance: { label: 'Maintenance',color: 'text-red-400',     border: 'border-red-800' },
};
