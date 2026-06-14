import { Link, useNavigate } from "react-router";
import { IoArrowBack } from "react-icons/io5";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  pageDescription?: string;
  showBackButton?: boolean;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  pageDescription,
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Tombol Kembali */}
        <div>
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-gray-500 dark:text-white/90 dark:hover:text-white/70 transition-colors cursor-pointer"
              title="Kembali ke halaman sebelumnya"
              aria-label="Kembali"
            >
              <IoArrowBack size={20} />
              <span>Kembali</span>
            </button>
          )}
        </div>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                to="/"
              >
                Home
              </Link>
            </li>
            
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <li key={index} className="flex items-center gap-1.5">
                  {/* Separator SVG */}
                  <svg
                    className="stroke-current text-gray-400"
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Item Link atau Text Aktif */}
                  {item.path && !isLast ? (
                    <Link
                      to={item.path}
                      className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90" aria-current="page">
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
      {/* Description Section */}
      {pageDescription && (
        ""
      )}
    </div>
  );
};

export default PageBreadcrumb;