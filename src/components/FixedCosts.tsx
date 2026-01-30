import { useState } from 'react'
import { FamilyMember, FixedCost, Household, Category } from '../types'
import { Plus, Trash2, DollarSign, Edit } from 'lucide-react'

interface FixedCostsProps {
  fixedCosts: FixedCost[]
  familyMembers: FamilyMember[]
  households: Household[]
  categories: Category[]
  onUpdate: () => void
}

export default function FixedCosts({ fixedCosts, familyMembers, households, categories, onUpdate }: FixedCostsProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [familyMemberId, setFamilyMemberId] = useState<number | undefined>()
  const [householdId, setHouseholdId] = useState<number | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCost) {
        // Update existing fixed cost
        await fetch(`/api/fixed-costs/${editingCost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            amount: parseFloat(amount),
            interval,
            familyMemberId: familyMemberId || undefined,
            householdId: householdId || undefined
          })
        })
      } else {
        // Create new fixed cost
        await fetch('/api/fixed-costs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            amount: parseFloat(amount),
            interval,
            familyMemberId: familyMemberId || undefined,
            householdId: householdId || undefined
          })
        })
      }
      
      resetForm()
      setShowForm(false)
      setEditingCost(null)
      onUpdate()
    } catch (error) {
      console.error('Fehler beim Speichern der Fixkosten:', error)
    }
  }

  const resetForm = () => {
    setName('')
    setCategory('')
    setAmount('')
    setInterval('monthly')
    setFamilyMemberId(undefined)
    setHouseholdId(undefined)
  }

  const handleEdit = (cost: FixedCost) => {
    setEditingCost(cost)
    setName(cost.name)
    setCategory(cost.category)
    setAmount(cost.amount.toString())
    setInterval(cost.interval)
    setFamilyMemberId(cost.familyMemberId)
    setHouseholdId(cost.householdId)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/fixed-costs/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Fehler beim Löschen der Fixkosten:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Fixkosten</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            if (!showForm) {
              resetForm()
              setEditingCost(null)
            }
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>{editingCost ? 'Fixkosten bearbeiten' : 'Fixkosten hinzufügen'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. Miete, Strom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Kategorie wählen</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Betrag (€) *</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intervall *</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as 'monthly' | 'yearly')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Monatlich</option>
                <option value="yearly">Jährlich</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Haushalt (optional)</label>
              <select
                value={householdId || ''}
                onChange={(e) => setHouseholdId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Kein Haushalt</option>
                {households.map((household) => (
                  <option key={household.id} value={household.id}>
                    {household.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mitglied (optional)</label>
              <select
                value={familyMemberId || ''}
                onChange={(e) => setFamilyMemberId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Kein Mitglied</option>
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
              Speichern
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingCost(null)
                resetForm()
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {fixedCosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Noch keine Fixkosten hinzugefügt</p>
        ) : (
          fixedCosts.map((cost) => {
            const member = familyMembers.find(m => m.id === cost.familyMemberId)
            const household = households.find(h => h.id === cost.householdId)
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
                      {cost.category} • {member ? member.name : household ? household.name : 'Allgemein'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{cost.amount.toFixed(2)} €</p>
                    <p className="text-sm text-gray-500">
                      {cost.interval === 'monthly' ? 'Monatlich' : 'Jährlich'} ({monthlyAmount.toFixed(2)} €/Monat)
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(cost)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Fixkosten bearbeiten"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cost.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Fixkosten löschen"
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
