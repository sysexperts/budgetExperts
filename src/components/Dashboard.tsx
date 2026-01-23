import { FamilyMember, FixedCost, Subscription, InstallmentPlan } from '../types'
import { DollarSign, TrendingUp, CreditCard, Coins } from 'lucide-react'

interface DashboardProps {
  familyMembers: FamilyMember[]
  fixedCosts: FixedCost[]
  subscriptions: Subscription[]
  installmentPlans: InstallmentPlan[]
}

export default function Dashboard({ familyMembers, fixedCosts, subscriptions, installmentPlans }: DashboardProps) {

  const calculateMonthlyTotal = () => {
    const fixedTotal = fixedCosts.reduce((sum, cost) => {
      return sum + (cost.interval === 'monthly' ? cost.amount : cost.amount / 12)
    }, 0)

    const subsTotal = subscriptions.reduce((sum, sub) => {
      return sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12)
    }, 0)

    return fixedTotal + subsTotal
  }

  const monthlyTotal = calculateMonthlyTotal()
  const subscriptionTotal = subscriptions.reduce((sum, sub) => {
    return sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12)
  }, 0)

  const installmentTotal = installmentPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0)

  const fixedCostRatio = monthlyTotal > 0 ? ((monthlyTotal - subscriptionTotal) / monthlyTotal * 100) : 0
  const combinedMonthly = monthlyTotal + installmentTotal

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budget Analytics & Berichte</h1>
        <p className="text-gray-600 mt-1">Verfolge familiäre Ausgabentrends und Fixkosten für das aktuelle Jahr.</p>
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
                <p className="text-sm text-blue-500 mt-2">+6.2% vom letzten Monat</p>
              )}
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <DollarSign className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-blue-500 mt-2">+2.1% (Neu: Disney+)</p>
              )}
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <CreditCard className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-blue-500 mt-2">Aktive Ratenzahlungen</p>
              )}
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Coins className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-blue-500 mt-2">-1.5% optimiert</p>
              )}
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-500" />
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
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 text-blue-900 shadow-lg transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-200 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-700" />
              </div>
              <div className="text-right">
                <p className="text-blue-700 text-sm font-medium">Gesamt</p>
                <p className="text-3xl font-bold">{combinedMonthly.toFixed(0)}€</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Monatliche Ausgaben</span>
              <span className="bg-blue-300 px-2 py-1 rounded-full text-xs">100%</span>
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

      {familyMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Familienmitglieder</h2>
          <div className="flex flex-wrap gap-3">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
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
