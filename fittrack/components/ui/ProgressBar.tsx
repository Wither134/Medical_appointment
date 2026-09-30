interface ProgressBarProps {
  value: number        // 0–100
  color?: string
  height?: string
  showLabel?: boolean
}

export function ProgressBar({ value, color = 'bg-blue-600', height = 'h-2', showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{pct}%</p>
      )}
    </div>
  )
}
