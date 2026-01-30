import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react'
import { Budget } from '../types'

interface BudgetManagementProps {
  onUpdate: () => void
}

export default function BudgetManagement({ onUpdate }: BudgetManagementProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'monthly' as 'monthly' | 'yearly' | 'custom',
    amount: '',
    period: '',
    category: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    loadBudgets()
  }, [])

  const loadBudgets = async () => {
    try {
      const response = await fetch('/api/budgets')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Budgets:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const budgetData = {
      name: formData.name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      period: formData.type === 'custom' ? formData.period : undefined,
      category: formData.category || undefined,
      description: formData.description || undefined,
      isActive: formData.isActive
    }

    try {
      if (editingBudget) {
        // Update existing budget
        const updateResponse = await fetch(`/api/budgets/${editingBudget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(budgetData)
        })
        if (updateResponse.ok) {
          loadBudgets()
          closeModal()
          onUpdate()
        }
      } else {
        // Create new budget
        const createResponse = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(budgetData)
        })
        if (createResponse.ok) {
          loadBudgets()
          closeModal()
          onUpdate()
        }
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Budgets:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie dieses Budget wirklich löschen?')) return

    try {
      const deleteResponse = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE'
      })
      
      if (deleteResponse.ok) {
        loadBudgets()
        onUpdate()
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Budgets:', error)
    }
  }

  const openModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget)
      setFormData({
        name: budget.name,
        type: budget.type,
        amount: budget.amount.toString(),
        period: budget.period || '',
        category: budget.category || '',
        description: budget.description || '',
        isActive: budget.isActive
      })
    } else {
      setEditingBudget(null)
      setFormData({
        name: '',
        type: 'monthly',
        amount: '',
        period: '',
        category: '',
        description: '',
        isActive: true
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBudget(null)
    setFormData({
      name: '',
      type: 'monthly',
      amount: '',
      period: '',
      category: '',
      description: '',
      isActive: true
    })
  }

  const getTotalBudgetAmount = () => {
    return budgets
      .filter(b => b.isActive)
      .reduce((total, budget) => {
        const monthlyAmount = budget.type === 'yearly' 
          ? budget.amount / 12 
          : budget.amount
        return total + monthlyAmount
      }, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget-Verwaltung</h2>
          <p className="text-gray-600 mt-1">Erstelle und verwalte deine Budget-Limits</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-maxcrowds-green text-white rounded-lg hover:bg-maxcrowds-green-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Budget hinzufügen
        </button>
      </div>

      {/* Budget Summary */}
      <div className="bg-gradient-to-r from-maxcrowds-green to-maxcrowds-green-hover rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Gesamtbudget (monatlich)</h3>
            <p className="text-sm opacity-90 mt-1">Aktive Budget-Limits</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">€{getTotalBudgetAmount().toFixed(2)}</p>
            <p className="text-sm opacity-90">{budgets.filter(b => b.isActive).length} aktiv</p>
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Betrag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monatlich
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.map((budget) => {
                const monthlyAmount = budget.type === 'yearly' ? budget.amount / 12 : budget.amount
                return (
                  <tr key={budget.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{budget.name}</div>
                        {budget.description && (
                          <div className="text-sm text-gray-500">{budget.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        budget.type === 'monthly' 
                          ? 'bg-blue-100 text-blue-800'
                          : budget.type === 'yearly'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {budget.type === 'monthly' ? 'Monatlich' : budget.type === 'yearly' ? 'Jährlich' : 'Benutzerdefiniert'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{budget.amount.toFixed(2)}
                      {budget.period && (
                        <div className="text-xs text-gray-500">{budget.period}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{monthlyAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        budget.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {budget.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(budget)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {budgets.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Budgets vorhanden</h3>
              <p className="text-gray-500 mb-4">Erstelle dein erstes Budget, um deine Ausgaben zu kontrollieren</p>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-maxcrowds-green text-white rounded-lg hover:bg-maxcrowds-green-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                Erstes Budget erstellen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingBudget ? 'Budget bearbeiten' : 'Budget hinzufügen'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                  placeholder="z.B. Lebensmittelbudget"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Typ *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'monthly' | 'yearly' | 'custom' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                >
                  <option value="monthly">Monatlich</option>
                  <option value="yearly">Jährlich</option>
                  <option value="custom">Benutzerdefiniert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Betrag (€) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                  placeholder="0.00"
                />
              </div>

              {formData.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zeitraum *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                    placeholder="z.B. 2024-01, Q1-2024"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                  placeholder="z.B. Essen, Transport"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                  rows={3}
                  placeholder="Optionale Beschreibung..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-maxcrowds-green border-gray-300 rounded focus:ring-maxcrowds-green"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Budget aktiv
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-maxcrowds-green text-white rounded-lg hover:bg-maxcrowds-green-hover transition-colors"
                >
                  {editingBudget ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
