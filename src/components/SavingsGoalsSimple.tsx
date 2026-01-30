import { useState, useEffect } from 'react'
import { Target, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react'
import { FamilyMember } from '../types'

interface SavingsGoalsSimpleProps {
  familyMembers: FamilyMember[]
}

interface SimpleSavingsGoal {
  id: number
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  priority: 'low' | 'medium' | 'high'
  monthlyContribution: number
  createdAt: string
  familyMemberId?: number // Optional für gemeinsame Ziele
  isShared: boolean // Gemeinsames Ziel oder privat
}

export default function SavingsGoalsSimple({ familyMembers }: SavingsGoalsSimpleProps) {
  const [goals, setGoals] = useState<SimpleSavingsGoal[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SimpleSavingsGoal | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'other',
    priority: 'medium' as 'low' | 'medium' | 'high',
    monthlyContribution: '',
    familyMemberId: '',
    isShared: false
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

  // Lade Ziele aus localStorage beim Start
  useEffect(() => {
    const savedGoals = localStorage.getItem('savings-goals')
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [])

  // Speichere Ziele immer wenn sie sich ändern
  useEffect(() => {
    localStorage.setItem('savings-goals', JSON.stringify(goals))
  }, [goals])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const goalData: SimpleSavingsGoal = {
      id: editingGoal ? editingGoal.id : Date.now(),
      name: formData.name,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: editingGoal ? editingGoal.currentAmount : 0,
      targetDate: formData.targetDate,
      category: formData.category,
      priority: formData.priority,
      monthlyContribution: parseFloat(formData.monthlyContribution),
      createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString(),
      familyMemberId: formData.familyMemberId ? parseInt(formData.familyMemberId) : undefined,
      isShared: formData.isShared
    }

    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? goalData : g))
    } else {
      setGoals([...goals, goalData])
    }

    resetForm()
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
      familyMemberId: '',
      isShared: false
    })
    setShowAddForm(false)
    setEditingGoal(null)
  }

  const handleEdit = (goal: SimpleSavingsGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority,
      monthlyContribution: goal.monthlyContribution.toString(),
      familyMemberId: goal.familyMemberId?.toString() || '',
      isShared: goal.isShared
    })
    setShowAddForm(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Möchtest du dieses Sparziel wirklich löschen?')) {
      setGoals(goals.filter(g => g.id !== id))
    }
  }

  const handleContribute = (id: number, amount: number) => {
    setGoals(goals.map(g => 
      g.id === id 
        ? { ...g, currentAmount: g.currentAmount + amount }
        : g
    ))
  }

  const calculateProgress = (goal: SimpleSavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gemeinsames Ziel</label>
                <div className="flex items-center space-x-3 mt-2">
                  <input
                    type="checkbox"
                    id="isShared"
                    checked={formData.isShared}
                    onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                    className="h-4 w-4 text-maxcrowds-green focus:ring-maxcrowds-green border-gray-300 rounded"
                  />
                  <label htmlFor="isShared" className="text-sm text-gray-700">
                    Für die ganze Familie
                  </label>
                </div>
              </div>
              {!formData.isShared && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zuständiges Mitglied</label>
                  <select
                    value={formData.familyMemberId}
                    onChange={(e) => setFormData({ ...formData, familyMemberId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                  >
                    <option value="">Keine Zuordnung</option>
                    {familyMembers.map(member => (
                      <option key={member.id} value={member.id.toString()}>
                        {member.name} {member.role && `(${member.role})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
          const remaining = goal.targetAmount - goal.currentAmount
          
          return (
            <div key={goal.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                    <div className="flex items-center space-x-2">
                      {goal.isShared && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          👨‍👩‍👧‍👦 Gemeinsam
                        </span>
                      )}
                      <span className={`inline-block px-2 py-1 text-xs rounded-full bg-${priorityInfo.color}-100 text-${priorityInfo.color}-800`}>
                        {priorityInfo.label}
                      </span>
                    </div>
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
                  <span className="font-semibold text-gray-900">{goal.currentAmount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ziel:</span>
                  <span className="font-semibold text-gray-900">{goal.targetAmount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fehlt:</span>
                  <span className="font-semibold text-orange-600">{Math.max(0, remaining).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monatlich:</span>
                  <span className="font-semibold text-gray-900">{goal.monthlyContribution.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verbleibend:</span>
                  <span className="font-semibold text-gray-900">{monthsRemaining} Monate</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {progress >= 100 ? (
                  <div className="flex items-center justify-center bg-green-50 px-4 py-3 rounded-lg border border-green-200 animate-pulse">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <div className="text-center">
                      <div className="text-base font-semibold text-green-800">🎉 Erreicht!</div>
                      <div className="text-sm text-green-600">Ziel vollendet</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Betrag hinzufügen"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-maxcrowds-green focus:border-maxcrowds-green"
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
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement
                          if (input) {
                            const amount = parseFloat(input.value)
                            if (amount && !isNaN(amount) && amount > 0) {
                              handleContribute(goal.id, amount)
                              input.value = ''
                            }
                          }
                        }}
                        className="bg-maxcrowds-green text-white px-4 py-2 rounded-lg hover:bg-maxcrowds-green-hover transition-colors text-sm font-medium"
                      >
                        Hinzufügen
                      </button>
                    </div>
                  </div>
                )}
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
