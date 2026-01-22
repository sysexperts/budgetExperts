import { FamilyMember, FixedCost, Subscription } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsProps {
  familyMembers: FamilyMember[]
  fixedCosts: FixedCost[]
  subscriptions: Subscription[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Analytics({ familyMembers, fixedCosts, subscriptions }: AnalyticsProps) {
  const getCategoryData = () => {
    const categories: { [key: string]: number } = {}
    
    fixedCosts.forEach(cost => {
      const monthly = cost.interval === 'monthly' ? cost.amount : cost.amount / 12
      categories[cost.category] = (categories[cost.category] || 0) + monthly
    })
    
    subscriptions.forEach(sub => {
      const monthly = sub.interval === 'monthly' ? sub.amount : sub.amount / 12
      categories[sub.category] = (categories[sub.category] || 0) + monthly
    })
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }))
  }

  const getFixedVsVariable = () => {
    const fixedTotal = fixedCosts.reduce((sum, cost) => {
      return sum + (cost.interval === 'monthly' ? cost.amount : cost.amount / 12)
    }, 0)
    
    const subsTotal = subscriptions.reduce((sum, sub) => {
      return sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12)
    }, 0)
    
    return [
      { name: 'Fixed Costs', value: parseFloat(fixedTotal.toFixed(2)) },
      { name: 'Subscriptions', value: parseFloat(subsTotal.toFixed(2)) }
    ]
  }

  const getFamilyMemberData = () => {
    const memberData: { [key: string]: number } = {}
    
    familyMembers.forEach(member => {
      memberData[member.name] = 0
    })
    
    fixedCosts.forEach(cost => {
      const monthly = cost.interval === 'monthly' ? cost.amount : cost.amount / 12
      if (cost.familyMemberId) {
        const member = familyMembers.find(m => m.id === cost.familyMemberId)
        if (member) {
          memberData[member.name] = (memberData[member.name] || 0) + monthly
        }
      }
    })
    
    subscriptions.forEach(sub => {
      const monthly = sub.interval === 'monthly' ? sub.amount : sub.amount / 12
      if (sub.familyMemberId) {
        const member = familyMembers.find(m => m.id === sub.familyMemberId)
        if (member) {
          memberData[member.name] = (memberData[member.name] || 0) + monthly
        }
      }
    })
    
    return Object.entries(memberData).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }))
  }

  const categoryData = getCategoryData()
  const fixedVsVariable = getFixedVsVariable()
  const familyMemberData = getFamilyMemberData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Detailed breakdown of your spending patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Expenses by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Fixed Costs vs Subscriptions</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fixedVsVariable}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {familyMemberData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Expenses by Family Member</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={familyMemberData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#10B981" name="Monthly Expenses ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryData.map((cat, index) => {
                  const total = categoryData.reduce((sum, c) => sum + c.value, 0)
                  const percentage = (cat.value / total * 100).toFixed(1)
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${cat.value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {percentage}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
