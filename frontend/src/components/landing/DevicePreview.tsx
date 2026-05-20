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
    <div className="mx-auto max-w-2xl mt-12 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Fake browser bar */}
      <div className="bg-gray-950 border-b border-gray-800 px-4 py-2.5 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="mx-auto text-xs text-gray-600">Monitor Perangkat — Kasir</span>
      </div>

      {/* Device grid */}
      <div className="grid grid-cols-4 gap-3 p-4">
        {DEVICES.map((d, i) => {
          const cfg = statusConfig[d.status];
          return (
            <div
              key={d.name}
              className={`bg-gray-950 border ${cfg.border} rounded-xl p-3 text-center`}
            >
              <div className="text-xl mb-1">{d.status === 'maintenance' ? '🔧' : d.type === 'PS5' ? '🎮' : '🕹️'}</div>
              <p className="text-xs font-medium text-gray-200 leading-tight">{d.name}</p>
              <p className={`text-[10px] mt-1 ${cfg.color}`}>{cfg.label}</p>
              {timers[i] && (
                <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{timers[i]}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 border-t border-gray-800">
        {[
          { num: '3', label: 'Tersedia',          color: 'text-emerald-400' },
          { num: '3', label: 'Digunakan',          color: 'text-indigo-400' },
          { num: 'Rp 142.000', label: 'Pendapatan hari ini', color: 'text-white' },
        ].map((s, i) => (
          <div key={i} className={`py-3 text-center ${i < 2 ? 'border-r border-gray-800' : ''}`}>
            <p className={`text-base font-semibold ${s.color}`}>{s.num}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
