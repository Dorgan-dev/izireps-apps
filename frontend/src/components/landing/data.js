import {
  Gamepad2,
  CalendarCheck,
  UtensilsCrossed,
  BarChart3,
  CreditCard,
  Users,
} from "lucide-react";

export const FEATURES = [
  {
    icon: Gamepad2,
    bg: "bg-success/10",
    text: "text-success",
    title: "Monitor sesi real-time",
    desc: "Pantau status semua perangkat dan durasi sesi yang sedang berjalan.",
  },
  {
    icon: CalendarCheck,
    bg: "bg-primary/10",
    text: "text-primary",
    title: "Sistem booking & DP",
    desc: "Pelanggan bisa booking online, kasir konfirmasi bukti transfer DP.",
  },
  {
    icon: UtensilsCrossed,
    bg: "bg-warning/10",
    text: "text-warning",
    title: "FnB terintegrasi",
    desc: "Order makanan dan minuman langsung dicatat dalam satu transaksi.",
  },
  {
    icon: BarChart3,
    bg: "bg-info/10",
    text: "text-info",
    title: "Laporan & ekspor",
    desc: "Lihat tren pendapatan, sesi per perangkat, dan ekspor ke Excel/PDF.",
  },
  {
    icon: CreditCard,
    bg: "bg-error/10",
    text: "text-error",
    title: "Checkout fleksibel",
    desc: "Mendukung tunai, transfer bank, dan QRIS dalam satu checkout.",
  },
  {
    icon: Users,
    bg: "bg-secondary/10",
    text: "text-secondary",
    title: "Multi-role akses",
    desc: "Owner dan kasir memiliki dasbor dan akses yang berbeda.",
  },
];

export const STEPS = [
  {
    num: 1,
    title: "Booking masuk",
    desc: "Pelanggan booking + bayar DP, kasir konfirmasi",
  },
  {
    num: 2,
    title: "Mulai sesi",
    desc: "Kasir klik tombol mulai, perangkat langsung aktif",
  },
  {
    num: 3,
    title: "Order FnB",
    desc: "Tambahkan item FnB kapan saja selama sesi",
  },
  {
    num: 4,
    title: "Checkout",
    desc: "Sesi selesai, tagihan otomatis terhitung",
  },
];

export const OWNER_FEATURES = [
  "Manajemen perangkat & tarif",
  "Tambah & kelola kasir",
  "Menu FnB & kategori",
  "Laporan & ekspor data",
  "Lihat semua booking",
];

export const CASHIER_FEATURES = [
  "Monitor perangkat live",
  "Konfirmasi booking & DP",
  "Mulai & kelola sesi",
  "Order FnB dalam sesi",
  "Proses checkout & pembayaran",
];

export const DEVICES = [
  { name: "PS5 – Unit 1", type: "PS5", status: "available", timer: null },
  { name: "PS4 – Unit 2", type: "PS4", status: "in_use", timer: "01:24:07" },
  { name: "PS4 – Unit 3", type: "PS4", status: "in_use", timer: "00:47:32" },
  { name: "PS4 – Unit 4", type: "PS4", status: "processing", timer: null },
  { name: "PS5 – Unit 5", type: "PS5", status: "available", timer: null },
  { name: "PS4 – Unit 6", type: "PS4", status: "in_use", timer: "02:10:55" },
  { name: "PS3 – Unit 7", type: "PS3", status: "maintenance", timer: null },
  { name: "PS5 – Unit 8", type: "PS5", status: "available", timer: null },
];

export const statusConfig = {
  available: {
    label: "Tersedia",
    color: "text-success",
    border: "border-success",
    badgeBg: "badge-success",
  },
  in_use: {
    label: "Digunakan",
    color: "text-primary",
    border: "border-primary",
    badgeBg: "badge-primary",
  },
  processing: {
    label: "Diproses",
    color: "text-warning",
    border: "border-warning",
    badgeBg: "badge-warning",
  },
  maintenance: {
    label: "Maintenance",
    color: "text-error",
    border: "border-error",
    badgeBg: "badge-error",
  },
};

export const REVIEWS = [
  {
    name: "Rizal Maulana",
    role: "Pelanggan tetap",
    rating: 5,
    comment:
      "Booking-nya gampang banget, langsung konfirmasi dan unit sudah siap waktu aku datang. Tidak perlu antri lagi!",
  },
  {
    name: "Sari Dewi",
    role: "Pelanggan baru",
    rating: 5,
    comment:
      "Sistem bookingnya super mudah dipahami. FnB juga langsung masuk tagihan, jadi tidak bingung bayar terpisah.",
  },
  {
    name: "Dimas Pratama",
    role: "Pelanggan reguler",
    rating: 4,
    comment:
      "Suka banget ada fitur lihat ketersediaan unit secara real-time. Jadi bisa rencanakan kapan mau main.",
  },
  {
    name: "Hendra Wijaya",
    role: "Gamer kasual",
    rating: 5,
    comment:
      "Pelayanannya cepat dan rapi. DP booking langsung dikonfirmasi dalam hitungan menit. Recommended!",
  },
  {
    name: "Ayu Lestari",
    role: "Pelanggan setia",
    rating: 5,
    comment:
      "Aplikasinya sangat membantu, tidak perlu repot nelpon dulu untuk tahu unit tersedia atau tidak.",
  },
  {
    name: "Budi Santoso",
    role: "Pelanggan weekend",
    rating: 4,
    comment:
      "Proses booking simpel dan jelas. Pilihan konsol lengkap dari PS3 sampai PS5. Pasti balik lagi!",
  },
];
