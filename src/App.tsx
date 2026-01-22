import { useState, useEffect } from 'react'
import { Users, DollarSign, Download } from 'lucide-react'
import Dashboard from './components/Dashboard'
import FamilyMembers from './components/FamilyMembers'
import FixedCosts from './components/FixedCosts'
import Subscriptions from './components/Subscriptions'
import Analytics from './components/Analytics'
import ThisMonth from './components/ThisMonth'
import Households from './components/Households'
import { FamilyMember, FixedCost, Subscription, Household } from './types'

type Tab = 'dashboard' | 'analytics' | 'subscriptions' | 'households' | 'members' | 'costs' | 'thismonth'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [households, setHouseholds] = useState<Household[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [membersRes, costsRes, subsRes, householdsRes] = await Promise.all([
        fetch('/api/family-members'),
        fetch('/api/fixed-costs'),
        fetch('/api/subscriptions'),
        fetch('/api/households')
      ])
      
      setFamilyMembers(await membersRes.json())
      setFixedCosts(await costsRes.json())
      setSubscriptions(await subsRes.json())
      setHouseholds(await householdsRes.json())
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/export?format=${format}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `budget-export-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Fehler beim Exportieren:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <DollarSign className="h-6 w-6" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Budget Planer</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Übersicht
                </button>
                <button
                  onClick={() => setActiveTab('thismonth')}
                  className={`${
                    activeTab === 'thismonth'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dieser Monat
                </button>
                <button
                  onClick={() => setActiveTab('households')}
                  className={`${
                    activeTab === 'households'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Haushalte
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`${
                    activeTab === 'members'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Mitglieder
                </button>
                <button
                  onClick={() => setActiveTab('costs')}
                  className={`${
                    activeTab === 'costs'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Fixkosten
                </button>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`${
                    activeTab === 'subscriptions'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Abonnements
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Statistik
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleExport('csv')}
                className="text-gray-500 hover:text-gray-700"
                title="Export CSV"
              >
                <Download className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            familyMembers={familyMembers}
            fixedCosts={fixedCosts}
            subscriptions={subscriptions}
          />
        )}
        {activeTab === 'thismonth' && (
          <ThisMonth />
        )}
        {activeTab === 'households' && (
          <Households />
        )}
        {activeTab === 'members' && (
          <FamilyMembers 
            familyMembers={familyMembers}
            households={households}
            onUpdate={loadData}
          />
        )}
        {activeTab === 'costs' && (
          <FixedCosts 
            fixedCosts={fixedCosts}
            familyMembers={familyMembers}
            households={households}
            onUpdate={loadData}
          />
        )}
        {activeTab === 'subscriptions' && (
          <Subscriptions 
            subscriptions={subscriptions}
            familyMembers={familyMembers}
            households={households}
            onUpdate={loadData}
          />
        )}
        {activeTab === 'analytics' && (
          <Analytics 
            familyMembers={familyMembers}
            fixedCosts={fixedCosts}
            subscriptions={subscriptions}
          />
        )}
      </main>
    </div>
  )
}

export default App
