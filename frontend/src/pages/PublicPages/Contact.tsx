import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Contact() {
    return (
        <section
            id="kontak"
            className="bg-gray-50 py-16 dark:bg-gray-950 sm:py-20"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-14 text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-500">
                        Hubungi Kami
                    </p>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                        Kami siap membantu bisnis rental PS Anda
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
                        Punya pertanyaan, butuh demo, atau ingin konsultasi? Tim iZiReps
                        siap membantu Anda kapan saja.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                                Informasi Kontak
                            </h3>

                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-xl bg-brand-100 p-3 text-brand-500 dark:bg-brand-500/10">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            Alamat
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Jl. Sudirman No. 123, Pekanbaru, Riau, Indonesia
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="rounded-xl bg-brand-100 p-3 text-brand-500 dark:bg-brand-500/10">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            Telepon
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            +62 812-3456-7890
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="rounded-xl bg-brand-100 p-3 text-brand-500 dark:bg-brand-500/10">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            Email
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            support@izireps.com
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="rounded-xl bg-brand-100 p-3 text-brand-500 dark:bg-brand-500/10">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            Jam Operasional
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Senin - Minggu, 08:00 - 22:00 WIB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Maps */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm dark:border-gray-800">
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
    );
}