import { useMemo, useState, useEffect } from 'react'
import { Coins, DollarSign, CreditCard } from 'lucide-react'
import { FamilyMember, Household, InstallmentPlan, FixedCost, Subscription } from '../types'

interface MonthlyPaymentsProps {
  installmentPlans: InstallmentPlan[]
  fixedCosts: FixedCost[]
  subscriptions: Subscription[]
  familyMembers: FamilyMember[]
  households: Household[]
}

export default function MonthlyPayments({ 
  installmentPlans, 
  fixedCosts, 
  subscriptions, 
  familyMembers, 
  households
}: MonthlyPaymentsProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM format
  const [paidItems, setPaidItems] = useState<Record<string, boolean>>({})

  // Lade paid-Items für den aktuellen Monat von der Datenbank
  useEffect(() => {
    loadPaidItems();
  }, [selectedMonth])

  const loadPaidItems = async () => {
    try {
      const response = await fetch('/api/paid-items');
      const paidItemsData = await response.json();
      
      // Filtere nur die Items für den aktuellen Monat
      const monthPaidItems = paidItemsData
        .filter((item: any) => item.item_id.startsWith(`${selectedMonth}-`))
        .reduce((acc: Record<string, boolean>, item: any) => {
          const itemId = item.item_id.replace(`${selectedMonth}-`, '');
          acc[itemId] = true; // Wenn es in der DB ist, ist es bezahlt
          return acc;
        }, {} as Record<string, boolean>)
      
      setPaidItems(monthPaidItems);
    } catch (error) {
      console.error('Fehler beim Laden der bezahlten Items:', error);
    }
  }

  // Alle monatlichen Zahlungen für den ausgewählten Monat
  const getAllMonthlyPayments = useMemo(() => {
    const payments: Array<{
      id: string
      name: string
      amount: number
      type: 'installment' | 'fixed' | 'subscription'
      familyMemberId?: number
      householdId?: number
      interval?: string
      paymentDate?: number
      startDate?: string
      endDate?: string
      category?: string
    }> = []

    // Fixe Kosten (nur monatliche)
    fixedCosts
      .filter(cost => cost.interval === 'monthly')
      .forEach(cost => {
        payments.push({
          id: `fixed-${cost.id}`,
          name: cost.name,
          amount: cost.amount,
          type: 'fixed',
          familyMemberId: cost.familyMemberId,
          householdId: cost.householdId,
          interval: cost.interval,
          category: cost.category
        })
      })

    // Abonnements (nur monatliche)
    subscriptions
      .filter(sub => sub.interval === 'monthly')
      .forEach(sub => {
        payments.push({
          id: `subscription-${sub.id}`,
          name: sub.name,
          amount: sub.amount,
          type: 'subscription',
          familyMemberId: sub.familyMemberId,
          householdId: sub.householdId,
          interval: sub.interval,
          paymentDate: sub.paymentDate,
          category: sub.category
        })
      })

    // Ratenpläne (nur wenn der Monat im Zeitraum liegt)
    installmentPlans.forEach(plan => {
      const planStart = new Date(plan.startDate)
      const planEnd = new Date(plan.endDate)
      const currentMonth = new Date(selectedMonth + '-01')
      
      if (currentMonth >= planStart && currentMonth <= planEnd) {
        payments.push({
          id: `installment-${plan.id}`,
          name: plan.name,
          amount: plan.monthlyAmount,
          type: 'installment',
          familyMemberId: plan.familyMemberId,
          householdId: plan.householdId,
          startDate: plan.startDate,
          endDate: plan.endDate
        })
      }
    })

    return payments
  }, [fixedCosts, subscriptions, installmentPlans, selectedMonth])

  // Toggle bezahlten Status über die Datenbank-API
  const togglePaidItem = async (itemId: string) => {
    const monthKey = `${selectedMonth}-${itemId}`
    const isPaid = paidItems[itemId] || false
    
    try {
      await fetch('/api/paid-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: monthKey,
          itemType: 'monthly_payment',
          paid: !isPaid
        })
      });
      
      // Lade die Daten neu
      await loadPaidItems();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Zahlungsstatus:', error);
    }
  }

  // Prüfe ob ein Item bezahlt wurde
  const isItemPaid = (itemId: string) => {
    return paidItems[itemId] || false
  }

  // Berechne Summen
  const totalMonthly = useMemo(() => {
    return getAllMonthlyPayments.reduce((sum, payment) => sum + payment.amount, 0)
  }, [getAllMonthlyPayments])

  const unpaidMonthlyTotal = useMemo(() => {
    return getAllMonthlyPayments
      .filter(payment => !isItemPaid(payment.id))
      .reduce((sum, payment) => sum + payment.amount, 0)
  }, [getAllMonthlyPayments, paidItems])

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

  // Icon für Typ
  const getIcon = (type: string) => {
    switch (type) {
      case 'installment':
        return <Coins className="h-5 w-5 text-orange-600" />
      case 'fixed':
        return <DollarSign className="h-5 w-5 text-emerald-600" />
      case 'subscription':
        return <CreditCard className="h-5 w-5 text-indigo-600" />
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />
    }
  }

  // Hintergrundfarbe für Typ
  const getBgColor = (type: string) => {
    switch (type) {
      case 'installment':
        return 'bg-orange-100'
      case 'fixed':
        return 'bg-emerald-100'
      case 'subscription':
        return 'bg-indigo-100'
      default:
        return 'bg-gray-100'
    }
  }

  // Typ-Bezeichnung
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'installment':
        return 'Rate'
      case 'fixed':
        return 'Fixe Kosten'
      case 'subscription':
        return 'Abonnement'
      default:
        return 'Sonstiges'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Monatliche Zahlungen</h1>
        <p className="text-gray-600 mt-1">Übersicht aller monatlichen Zahlungen und tracke bezahlte Posten.</p>
      </div>

      {/* Monatsfilter und Zusammenfassung */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monat auswählen</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {generateMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.isCurrent && '(Aktuell)'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Offen im {new Date(selectedMonth + '-01').toLocaleString('de-DE', { month: 'long', year: 'numeric' })}</div>
            <div className="text-2xl font-semibold text-gray-900">{unpaidMonthlyTotal.toFixed(2)} €</div>
            <div className="text-xs text-gray-500">von {totalMonthly.toFixed(2)} € gesamt</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gesamt monatlich</h2>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{totalMonthly.toFixed(2)}€</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {getAllMonthlyPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Keine monatlichen Zahlungen für diesen Monat gefunden</p>
          ) : (
            getAllMonthlyPayments.map((payment) => {
              const member = familyMembers.find((m) => m.id === payment.familyMemberId)
              const household = households.find((h) => h.id === payment.householdId)
              const isPaid = isItemPaid(payment.id)

              return (
                <div
                  key={payment.id}
                  className={`flex items-center justify-between p-4 rounded-md border ${isPaid ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'} hover:bg-gray-50 transition-colors duration-200`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Checkbox ganz links */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isPaid}
                        onChange={() => togglePaidItem(payment.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        title={`Als bezahlt markieren für ${new Date(selectedMonth + '-01').toLocaleString('de-DE', { month: 'long', year: 'numeric' })}`}
                      />
                      <label className="ml-2 text-xs text-gray-500 cursor-pointer">
                        {isPaid ? 'Bezahlt' : 'Offen'}
                      </label>
                    </div>
                    
                    <div className={`w-10 h-10 ${getBgColor(payment.type)} rounded-full flex items-center justify-center`}>
                      {getIcon(payment.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.name}</p>
                      <p className="text-sm text-gray-500">
                        {getTypeLabel(payment.type)}
                        {payment.category && ` • ${payment.category}`}
                        {payment.paymentDate && ` • Zahlungstag ${payment.paymentDate}.`}
                        {payment.startDate && payment.endDate && ` • ${payment.startDate} – ${payment.endDate}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member ? member.name : household ? household.name : 'Allgemein'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {payment.amount.toFixed(2)} €
                    </p>
                    <p className="text-sm text-gray-500">{getTypeLabel(payment.type)}</p>
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
