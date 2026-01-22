import { useState } from 'react'
import { FamilyMember, Subscription } from '../types'
import { Plus, Trash2, CreditCard } from 'lucide-react'

interface SubscriptionsProps {
  subscriptions: Subscription[]
  familyMembers: FamilyMember[]
  onUpdate: () => void
}

export default function Subscriptions({ subscriptions, familyMembers, onUpdate }: SubscriptionsProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [paymentDate, setPaymentDate] = useState('1')
  const [familyMemberId, setFamilyMemberId] = useState<number | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          amount: parseFloat(amount),
          interval,
          paymentDate: parseInt(paymentDate),
          familyMemberId: familyMemberId || undefined
        })
      })
      
      setName('')
      setCategory('')
      setAmount('')
      setInterval('monthly')
      setPaymentDate('1')
      setFamilyMemberId(undefined)
      setShowForm(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding subscription:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Error deleting subscription:', error)
    }
  }

  const totalMonthly = subscriptions.reduce((sum, sub) => {
    return sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12)
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-gray-600 mt-1">Manage your recurring subscriptions</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Total Monthly Cost</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">${totalMonthly.toFixed(2)}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Add Subscription</span>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date (Day of Month)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.length === 0 ? (
            <p className="text-gray-500 text-center py-8 col-span-full">No subscriptions added yet</p>
          ) : (
            subscriptions.map((sub) => {
              const member = familyMembers.find(m => m.id === sub.familyMemberId)
              const monthlyAmount = sub.interval === 'monthly' ? sub.amount : sub.amount / 12
              
              return (
                <div
                  key={sub.id}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{sub.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{sub.category}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">${monthlyAmount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Due: {sub.paymentDate}th</p>
                      <p className="text-xs text-gray-500">{member ? member.name : 'Household'}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
