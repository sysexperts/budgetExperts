import { FamilyMember, FixedCost, Subscription } from '../types'
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react'

interface DashboardProps {
  familyMembers: FamilyMember[]
  fixedCosts: FixedCost[]
  subscriptions: Subscription[]
}

export default function Dashboard({ familyMembers, fixedCosts, subscriptions }: DashboardProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

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

  const fixedCostRatio = monthlyTotal > 0 ? ((monthlyTotal - subscriptionTotal) / monthlyTotal * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budget Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Track family spending trends and fixed costs for the current year.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Monthly Spending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${monthlyTotal.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 mt-2">+6.2% from last month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Subscription Costs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${subscriptionTotal.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 mt-2">+2.1% (New: Disney+)</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fixed Cost Ratio</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {fixedCostRatio.toFixed(0)}%
              </p>
              <p className="text-sm text-red-600 mt-2">-1.5% optimized</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">This Month Overview</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Total Expenses</span>
            <span className="font-semibold">${monthlyTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-gray-600">Fixed Costs</span>
            <span className="font-semibold">${(monthlyTotal - subscriptionTotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">Subscriptions</span>
            <span className="font-semibold">${subscriptionTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {familyMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Family Members</h2>
          <div className="flex flex-wrap gap-3">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full"
              >
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-sm">
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
