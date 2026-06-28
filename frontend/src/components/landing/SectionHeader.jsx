export default function SectionHeader({ label, title, sub }) {
  return (
    <div className="mb-10 text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
        {label}
      </p>
      <h2 className="mb-3 text-2xl font-bold text-base-content sm:text-3xl">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-base-content/70">
          {sub}
        </p>
      )}
    </div>
  );
}
