import { useState } from 'react'
import { FamilyMember, Household } from '../types'
import { Plus, Trash2, User } from 'lucide-react'

interface FamilyMembersProps {
  familyMembers: FamilyMember[]
  households: Household[]
  onUpdate: () => void
}

export default function FamilyMembers({ familyMembers, households, onUpdate }: FamilyMembersProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [householdId, setHouseholdId] = useState<number | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role: role || undefined, householdId })
      })
      
      setName('')
      setRole('')
      setHouseholdId(undefined)
      setShowForm(false)
      onUpdate()
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Mitglieds:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/family-members/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Fehler beim Löschen des Mitglieds:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Familienmitglieder</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Mitglied hinzufügen</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. Max Mustermann"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rolle (optional)</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. Vater, Mutter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Haushalt (optional)</label>
              <select
                value={householdId || ''}
                onChange={(e) => setHouseholdId(e.target.value ? Number(e.target.value) : undefined)}
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
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {familyMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Noch keine Familienmitglieder hinzugefügt</p>
        ) : (
          familyMembers.map((member) => {
            const household = households.find(h => h.id === member.householdId);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    {member.role && <p className="text-sm text-gray-500">{member.role}</p>}
                    {household && <p className="text-xs text-blue-600">{household.name}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Mitglied löschen"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}
