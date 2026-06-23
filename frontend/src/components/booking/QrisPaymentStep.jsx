import React from "react";
// 1. Hapus QrCode dari lucide-react agar tidak bentrok
// import { QrCode } from 'lucide-react';

// 2. Import QRCodeSVG dari library generator QR Code yang baru diinstal
import { QRCodeSVG } from "qrcode.react";

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const QrisPaymentStep = ({
  dpAmount,
  estimatedCost,
  qrisString,
  qrisAvailable,
  onProceedToProof,
  onBack,
}) => {
  return (
    <div className="qris-payment-step">
      {/* Info Biaya */}
      <div className="cost-summary">
        {estimatedCost !== null && (
          <div className="cost-row">
            <span className="cost-label">Estimasi Total</span>
            <span className="cost-value">{formatRupiah(estimatedCost)}</span>
          </div>
        )}
        <div className="cost-row cost-row--dp">
          <span className="cost-label">Down Payment (DP)</span>
          <span className="cost-value cost-value--highlight">
            {formatRupiah(dpAmount)}
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className="qris-container">
        {qrisAvailable && qrisString ? (
          <>
            <p className="qris-instruction">
              Scan QR di bawah ini menggunakan aplikasi e-wallet atau m-banking
              Anda
            </p>
            <div className="qris-code-wrapper">
              {/* 3. Gunakan <QRCodeSVG /> di sini. Semua properti Anda sekarang valid dan didukung */}
              <QRCodeSVG
                value={qrisString}
                size={220}
                bgColor="#ffffff"
                fgColor="#111827"
                level="M"
              />
            </div>
            <div className="qris-badges">
              <span className="qris-badge">GoPay</span>
              <span className="qris-badge">OVO</span>
              <span className="qris-badge">Dana</span>
              <span className="qris-badge">ShopeePay</span>
              <span className="qris-badge">m-Banking</span>
            </div>
            <p className="qris-amount-label">
              Nominal: <strong>{formatRupiah(dpAmount)}</strong>
            </p>
          </>
        ) : (
          <div className="qris-unavailable">
            <span className="qris-unavailable-icon">⚠️</span>
            <p>QRIS belum dikonfigurasi oleh pemilik toko.</p>
            <p className="qris-unavailable-sub">
              Silakan hubungi kasir untuk melakukan pembayaran.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="payment-actions">
        <button type="button" className="btn btn--outline" onClick={onBack}>
          ← Kembali
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onProceedToProof}
        >
          Sudah Bayar → Upload Bukti
        </button>
      </div>
    </div>
  );
};

export default QrisPaymentStep;
