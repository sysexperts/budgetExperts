import { useState } from 'react'
import { FamilyMember, Subscription, Household, Category } from '../types'
import { Plus, Trash2, CreditCard, Edit, Home, Car, ShoppingCart, Utensils, Heart, Briefcase, Gamepad2, Book, Dumbbell, Music, Film, Plane, Coffee, Smartphone, Laptop, Shirt, Pill, GraduationCap, Baby, Dog, Cat, TreePine, Zap, Shield, Wrench } from 'lucide-react'

interface SubscriptionsProps {
  subscriptions: Subscription[]
  familyMembers: FamilyMember[]
  households: Household[]
  categories: Category[]
  onUpdate: () => void
}

const availableIcons = [
  { name: 'Tag', icon: CreditCard },
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Utensils', icon: Utensils },
  { name: 'Heart', icon: Heart },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Book', icon: Book },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Music', icon: Music },
  { name: 'Film', icon: Film },
  { name: 'Plane', icon: Plane },
  { name: 'Coffee', icon: Coffee },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Laptop', icon: Laptop },
  { name: 'Shirt', icon: Shirt },
  { name: 'Pill', icon: Pill },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Baby', icon: Baby },
  { name: 'Dog', icon: Dog },
  { name: 'Cat', icon: Cat },
  { name: 'TreePine', icon: TreePine },
  { name: 'Zap', icon: Zap },
  { name: 'Shield', icon: Shield },
  { name: 'Wrench', icon: Wrench }
];

const getCategoryIcon = (categoryName: string, categories: Category[]) => {
  const category = categories.find(c => c.name === categoryName);
  if (category && category.icon) {
    const iconData = availableIcons.find(i => i.name === category.icon);
    return iconData ? iconData.icon : CreditCard;
  }
  return CreditCard;
};

export default function Subscriptions({ subscriptions, familyMembers, households, categories, onUpdate }: SubscriptionsProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [paymentDate, setPaymentDate] = useState('1')
  const [familyMemberId, setFamilyMemberId] = useState<number | undefined>()
  const [householdId, setHouseholdId] = useState<number | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSubscription) {
        // Update existing subscription
        await fetch(`/api/subscriptions/${editingSubscription.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            amount: parseFloat(amount),
            interval,
            paymentDate: parseInt(paymentDate),
            familyMemberId: familyMemberId || undefined,
            householdId: householdId || undefined
          })
        })
      } else {
        // Create new subscription
        await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            amount: parseFloat(amount),
            interval,
            paymentDate: parseInt(paymentDate),
            familyMemberId: familyMemberId || undefined,
            householdId: householdId || undefined
          })
        })
      }
      
      resetForm()
      setShowForm(false)
      setEditingSubscription(null)
      onUpdate()
    } catch (error) {
      console.error('Error saving subscription:', error)
    }
  }

  const resetForm = () => {
    setName('')
    setCategory('')
    setAmount('')
    setInterval('monthly')
    setPaymentDate('1')
    setFamilyMemberId(undefined)
    setHouseholdId(undefined)
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setName(subscription.name)
    setCategory(subscription.category)
    setAmount(subscription.amount.toString())
    setInterval(subscription.interval)
    setPaymentDate(subscription.paymentDate.toString())
    setFamilyMemberId(subscription.familyMemberId)
    setHouseholdId(subscription.householdId)
    setShowForm(true)
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
        <h1 className="text-3xl font-bold text-gray-900">Abonnements</h1>
        <p className="text-gray-600 mt-1">Verwalte deine wiederkehrenden Abonnements</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Monatliche Gesamtkosten</h2>
            <p className="text-3xl font-bold text-maxcrowds-green mt-2">{totalMonthly.toFixed(2)} €</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              if (!showForm) {
                resetForm()
                setEditingSubscription(null)
              }
            }}
            className="flex items-center space-x-2 bg-maxcrowds-green text-white px-4 py-2 rounded-lg hover:bg-maxcrowds-green-hover transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>{editingSubscription ? 'Abonnement bearbeiten' : 'Abonnement hinzufügen'}</span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maxcrowds-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maxcrowds-green focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maxcrowds-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intervall *</label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value as 'monthly' | 'yearly')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maxcrowds-green focus:border-transparent"
                >
                  <option value="monthly">Monatlich</option>
                  <option value="yearly">Jährlich</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zahlungstag *</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maxcrowds-green focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Haushalt (optional)</label>
                <select
                  value={householdId || ''}
                  onChange={(e) => setHouseholdId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maxcrowds-green focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Familienmitglied (optional)</label>
                <select
                  value={familyMemberId || ''}
                  onChange={(e) => setFamilyMemberId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maxcrowds-green focus:border-transparent"
                >
                  <option value="">Keins</option>
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
                className="bg-maxcrowds-green text-white px-4 py-2 rounded-lg hover:bg-maxcrowds-green-hover transition-colors"
              >
                Speichern
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSubscription(null)
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
          {subscriptions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Noch keine Abonnements hinzugefügt</p>
          ) : (
            subscriptions.map((sub) => {
              const member = familyMembers.find(m => m.id === sub.familyMemberId)
              const household = households.find(h => h.id === sub.householdId)
              const monthlyAmount = sub.interval === 'monthly' ? sub.amount : sub.amount / 12
              
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-maxcrowds-light-gray rounded-full flex items-center justify-center">
                      {(() => {
                        const IconComponent = getCategoryIcon(sub.category, categories);
                        return <IconComponent className="h-5 w-5 text-maxcrowds-green" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sub.name}</p>
                      <p className="text-sm text-gray-500">
                        {sub.category} • Fällig am {sub.paymentDate}. • {member ? member.name : household ? household.name : 'Allgemein'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{sub.amount.toFixed(2)} €</p>
                      <p className="text-sm text-gray-500">
                        {sub.interval === 'monthly' ? 'Monatlich' : 'Jährlich'} ({monthlyAmount.toFixed(2)} €/Monat)
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(sub)}
                      className="text-maxcrowds-green hover:text-maxcrowds-green-hover"
                      title="Abonnement bearbeiten"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Abonnement löschen"
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
    </div>
  )
}
