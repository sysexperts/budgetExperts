import { useState, useEffect } from 'react'
import { Users, Download, Languages } from 'lucide-react'
import Dashboard from './components/Dashboard'
import FixedCosts from './components/FixedCosts'
import Subscriptions from './components/Subscriptions'
import Analytics from './components/Analytics'
import ThisMonth from './components/ThisMonth'
import Settings from './components/Settings'
import InstallmentPlans from './components/InstallmentPlans'
import SetupWizard from './components/SetupWizard'
import TutorialTooltip from './components/TutorialTooltip'
import { FamilyMember, FixedCost, Subscription, Household, Category, InstallmentPlan } from './types'

type Tab = 'dashboard' | 'analytics' | 'subscriptions' | 'costs' | 'thismonth' | 'settings' | 'installments'
type Language = 'de' | 'en'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showSetup, setShowSetup] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [language, setLanguage] = useState<Language>('de')

  useEffect(() => {
    // Prüfe ob Setup bereits abgeschlossen wurde
    const setupCompleted = localStorage.getItem('setupCompleted')
    const tutorialCompleted = localStorage.getItem('tutorialCompleted')
    
    if (!setupCompleted) {
      setShowSetup(true)
    } else if (!tutorialCompleted) {
      setShowTutorial(true)
    }
    
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [membersRes, costsRes, subsRes, installmentRes, householdsRes, categoriesRes] = await Promise.all([
        fetch('/api/family-members'),
        fetch('/api/fixed-costs'),
        fetch('/api/subscriptions'),
        fetch('/api/installment-plans'),
        fetch('/api/households'),
        fetch('/api/categories')
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

  const handleSetupComplete = () => {
    setShowSetup(false)
    setShowTutorial(true)
    loadData()
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
  }

  return (
    <>
      {showSetup && <SetupWizard onComplete={handleSetupComplete} />}
      {showTutorial && <TutorialTooltip onComplete={handleTutorialComplete} />}
      
      <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="flex items-center">
                  <span className="text-3xl font-black bg-gradient-to-r from-blue-300 via-blue-500 to-blue-700 bg-clip-text text-transparent tracking-tight">
                    moneta
                  </span>
                  <div className="ml-1 flex flex-col items-center justify-center">
                    <div className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mt-0.5"></div>
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
                  onClick={() => setActiveTab('installments')}
                  className={`${
                    activeTab === 'installments'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Ratenpläne
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
                onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sprache wechseln"
              >
                <Languages className="h-5 w-5" />
                <span className="font-bold">{language.toUpperCase()}</span>
              </button>
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
            installmentPlans={installmentPlans}
          />
        )}
        {activeTab === 'thismonth' && (
          <ThisMonth />
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
        {activeTab === 'installments' && (
          <InstallmentPlans
            installmentPlans={installmentPlans}
            familyMembers={familyMembers}
            households={households}
            onUpdate={loadData}
          />
        )}
        {activeTab === 'settings' && (
          <Settings 
            households={households}
            familyMembers={familyMembers}
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
    </>
  )
}

export default App
