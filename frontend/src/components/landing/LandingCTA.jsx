import { REVIEWS } from "./data";
import SectionHeader from "./SectionHeader";
import { Star } from "lucide-react";

export default function LandingCTA() {
  return (
    <>
      {/* ── Reviews Section ── */}
      <section id="kontak" className="bg-base-100 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Ulasan Pelanggan"
            title="Dipercaya oleh banyak pelanggan"
            sub="Ini yang mereka rasakan setelah menggunakan layanan kami."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-theme-xs"
              >
                {/* Stars */}
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < r.rating
                          ? "fill-warning text-warning"
                          : "fill-base-content/20 text-base-content/20"
                      }
                    />
                  ))}
                </div>
                {/* Quote */}
                <p className="mb-4 text-sm leading-relaxed text-base-content/80">
                  "{r.comment}"
                </p>
                {/* Reviewer */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-base-content">
                      {r.name}
                    </p>
                    <p className="text-xs text-base-content/60">
                      {r.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
