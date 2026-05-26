import { useEffect, useRef, useState } from 'react';
import { DEVICES, statusConfig } from './data';

function useLiveTimers(initial: (string | null)[]) {
  const toSecs = (t: string) => {
    const [h, m, s] = t.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };
  const fmt = (n: number) => {
    const h = Math.floor(n / 3600);
    const m = Math.floor((n % 3600) / 60);
    const s = n % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const secsRef = useRef(initial.map((t) => (t ? toSecs(t) : null)));
  const [display, setDisplay] = useState(initial);

  useEffect(() => {
    const id = setInterval(() => {
      secsRef.current = secsRef.current.map((s) => (s !== null ? s + 1 : null));
      setDisplay(secsRef.current.map((s) => (s !== null ? fmt(s) : null)));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return display;
}

export default function DevicePreview() {
  const timers = useLiveTimers(DEVICES.map((d) => d.timer));

  return (
    <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900">
      {/* Fake browser chrome */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-950">
        <span className="h-3 w-3 rounded-full bg-error-400/70" />
        <span className="h-3 w-3 rounded-full bg-warning-400/70" />
        <span className="h-3 w-3 rounded-full bg-success-400/70" />
        <span className="mx-auto text-xs text-gray-400 dark:text-gray-600">
          Monitor Perangkat — Kasir
        </span>
      </div>

      {/* Device grid */}
      <div className="grid grid-cols-4 gap-2.5 p-4">
        {DEVICES.map((d, i) => {
          const cfg = statusConfig[d.status];
          return (
            <div
              key={d.name}
              className={`rounded-xl border ${cfg.border} bg-gray-50 p-3 text-center dark:bg-gray-950`}
            >
              <div className="mb-1 text-xl">
                {d.status === 'maintenance' ? '🔧' : d.type === 'PS5' ? '🎮' : '🕹️'}
              </div>
              <p className="text-[11px] font-medium leading-tight text-gray-800 dark:text-gray-200">
                {d.name}
              </p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.badgeBg} ${cfg.color}`}>
                {cfg.label}
              </span>
              {timers[i] && (
                <p className="mt-0.5 font-mono text-[9px] text-gray-400 dark:text-gray-600">
                  {timers[i]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 border-t border-gray-100 dark:border-gray-800">
        {[
          { num: '3', label: 'Tersedia', color: 'text-success-600 dark:text-success-400' },
          { num: '3', label: 'Digunakan', color: 'text-brand-600 dark:text-brand-400' },
          { num: 'Rp 142.000', label: 'Pendapatan hari ini', color: 'text-gray-900 dark:text-white' },
        ].map((s, i) => (
          <div
            key={i}
            className={`py-3 text-center ${i < 2 ? 'border-r border-gray-100 dark:border-gray-800' : ''}`}
          >
            <p className={`text-base font-semibold ${s.color}`}>{s.num}</p>
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
