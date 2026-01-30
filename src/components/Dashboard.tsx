import { useState } from 'react'
import { FamilyMember, FixedCost, Subscription, InstallmentPlan } from '../types'
import { DollarSign, TrendingUp, CreditCard, Coins, Users, ArrowUp, ArrowDown, MoreHorizontal, PieChart, BarChart3, Activity, Target, Zap } from 'lucide-react'

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

  // Calculate percentages for charts
  const fixedCostPercentage = monthlyTotal > 0 ? (fixedCostTotal / monthlyTotal * 100) : 0
  const subscriptionPercentage = monthlyTotal > 0 ? (subscriptionTotal / monthlyTotal * 100) : 0
  const installmentPercentage = monthlyTotal > 0 ? (installmentTotal / monthlyTotal * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-maxcrowds-green to-maxcrowds-green-hover bg-clip-text text-transparent">
                Budget Dashboard
              </h1>
              <p className="text-sm text-gray-500">Monat {new Date().toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Main Metrics */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-maxcrowds-green via-maxcrowds-green/90 to-maxcrowds-green-hover rounded-3xl p-8 text-white shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="w-8 h-8" />
                  <div>
                    <p className="text-white/80 text-sm">Monatliche Ausgaben</p>
                    <p className="text-4xl font-bold">€{monthlyTotal.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  {Number(monthlyChange) > 0 ? (
                    <>
                      <ArrowUp className="w-4 h-4 text-red-300" />
                      <span className="text-red-300">+{Math.abs(Number(monthlyChange))}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4 text-green-300" />
                      <span className="text-green-300">-{Math.abs(Number(monthlyChange))}%</span>
                    </>
                  )}
                  <span className="text-white/60">vs. letztes Monat</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Target className="w-8 h-8" />
                </div>
                <p className="text-white/80 text-sm">Budget-Gesundheit</p>
                <p className="text-4xl font-bold">{budgetHealth.toFixed(0)}%</p>
                <div className="w-full bg-white/20 rounded-full h-3 mt-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-700 ${
                      budgetHealth > 70 ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                      budgetHealth > 40 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 
                      'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${budgetHealth}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex justify-end space-x-3 mb-2">
                  <Zap className="w-8 h-8" />
                </div>
                <p className="text-white/80 text-sm">Sparquote</p>
                <p className="text-4xl font-bold">{savingsRate.toFixed(1)}%</p>
                <p className="text-sm text-white/60">von €5,000 Budget</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Subscriptions */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6" />
                <div>
                  <p className="text-white/90 text-sm font-medium">Abonnements</p>
                  <p className="text-3xl font-bold">€{subscriptionTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1">
                <span className="text-sm font-medium">{subscriptions.length} aktiv</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${subscriptionPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/80 mt-2">{subscriptionPercentage.toFixed(1)}% der Ausgaben</p>
            </div>
          </div>

          {/* Installment Plans */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Coins className="w-6 h-6" />
                <div>
                  <p className="text-white/90 text-sm font-medium">Ratenpläne</p>
                  <p className="text-3xl font-bold">€{installmentTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1">
                <span className="text-sm font-medium">{installmentPlans.length} aktiv</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${installmentPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/80 mt-2">{installmentPercentage.toFixed(1)}% der Ausgaben</p>
            </div>
          </div>

          {/* Daily Average */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6" />
                <div>
                  <p className="text-white/90 text-sm font-medium">Tagesdurchschnitt</p>
                  <p className="text-3xl font-bold">€{(monthlyTotal / 30).toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-full px-3 py-1">
                <span className="text-sm font-medium">pro Tag</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-white/60">Woche</p>
                  <p className="text-lg font-semibold">€{(monthlyTotal / 30 * 7).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Jahr</p>
                  <p className="text-lg font-semibold">€{(monthlyTotal * 12).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60">Verbleibend</p>
                  <p className="text-lg font-semibold">€{(5000 - monthlyTotal).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Expense Breakdown with Visual Charts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <PieChart className="w-6 h-6 text-maxcrowds-green" />
                  Ausgaben-Verteilung
                </h2>
                <label className="flex items-center cursor-pointer bg-gray-50 rounded-lg px-3 py-2">
                  <input
                    type="checkbox"
                    checked={includeInstallments}
                    onChange={(e) => setIncludeInstallments(e.target.checked)}
                    className="w-4 h-4 text-maxcrowds-green border-gray-300 rounded focus:ring-maxcrowds-green mr-2"
                  />
                  <span className="text-sm text-gray-700">Ratenpläne einbeziehen</span>
                </label>
              </div>
              
              {/* Visual Chart Representation */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Donut Chart Simulation */}
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="16"
                          className="text-gray-200"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="16"
                          className="text-maxcrowds-green"
                          strokeDasharray={`${2 * Math.PI * 80 * (fixedCostPercentage / 100)} ${2 * Math.PI * 80}`}
                          transform="rotate(90)"
                          style={{ transformOrigin: 'center' }}
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="80"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="16"
                          className="text-purple-500"
                          strokeDasharray={`${2 * Math.PI * 80 * (subscriptionPercentage / 100)} ${2 * Math.PI * 80}`}
                          strokeDashoffset={`${2 * Math.PI * 80 * (fixedCostPercentage / 100)}`}
                          transform="rotate(90)"
                          style={{ transformOrigin: 'center' }}
                        />
                        {includeInstallments && (
                          <circle
                            cx="96"
                            cy="96"
                            r="80"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="16"
                            className="text-orange-500"
                            strokeDasharray={`${2 * Math.PI * 80 * (installmentPercentage / 100)} ${2 * Math.PI * 80}`}
                            strokeDashoffset={`${2 * Math.PI * 80 * ((fixedCostPercentage + subscriptionPercentage) / 100)}`}
                            transform="rotate(90)"
                            style={{ transformOrigin: 'center' }}
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">€{monthlyTotal.toFixed(0)}</p>
                          <p className="text-sm text-gray-500">Gesamt</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-maxcrowds-green rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Fixkosten</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">€{fixedCostTotal.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{fixedCostPercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Abonnements</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">€{subscriptionTotal.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{subscriptionPercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    {includeInstallments && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-700">Ratenpläne</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">€{installmentTotal.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{installmentPercentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-maxcrowds-green" />
                  Trend-Analyse
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Letzte 7 Tage</p>
                    <p className="text-xl font-bold text-maxcrowds-green">+€{(monthlyTotal * 0.23).toFixed(0)}</p>
                    <p className="text-xs text-gray-500">vs. Vorwoche</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Letzte 30 Tage</p>
                    <p className="text-xl font-bold text-maxcrowds-green">+€{(monthlyTotal * 0.06).toFixed(0)}</p>
                    <p className="text-xs text-gray-500">vs. Vormonat</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Prognose</p>
                    <p className="text-xl font-bold text-blue-600">€{(monthlyTotal * 1.12).toFixed(0)}</p>
                    <p className="text-xs text-gray-500">nächste 30 Tage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Family Members */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Users className="w-6 h-6 text-maxcrowds-green" />
                  Familienmitglieder
                </h2>
              </div>
              <div className="space-y-3">
                {familyMembers.length > 0 ? (
                  familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-maxcrowds-green/30 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-maxcrowds-green to-maxcrowds-green-hover rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{member.name}</p>
                          {member.role && (
                            <p className="text-sm text-gray-500">{member.role}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">€0.00</p>
                        <p className="text-xs text-gray-500">dieser Monat</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Keine Familienmitglieder</p>
                    <p className="text-sm text-gray-400 mt-2">Füge Mitglieder hinzu, um das Budget gemeinsam zu verwalten</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-maxcrowds-green to-maxcrowds-green-hover rounded-2xl shadow-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Schnellaktionen</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 p-4 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all border border-white/30">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium">Ausgabe hinzufügen</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 p-4 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-all border border-white/20">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Bericht exportieren</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Budget Zusammenfassung</h3>
              <p className="text-gray-300">
                Dein Budget ist {budgetHealth > 70 ? 'im grünen Bereich' : budgetHealth > 40 ? 'im gelben Bereich' : 'im kritischen Bereich'}.
                {savingsRate > 20 && ' Du sparst hervorragend gut!'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">€{monthlyTotal.toFixed(2)}</p>
              <p className="text-gray-400">von €5,000.00 Budget</p>
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Optimiert für maximale Einsparungen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
