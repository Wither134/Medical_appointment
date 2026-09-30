interface StatCardProps {
  label: string
  value: string | number
  icon: string
  subtext?: string
  accent?: string
}

export function StatCard({ label, value, icon, subtext, accent = 'text-blue-600' }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}
