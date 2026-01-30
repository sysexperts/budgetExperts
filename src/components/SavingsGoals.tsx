import { useState, useEffect, useRef } from 'react'
import { SavingsGoal, FamilyMember } from '../types'
import { Target, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react'

interface SavingsGoalsProps {
  familyMembers: FamilyMember[]
}

export default function SavingsGoals({ familyMembers }: SavingsGoalsProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  
  // Hilfsfunktion für sichere Zahlumwandlung
  const safeParseFloat = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined) return defaultValue
    const parsed = parseFloat(value.toString())
    return isNaN(parsed) ? defaultValue : parsed
  }
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'other' as 'vacation' | 'emergency' | 'purchase' | 'education' | 'home' | 'car' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high',
    monthlyContribution: '',
    familyMemberId: ''
  })

  const categories = [
    { value: 'vacation', label: 'Urlaub', icon: '✈️' },
    { value: 'emergency', label: 'Notfallfonds', icon: '🛡️' },
    { value: 'purchase', label: 'Anschaffung', icon: '🛍️' },
    { value: 'education', label: 'Bildung', icon: '📚' },
    { value: 'home', label: 'Haus/Wohnung', icon: '🏠' },
    { value: 'car', label: 'Auto', icon: '🚗' },
    { value: 'other', label: 'Sonstiges', icon: '📌' }
  ]

  const priorities = [
    { value: 'low', label: 'Niedrig', color: 'gray' },
    { value: 'medium', label: 'Mittel', color: 'blue' },
    { value: 'high', label: 'Hoch', color: 'red' }
  ]

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/savings-goals')
      const data = await response.json()
      setGoals(data)
    } catch (error) {
      console.error('Fehler beim Laden der Sparziele:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        monthlyContribution: parseFloat(formData.monthlyContribution),
        familyMemberId: formData.familyMemberId ? parseInt(formData.familyMemberId) : undefined
      }

      let response
      if (editingGoal) {
        response = await fetch(`/api/savings-goals/${editingGoal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...goalData,
            currentAmount: editingGoal.currentAmount,
            status: editingGoal.status
          })
        })
      } else {
        response = await fetch('/api/savings-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(goalData)
        })
      }

      if (response.ok) {
        resetForm()
        fetchGoals()
      } else {
        const errorData = await response.json()
        console.error('Server Fehler:', errorData)
        alert('Fehler beim Speichern: ' + (errorData.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Sparziels:', error)
      alert('Fehler beim Speichern des Sparziels. Bitte versuche es erneut.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      category: 'other',
      priority: 'medium',
      monthlyContribution: '',
      familyMemberId: ''
    })
    setShowAddForm(false)
    setEditingGoal(null)
  }

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name || '',
      description: goal.description || '',
      targetAmount: safeParseFloat(goal.targetAmount).toString(),
      targetDate: goal.targetDate || '',
      category: goal.category || 'other',
      priority: goal.priority || 'medium',
      monthlyContribution: safeParseFloat(goal.monthlyContribution).toString(),
      familyMemberId: goal.familyMemberId?.toString() || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Möchtest du dieses Sparziel wirklich löschen?')) {
      try {
        await fetch(`/api/savings-goals/${id}`, { method: 'DELETE' })
        fetchGoals()
      } catch (error) {
        console.error('Fehler beim Löschen des Sparziels:', error)
      }
    }
  }

  const handleContribute = async (id: number, amount: number) => {
    try {
      await fetch(`/api/savings-goals/${id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      fetchGoals()
      
      // Zeige Erfolgsmeldung
      const goal = goals.find(g => g.id === id)
      if (goal) {
        const newAmount = parseFloat(goal.currentAmount?.toString() || '0') + amount
        console.log(`Erfolgreich ${amount}€ zu "${goal.name}" hinzugefügt. Neuer Betrag: ${newAmount.toFixed(2)}€`)
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Betrags:', error)
    }
  }

  const calculateProgress = (goal: SavingsGoal) => {
    const current = safeParseFloat(goal.currentAmount)
    const target = safeParseFloat(goal.targetAmount)
    return Math.min((current / target) * 100, 100)
  }

  const calculateMonthsRemaining = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const months = Math.max(0, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()))
    return months
  }

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[6]
  }

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sparziele</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-maxcrowds-green text-white px-4 py-2 rounded-lg hover:bg-maxcrowds-green-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Neues Sparziel</span>
        </button>
      </div>

      {/* Formular für neues/bearbeitetes Sparziel */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGoal ? 'Sparziel bearbeiten' : 'Neues Sparziel erstellen'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                  placeholder="z.B. Urlaub 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zielbetrag (€) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zieldatum *</label>
                <input
                  type="date"
                  required
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monatlicher Beitrag (€) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                  placeholder="250"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                >
                  {priorities.map(prio => (
                    <option key={prio.value} value={prio.value}>
                      {prio.label}
                    </option>
                  ))}
                </select>
              </div>
              {familyMembers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zuständig</label>
                  <select
                    value={formData.familyMemberId}
                    onChange={(e) => setFormData({ ...formData, familyMemberId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
                  >
                    <option value="">Gemeinsam</option>
                    {familyMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Beschreibe dein Sparziel..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-maxcrowds-green text-white rounded-lg hover:bg-maxcrowds-green-hover transition-colors"
              >
                {editingGoal ? 'Speichern' : 'Erstellen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sparziele Liste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = calculateProgress(goal)
          const categoryInfo = getCategoryInfo(goal.category)
          const priorityInfo = getPriorityInfo(goal.priority)
          const monthsRemaining = calculateMonthsRemaining(goal.targetDate)
          
          return (
            <div key={goal.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full bg-${priorityInfo.color}-100 text-${priorityInfo.color}-800`}>
                      {priorityInfo.label}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-gray-400 hover:text-maxcrowds-green transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Fortschritt</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Aktuell:</span>
                  <span className="font-semibold text-gray-900">{safeParseFloat(goal.currentAmount).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ziel:</span>
                  <span className="font-semibold text-gray-900">{safeParseFloat(goal.targetAmount).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fehlt:</span>
                  <span className="font-semibold text-orange-600">{Math.max(0, safeParseFloat(goal.targetAmount) - safeParseFloat(goal.currentAmount)).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monatlich:</span>
                  <span className="font-semibold text-gray-900">{safeParseFloat(goal.monthlyContribution).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verbleibend:</span>
                  <span className="font-semibold text-gray-900">{monthsRemaining} Monate</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      ref={el => inputRefs.current[`contribute-${goal.id}`] = el}
                      type="number"
                      placeholder="Betrag hinzufügen"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement
                          const amount = parseFloat(input.value)
                          if (amount && !isNaN(amount) && amount > 0) {
                            handleContribute(goal.id, amount)
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = inputRefs.current[`contribute-${goal.id}`]
                        if (input) {
                          const amount = parseFloat(input.value)
                          if (amount && !isNaN(amount) && amount > 0) {
                            handleContribute(goal.id, amount)
                            input.value = ''
                          }
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Hinzufügen
                    </button>
                  </div>
                  {goal.status === 'completed' && (
                    <div className="flex items-center space-x-1 text-green-600 px-3 py-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Erreicht</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Sparziele</h3>
          <p className="text-gray-600 mb-4">Erstelle dein erstes Sparziel, um deine Ersparnisse zu verfolgen.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-maxcrowds-green text-white px-4 py-2 rounded-lg hover:bg-maxcrowds-green-hover transition-colors"
          >
            Sparziel erstellen
          </button>
        </div>
      )}
    </div>
  )
}
