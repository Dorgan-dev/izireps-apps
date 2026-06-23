import { useState, useEffect } from "react";
import { deviceApi, customerApi, bookingApi } from "../api";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDeviceBooking(id, user, navigate) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(1);

  // Step management: form → payment → proof
  const [step, setStep] = useState("form");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    booking_date: getTodayDateString(),
    start_time: "",
    end_time: "",
    time_type: "per_hour",
  });

  // Payment step data
  const [qrisData, setQrisData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Proof step
  const [dpProof, setDpProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // ── Fetch device ─────────────────────────────────────────────────────────
  useEffect(() => {
    deviceApi
      .publicList()
      .then((res) => {
        const found = res.data.data?.find((d) => d.id === Number(id));
        found ? setDevice(found) : setError("Perangkat tidak ditemukan.");
      })
      .catch(() => setError("Gagal memuat data perangkat."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Step 1: Buka modal ────────────────────────────────────────────────────
  const handleBookingClick = () => {
    if (!user) {
      alert("Anda harus login terlebih dahulu untuk melakukan booking.");
      navigate("/login");
      return;
    }
    const today = getTodayDateString();
    const now = getCurrentTime();
    setFormData((prev) => ({
      ...prev,
      name: user.name ?? "",
      phone: user.phone ?? "",
      booking_date: today,
      start_time: now,
      end_time: calculateEndTime(now, 1),
    }));
    setStep("form");
    setQrisData(null);
    setDpProof(null);
    setBookingError(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateEndTime = (startTime, dur) => {
    setFormData((prev) => ({
      ...prev,
      start_time: startTime,
      end_time: calculateEndTime(startTime, dur),
    }));
  };

  // ── Step 2: Klik "Bayar" → hitung estimasi + generate QR ─────────────────
  const handleProceedToPayment = async () => {
    if (!formData.booking_date) {
      setBookingError("Tanggal booking wajib dipilih.");
      return;
    }
    if (formData.time_type === "per_hour" && !formData.end_time) {
      setBookingError("Waktu selesai wajib diisi.");
      return;
    }

    setIsCalculating(true);
    setBookingError(null);

    try {
      const res = await bookingApi.publicCalculate({
        device_id: device.id,
        time_type: formData.time_type,
        start_time: formData.start_time,
        end_time:
          formData.time_type === "per_hour" ? formData.end_time : undefined,
      });

      setQrisData(res.data.data);
      setStep("payment");
    } catch (err) {
      setBookingError(
        err.response?.data?.message || "Gagal menghitung estimasi biaya.",
      );
    } finally {
      setIsCalculating(false);
    }
  };

  // ── Step 3: Setelah scan QR, user upload bukti → tampilkan form upload ────
  const handleProceedToProof = () => {
    setStep("proof");
    setBookingError(null);
  };

  // ── Step 4: Submit booking dengan bukti bayar ─────────────────────────────
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!dpProof) {
      setBookingError("Bukti transfer DP wajib diupload.");
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      let customerId = user?.customer_id || user?.id;

      if (!customerId) {
        const custRes = await customerApi.publicRegister({
          name: formData.name,
          phone: formData.phone,
        });
        customerId = custRes.data.data.id;
      }

      const payload = new FormData();
      payload.append("device_id", String(device?.id));
      payload.append("customer_id", String(customerId));
      payload.append("booking_date", formData.booking_date);
      payload.append("start_time", formData.start_time);
      payload.append("time_type", formData.time_type);
      if (formData.time_type === "per_hour") {
        payload.append("end_time", formData.end_time);
      }
      payload.append("dp_proof", dpProof);

      await bookingApi.publicCreate(payload);

      // Reset semua state
      setFormData({
        name: "",
        phone: "",
        time_type: "per_hour",
        booking_date: "",
        start_time: "",
        end_time: "",
      });
      setDpProof(null);
      setQrisData(null);
      setStep("form");

      alert("Booking berhasil dikirim! Menunggu konfirmasi kasir.");
      setIsModalOpen(false);
      navigate("/devices");
    } catch (err) {
      console.error("Detail Error Booking:", err);
      setBookingError(err.response?.data?.message || "Gagal membuat booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setStep("form");
    setQrisData(null);
    setDpProof(null);
    setBookingError(null);
  };

  return {
    // Device
    device,
    loading,
    error,
    // Duration
    duration,
    setDuration,
    // Modal
    isModalOpen,
    setIsModalOpen,
    handleCloseModal,
    // Form
    formData,
    setFormData,
    handleInputChange,
    updateEndTime,
    // Step management
    step,
    setStep,
    // Payment (Step 2)
    qrisData,
    isCalculating,
    handleProceedToPayment,
    // Proof (Step 3)
    handleProceedToProof,
    // Submit (Step 4)
    dpProof,
    setDpProof,
    isSubmitting,
    bookingError,
    handleBookingClick,
    handleBookingSubmit,
  };
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

export const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

export function calculateEndTime(startTime, durationHours) {
  if (!startTime) return "";
  const [h, m] = startTime.split(":").map(Number);
  const totalMinutes = h * 60 + m + durationHours * 60;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

export function getMinTime(bookingDate) {
  const today = getTodayDateString();
  if (bookingDate === today || !bookingDate) {
    return getCurrentTime();
  }
  return undefined;
}

export function getFutureTime(addMinutes = 30) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + addMinutes);
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
