import { REVIEWS } from "./data";
import SectionHeader from "./SectionHeader";
import { Star } from "lucide-react";

export default function LandingCTA() {
  return (
    <>
      {/* ── Reviews Section ── */}
      <section id="kontak" className="bg-white py-16 dark:bg-gray-900 sm:py-20">
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
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Stars */}
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < r.rating
                          ? "fill-warning-400 text-warning-400"
                          : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                      }
                    />
                  ))}
                </div>
                {/* Quote */}
                <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  "{r.comment}"
                </p>
                {/* Reviewer */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {r.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
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
