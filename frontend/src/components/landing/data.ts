import {
  Gamepad2, CalendarCheck, UtensilsCrossed, BarChart3,
  CreditCard, Users,
} from 'lucide-react';

export const FEATURES = [
  {
    icon: Gamepad2,
    bg: 'bg-success-50 dark:bg-success-950/40',
    text: 'text-success-600 dark:text-success-400',
    title: 'Monitor sesi real-time',
    desc: 'Pantau status semua perangkat dan durasi sesi yang sedang berjalan.',
  },
  {
    icon: CalendarCheck,
    bg: 'bg-brand-50 dark:bg-brand-950/40',
    text: 'text-brand-600 dark:text-brand-400',
    title: 'Sistem booking & DP',
    desc: 'Pelanggan bisa booking online, kasir konfirmasi bukti transfer DP.',
  },
  {
    icon: UtensilsCrossed,
    bg: 'bg-warning-50 dark:bg-warning-950/40',
    text: 'text-warning-600 dark:text-warning-400',
    title: 'FnB terintegrasi',
    desc: 'Order makanan dan minuman langsung dicatat dalam satu transaksi.',
  },
  {
    icon: BarChart3,
    bg: 'bg-blue-light-50 dark:bg-blue-light-950/20',
    text: 'text-blue-light-600 dark:text-blue-light-400',
    title: 'Laporan & ekspor',
    desc: 'Lihat tren pendapatan, sesi per perangkat, dan ekspor ke Excel/PDF.',
  },
  {
    icon: CreditCard,
    bg: 'bg-error-50 dark:bg-error-950/40',
    text: 'text-error-600 dark:text-error-400',
    title: 'Checkout fleksibel',
    desc: 'Mendukung tunai, transfer bank, dan QRIS dalam satu checkout.',
  },
  {
    icon: Users,
    bg: 'bg-theme-purple-500/10 dark:bg-theme-purple-500/10',
    text: 'text-theme-purple-500',
    title: 'Multi-role akses',
    desc: 'Owner dan kasir memiliki dasbor dan akses yang berbeda.',
  },
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

export const statusConfig: Record<string, { label: string; color: string; border: string; badgeBg: string }> = {
  available:   {
    label: 'Tersedia',
    color: 'text-success-600 dark:text-success-400',
    border: 'border-success-200 dark:border-success-900',
    badgeBg: 'bg-success-50 dark:bg-success-950/50',
  },
  in_use:      {
    label: 'Digunakan',
    color: 'text-brand-600 dark:text-brand-400',
    border: 'border-brand-200 dark:border-brand-900',
    badgeBg: 'bg-brand-50 dark:bg-brand-950/50',
  },
  processing:  {
    label: 'Diproses',
    color: 'text-warning-600 dark:text-warning-400',
    border: 'border-warning-200 dark:border-warning-900',
    badgeBg: 'bg-warning-50 dark:bg-warning-950/50',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-error-600 dark:text-error-400',
    border: 'border-error-200 dark:border-error-900',
    badgeBg: 'bg-error-50 dark:bg-error-950/50',
  },
};

export const REVIEWS = [
  {
    name: 'Rizal Maulana',
    role: 'Pelanggan tetap',
    rating: 5,
    comment:
      'Booking-nya gampang banget, langsung konfirmasi dan unit sudah siap waktu aku datang. Tidak perlu antri lagi!',
  },
  {
    name: 'Sari Dewi',
    role: 'Pelanggan baru',
    rating: 5,
    comment:
      'Sistem bookingnya super mudah dipahami. FnB juga langsung masuk tagihan, jadi tidak bingung bayar terpisah.',
  },
  {
    name: 'Dimas Pratama',
    role: 'Pelanggan reguler',
    rating: 4,
    comment:
      'Suka banget ada fitur lihat ketersediaan unit secara real-time. Jadi bisa rencanakan kapan mau main.',
  },
  {
    name: 'Hendra Wijaya',
    role: 'Gamer kasual',
    rating: 5,
    comment:
      'Pelayanannya cepat dan rapi. DP booking langsung dikonfirmasi dalam hitungan menit. Recommended!',
  },
  {
    name: 'Ayu Lestari',
    role: 'Pelanggan setia',
    rating: 5,
    comment:
      'Aplikasinya sangat membantu, tidak perlu repot nelpon dulu untuk tahu unit tersedia atau tidak.',
  },
  {
    name: 'Budi Santoso',
    role: 'Pelanggan weekend',
    rating: 4,
    comment:
      'Proses booking simpel dan jelas. Pilihan konsol lengkap dari PS3 sampai PS5. Pasti balik lagi!',
  },
];
