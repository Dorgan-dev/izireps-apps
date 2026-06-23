export default function SectionHeader({ label, title, sub }) {
  return (
    <div className="mb-10 text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-500 dark:text-brand-400">
        {label}
      </p>
      <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {sub}
        </p>
      )}
    </div>
  );
}
