import { useState } from 'react'
import { Download, FileText, Calendar, FileSpreadsheet } from 'lucide-react'
import { exportToCSV, exportToPDF, generateMonthlySummaries } from '../utils/exportUtils'

interface ExportReportsProps {
  familyMembers: any[]
  fixedCosts: any[]
  subscriptions: any[]
  installmentPlans: any[]
}

export default function ExportReports({ familyMembers, fixedCosts, subscriptions, installmentPlans }: ExportReportsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'monthly'>('csv')

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Lade Sparziele aus localStorage
      const savedGoals = localStorage.getItem('savings-goals')
      const goalsData = savedGoals ? JSON.parse(savedGoals) : []
      
      const exportData = {
        familyMembers,
        fixedCosts,
        subscriptions,
        installmentPlans,
        savingsGoals: goalsData,
        exportDate: new Date().toLocaleDateString('de-DE')
      }

      switch (exportType) {
        case 'csv':
          const csvContent = exportToCSV(exportData)
          downloadCSV(csvContent)
          break
        case 'pdf':
          await exportToPDF(exportData)
          break
        case 'monthly':
          const summaries = generateMonthlySummaries(exportData)
          downloadMonthlyReport(summaries)
          break
      }
    } catch (error) {
      console.error('Export fehlgeschlagen:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadCSV = (content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const downloadMonthlyReport = (summaries: any[]) => {
    let content = 'Monatsbericht - Budget Übersicht\n\n'
    content += `Erstellt am: ${new Date().toLocaleDateString('de-DE')}\n\n`
    content += '=====================================\n\n'
    
    summaries.forEach(summary => {
      content += `${summary.month}\n`
      content += `-------------------------------------\n`
      content += `Gesamtausgaben: ${summary.totalExpenses.toFixed(2)}€\n`
      content += `Fixkosten: ${summary.fixedCosts.toFixed(2)}€\n`
      content += `Abonnements: ${summary.subscriptions.toFixed(2)}€\n`
      content += `Ratenpläne: ${summary.installmentPlans.toFixed(2)}€\n`
      content += `Sparziele: ${summary.savingsGoals.totalCurrent.toFixed(2)}€ / ${summary.savingsGoals.totalTarget.toFixed(2)}€\n`
      content += `Fortschritt: ${((summary.savingsGoals.totalCurrent / summary.savingsGoals.totalTarget) * 100).toFixed(1)}%\n\n`
    })
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monatsbericht-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const calculateTotalExpenses = () => {
    const fixedTotal = fixedCosts.reduce((sum: number, cost: any) => sum + (cost.interval === 'monthly' ? cost.amount : cost.amount / 12), 0)
    const subsTotal = subscriptions.reduce((sum: number, sub: any) => sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12), 0)
    const installmentTotal = installmentPlans.reduce((sum: number, plan: any) => sum + plan.monthlyAmount, 0)
    return fixedTotal + subsTotal + installmentTotal
  }

  const calculateSavingsProgress = () => {
    const savedGoals = localStorage.getItem('savings-goals')
    const goalsData = savedGoals ? JSON.parse(savedGoals) : []
    const totalTarget = goalsData.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0)
    const totalCurrent = goalsData.reduce((sum: number, goal: any) => sum + goal.currentAmount, 0)
    return totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Export & Berichte</h2>
      </div>

      {/* Übersicht */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Aktuelle Übersicht</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-maxcrowds-green">{calculateTotalExpenses().toFixed(2)}€</div>
            <div className="text-sm text-gray-600 mt-1">Monatliche Ausgaben</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{calculateSavingsProgress().toFixed(1)}%</div>
            <div className="text-sm text-gray-600 mt-1">Spar-Fortschritt</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{fixedCosts.length}</div>
            <div className="text-sm text-gray-600 mt-1">Fixkosten</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{subscriptions.length}</div>
            <div className="text-sm text-gray-600 mt-1">Abonnements</div>
          </div>
        </div>
      </div>

      {/* Export Optionen */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export-Optionen</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setExportType('csv')}
            className={`p-4 rounded-lg border-2 transition-all ${
              exportType === 'csv' 
                ? 'border-maxcrowds-green bg-maxcrowds-green/10' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="font-semibold text-gray-900">CSV Export</div>
            <div className="text-sm text-gray-600 mt-1">Für Excel-Analyse</div>
          </button>

          <button
            onClick={() => setExportType('pdf')}
            className={`p-4 rounded-lg border-2 transition-all ${
              exportType === 'pdf' 
                ? 'border-maxcrowds-green bg-maxcrowds-green/10' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="font-semibold text-gray-900">PDF Bericht</div>
            <div className="text-sm text-gray-600 mt-1">Druckbarer Report</div>
          </button>

          <button
            onClick={() => setExportType('monthly')}
            className={`p-4 rounded-lg border-2 transition-all ${
              exportType === 'monthly' 
                ? 'border-maxcrowds-green bg-maxcrowds-green/10' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="font-semibold text-gray-900">Monatsübersicht</div>
            <div className="text-sm text-gray-600 mt-1">12 Monate Report</div>
          </button>
        </div>

        {/* Export Beschreibung */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">
            {exportType === 'csv' && 'CSV Export Details'}
            {exportType === 'pdf' && 'PDF Bericht Details'}
            {exportType === 'monthly' && 'Monatsübersicht Details'}
          </h4>
          <div className="text-sm text-gray-600">
            {exportType === 'csv' && (
              <p>Exportiert alle Daten als CSV-Datei für die Analyse in Excel oder anderen Tabellenkalkulationsprogrammen. Enthält Fixkosten, Abonnements, Ratenpläne und Sparziele.</p>
            )}
            {exportType === 'pdf' && (
              <p>Erstellt einen druckbaren PDF-Bericht mit allen aktuellen Finanzdaten. Ideal für Dokumentation und Präsentation.</p>
            )}
            {exportType === 'monthly' && (
              <p>Generiert eine detaillierte Monatsübersicht der letzten 12 Monate mit Ausgaben- und Sparfortschritt.</p>
            )}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center space-x-2 bg-maxcrowds-green text-white px-6 py-3 rounded-lg hover:bg-maxcrowds-green-hover transition-colors disabled:bg-gray-400"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Exportiere...</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span>Exportieren</span>
            </>
          )}
        </button>
      </div>

      {/* Letzte Exporte */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export-Tipps</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-maxcrowds-green rounded-full mt-1.5"></div>
            <p><strong>CSV Export:</strong> Perfekt für Excel-Analyse und Datenverarbeitung</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
            <p><strong>PDF Bericht:</strong> Ideal für Dokumentation und Steuer-Vorbereitung</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
            <p><strong>Monatsübersicht:</strong> Zeigt Trends und Entwicklungen über Zeit</p>
          </div>
        </div>
      </div>
    </div>
  )
}
