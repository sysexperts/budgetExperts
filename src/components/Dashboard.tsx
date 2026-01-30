import { useState, useEffect } from 'react'
import { FamilyMember, FixedCost, Subscription, InstallmentPlan } from '../types'
import { DollarSign, TrendingUp, CreditCard, Coins, Target } from 'lucide-react'

interface DashboardProps {
  familyMembers: FamilyMember[]
  fixedCosts: FixedCost[]
  subscriptions: Subscription[]
  installmentPlans: InstallmentPlan[]
}

export default function Dashboard({ familyMembers, fixedCosts, subscriptions, installmentPlans }: DashboardProps) {

  const [savingsGoals, setSavingsGoals] = useState<any[]>([])
  const [includeInstallments, setIncludeInstallments] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM format
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [paidInstallments, setPaidInstallments] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('paid-installments')
    return saved ? JSON.parse(saved) : {}
  })
  const [installmentFilter, setInstallmentFilter] = useState<'all' | 'unpaid' | 'paid'>('all')

  // Lade Sparziele aus localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('savings-goals')
    if (savedGoals) {
      setSavingsGoals(JSON.parse(savedGoals))
    }
  }, [])

  const calculateProgress = (goal: any) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  }

  // Prüfe ob eine Rate für den ausgewählten Monat bezahlt wurde
  const isInstallmentPaid = (planId: number, month: string) => {
    const key = `${planId}-${month}`
    return paidInstallments[key] || false
  }

  // Generiere Jahrsoptionen
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    
    // Aktuelles Jahr + 3 Jahre zurück + 2 Jahre vor
    for (let i = -3; i <= 2; i++) {
      const year = currentYear + i
      years.push({
        value: year,
        label: year.toString(),
        isCurrent: i === 0
      })
    }
    return years
  }

  // Generiere Monatsoptionen für ausgewähltes Jahr
  const getMonthOptions = () => {
    const months = []
    const currentDate = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(selectedYear, i, 1)
      const monthValue = String(i + 1).padStart(2, '0')
      const monthLabel = date.toLocaleString('de-DE', { month: 'long' })
      const isCurrentMonth = selectedYear === currentDate.getFullYear() && i === currentDate.getMonth()
      
      months.push({
        value: `${selectedYear}-${monthValue}`,
        label: monthLabel,
        isCurrent: isCurrentMonth
      })
    }
    return months
  }

  // Aktualisiere selectedMonth wenn sich das Jahr ändert
  const handleYearChange = (year: number) => {
    setSelectedYear(year)
    // Behalte den aktuellen Monat wenn möglich, sonst nimm Januar
    const currentMonth = new Date().getMonth()
    const monthValue = String(currentMonth + 1).padStart(2, '0')
    setSelectedMonth(`${year}-${monthValue}`)
  }

  // Berechne unbezahlte Raten für den ausgewählten Monat
  const getUnpaidInstallmentsForMonth = () => {
    return installmentPlans.filter(plan => !isInstallmentPaid(plan.id, selectedMonth))
  }

  // Filtere Raten basierend auf dem ausgewählten Filter
  const getFilteredInstallments = () => {
    switch (installmentFilter) {
      case 'unpaid':
        return installmentPlans.filter(plan => !isInstallmentPaid(plan.id, selectedMonth))
      case 'paid':
        return installmentPlans.filter(plan => isInstallmentPaid(plan.id, selectedMonth))
      default:
        return installmentPlans
    }
  }

  const unpaidInstallmentTotal = getUnpaidInstallmentsForMonth().reduce((sum, plan) => sum + plan.monthlyAmount, 0)
  const filteredInstallments = getFilteredInstallments()

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

  const fixedCostRatio = monthlyTotal > 0 ? ((monthlyTotal - subscriptionTotal) / monthlyTotal * 100) : 0
  const combinedMonthly = monthlyTotal

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budget Analytics & Berichte</h1>
        <p className="text-gray-600 mt-1">Verfolge familiäre Ausgabentrends und Fixkosten für das aktuelle Jahr.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInstallments}
            onChange={(e) => setIncludeInstallments(e.target.checked)}
            className="w-4 h-4 text-maxcrowds-green border-gray-300 rounded focus:ring-maxcrowds-green"
          />
          <span className="text-sm font-medium text-gray-700">Ratenpläne in Berechnung einbeziehen</span>
          <span className="text-xs text-gray-500">
            ({installmentTotal.toFixed(2)}€/Monat)
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monatliche Gesamtkosten</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {combinedMonthly.toFixed(2)}€
              </p>
              {combinedMonthly > 0 && (
                <p className="text-sm text-maxcrowds-green mt-2">+6.2% vom letzten Monat</p>
              )}
            </div>
            <div className="bg-maxcrowds-light-gray p-3 rounded-lg">
              <DollarSign className="h-8 w-8 text-maxcrowds-green" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Abonnement-Kosten</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {subscriptionTotal.toFixed(2)}€
              </p>
              {subscriptionTotal > 0 && (
                <p className="text-sm text-maxcrowds-green mt-2">+2.1% (Neu: Disney+)</p>
              )}
            </div>
            <div className="bg-maxcrowds-light-gray p-3 rounded-lg">
              <CreditCard className="h-8 w-8 text-maxcrowds-green" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ratenpläne</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {installmentTotal.toFixed(2)}€
              </p>
              {installmentTotal > 0 && (
                <p className="text-sm text-maxcrowds-green mt-2">Aktive Ratenzahlungen</p>
              )}
            </div>
            <div className="bg-maxcrowds-light-gray p-3 rounded-lg">
              <Coins className="h-8 w-8 text-maxcrowds-green" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fixkosten-Anteil</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {fixedCostRatio.toFixed(0)}%
              </p>
              {fixedCostRatio > 0 && (
                <p className="text-sm text-maxcrowds-green mt-2">-1.5% optimiert</p>
              )}
            </div>
            <div className="bg-maxcrowds-light-gray p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-maxcrowds-green" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Monatsübersicht</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Aktuell</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Gesamtausgaben Card */}
          <div className="bg-gradient-to-br from-maxcrowds-green/10 to-maxcrowds-green/5 rounded-xl p-6 text-maxcrowds-dark-gray shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-maxcrowds-green/20 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-maxcrowds-green" />
              </div>
              <div className="text-right">
                <p className="text-maxcrowds-green text-sm font-medium">Gesamt</p>
                <p className="text-3xl font-bold">{combinedMonthly.toFixed(0)}€</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-maxcrowds-green">Monatliche Ausgaben</span>
              <span className="bg-maxcrowds-green/20 px-2 py-1 rounded-full text-xs">100%</span>
            </div>
          </div>

          {/* Fixkosten Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm font-medium">Fixkosten</p>
                <p className="text-2xl font-bold text-gray-900">{(monthlyTotal - subscriptionTotal).toFixed(0)}€</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${combinedMonthly > 0 ? ((monthlyTotal - subscriptionTotal) / combinedMonthly * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-3 text-sm text-gray-600 font-medium">
                {combinedMonthly > 0 ? Math.round((monthlyTotal - subscriptionTotal) / combinedMonthly * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Abonnements Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm font-medium">Abonnements</p>
                <p className="text-2xl font-bold text-gray-900">{subscriptionTotal.toFixed(0)}€</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${combinedMonthly > 0 ? (subscriptionTotal / combinedMonthly * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-3 text-sm text-gray-600 font-medium">
                {combinedMonthly > 0 ? Math.round(subscriptionTotal / combinedMonthly * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Ratenpläne Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Coins className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm font-medium">Ratenpläne</p>
                <p className="text-2xl font-bold text-gray-900">{installmentTotal.toFixed(0)}€</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${combinedMonthly > 0 ? (installmentTotal / combinedMonthly * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-3 text-sm text-gray-600 font-medium">
                {combinedMonthly > 0 ? Math.round(installmentTotal / combinedMonthly * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Zusätzliche Zusammenfassung */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Durchschnitt pro Tag</p>
            <p className="text-xl font-bold text-gray-900">{(combinedMonthly / 30).toFixed(2)}€</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Verbleibend (30 Tage)</p>
            <p className="text-xl font-bold text-green-600">{((combinedMonthly / 30) * (30 - new Date().getDate())).toFixed(2)}€</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Kategorie mit meisten Ausgaben</p>
            <p className="text-xl font-bold text-gray-900">Fixkosten</p>
          </div>
        </div>
      </div>

      {/* Ratenpläne Detailübersicht mit Checkboxen */}
      {installmentPlans.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-8">
          {/* Filter direkt über den Ratenplänen */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Jahresauswahl */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jahr</label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getYearOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.isCurrent && '(Aktuell)'}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Monatsauswahl */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monat</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getMonthOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.isCurrent && '(Aktuell)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setInstallmentFilter('all')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    installmentFilter === 'all'
                      ? 'bg-maxcrowds-green text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Alle ({installmentPlans.length})
                </button>
                <button
                  onClick={() => setInstallmentFilter('unpaid')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    installmentFilter === 'unpaid'
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Offen ({getUnpaidInstallmentsForMonth().length})
                </button>
                <button
                  onClick={() => setInstallmentFilter('paid')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    installmentFilter === 'paid'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Bezahlt ({installmentPlans.length - getUnpaidInstallmentsForMonth().length})
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ratenpläne - {new Date(selectedMonth + '-01').toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <Coins className="h-4 w-4" />
                <span>{installmentPlans.length} Pläne</span>
                <span>• {filteredInstallments.length} angezeigt</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Unbezahlte Raten</div>
              <div className="text-xl font-bold text-orange-600">{unpaidInstallmentTotal.toFixed(2)}€</div>
              <div className="text-xs text-gray-500">von {installmentTotal.toFixed(2)}€ gesamt</div>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredInstallments.map(plan => {
              const isPaid = isInstallmentPaid(plan.id, selectedMonth)
              
              return (
                <div key={plan.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Checkbox */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isPaid}
                          onChange={() => {
                            const key = `${plan.id}-${selectedMonth}`
                            const newPaidInstallments = {
                              ...paidInstallments,
                              [key]: !paidInstallments[key]
                            }
                            setPaidInstallments(newPaidInstallments)
                            localStorage.setItem('paid-installments', JSON.stringify(newPaidInstallments))
                          }}
                          className="w-4 h-4 text-maxcrowds-green border-gray-300 rounded focus:ring-maxcrowds-green"
                          title={`Rate für ${new Date(selectedMonth + '-01').toLocaleString('de-DE', { month: 'long', year: 'numeric' })} als bezahlt markieren`}
                        />
                        <label className="ml-2 text-xs text-gray-500 cursor-pointer">
                          {isPaid ? 'Bezahlt' : 'Offen'}
                        </label>
                      </div>
                      
                      {/* Plan Details */}
                      <div>
                        <p className={`font-semibold ${isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {plan.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {plan.startDate} – {plan.endDate}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {plan.monthlyAmount.toFixed(2)}€
                      </p>
                      <p className="text-xs text-gray-500">Monatliche Rate</p>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {filteredInstallments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {installmentFilter === 'unpaid' && 'Keine offenen Raten in diesem Monat'}
                  {installmentFilter === 'paid' && 'Keine bezahlten Raten in diesem Monat'}
                  {installmentFilter === 'all' && 'Keine Ratenpläne gefunden'}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unbezahlte Raten gesamt:</span>
              <span className="text-xl font-bold text-orange-600">{unpaidInstallmentTotal.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      )}

      {/* Sparziele Übersicht */}
      {savingsGoals.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sparziele</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Target className="h-4 w-4" />
              <span>{savingsGoals.length} Ziele</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savingsGoals.slice(0, 3).map(goal => {
              const progress = calculateProgress(goal)
              const remaining = goal.targetAmount - goal.currentAmount
              
              return (
                <div key={goal.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-600">{goal.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{progress.toFixed(0)}%</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aktuell:</span>
                      <span className="font-semibold">{goal.currentAmount.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ziel:</span>
                      <span className="font-semibold">{goal.targetAmount.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fehlt:</span>
                      <span className="font-semibold text-orange-600">{Math.max(0, remaining).toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {savingsGoals.length > 3 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Und {savingsGoals.length - 3} weitere Sparziele...
              </p>
            </div>
          )}
        </div>
      )}

      {familyMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Familienmitglieder</h2>
          <div className="flex flex-wrap gap-3">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-2 bg-maxcrowds-light-gray px-4 py-2 rounded-full"
              >
                <div className="w-8 h-8 bg-maxcrowds-green/20 rounded-full flex items-center justify-center">
                  <span className="text-maxcrowds-green font-semibold text-sm">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <span className="text-gray-900 font-medium">{member.name}</span>
                {member.role && (
                  <span className="text-gray-500 text-sm">({member.role})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
