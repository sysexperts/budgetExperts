import { useState } from 'react'
import { FamilyMember, FixedCost, Subscription, InstallmentPlan } from '../types'
import { DollarSign, TrendingUp, CreditCard, Coins, Users, MoreHorizontal, Target, Activity, Bell, Settings } from 'lucide-react'

interface DashboardProps {
  familyMembers: FamilyMember[]
  fixedCosts: FixedCost[]
  subscriptions: Subscription[]
  installmentPlans: InstallmentPlan[]
}

export default function Dashboard({ familyMembers, fixedCosts, subscriptions, installmentPlans }: DashboardProps) {
  const [includeInstallments, setIncludeInstallments] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showChartDetails, setShowChartDetails] = useState(false)

  // Calculate monthly totals first
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

  // Calculate percentages
  const fixedCostPercentage = monthlyTotal > 0 ? (fixedCostTotal / monthlyTotal * 100) : 0
  const subscriptionPercentage = monthlyTotal > 0 ? (subscriptionTotal / monthlyTotal * 100) : 0
  const installmentPercentage = monthlyTotal > 0 ? (installmentTotal / monthlyTotal * 100) : 0

  // Calculate budget health and remaining budget
  const calculateBudgetData = () => {
    // Get budgets from localStorage
    const storedBudgets = localStorage.getItem('budgets')
    let totalBudgetLimit = 5000 // Default fallback
    
    if (storedBudgets) {
      try {
        const budgets = JSON.parse(storedBudgets)
        const activeBudgets = budgets.filter((b: any) => b.isActive)
        
        // Calculate total monthly budget from active budgets
        totalBudgetLimit = activeBudgets.reduce((total: number, budget: any) => {
          const monthlyAmount = budget.type === 'yearly' ? budget.amount / 12 : budget.amount
          return total + monthlyAmount
        }, 0)
      } catch (error) {
        console.error('Error loading budgets:', error)
      }
    }
    
    return {
      budgetLimit: totalBudgetLimit,
      remainingBudget: totalBudgetLimit - monthlyTotal,
      budgetHealth: monthlyTotal > 0 ? Math.max(0, ((totalBudgetLimit - monthlyTotal) / totalBudgetLimit * 100)) : 100,
      savingsRate: monthlyTotal > 0 ? ((totalBudgetLimit - monthlyTotal) / totalBudgetLimit * 100) : 100
    }
  }

  const { budgetLimit, remainingBudget, budgetHealth, savingsRate } = calculateBudgetData()

  // Calculate real statistics (after monthlyTotal is defined)
  const calculateMonthlyChange = () => {
    // Mock previous month calculation (would normally come from historical data)
    const previousMonthTotal = monthlyTotal * 0.94 // Mock: 6% increase
    const change = ((monthlyTotal - previousMonthTotal) / previousMonthTotal * 100)
    return change
  }

  const calculateBudgetOptimization = () => {
    // Mock budget optimization based on categories
    const optimizationRate = fixedCosts.length > 0 ? -1.5 : 0
    return optimizationRate
  }

  const monthlyChange = calculateMonthlyChange()
  const budgetOptimization = calculateBudgetOptimization()

  // Quick Actions handlers
  const handleAddExpense = () => {
    // Navigate to Fixed Costs page to add expense
    window.location.href = '#/fixed-costs'
  }

  const handleExportReport = () => {
    // Generate and export report
    const reportData = {
      period: selectedPeriod,
      totalExpenses: monthlyTotal,
      fixedCosts: fixedCostTotal,
      subscriptions: subscriptionTotal,
      installmentPlans: installmentTotal,
      familyMembers: familyMembers.length,
      timestamp: new Date().toISOString()
    }
    
    // Create downloadable JSON file
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `budget-report-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-maxcrowds-green rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Budget Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Expenses */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Monatliche Ausgaben</p>
                <p className="text-3xl font-bold text-gray-900">€{monthlyTotal.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-maxcrowds-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">€</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Budget genutzt</span>
                <span>{budgetHealth.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    budgetHealth > 50 ? 'bg-maxcrowds-green-hover' : budgetHealth > 25 ? 'bg-maxcrowds-green/80' : 'bg-maxcrowds-green/60'
                  }`}
                  style={{ width: `${Math.min(100, (monthlyTotal / budgetLimit * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Budget Health */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="text-3xl font-bold text-gray-900">{budgetHealth.toFixed(0)}%</p>
              </div>
              <div className="w-12 h-12 bg-maxcrowds-green rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Budget-Limit</span>
                <span className="font-semibold">€{budgetLimit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Ausgaben</span>
                <span className="font-semibold">€{monthlyTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Verbleibend</span>
                <span className={`font-semibold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  €{Math.abs(remainingBudget).toFixed(2)}
                  {remainingBudget < 0 ? ' (Überzogen)' : ''}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    budgetHealth > 50 ? 'bg-maxcrowds-green-hover' : budgetHealth > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetHealth)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Abonnements</p>
                <p className="text-3xl font-bold text-gray-900">€{subscriptionTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{subscriptions.length} aktiv</p>
              </div>
              <div className="w-12 h-12 bg-maxcrowds-green rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Anteil</span>
                <span className="font-semibold">{subscriptionPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-maxcrowds-green-hover/80 transition-all duration-500"
                  style={{ width: `${subscriptionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Installment Plans */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Ratenpläne</p>
                <p className="text-3xl font-bold text-gray-900">€{installmentTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{installmentPlans.length} aktiv</p>
              </div>
              <div className="w-12 h-12 bg-maxcrowds-green rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Anteil</span>
                <span className="font-semibold">{installmentPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-maxcrowds-green-hover/60 transition-all duration-500"
                  style={{ width: `${installmentPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Expense Breakdown */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Ausgaben-Verteilung</h2>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInstallments}
                      onChange={(e) => setIncludeInstallments(e.target.checked)}
                      className="w-4 h-4 text-maxcrowds-green border-gray-300 rounded focus:ring-maxcrowds-green mr-2"
                    />
                    <span className="text-sm text-gray-700">Ratenpläne einbeziehen</span>
                  </label>
                </div>
              </div>
              
              {/* Pie Chart Visualization */}
              <div className="flex justify-center mb-6">
                <div className="relative w-64 h-64 group cursor-pointer" onClick={() => setShowChartDetails(!showChartDetails)}>
                  <svg className="transform -rotate-90 w-64 h-64 transition-transform duration-300 group-hover:scale-105">
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      className="text-gray-200"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      className="text-maxcrowds-green transition-all duration-300 group-hover:text-maxcrowds-green-hover"
                      strokeDasharray={`${2 * Math.PI * 100 * (fixedCostPercentage / 100)} ${2 * Math.PI * 100}`}
                      transform="rotate(90)"
                      style={{ transformOrigin: 'center' }}
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      className="text-purple-500 transition-all duration-300 group-hover:text-purple-600"
                      strokeDasharray={`${2 * Math.PI * 100 * (subscriptionPercentage / 100)} ${2 * Math.PI * 100}`}
                      strokeDashoffset={`${2 * Math.PI * 100 * (fixedCostPercentage / 100)}`}
                      transform="rotate(90)"
                      style={{ transformOrigin: 'center' }}
                    />
                    {includeInstallments && (
                      <circle
                        cx="128"
                        cy="128"
                        r="100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="20"
                        className="text-orange-500 transition-all duration-300 group-hover:text-orange-600"
                        strokeDasharray={`${2 * Math.PI * 100 * (installmentPercentage / 100)} ${2 * Math.PI * 100}`}
                        strokeDashoffset={`${2 * Math.PI * 100 * ((fixedCostPercentage + subscriptionPercentage) / 100)}`}
                        transform="rotate(90)"
                        style={{ transformOrigin: 'center' }}
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 group-hover:text-maxcrowds-green transition-colors duration-300">€{monthlyTotal.toFixed(0)}</p>
                      <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">Gesamt</p>
                    </div>
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
                      <p className="text-xs font-medium">{showChartDetails ? 'Klicke zum Schließen' : 'Klicke für Details'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Details */}
              {showChartDetails && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Detaillierte Ausgaben-Aufteilung</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-maxcrowds-green rounded-full"></div>
                        <span className="text-gray-700">Fixkosten</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">€{fixedCostTotal.toFixed(2)}</span>
                        <span className="text-gray-500 ml-2">({fixedCostPercentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700">Abonnements</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">€{subscriptionTotal.toFixed(2)}</span>
                        <span className="text-gray-500 ml-2">({subscriptionPercentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    {includeInstallments && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-gray-700">Ratenpläne</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">€{installmentTotal.toFixed(2)}</span>
                          <span className="text-gray-500 ml-2">({installmentPercentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span className="text-gray-900">Gesamt</span>
                        <span className="text-gray-900">€{monthlyTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Simple Chart Representation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-maxcrowds-green rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Fixkosten</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">€{fixedCostTotal.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{fixedCostPercentage.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Abonnements</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">€{subscriptionTotal.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{subscriptionPercentage.toFixed(1)}%</p>
                  </div>
                </div>

                {includeInstallments && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Ratenpläne</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">€{installmentTotal.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{installmentPercentage.toFixed(1)}%</p>
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
                    <p className="text-lg font-semibold text-gray-900">€{Math.abs(remainingBudget).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Period Selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Zeitraum</h3>
              <div className="flex space-x-2">
                {['Woche', 'Monat', 'Quartal', 'Jahr'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-maxcrowds-green text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Family Members */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Familienmitglieder</h3>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {familyMembers.length > 0 ? (
                  familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-maxcrowds-green/20 rounded-full flex items-center justify-center">
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
                    <p className="text-gray-500">Keine Familienmitglieder</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h3>
              <div className="space-y-3">
                <button onClick={handleAddExpense} className="w-full flex items-center justify-center space-x-2 p-3 bg-maxcrowds-green text-white rounded-lg hover:bg-maxcrowds-green-hover transition-colors">
                  <span className="text-white font-bold">€</span>
                  <span className="text-sm font-medium">Ausgabe hinzufügen</span>
                </button>
                <button onClick={handleExportReport} className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Bericht exportieren</span>
                </button>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Einblicke</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Trend-Analyse</p>
                      <p className="text-xs text-blue-700">{monthlyChange > 0 ? '+' : ''}{monthlyChange.toFixed(1)}% vs. letztes Monat</p>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600">
                    {monthlyChange > 0 ? 'Ausgaben gestiegen' : monthlyChange < 0 ? 'Ausgaben gesunken' : 'Ausgaben stabil'}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Budget-Optimierung</p>
                      <p className="text-xs text-green-700">{budgetOptimization > 0 ? '+' : ''}{budgetOptimization.toFixed(1)}% vs. letztes Monat</p>
                    </div>
                  </div>
                  <div className="text-xs text-green-600">
                    {budgetOptimization < 0 ? 'Einsparungen erzielt' : budgetOptimization > 0 ? 'Mehr Ausgaben' : 'Keine Veränderung'}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Abonnement-Check</p>
                      <p className="text-xs text-purple-700">{subscriptions.length} aktiv</p>
                    </div>
                  </div>
                  <div className="text-xs text-purple-600">
                    {subscriptionTotal > 100 ? 'Hohe Abonnement-Kosten' : 'Abonnement-Kosten im Rahmen'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Budget-Zusammenfassung</h3>
              <p className="text-sm text-gray-500">Ihr aktueller Budget-Status</p>
            </div>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">€{Math.abs(remainingBudget).toFixed(2)}</p>
                <p className={`text-sm ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {remainingBudget < 0 ? 'Budget überschritten' : 'Verbleibendes Budget'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-maxcrowds-green">{savingsRate.toFixed(0)}%</p>
                <p className="text-sm text-gray-500">Sparquote</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
