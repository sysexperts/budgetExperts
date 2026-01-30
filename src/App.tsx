import { useState, useEffect } from 'react'
import { Download, Menu, X } from 'lucide-react'
import { Menu as HeadlessMenu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import Dashboard from './components/Dashboard'
import FixedCosts from './components/FixedCosts'
import Subscriptions from './components/Subscriptions'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import MonthlyPayments from './components/MonthlyPayments'
import InstallmentPlans from './components/InstallmentPlans'
import SavingsGoalsSimple from './components/SavingsGoalsSimple'
import { FamilyMember, FixedCost, Subscription, Household, Category, InstallmentPlan } from './types'

type Tab = 'dashboard' | 'analytics' | 'subscriptions' | 'costs' | 'settings' | 'installments' | 'savings' | 'monthly'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    // Tab aus URL auslesen oder Dashboard als Default
    const savedTab = localStorage.getItem('activeTab')
    return (savedTab as Tab) || 'dashboard'
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const sessionId = 'local-user' // Lokaler Benutzer - kein Login nötig

  // Tab in localStorage speichern und URL aktualisieren
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab)
    // URL aktualisieren ohne Page Reload
    const url = new URL(window.location.href)
    url.searchParams.set('tab', activeTab)
    window.history.replaceState({}, '', url.toString())
  }, [activeTab])

  // Tab aus URL beim Laden wiederherstellen
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabFromUrl = urlParams.get('tab') as Tab
    if (tabFromUrl && ['dashboard', 'analytics', 'subscriptions', 'costs', 'settings', 'installments', 'savings', 'monthly'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [])

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
                      <div className="flex items-center">
                        <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                          <img src="/logo.png" alt="monetaX" className="h-10 w-auto object-contain" />
                        </div>
                      </div>
                      <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                        {/* Monthly Payments Dropdown with Headless UI */}
                        <HeadlessMenu>
                          <MenuButton
                            className={`${
                              ['monthly', 'costs', 'subscriptions', 'installments'].includes(activeTab)
                                ? 'text-gray-900 border-b-2 border-gray-900'
                                : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300'
                            } px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1`}
                          >
                            <span>Monatliche Zahlungen</span>
                            <svg className="w-4 h-4 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </MenuButton>
                          
                          <MenuItems
                            transition
                            anchor="bottom"
                            className="absolute left-0 mt-1 w-48 origin-top rounded-lg bg-white border border-gray-200 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0"
                          >
                            <MenuItem>
                              <button
                                onClick={() => setActiveTab('monthly')}
                                className={`${
                                  activeTab === 'monthly'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                } block w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200`}
                              >
                                Übersicht
                              </button>
                            </MenuItem>
                            <MenuItem>
                              <button
                                onClick={() => setActiveTab('costs')}
                                className={`${
                                  activeTab === 'costs'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                } block w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200`}
                              >
                                Fixkosten
                              </button>
                            </MenuItem>
                            <MenuItem>
                              <button
                                onClick={() => setActiveTab('subscriptions')}
                                className={`${
                                  activeTab === 'subscriptions'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                } block w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200`}
                              >
                                Abonnements
                              </button>
                            </MenuItem>
                            <MenuItem>
                              <button
                                onClick={() => setActiveTab('installments')}
                                className={`${
                                  activeTab === 'installments'
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                } block w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200`}
                              >
                                Ratenzahlungen
                              </button>
                            </MenuItem>
                          </MenuItems>
                        </HeadlessMenu>
                        
                        <button
                          onClick={() => setActiveTab('savings')}
                          className={`${
                            activeTab === 'savings'
                              ? 'text-gray-900 border-b-2 border-gray-900'
                              : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300'
                          } px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                        >
                          Sparziele
                        </button>
                        <button
                          onClick={() => setActiveTab('analytics')}
                          className={`${
                            activeTab === 'analytics'
                              ? 'text-gray-900 border-b-2 border-gray-900'
                              : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300'
                          } px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                        >
                          Statistik
                        </button>
                        <button
                          onClick={() => setActiveTab('settings')}
                          className={`${
                            activeTab === 'settings'
                              ? 'text-gray-900 border-b-2 border-gray-900'
                              : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300'
                          } px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                        >
                          Einstellungen
                        </button>
                      </div>
                      <div className="flex items-center">
                        {/* Mobile menu button */}
                        <div className="sm:hidden">
                          <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                          >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                          </button>
                        </div>
                        <button
                          onClick={() => handleExport('csv')}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 ml-2"
                          title="Export CSV"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </nav>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                  <div className="sm:hidden bg-white border-b border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                      {/* Monthly Payments Mobile */}
                      <div className="space-y-1">
                        <button
                          onClick={() => { setActiveTab('monthly'); setMobileMenuOpen(false); }}
                          className={`${
                            activeTab === 'monthly'
                              ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                          } block w-full text-left py-2 px-3 text-base font-medium transition-colors duration-200`}
                        >
                          Monatliche Zahlungen
                        </button>
                        <div className="pl-6 space-y-1">
                          <button
                            onClick={() => { setActiveTab('costs'); setMobileMenuOpen(false); }}
                            className={`${
                              activeTab === 'costs'
                                ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                            } block w-full text-left py-2 px-3 text-sm font-medium transition-colors duration-200`}
                          >
                            Fixkosten
                          </button>
                          <button
                            onClick={() => { setActiveTab('subscriptions'); setMobileMenuOpen(false); }}
                            className={`${
                              activeTab === 'subscriptions'
                                ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                            } block w-full text-left py-2 px-3 text-sm font-medium transition-colors duration-200`}
                          >
                            Abonnements
                          </button>
                          <button
                            onClick={() => { setActiveTab('installments'); setMobileMenuOpen(false); }}
                            className={`${
                              activeTab === 'installments'
                                ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                            } block w-full text-left py-2 px-3 text-sm font-medium transition-colors duration-200`}
                          >
                            Ratenzahlungen
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => { setActiveTab('savings'); setMobileMenuOpen(false); }}
                        className={`${
                          activeTab === 'savings'
                            ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                        } block w-full text-left py-2 px-3 text-base font-medium transition-colors duration-200`}
                      >
                        Sparziele
                      </button>
                      <button
                        onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
                        className={`${
                          activeTab === 'analytics'
                            ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                        } block w-full text-left py-2 px-3 text-base font-medium transition-colors duration-200`}
                      >
                        Statistik
                      </button>
                      <button
                        onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                        className={`${
                          activeTab === 'settings'
                            ? 'bg-gray-100 text-gray-900 border-l-4 border-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                        } block w-full text-left py-2 px-3 text-base font-medium transition-colors duration-200`}
                      >
                        Einstellungen
                      </button>
                    </div>
                  </div>
                )}

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
              {activeTab === 'installments' && (
                <InstallmentPlans
                  installmentPlans={installmentPlans}
                  familyMembers={familyMembers}
                  households={households}
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
