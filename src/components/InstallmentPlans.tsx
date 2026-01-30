import { useMemo, useState } from 'react'
import { Plus, Trash2, Coins } from 'lucide-react'
import { FamilyMember, Household, InstallmentPlan } from '../types'

interface InstallmentPlansProps {
  installmentPlans: InstallmentPlan[]
  familyMembers: FamilyMember[]
  households: Household[]
  onUpdate: () => void
}

function monthsBetween(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0
  }
  const years = endDate.getFullYear() - startDate.getFullYear()
  const months = endDate.getMonth() - startDate.getMonth()
  return Math.max(0, years * 12 + months + 1)
}

export default function InstallmentPlans({ installmentPlans, familyMembers, households, onUpdate }: InstallmentPlansProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [paymentDay, setPaymentDay] = useState('')
  const [notes, setNotes] = useState('')
  const [familyMemberId, setFamilyMemberId] = useState<number | undefined>()
  const [householdId, setHouseholdId] = useState<number | undefined>()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM format
  const [paidInstallments, setPaidInstallments] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('paid-installments')
    return saved ? JSON.parse(saved) : {}
  })

  const totalMonthly = useMemo(() => installmentPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0), [installmentPlans])

  // Speichere bezahlte Raten im localStorage
  const togglePaidInstallment = (planId: number, month: string) => {
    const key = `${planId}-${month}`
    const newPaidInstallments = {
      ...paidInstallments,
      [key]: !paidInstallments[key]
    }
    setPaidInstallments(newPaidInstallments)
    localStorage.setItem('paid-installments', JSON.stringify(newPaidInstallments))
  }

  // Generiere Monate für den Filter
  const generateMonthOptions = () => {
    const options = []
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    
    // Letzte 6 Monate + nächste 6 Monate
    for (let i = -6; i <= 6; i++) {
      const date = new Date(currentYear, currentMonth + i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const monthName = date.toLocaleString('de-DE', { month: 'long', year: 'numeric' })
      options.push({
        value: `${year}-${month}`,
        label: monthName,
        isCurrent: i === 0
      })
    }
    return options
  }

  // Prüfe ob eine Rate für den ausgewählten Monat bezahlt wurde
  const isInstallmentPaid = (planId: number, month: string) => {
    const key = `${planId}-${month}`
    return paidInstallments[key] || false
  }

  // Berechne unbezahlte Raten für den ausgewählten Monat
  const getUnpaidInstallmentsForMonth = () => {
    return installmentPlans.filter(plan => !isInstallmentPaid(plan.id, selectedMonth))
  }

  const unpaidMonthlyTotal = useMemo(() => {
    return getUnpaidInstallmentsForMonth().reduce((sum, plan) => sum + plan.monthlyAmount, 0)
  }, [installmentPlans, selectedMonth, paidInstallments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await fetch('/api/installment-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          startDate,
          endDate,
          monthlyAmount: parseFloat(monthlyAmount),
          totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
          downPayment: downPayment ? parseFloat(downPayment) : undefined,
          interestRate: interestRate ? parseFloat(interestRate) : undefined,
          paymentDay: paymentDay ? parseInt(paymentDay) : undefined,
          notes: notes || undefined,
          familyMemberId: familyMemberId || undefined,
          householdId: householdId || undefined
        })
      })

      setName('')
      setStartDate('')
      setEndDate('')
      setMonthlyAmount('')
      setTotalAmount('')
      setDownPayment('')
      setInterestRate('')
      setPaymentDay('')
      setNotes('')
      setFamilyMemberId(undefined)
      setHouseholdId(undefined)
      setShowForm(false)
      onUpdate()
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Ratenplans:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/installment-plans/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Fehler beim Löschen des Ratenplans:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ratenpläne</h1>
        <p className="text-gray-600 mt-1">Verwalte deine Ratenzahlungen und tracke bezahlte Raten.</p>
      </div>

      {/* Monatsfilter und Zusammenfassung */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monat auswählen</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {generateMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.isCurrent && '(Aktuell)'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Unbezahlte Raten im {new Date(selectedMonth + '-01').toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</div>
            <div className="text-2xl font-bold text-gray-900">{unpaidMonthlyTotal.toFixed(2)} €</div>
            <div className="text-xs text-gray-500">von {totalMonthly.toFixed(2)} € gesamt</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gesamtrate pro Monat</h2>
            <p className="text-3xl font-bold text-maxcrowds-green mt-2">{totalMonthly.toFixed(2)}€</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center space-x-2 bg-maxcrowds-green text-white px-4 py-2 rounded-lg hover:bg-maxcrowds-green-hover"
          >
            <Plus className="h-5 w-5" />
            <span>Ratenplan hinzufügen</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monatliche Rate (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Startdatum *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enddatum *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gesamtsumme (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anzahlung (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zinssatz (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zahlungstag</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Haushalt</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Familienmitglied</label>
                <select
                  value={familyMemberId || ''}
                  onChange={(e) => setFamilyMemberId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Keins</option>
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-maxcrowds-green text-white px-4 py-2 rounded-lg hover:bg-maxcrowds-green-hover"
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

        <div className="mt-6 space-y-3">
          {installmentPlans.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Noch keine Ratenpläne erfasst</p>
          ) : (
            installmentPlans.map((plan) => {
              const member = familyMembers.find((m) => m.id === plan.familyMemberId)
              const household = households.find((h) => h.id === plan.householdId)
              const durationMonths = monthsBetween(plan.startDate, plan.endDate)

              return (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-maxcrowds-light-gray rounded-full flex items-center justify-center">
                      <Coins className="h-5 w-5 text-maxcrowds-green" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <p className="text-sm text-gray-500">
                        {plan.startDate} – {plan.endDate} {durationMonths > 0 && `(${durationMonths} Monate)`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member ? member.name : household ? household.name : 'Allgemein'}
                        {plan.paymentDay ? ` • Zahlungstag ${plan.paymentDay}.` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Checkbox für bezahlte Rate */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isInstallmentPaid(plan.id, selectedMonth)}
                        onChange={() => togglePaidInstallment(plan.id, selectedMonth)}
                        className="w-4 h-4 text-maxcrowds-green border-gray-300 rounded focus:ring-maxcrowds-green"
                        title={`Rate für ${new Date(selectedMonth + '-01').toLocaleString('de-DE', { month: 'long', year: 'numeric' })} als bezahlt markieren`}
                      />
                      <label className="ml-2 text-xs text-gray-500 cursor-pointer">
                        {isInstallmentPaid(plan.id, selectedMonth) ? 'Bezahlt' : 'Offen'}
                      </label>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${isInstallmentPaid(plan.id, selectedMonth) ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {plan.monthlyAmount.toFixed(2)} €
                      </p>
                      <p className="text-sm text-gray-500">Monatliche Rate</p>
                      {(plan.totalAmount != null || plan.downPayment != null || plan.interestRate != null) && (
                        <p className="text-xs text-gray-400">
                          {plan.totalAmount != null ? `Gesamt ${plan.totalAmount.toFixed(2)}€` : ''}
                          {plan.totalAmount != null && plan.downPayment != null ? ' • ' : ''}
                          {plan.downPayment != null ? `Anzahlung ${plan.downPayment.toFixed(2)}€` : ''}
                          {(plan.totalAmount != null || plan.downPayment != null) && plan.interestRate != null ? ' • ' : ''}
                          {plan.interestRate != null ? `Zins ${plan.interestRate.toFixed(2)}%` : ''}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Ratenplan löschen"
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
