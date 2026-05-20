import { STEPS } from './data';
import { ArrowRight } from 'lucide-react';
import SectionHeader from './SectionHeader';

export default function LandingWorkflow() {
  return (
    <section id="alur" className="py-20 px-6 border-t border-gray-800 bg-gray-900/40">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          label="Alur Kerja"
          title="Dari booking sampai selesai"
          sub="Proses sederhana yang mudah diikuti kasir setiap harinya."
        />
        <div className="flex flex-wrap items-start justify-center gap-0">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-start">
              <div className="text-center w-36 px-2">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold mx-auto mb-3">
                  {step.num}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight size={16} className="text-gray-700 mt-2.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
