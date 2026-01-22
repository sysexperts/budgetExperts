import { useState, useEffect } from 'react'
import { Users, DollarSign, CreditCard, BarChart3, Download, Calendar } from 'lucide-react'
import Dashboard from './components/Dashboard'
import FamilyMembers from './components/FamilyMembers'
import FixedCosts from './components/FixedCosts'
import Subscriptions from './components/Subscriptions'
import Analytics from './components/Analytics'
import ThisMonth from './components/ThisMonth'
import { FamilyMember, FixedCost, Subscription } from './types'

type Tab = 'dashboard' | 'analytics' | 'subscriptions' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [membersRes, costsRes, subsRes] = await Promise.all([
        fetch('/api/family-members'),
        fetch('/api/fixed-costs'),
        fetch('/api/subscriptions')
      ])
      
      setFamilyMembers(await membersRes.json())
      setFixedCosts(await costsRes.json())
      setSubscriptions(await subsRes.json())
    } catch (error) {
      console.error('Error loading data:', error)
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
      console.error('Error exporting data:', error)
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
                <span className="ml-3 text-xl font-bold text-gray-900">Budget Planner</span>
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
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`${
                    activeTab === 'subscriptions'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Subscriptions
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Settings
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
        {activeTab === 'analytics' && (
          <Analytics 
            familyMembers={familyMembers}
            fixedCosts={fixedCosts}
            subscriptions={subscriptions}
          />
        )}
        {activeTab === 'subscriptions' && (
          <Subscriptions 
            subscriptions={subscriptions}
            familyMembers={familyMembers}
            onUpdate={loadData}
          />
        )}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <FamilyMembers 
              familyMembers={familyMembers}
              onUpdate={loadData}
            />
            <FixedCosts 
              fixedCosts={fixedCosts}
              familyMembers={familyMembers}
              onUpdate={loadData}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
