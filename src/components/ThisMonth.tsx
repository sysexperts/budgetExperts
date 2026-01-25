import { useState, useEffect } from 'react'
import { MonthSummary } from '../types'

export default function ThisMonth() {
  const [summary, setSummary] = useState<MonthSummary | null>(null)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/month-summary', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      })
      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error('Error loading month summary:', error)
    }
  }

  if (!summary) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">This Month</h1>
        <p className="text-gray-600 mt-1">Overview of current month expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ${summary.totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ${summary.paid.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Open</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            ${summary.open.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Remaining</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            ${summary.remaining.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transactions</h2>
        <div className="space-y-2">
          {summary.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{transaction.name}</p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${transaction.amount.toFixed(2)}</p>
                <p className={`text-sm ${transaction.paid ? 'text-green-600' : 'text-orange-600'}`}>
                  {transaction.paid ? 'Paid' : 'Open'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
