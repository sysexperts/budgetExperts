import { useState } from 'react'
import { FamilyMember } from '../types'
import { Plus, Trash2, User } from 'lucide-react'

interface FamilyMembersProps {
  familyMembers: FamilyMember[]
  onUpdate: () => void
}

export default function FamilyMembers({ familyMembers, onUpdate }: FamilyMembersProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role: role || undefined })
      })
      
      setName('')
      setRole('')
      setShowForm(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding family member:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/family-members/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Error deleting family member:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Family Members</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Add Member</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Role (optional)</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
        {familyMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No family members added yet</p>
        ) : (
          familyMembers.map((member) => (
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
                </div>
              </div>
              <button
                onClick={() => handleDelete(member.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
