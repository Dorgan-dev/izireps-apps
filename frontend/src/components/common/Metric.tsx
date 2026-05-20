import React from 'react'

interface MetricProps {
  title: string
  amount?: number
  icon?: React.ReactNode

  // tambahan custom color
  iconBg?: string
  iconColor?: string
}

const Metric: React.FC<MetricProps> = ({
  title,
  amount,
  icon,

  iconBg = 'bg-gray-100 dark:bg-gray-800',
  iconColor = 'text-gray-700 dark:text-white',
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-4">
        
        {/* Icon */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

        {/* Content */}
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>

          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
            {amount}
          </h4>
        </div>
      </div>
    </div>
  )
}

export default Metric