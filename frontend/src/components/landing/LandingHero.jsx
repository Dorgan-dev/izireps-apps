import { useNavigate } from "react-router-dom";
import { CalendarCheck, ArrowRight } from "lucide-react";

export default function LandingHero() {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-white pt-20 pb-12 dark:bg-gray-900 sm:pt-24 lg:min-h-screen lg:pt-28 lg:pb-20"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(70,95,255,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Container */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between lg:gap-16">
          {/* TEXT */}
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:max-w-2xl lg:items-start lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl xl:text-6xl">
              Booking PlayStation
              <br />
              jadi lebih <span className="text-brand-500">iZi</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-500 dark:text-gray-400 sm:text-lg lg:text-xl">
              Mau main PS tapi bingung cari tempat kosong?{" "}
              <br className="hidden sm:inline" />
              Tenang, kan ada iZi. <br />
              <span className="font-semibold text-emerald-500 dark:text-emerald-400">
                Booking gampang, hati senang.
              </span>
            </p>

            {/* CTA */}
            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row lg:justify-start">
              <button
                onClick={() => navigate("/devices")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg sm:w-auto"
              >
                <CalendarCheck size={18} />
                Mulai Booking
              </button>

              <button
                onClick={() => navigate("/schedule")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.07] sm:w-auto"
              >
                Lihat Jadwal
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* IMAGE */}
          <div className="order-1 w-full lg:order-2 lg:w-1/2">
            <div className="relative mx-auto w-full max-w-full sm:max-w-2xl lg:max-w-xl xl:max-w-2xl transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative rounded-2xl border border-gray-200 bg-gray-50/60 p-3 shadow-xl backdrop-blur-sm dark:border-gray-800 dark:bg-gray-800/30">
                <div className="absolute -left-px -top-px h-10 w-10 rounded-tl-2xl border-l border-t border-brand-500/40" />

                <img
                  src="/images/izi1.png"
                  alt="iZiReps PlayStation Preview"
                  className="h-auto w-full rounded-xl object-contain shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
