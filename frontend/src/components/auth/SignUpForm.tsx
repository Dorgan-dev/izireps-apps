import { useGoogleLogin } from '@react-oauth/google';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuthStore } from "../../store/authStore";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /**
   * Banner "Akun sudah terdaftar".
   * Saat already_registered=true dari backend, simpan user sementara di sini
   * dan tampilkan banner dengan tombol "Lanjutkan".
   */
  const [alreadyRegisteredUser, setAlreadyRegisteredUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const navigate = useNavigate();
  const { register, loginWithGoogle, isLoading } = useAuthStore();

  // ── Google Register (khusus customer) ─────────────────────────────────────
  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setAlreadyRegisteredUser(null);
      try {
        // fromRegister=true → backend buat customer baru jika belum ada
        const { alreadyRegistered } = await loginWithGoogle(
          tokenResponse.access_token,
          true,  // rememberMe
          true   // fromRegister
        );

        if (alreadyRegistered) {
          const { user } = useAuthStore.getState();
          setAlreadyRegisteredUser({ name: user?.name ?? "", email: user?.email ?? "" });
          return;
        }

        navigate("/");
      } catch (err: any) {
        setError(err.response?.data?.message || "Google Auth gagal.");
      }
    },
    onError: () => {
      setError("Login Google dibatalkan atau gagal.");
    },
  });

  // ── Email/Password Register ───────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAlreadyRegisteredUser(null);

    if (!isChecked) {
      setError("Kamu harus menyetujui Syarat dan Ketentuan.");
      return;
    }

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await register(fullName, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registrasi gagal, coba lagi.");
    }
  };

  // ── Lanjutkan login (dari banner already_registered) ──────────────────────
  const handleContinueLogin = () => {
    // Token & user sudah ada di store dari customerGoogleAuth
    navigate("/");
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Kembali ke halaman utama
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Daftar Akun
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Masukkan data kamu untuk membuat akun baru!
            </p>
          </div>

          {/* ── Banner: Akun sudah terdaftar ── */}
          {alreadyRegisteredUser && (
            <div className="mb-5 p-4 rounded-xl border border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/30">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300 mb-1">
                Akun ini sudah terdaftar
              </p>
              <p className="text-xs text-brand-600 dark:text-brand-400 mb-3">
                <span className="font-semibold">{alreadyRegisteredUser.email}</span> sudah memiliki
                akun. Klik tombol di bawah untuk melanjutkan masuk dengan akun ini.
              </p>
              <button
                type="button"
                onClick={handleContinueLogin}
                className="w-full py-2 px-4 rounded-lg text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors"
              >
                Lanjutkan masuk dengan akun ini
              </button>
            </div>
          )}

          <div>
            {/* ── Form Register ── */}
            <form onSubmit={handleRegister}>
              <div className="space-y-5">
                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>Nama Depan <span className="text-error-500">*</span></Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Masukkan nama depan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>Nama Belakang <span className="text-error-500">*</span></Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      placeholder="Masukkan nama belakang"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email <span className="text-error-500">*</span></Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Masukkan email kamu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      placeholder="Masukkan password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="relative py-3 sm:py-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                      Atau
                    </span>
                  </div>
                </div>

                {/* ── Tombol Google ── */}
                <div className="grid grid-cols-1 gap-3 sm:gap-5">
                  <button
                    type="button"
                    onClick={() => handleGoogleAuth()}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 disabled:opacity-50"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z" fill="#4285F4" />
                      <path d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z" fill="#34A853" />
                      <path d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z" fill="#FBBC05" />
                      <path d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z" fill="#EB4335" />
                    </svg>
                    Daftar dengan Google
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                    id="terms-conditions"
                  />
                  <label
                    htmlFor="terms-conditions"
                    className="inline-block font-normal text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                  >
                    Dengan mendaftar, kamu menyetujui{" "}
                    <span className="text-gray-800 dark:text-white/90">Syarat & Ketentuan</span>
                    {" "}dan{" "}
                    <span className="text-gray-800 dark:text-white">Kebijakan Privasi</span>
                  </label>
                </div>

                <div>
                  <Button className="w-full" size="md" type="submit" loading={isLoading}>
                    Daftar
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-semibold"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
