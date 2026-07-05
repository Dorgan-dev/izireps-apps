import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <>
      <PageMeta title="IZIReps | Kontak" description="Silahkan hubungi Kami" />
      <PageBreadcrumb items={[{ label: "Contact", path: "/contact" }]}/>
      <section id="contact" className="bg-base-100 py-16 sm:py-20 rounded-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Hubungi Kami
            </p>
            <h2 className="mb-4 text-3xl font-bold text-base-content sm:text-4xl">
              Kami siap membantu bisnis rental PS Anda
            </h2>
            <p className="mx-auto max-w-2xl text-base-content/70">
              Punya pertanyaan, butuh demo, atau ingin konsultasi? Tim iZiReps
              siap membantu Anda kapan saja.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow-sm">
                <h3 className="mb-6 text-xl font-semibold text-base-content">
                  Informasi Kontak
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-base-content">
                        Alamat
                      </h4>
                      <p className="text-sm text-base-content/70">
                        Jl. Sudirman No. 123, Pekanbaru, Riau, Indonesia
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-base-content">
                        Telepon
                      </h4>
                      <p className="text-sm text-base-content/70">
                        +62 812-3456-7890
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-base-content">
                        Email
                      </h4>
                      <p className="text-sm text-base-content/70">
                        support@izireps.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-base-content">
                        Jam Operasional
                      </h4>
                      <p className="text-sm text-base-content/70">
                        Senin - Minggu, 08:00 - 22:00 WIB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Maps */}
            <div className="overflow-hidden rounded-2xl border border-base-300 shadow-sm">
              <iframe
                title="Lokasi iZiReps"
                src="https://www.google.com/maps?q=Rumbai,Riau&output=embed"
                width="100%"
                height="340"
                loading="lazy"
                className="border-0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
