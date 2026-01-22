import { useState } from 'react'
import { FamilyMember, FixedCost } from '../types'
import { Plus, Trash2, DollarSign } from 'lucide-react'

interface FixedCostsProps {
  fixedCosts: FixedCost[]
  familyMembers: FamilyMember[]
  onUpdate: () => void
}

export default function FixedCosts({ fixedCosts, familyMembers, onUpdate }: FixedCostsProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [familyMemberId, setFamilyMemberId] = useState<number | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await fetch('/api/fixed-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          amount: parseFloat(amount),
          interval,
          familyMemberId: familyMemberId || undefined
        })
      })
      
      setName('')
      setCategory('')
      setAmount('')
      setInterval('monthly')
      setFamilyMemberId(undefined)
      setShowForm(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding fixed cost:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/fixed-costs/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Error deleting fixed cost:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Fixed Costs</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Cost</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as 'monthly' | 'yearly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Member (optional)</label>
              <select
                value={familyMemberId || ''}
                onChange={(e) => setFamilyMemberId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Household</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {fixedCosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No fixed costs added yet</p>
        ) : (
          fixedCosts.map((cost) => {
            const member = familyMembers.find(m => m.id === cost.familyMemberId)
            const monthlyAmount = cost.interval === 'monthly' ? cost.amount : cost.amount / 12
            
            return (
              <div
                key={cost.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{cost.name}</p>
                    <p className="text-sm text-gray-500">
                      {cost.category} • {member ? member.name : 'Household'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${cost.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {cost.interval} (${monthlyAmount.toFixed(2)}/mo)
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(cost.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
