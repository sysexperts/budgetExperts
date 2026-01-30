import { useState } from 'react'
import { ExpenseHistory } from './ExpenseTracker'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface ExpenseChartProps {
  history: ExpenseHistory[]
  currentTotal: number
  budgetLimit: number
}

export default function ExpenseChart({ history, currentTotal, budgetLimit }: ExpenseChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day')
  const [hoveredPoint, setHoveredPoint] = useState<ExpenseHistory | null>(null)

  // Filter history based on selected period
  const getFilteredHistory = () => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (selectedPeriod) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1)
        break
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
    }
    
    return history.filter(entry => new Date(entry.date) >= cutoffDate)
  }

  // Calculate chart dimensions
  const filteredHistory = getFilteredHistory()
  const maxAmount = Math.max(...filteredHistory.map(h => h.totalAmount), budgetLimit, currentTotal)
  const minAmount = Math.min(...filteredHistory.map(h => h.totalAmount), 0)
  const range = maxAmount - minAmount || 1

  // Generate chart points
  const chartHeight = 150
  const chartWidth = 600
  const padding = 30

  const chartPoints = filteredHistory.map((entry, index) => {
    const x = padding + (index / Math.max(filteredHistory.length - 1, 1)) * (chartWidth - 2 * padding)
    const y = padding + ((maxAmount - entry.totalAmount) / range) * (chartHeight - 2 * padding)
    return { x, y, entry }
  })

  // Generate path for the line
  const pathData = chartPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  // Generate area path
  const areaPathData = `${pathData} L ${chartPoints[chartPoints.length - 1]?.x || padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Ausgaben-Verlauf</h3>
          <p className="text-xs text-gray-500">Jede Änderung wird protokolliert</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <div className="flex space-x-1">
            {(['day', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-maxcrowds-green text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period === 'day' ? 'Tag' : period === 'week' ? 'Woche' : 'Monat'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg 
          width="100%" 
          height={chartHeight} 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const y = padding + (percent / 100) * (chartHeight - 2 * padding)
            const amount = maxAmount - (percent / 100) * range
            return (
              <g key={percent}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  €{amount.toFixed(0)}
                </text>
              </g>
            )
          })}

          {/* Budget limit line */}
          <line
            x1={padding}
            y1={padding + ((maxAmount - budgetLimit) / range) * (chartHeight - 2 * padding)}
            x2={chartWidth - padding}
            y2={padding + ((maxAmount - budgetLimit) / range) * (chartHeight - 2 * padding)}
            stroke="#07B0AA"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text
            x={chartWidth - padding + 10}
            y={padding + ((maxAmount - budgetLimit) / range) * (chartHeight - 2 * padding) + 4}
            className="text-xs fill-maxcrowds-green"
          >
            Budget
          </text>

          {/* Area under the line */}
          <path
            d={areaPathData}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />

          {/* Data points */}
          {chartPoints.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3b82f6"
              className="cursor-pointer hover:r-6"
              onMouseEnter={() => setHoveredPoint(point.entry)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg z-10">
            <div className="flex items-center space-x-2 mb-1">
              {hoveredPoint.changeType === 'increase' ? (
                <TrendingUp className="w-3 h-3 text-red-500" />
              ) : hoveredPoint.changeType === 'decrease' ? (
                <TrendingDown className="w-3 h-3 text-green-500" />
              ) : (
                <Activity className="w-3 h-3 text-blue-500" />
              )}
              <span className="text-xs font-medium text-gray-900">
                {hoveredPoint.description}
              </span>
            </div>
            <div className="text-xs text-gray-600 space-y-0.5">
              <div>Betrag: €{hoveredPoint.totalAmount.toFixed(2)}</div>
              <div>Änderung: €{hoveredPoint.changeAmount.toFixed(2)} ({hoveredPoint.changePercentage.toFixed(1)}%)</div>
              <div>Datum: {new Date(hoveredPoint.date).toLocaleString('de-DE')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Aktueller Betrag</p>
          <p className="text-sm font-semibold text-gray-900">€{currentTotal.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Budget-Limit</p>
          <p className="text-sm font-semibold text-maxcrowds-green">€{budgetLimit.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Änderungen</p>
          <p className="text-sm font-semibold text-blue-600">{filteredHistory.length}</p>
        </div>
      </div>
    </div>
  )
}
