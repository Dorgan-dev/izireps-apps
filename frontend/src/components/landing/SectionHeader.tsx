export default function SectionHeader({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="text-center mb-10">
      <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-2">{label}</p>
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      {sub && <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}
