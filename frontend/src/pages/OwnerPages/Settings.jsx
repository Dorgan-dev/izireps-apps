import React, { useEffect, useState } from "react";
import { settingsApi } from "../../services/api";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Spinner } from "../../components/common";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { TbBuildingStore , TbQrcode } from "react-icons/tb";

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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Memuat pengaturan...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageBreadcrumb
        items={[
          {
            label: "Pengaturan",
            path: "/owner/settings",
          },
        ]}
        pageDescription="Kelola konfigurasi toko dan pembayaran QRIS"
      />

      <div className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl border ${
              message.type === "success"
                ? "bg-success-50 text-success-700 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20"
                : "bg-error-50 text-error-700 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <ComponentCard title="Informasi Toko">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
                <TbBuildingStore  size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Profil Toko
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Atur identitas utama untuk toko Anda
                </p>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="mb-4">
                <Label htmlFor="store_name">Nama Toko</Label>
                <Input
                  id="store_name"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="contoh: IZI PLAYSTATION"
                  maxLength="100"
                />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Pengaturan QRIS">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400">
                <TbQrcode size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Integrasi QRIS
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Konfigurasi pembayaran otomatis via QRIS dinamis
                </p>
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="mb-4">
                <Label htmlFor="qris_string">
                  QRIS String{" "}
                  <span className="text-gray-400 font-normal">
                    (dari aplikasi/portal bank Anda)
                  </span>
                </Label>
                <TextArea
                  id="qris_string"
                  value={qrisString}
                  onChange={(e) => setQrisString(e)}
                  placeholder="00020101021126..."
                  rows={5}
                  spellCheck={false}
                  hint="String QRIS biasanya diawali dengan 000201 dan berakhir dengan 4 karakter CRC. Dapatkan dari portal QRIS bank/acquirer Anda."
                />
              </div>

              <div
                className={`flex items-center gap-3 mt-6 p-4 rounded-xl border ${
                  qrisString.trim().length > 50
                    ? "bg-success-50 border-success-200 dark:bg-success-500/10 dark:border-success-500/20"
                    : "bg-warning-50 border-warning-200 dark:bg-warning-500/10 dark:border-warning-500/20"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    qrisString.trim().length > 50
                      ? "bg-success-500"
                      : "bg-warning-500"
                  }`}
                />
                <span
                  className={`text-sm ${
                    qrisString.trim().length > 50
                      ? "text-success-700 dark:text-success-400"
                      : "text-warning-700 dark:text-warning-400"
                  }`}
                >
                  {qrisString.trim().length > 50
                    ? "QRIS string terisi — pelanggan dapat melakukan pembayaran QR"
                    : "QRIS belum dikonfigurasi — pelanggan tidak dapat scan QR saat booking"}
                </span>
              </div>
            </div>
          </ComponentCard>

          <div className="flex justify-end pt-4 pb-10">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default OwnerSettings;
