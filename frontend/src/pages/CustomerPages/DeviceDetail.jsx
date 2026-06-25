import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Tv2,
  Gamepad2,
  Monitor,
  Loader2,
  WifiOff,
  CalendarCheck,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuthStore } from "../../store/authStore";
import Modal from "../../components/ui/modal";
import InputField from "../../components/form/input/InputField";
import FileInput from "../../components/form/input/FileInput";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/DatePicker";
import ClockTimePicker from "../../components/form/ClockTimePicker";
import QrisPaymentStep from "../../components/booking/QrisPaymentStep";
import { useEffect, useState, useCallback, useRef } from "react";

// Import custom hook dan helper
import {
  useDeviceBooking,
  getTodayDateString,
  getCurrentTime,
  calculateEndTime,
  getMinTime,
  getFutureTime,
} from "../../hooks/useDeviceBooking";

const statusConfig = {
  available: {
    label: "Tersedia",
    color: "text-success-600 dark:text-success-400",
    border: "border-success-200",
    badgeBg: "bg-success-50 dark:bg-success-950/50",
  },
  booked: {
    label: "Dibooking",
    color: "text-brand-600 dark:text-brand-400",
    border: "border-brand-200",
    badgeBg: "bg-brand-50 dark:bg-brand-950/50",
  },
  in_use: {
    label: "Digunakan",
    color: "text-warning-600 dark:text-warning-400",
    border: "border-warning-200",
    badgeBg: "bg-warning-50 dark:bg-warning-950/50",
  },
  maintenance: {
    label: "Maintenance",
    color: "text-error-600 dark:text-error-400",
    border: "border-error-200",
    badgeBg: "bg-error-50 dark:bg-error-950/50",
  },
};

function getTypeConfig(psType) {
  if (psType === "PS3")
    return {
      icon: Monitor,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/40",
    };
  if (psType === "PS5")
    return {
      icon: Tv2,
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-orange-950/40",
    };
  return {
    icon: Gamepad2,
    color: "text-brand-500",
    bg: "bg-brand-50 dark:bg-brand-950/40",
  };
}

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEPS = [
  { key: "form", label: "Isi Form" },
  { key: "payment", label: "Bayar" },
  { key: "proof", label: "Bukti" },
];

function StepIndicator({ current }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center justify-center gap-1 mb-4">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors
                        ${i < idx ? "bg-brand-500 text-white" : i === idx ? "bg-brand-500 text-white ring-2 ring-brand-200" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}
          >
            {i < idx ? "✓" : i + 1}
          </div>
          <span
            className={`text-[10px] font-medium ${i === idx ? "text-brand-600 dark:text-brand-400" : "text-gray-400 dark:text-gray-600"}`}
          >
            {s.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={`w-4 h-px mx-0.5 ${i < idx ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    device,
    loading,
    error,
    duration,
    setDuration,
    isModalOpen,
    setIsModalOpen,
    handleCloseModal,
    formData,
    setFormData,
    setDpProof,
    isSubmitting,
    bookingError,
    step,
    setStep,
    qrisData,
    isCalculating,
    handleProceedToPayment,
    handleProceedToProof,
    handleBookingClick: _handleBookingClick,
    handleInputChange,
    handleBookingSubmit,
  } = useDeviceBooking(id, user, navigate);

  const [timeType, setTimeType] = useState("per_hour");
  const [isTimeEdited, setIsTimeEdited] = useState(false);
  const isDatePickerOpenRef = useRef(false);
  const [selectedBookingDate, setSelectedBookingDate] =
    useState(getTodayDateString());
  const durationRef = useRef(duration);
  const timeTypeRef = useRef(timeType);

  useEffect(() => {
    durationRef.current = duration;
    timeTypeRef.current = timeType;
  }, [duration, timeType]);

  const handleBookingClick = useCallback(() => {
    const today = getTodayDateString();
    const futureTime = getFutureTime(15);
    setSelectedBookingDate(today);
    setIsTimeEdited(false);
    isDatePickerOpenRef.current = false;
    setTimeType("per_hour");
    setFormData((prev) => ({
      ...prev,
      booking_date: today,
      start_time: futureTime,
      end_time: calculateEndTime(futureTime, duration),
      time_type: "per_hour",
    }));
    _handleBookingClick();
  }, [_handleBookingClick, duration, setFormData]);

  useEffect(() => {
    const isToday = selectedBookingDate === getTodayDateString();
    if (!isModalOpen || !isToday || isTimeEdited || step !== "form") return;

    const interval = setInterval(() => {
      if (isDatePickerOpenRef.current) return;
      const futureTime = getFutureTime(15);
      setFormData((prev) => ({
        ...prev,
        start_time: futureTime,
        end_time:
          timeTypeRef.current === "free_play"
            ? ""
            : calculateEndTime(futureTime, durationRef.current),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isModalOpen, selectedBookingDate, isTimeEdited, step, setFormData]);

  const handleTimeChange = useCallback(
    (newTime) => {
      setIsTimeEdited(true);
      setFormData((prev) => ({
        ...prev,
        start_time: newTime,
        end_time:
          timeType === "free_play" ? "" : calculateEndTime(newTime, duration),
      }));
    },
    [duration, timeType, setFormData],
  );

  useEffect(() => {
    if (formData.start_time) {
      setFormData((prev) => {
        const calculatedEnd =
          timeType === "free_play"
            ? ""
            : calculateEndTime(prev.start_time, duration);
        if (prev.end_time === calculatedEnd) return prev;
        return { ...prev, end_time: calculatedEnd };
      });
    }
  }, [duration, timeType, formData.start_time, setFormData]);

  const minTime = getMinTime(selectedBookingDate);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center dark:bg-gray-950">
        <WifiOff size={40} className="mb-4 text-gray-400" />
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Oops!
        </h2>
        <p className="mb-6 text-gray-500 dark:text-gray-400">{error}</p>
        <Link to="/device" className="text-brand-500 hover:underline">
          Kembali ke daftar perangkat
        </Link>
      </div>
    );
  }

  const typeConfig = getTypeConfig(device.ps_type);
  const Icon = typeConfig.icon;
  const cfg = statusConfig[device.status] ?? statusConfig.available;

  // ── Judul modal per step ─────────────────────────────────────────────────
  const modalTitle =
    step === "form"
      ? "Formulir Booking"
      : step === "payment"
        ? "Pembayaran QRIS"
        : "Upload Bukti Pembayaran";

  return (
    <>
      <PageBreadcrumb
        pageDescription="Lihat informasi detail sesi bermain"
        items={[
          { label: "Perangkat", path: "/device" },
          { label: "Detail", path: `/device/${id}` },
        ]}
      />
      <div className="min-h-screen bg-gray-50 py-10 dark:bg-gray-950">
        <PageMeta
          title={`Detail ${device.name} - IZIREPS`}
          description={`Detail perangkat ${device.name}`}
        />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col md:flex-row">
              <div
                className={`flex flex-1 flex-col items-center justify-center p-10 ${typeConfig.bg}`}
              >
                <Icon size={120} className={typeConfig.color} />
                <span
                  className={`mt-6 inline-block rounded-full px-4 py-1 text-sm font-bold ${typeConfig.bg} ${typeConfig.color} border border-current`}
                >
                  {device.ps_type}
                </span>
              </div>

              <div className="flex-1 p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {device.name}
                  </h1>
                  <div className="mt-3 flex items-center gap-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${cfg.badgeBg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    {device.rate && (
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Rp {device.rate.toLocaleString("id-ID")} / jam
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-8 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Deskripsi
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {device.ps_type === "PS5"
                        ? "Nikmati pengalaman bermain game generasi terbaru dengan resolusi 4K dan loading super cepat."
                        : "Mainkan berbagai game seru dengan teman-teman Anda."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleBookingClick}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-brand-600"
                >
                  <CalendarCheck size={18} /> Booking Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Booking Modal ─────────────────────────────────────────── */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={modalTitle}
          size="md"
        >
          <div className="flex flex-col gap-3 p-1 sm:max-h-none pr-0.5">
            {/* Step indicator */}
            <StepIndicator current={step} />

            {/* Error banner */}
            {bookingError && (
              <div className="rounded-lg bg-error-50 p-2.5 text-xs text-error-600 dark:bg-error-500/10 dark:text-error-400">
                {bookingError}
              </div>
            )}

            {/* ── STEP 1: Form Booking ─────────────────────────── */}
            {step === "form" && (
              <>
                {/* Nama & WhatsApp */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs sm:text-sm">Nama Pelanggan</Label>
                    <InputField
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="Nama"
                      className="w-full text-xs sm:text-sm h-9 sm:h-11 px-2.5"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs sm:text-sm">No. WhatsApp</Label>
                    <InputField
                      type="text"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="08123..."
                      className="w-full text-xs sm:text-sm h-9 sm:h-11 px-2.5"
                    />
                  </div>
                </div>

                {/* Tanggal & Tipe Waktu */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  <div
                    className="flex flex-col gap-1 relative z-[70]"
                    onClick={(e) => {
                      e.stopPropagation();
                      isDatePickerOpenRef.current = true;
                    }}
                    onFocus={() => {
                      isDatePickerOpenRef.current = true;
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        isDatePickerOpenRef.current = false;
                      }, 200);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <DatePicker
                      id="booking-date-picker"
                      label="Tanggal Bermain"
                      minDate={getTodayDateString()}
                      placeholder="Pilih tgl"
                      value={formData.booking_date || getTodayDateString()}
                      onChange={(_, dateStr) => {
                        isDatePickerOpenRef.current = false;
                        if (!dateStr) return;
                        if (dateStr !== getTodayDateString())
                          setIsTimeEdited(false);
                        setSelectedBookingDate(dateStr);
                        setFormData((p) => ({ ...p, booking_date: dateStr }));
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs sm:text-sm">Tipe Waktu</Label>
                    <Select
                      value={timeType}
                      onChange={(val) => {
                        setTimeType(val);
                        setFormData((prev) => ({ ...prev, time_type: val }));
                      }}
                      options={[
                        { value: "per_hour", label: "Per jam" },
                        { value: "free_play", label: "Bebas" },
                      ]}
                      placeholder="Tipe"
                      className="w-full text-xs sm:text-sm h-9 sm:h-11"
                    />
                  </div>
                </div>

                {/* Durasi */}
                {timeType === "per_hour" && (
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs sm:text-sm">Durasi Bermain</Label>
                    <Select
                      value={String(duration)}
                      onChange={(val) => setDuration(Number(val))}
                      options={[1, 2, 3, 4, 5, 6].map((h) => ({
                        value: String(h),
                        label: `${h} jam`,
                      }))}
                      placeholder="Pilih durasi"
                      className="w-full text-xs sm:text-sm h-9 sm:h-11"
                    />
                  </div>
                )}

                {/* Jam Mulai & Selesai */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 relative">
                  <div className="flex flex-col gap-1 relative z-[65]">
                    <ClockTimePicker
                      id="start_time"
                      label="Jam Mulai"
                      value={formData.start_time || getCurrentTime()}
                      onChange={handleTimeChange}
                      minTime={minTime}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs sm:text-sm">Jam Selesai</Label>
                    <div className="h-9 sm:h-11 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs sm:text-sm font-mono text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 select-none w-full truncate">
                      {timeType === "free_play" ? (
                        <span className="text-warning-500 italic text-[11px] sm:text-sm">
                          Bebas
                        </span>
                      ) : (
                        formData.end_time || (
                          <span className="text-gray-400 dark:text-gray-500">
                            Otomatis
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Action: Bayar */}
                <div className="mt-2 flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-800 sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-lg border border-gray-200 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 w-1/2 sm:w-auto transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    disabled={isCalculating}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70 w-1/2 sm:w-auto transition-colors"
                  >
                    {isCalculating && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {isCalculating ? "Menghitung..." : "Bayar →"}
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 2: QR Payment ───────────────────────────── */}
            {step === "payment" && qrisData && (
              <QrisPaymentStep
                dpAmount={qrisData.dp_amount}
                estimatedCost={qrisData.estimated_cost}
                qrisString={qrisData.qris_string}
                qrisAvailable={qrisData.qris_available}
                onProceedToProof={handleProceedToProof}
                onBack={() => setStep("form")}
              />
            )}

            {/* ── STEP 3: Upload Bukti Bayar ───────────────────── */}
            {step === "proof" && (
              <>
                <div className="rounded-lg bg-brand-50 dark:bg-brand-950/30 p-3 text-xs text-brand-700 dark:text-brand-300">
                  ✅ Pembayaran berhasil? Upload screenshot bukti transfer di
                  bawah ini.
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs sm:text-sm">
                    Bukti Transfer DP (Maks 5MB)
                  </Label>
                  <FileInput
                    onChange={(e) => setDpProof(e.target.files?.[0] || null)}
                    className="w-full text-xs sm:text-sm"
                  />
                  <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500">
                    Format: JPG, PNG
                  </p>
                </div>

                <div className="mt-2 flex gap-2 border-t border-gray-200 pt-3 dark:border-gray-800 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setStep("payment")}
                    className="rounded-lg border border-gray-200 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 w-1/2 sm:w-auto transition-colors"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-70 w-1/2 sm:w-auto transition-colors"
                  >
                    {isSubmitting && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {isSubmitting ? "Mengirim..." : "Kirim Booking"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
}
