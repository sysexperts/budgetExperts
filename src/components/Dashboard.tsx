import { useState } from 'react'
import { FamilyMember, FixedCost, Subscription, InstallmentPlan } from '../types'
import { DollarSign, TrendingUp, CreditCard, Coins, Users, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react'

interface DashboardProps {
  familyMembers: FamilyMember[]
  fixedCosts: FixedCost[]
  subscriptions: Subscription[]
  installmentPlans: InstallmentPlan[]
}

export default function Dashboard({ familyMembers, fixedCosts, subscriptions, installmentPlans }: DashboardProps) {
  const [includeInstallments, setIncludeInstallments] = useState(true)

  // Calculate monthly totals
  const calculateMonthlyTotal = () => {
    const fixedTotal = fixedCosts.reduce((sum, cost) => {
      return sum + (cost.interval === 'monthly' ? cost.amount : cost.amount / 12)
    }, 0)

    const subsTotal = subscriptions.reduce((sum, sub) => {
      return sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12)
    }, 0)

    const installmentTotal = includeInstallments ? installmentPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0) : 0

    return fixedTotal + subsTotal + installmentTotal
  }

  const monthlyTotal = calculateMonthlyTotal()
  const subscriptionTotal = subscriptions.reduce((sum, sub) => {
    return sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12)
  }, 0)

  const installmentTotal = includeInstallments ? installmentPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0) : 0
  const fixedCostTotal = monthlyTotal - subscriptionTotal - installmentTotal

  // Calculate previous month (mock data for demonstration)
  const previousMonthTotal = monthlyTotal * 0.94 // Mock: 6% increase
  const monthlyChange = ((monthlyTotal - previousMonthTotal) / previousMonthTotal * 100).toFixed(1)

  // Calculate budget health
  const budgetHealth = monthlyTotal > 0 ? Math.max(0, 100 - (monthlyTotal / 5000 * 100)) : 100 // Mock budget limit of 5000€
  const savingsRate = monthlyTotal > 0 ? Math.max(0, ((5000 - monthlyTotal) / 5000 * 100)) : 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Budget Dashboard</h1>
              <p className="text-sm text-gray-500">Monat {new Date().toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Monthly Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-maxcrowds-green/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-maxcrowds-green" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                Number(monthlyChange) > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {Number(monthlyChange) > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                {Math.abs(Number(monthlyChange))}%
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Monatliche Ausgaben</p>
              <p className="text-2xl font-bold text-gray-900">€{monthlyTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">vs. €{previousMonthTotal.toFixed(2)} letztes Monat</p>
            </div>
          </div>

          {/* Budget Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className={`text-sm font-medium ${
                budgetHealth > 70 ? 'text-green-600' : budgetHealth > 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {budgetHealth > 70 ? 'Gut' : budgetHealth > 40 ? 'OK' : 'Kritisch'}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Budget-Gesundheit</p>
              <p className="text-2xl font-bold text-gray-900">{budgetHealth.toFixed(0)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    budgetHealth > 70 ? 'bg-green-500' : budgetHealth > 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${budgetHealth}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">{subscriptions.length} aktiv</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Abonnements</p>
              <p className="text-2xl font-bold text-gray-900">€{subscriptionTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{((subscriptionTotal / monthlyTotal) * 100).toFixed(1)}% der Ausgaben</p>
            </div>
          </div>

          {/* Installment Plans */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Coins className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">{installmentPlans.length} aktiv</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ratenpläne</p>
              <p className="text-2xl font-bold text-gray-900">€{installmentTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">{((installmentTotal / monthlyTotal) * 100).toFixed(1)}% der Ausgaben</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Expense Breakdown Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Ausgaben-Verteilung</h2>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInstallments}
                      onChange={(e) => setIncludeInstallments(e.target.checked)}
                      className="w-4 h-4 text-maxcrowds-green border-gray-300 rounded focus:ring-maxcrowds-green mr-2"
                    />
                    <span className="text-sm text-gray-600">Ratenpläne einbeziehen</span>
                  </label>
                </div>
              </div>
              
              {/* Simple Bar Chart Representation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-maxcrowds-green rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Fixkosten</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-maxcrowds-green h-2 rounded-full transition-all duration-500"
                        style={{ width: `${monthlyTotal > 0 ? (fixedCostTotal / monthlyTotal * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-20 text-right">€{fixedCostTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Abonnements</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${monthlyTotal > 0 ? (subscriptionTotal / monthlyTotal * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-20 text-right">€{subscriptionTotal.toFixed(2)}</span>
                  </div>
                </div>

                {includeInstallments && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Ratenpläne</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${monthlyTotal > 0 ? (installmentTotal / monthlyTotal * 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-20 text-right">€{installmentTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tagesdurchschnitt</p>
                    <p className="text-lg font-semibold text-gray-900">€{(monthlyTotal / 30).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sparquote</p>
                    <p className="text-lg font-semibold text-green-600">{savingsRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Verbleibend</p>
                    <p className="text-lg font-semibold text-gray-900">€{(5000 - monthlyTotal).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Family Members */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Familienmitglieder</h2>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {familyMembers.length > 0 ? (
                  familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-maxcrowds-green/20 rounded-full flex items-center justify-center">
                          <span className="text-maxcrowds-green font-semibold text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          {member.role && (
                            <p className="text-xs text-gray-500">{member.role}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">€0.00</p>
                        <p className="text-xs text-gray-500">dieser Monat</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Keine Familienmitglieder</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 p-3 bg-maxcrowds-green text-white rounded-lg hover:bg-maxcrowds-green-hover transition-colors">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Ausgabe hinzufügen</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Bericht exportieren</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Zusammenfassung</h3>
              <p className="text-sm text-gray-600">
                Dein Budget ist {budgetHealth > 70 ? 'im grünen Bereich' : budgetHealth > 40 ? 'im gelben Bereich' : 'im kritischen Bereich'}.
                {savingsRate > 20 && ' Du sparst gut!'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">€{monthlyTotal.toFixed(2)}</p>
              <p className="text-sm text-gray-500">von €5,000.00 Budget</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
