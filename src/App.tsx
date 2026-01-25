import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import Dashboard from './components/Dashboard'
import FixedCosts from './components/FixedCosts'
import Subscriptions from './components/Subscriptions'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import MonthlyPayments from './components/MonthlyPayments'
import SavingsGoalsSimple from './components/SavingsGoalsSimple'
import { FamilyMember, FixedCost, Subscription, Household, Category, InstallmentPlan } from './types'

type Tab = 'dashboard' | 'analytics' | 'subscriptions' | 'costs' | 'settings' | 'installments' | 'savings' | 'monthly'
function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const sessionId = 'local-user' // Lokaler Benutzer - kein Login nötig

  useEffect(() => {
    // Login entfernt - direkt zur Anwendung
    loadData()
    
    // Setup-Assistent und Tutorial deaktiviert - direkt zur Anwendung
    // Markiere als abgeschlossen, damit sie nicht mehr angezeigt werden
    localStorage.setItem('setupCompleted', 'true')
    localStorage.setItem('tutorialCompleted', 'true')
  }, [])

  const loadData = async () => {
    if (!sessionId) return
    
    try {
      const headers = {
        'Authorization': `Bearer ${sessionId}`
      }
      
      const [membersRes, costsRes, subsRes, installmentRes, householdsRes, categoriesRes] = await Promise.all([
        fetch('/api/family-members', { headers }),
        fetch('/api/fixed-costs', { headers }),
        fetch('/api/subscriptions', { headers }),
        fetch('/api/installment-plans', { headers }),
        fetch('/api/households', { headers }),
        fetch('/api/categories', { headers })
      ])
      
      setFamilyMembers(await membersRes.json())
      setFixedCosts(await costsRes.json())
      setSubscriptions(await subsRes.json())
      setInstallmentPlans(await installmentRes.json())
      setHouseholds(await householdsRes.json())
      setCategories(await categoriesRes.json())
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    if (!sessionId) return
    
    try {
      const response = await fetch(`/api/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      })
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
      {/* Login entfernt - direkt zur Anwendung */}
      <>
        {/* Setup-Assistent und Tutorial entfernt */}
        
        <div className="flex">
            <div className="flex-1">
                <nav className="bg-white border-b border-gray-200">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                      <div className="flex">
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <div className="flex items-center">
                            <span className="text-3xl font-black text-black tracking-tight">
                              monetaX
                            </span>
                            <div className="ml-1 flex flex-col items-center justify-center">
                              <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                              <div className="w-1 h-1 bg-black rounded-full mt-0.5"></div>
                            </div>
                          </div>
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
                            onClick={() => setActiveTab('monthly')}
                            className={`${
                              activeTab === 'monthly'
                                ? 'border-blue-500 text-gray-900'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                          >
                            Monatliche Zahlungen
                          </button>
                          <button
                            onClick={() => setActiveTab('savings')}
                            className={`${
                              activeTab === 'savings'
                                ? 'border-blue-500 text-gray-900'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                          >
                            Sparziele
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
                          <button
                            onClick={() => setActiveTab('settings')}
                            className={`${
                              activeTab === 'settings'
                                ? 'border-blue-500 text-gray-900'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                          >
                            Einstellungen
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
                  installmentPlans={installmentPlans}
                />
              )}
              {activeTab === 'costs' && (
                <FixedCosts 
                  fixedCosts={fixedCosts}
                  familyMembers={familyMembers}
                  households={households}
                  categories={categories}
                  onUpdate={loadData}
                />
              )}
              {activeTab === 'subscriptions' && (
                <Subscriptions 
                  subscriptions={subscriptions}
                  familyMembers={familyMembers}
                  households={households}
                  categories={categories}
                  onUpdate={loadData}
                />
              )}
              {activeTab === 'monthly' && (
                <MonthlyPayments
                  installmentPlans={installmentPlans}
                  fixedCosts={fixedCosts}
                  subscriptions={subscriptions}
                  familyMembers={familyMembers}
                  households={households}
                />
              )}
              {activeTab === 'savings' && (
                <SavingsGoalsSimple familyMembers={familyMembers} />
              )}
              {activeTab === 'settings' && (
                <Settings 
                  households={households}
                  familyMembers={familyMembers}
                  fixedCosts={fixedCosts}
                  subscriptions={subscriptions}
                  installmentPlans={installmentPlans}
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
      </div>
        </>
    </div>
  )
}

export default App
