import { Link } from "react-router";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  pageDescription?: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  pageDescription,
}) => {
  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Page Title (ambil item terakhir) */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {items[items.length - 1]?.label}
        </h2>

        {/* Breadcrumb */}
        <nav>
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
                  {/* Separator */}
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

                  {/* Item */}
                  {item.path && !isLast ? (
                    <Link
                      to={item.path}
                      className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-800 dark:text-white/90 font-medium">
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Description */}
      {pageDescription && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {pageDescription}
        </p>
      )}
    </div>
  );
};

export default PageBreadcrumb;