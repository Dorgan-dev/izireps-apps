export default function LandingFooter() {
  return (
    <footer className="border-t border-gray-800 px-6 py-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm font-bold">
          PS<span className="text-emerald-400">Rental</span>
        </span>
        <p className="text-xs text-gray-600">Sistem billing rental PlayStation berbasis web</p>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} PSRental</p>
      </div>
    </footer>
  );
}
