import { STEPS } from "../../components/landing/data";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import SectionHeader from "../../components/landing/SectionHeader";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <>
      <PageMeta title="IZIReps | About" description="About IZIReps" />
      <PageBreadcrumb items={[{ label: "About", path: "/about" }]} />
      <section id="about" className="bg-base-100 py-16 sm:py-20 rounded-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* About blurb */}
          <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Tentang Kami
              </p>
              <h2 className="mb-4 text-3xl font-bold leading-tight text-base-content sm:text-4xl">
                Platform billing rental PS yang modern
              </h2>
              <p className="mb-4 leading-relaxed text-base-content/70">
                iZiReps lahir dari kebutuhan nyata para pelaku usaha rental
                PlayStation yang ingin mengelola operasional harian dengan lebih
                terstruktur, cepat, dan efisien—tanpa perlu keahlian teknis
                khusus.
              </p>
              <p className="leading-relaxed text-base-content/70">
                Kami menyediakan solusi all-in-one: dari sesi gaming real-time,
                booking online dengan DP, hingga integrasi FnB dan laporan
                pendapatan harian.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "3 Tahun", label: "Pengalaman di industri rental PS" },
                { num: "200+", label: "Pelanggan puas di seluruh Indonesia" },
                { num: "24/7", label: "Dukungan teknis siap membantu" },
                { num: "Gratis", label: "Uji coba tanpa kartu kredit" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-base-300 bg-base-200 p-5"
                >
                  <p className="text-2xl font-bold text-primary">{item.num}</p>
                  <p className="mt-1 text-xs leading-snug text-base-content/70">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow steps */}
          <SectionHeader
            label="Alur Kerja"
            title="Dari booking sampai selesai"
            sub="Proses sederhana yang mudah diikuti kasir setiap harinya."
          />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-0">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="flex items-start sm:flex-col sm:items-center"
              >
                <div className="relative flex flex-col sm:flex-row sm:items-center">
                  <div className="flex flex-col items-center sm:items-center sm:w-36 sm:px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content shadow-theme-sm">
                      {step.num}
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="text-sm font-semibold text-base-content">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-base-content/70">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    size={16}
                    className="mx-2 mt-2.5 hidden shrink-0 text-base-300 sm:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}