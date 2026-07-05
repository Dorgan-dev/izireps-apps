import { useNavigate } from "react-router-dom";
import { CalendarCheck, ArrowRight } from "lucide-react";

export default function LandingHero() {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative flex min-h-[calc(100dvh-6rem)] lg:min-h-[calc(100vh-7rem)] lg:h-auto w-full items-center justify-center overflow-hidden bg-base-100 p-4 sm:p-6 lg:p-12 lg:py-16 rounded-2xl">

      {/* Background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(70,95,255,0.08) 0%, transparent 70%)"
      }} />

      {/* Container */}
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:justify-between lg:gap-12 w-full">

          {/* TEXT */}
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:max-w-xl lg:items-start lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-base-content sm:text-5xl lg:text-5xl xl:text-6xl leading-tight">
              Booking PlayStation
              <br />
              jadi lebih <span className="text-primary">iZi</span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-base-content/80 sm:text-base lg:text-lg">
              Mau main PS tapi bingung cari tempat kosong?{" "}
              <br className="hidden sm:inline" />
              Tenang, kan ada iZi. <br />
              <span className="font-semibold text-accent">
                Booking gampang, hati senang.
              </span>
            </p>

            {/* CTA */}
            <div className="mt-6 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row lg:justify-start">
              <button onClick={() => navigate("/devices")} className="btn btn-primary w-full sm:w-auto">
                <CalendarCheck size={18} /> Mulai Booking
              </button>

              <button onClick={() => navigate("/schedule")} className="btn btn-outline w-full sm:w-auto">
                Lihat Jadwal <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* IMAGE */}
          <div className="order-1 w-full max-w-xs sm:max-w-sm md:max-w-md lg:order-2 lg:w-1/2 lg:max-w-none flex justify-center h-full items-center">
            <div className="relative w-full h-full max-h-[70vh] transition-transform duration-300 hover:scale-[1.02]">
              <div className="relative h-full rounded-2xl border border-base-300 bg-base-200/50 p-2 sm:p-3 shadow-xl backdrop-blur-sm flex items-center justify-center">
                <div className="absolute -left-px -top-px h-10 w-10 rounded-tl-2xl border-l border-t border-primary/40" />
                <img src="/images/izi1.png" alt="iZiReps PlayStation Preview" className="h-auto max-h-[25vh] lg:h-full lg:max-h-full w-full rounded-xl object-contain shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}