import React, { useEffect, useState } from "react";
import { settingsApi } from "../../services/api";

const OwnerSettings = () => {
  const [qrisString, setQrisString] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    settingsApi
      .getAll()
      .then((res) => {
        const data = res.data.data;
        setQrisString(data.qris_string ?? "");
        setStoreName(data.store_name ?? "");
      })
      .catch(() =>
        setMessage({ type: "error", text: "Gagal memuat pengaturan." }),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await settingsApi.update({
        qris_string: qrisString || undefined,
        store_name: storeName || undefined,
      });
      setMessage({ type: "success", text: "Pengaturan berhasil disimpan." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Gagal menyimpan pengaturan.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner" />
        <p>Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="owner-settings">
      <div className="settings-header">
        <h1 className="settings-title">Pengaturan Toko</h1>
        <p className="settings-subtitle">
          Kelola konfigurasi toko dan pembayaran QRIS
        </p>
      </div>

      <form className="settings-form" onSubmit={handleSave}>
        {/* General Settings */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <span className="settings-section-icon">🏪</span>
            Informasi Toko
          </h2>
          <div className="form-group">
            <label htmlFor="store_name" className="form-label">
              Nama Toko
            </label>
            <input
              id="store_name"
              type="text"
              className="form-input"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="contoh: IZI PLAYSTATION"
              maxLength={100}
            />
          </div>
        </section>

        {/* QRIS Settings */}
        <section className="settings-section">
          <h2 className="settings-section-title">
            <span className="settings-section-icon">📱</span>
            Pengaturan QRIS
          </h2>
          <p className="settings-section-desc">
            Tempel string QRIS dari bank Anda di bawah ini. String ini akan
            digunakan untuk generate QR Code pembayaran secara otomatis dengan
            nominal DP yang sesuai.
          </p>
          <div className="form-group">
            <label htmlFor="qris_string" className="form-label">
              QRIS String
              <span className="form-label-hint">
                (dari aplikasi/portal bank Anda)
              </span>
            </label>
            <textarea
              id="qris_string"
              className="form-input form-textarea"
              value={qrisString}
              onChange={(e) => setQrisString(e.target.value)}
              placeholder="00020101021126..."
              rows={5}
              spellCheck={false}
            />

            <p className="form-hint">
              String QRIS biasanya diawali dengan <code>000201</code> dan
              berakhir dengan 4 karakter CRC. Dapatkan dari portal QRIS
              bank/acquirer Anda.
            </p>
          </div>

          {/* Preview status */}
          <div
            className={`qris-status ${qrisString.trim().length > 50 ? "qris-status--ready" : "qris-status--empty"}`}
          >
            {qrisString.trim().length > 50 ? (
              <>
                <span className="qris-status-dot qris-status-dot--green" />
                <span>
                  QRIS string valid — pelanggan dapat melakukan pembayaran QR
                </span>
              </>
            ) : (
              <>
                <span className="qris-status-dot qris-status-dot--red" />
                <span>
                  QRIS belum dikonfigurasi — pelanggan tidak dapat scan QR saat
                  booking
                </span>
              </>
            )}
          </div>
        </section>

        {/* Feedback message */}
        {message && (
          <div className={`settings-message settings-message--${message.type}`}>
            {message.type === "success" ? "✅" : "❌"} {message.text}
          </div>
        )}

        <div className="settings-actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OwnerSettings;
