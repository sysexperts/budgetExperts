// Export-Hilfsfunktionen für Budget-Reports

export interface ExportData {
  familyMembers: any[]
  fixedCosts: any[]
  subscriptions: any[]
  installmentPlans: any[]
  savingsGoals: any[]
  exportDate: string
}

export interface MonthlySummary {
  month: string
  year: number
  totalExpenses: number
  fixedCosts: number
  subscriptions: number
  installmentPlans: number
  savingsGoals: {
    totalTarget: number
    totalCurrent: number
    goals: any[]
  }
}

// CSV-Export Funktion
export const exportToCSV = (data: ExportData): string => {
  let csv = 'Typ,Name,Kategorie,Betrag,Intervall,Zahlungsdatum,Familienmitglied,Startdatum,Enddatum,Monatlicher Beitrag,Gesamt,Beschreibung\n'
  
  // Fixkosten
  data.fixedCosts.forEach(cost => {
    const member = data.familyMembers.find(m => m.id === cost.family_member_id)
    csv += `Fixed Cost,${cost.name},${cost.category},${cost.amount},${cost.interval},,${member ? member.name : 'Gemeinschaft'},,,,,,,${cost.amount},,${cost.description || ''}\n`
  })
  
  // Abonnements
  data.subscriptions.forEach(sub => {
    const member = data.familyMembers.find(m => m.id === sub.family_member_id)
    csv += `Subscription,${sub.name},${sub.category},${sub.amount},${sub.interval},${sub.payment_date},${member ? member.name : 'Gemeinschaft'},,,,,,,${sub.amount},\n`
  })
  
  // Ratenpläne
  data.installmentPlans.forEach(plan => {
    const member = data.familyMembers.find(m => m.id === plan.family_member_id)
    csv += `Installment Plan,${plan.name},,${plan.monthly_amount},Monthly,${plan.payment_day || ''},${member ? member.name : 'Gemeinschaft'},${plan.start_date},${plan.end_date},${plan.monthly_amount},${plan.total_amount || ''},${plan.down_payment || ''},${plan.interest_rate || ''},${plan.notes || ''}\n`
  })
  
  // Sparziele
  data.savingsGoals.forEach(goal => {
    const member = goal.familyMemberId ? data.familyMembers.find(m => m.id === goal.familyMemberId) : null
    csv += `Savings Goal,${goal.name},,${goal.targetAmount},,${goal.targetDate},,${member ? member.name : (goal.isShared ? 'Gemeinschaft' : 'Privat')},,,,,,${goal.monthly_contribution},${goal.current_amount},${goal.description || ''}\n`
  })
  
  return csv
}

// Hilfsfunktion für sichere Zahlumwandlung
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || isNaN(value)) return defaultValue
  return parseFloat(value)
}

// PDF-Export Funktion mit HTML zu PDF Konvertierung
export const exportToPDF = async (data: ExportData): Promise<void> => {
  const htmlContent = generateHTMLContent(data)
  
  // Erstelle ein temporäres Fenster zum Drucken
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Budget Report - ${new Date().toLocaleDateString('de-DE')}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .overview { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .section { margin: 20px 0; }
          .item { margin: 8px 0; padding: 8px; border-left: 3px solid #3b82f6; background: #f3f4f6; }
          .total { font-weight: bold; color: #1f2937; }
          .shared { color: #7c3aed; }
          @media print { body { margin: 10px; } }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }
}

// Generiere HTML-Inhalt für PDF-Export
const generateHTMLContent = (data: ExportData): string => {
  let html = `
    <h1>Budget Report - ${new Date().toLocaleDateString('de-DE')}</h1>
    <p><strong>Exportiert am:</strong> ${data.exportDate}</p>
    
    <div class="overview">
      <h2>Übersicht</h2>
      <p><strong>Gesamtausgaben:</strong> ${safeNumber(calculateTotalExpenses(data)).toFixed(2)}€</p>
      <p><strong>Fixkosten:</strong> ${safeNumber(data.fixedCosts.reduce((sum, cost) => sum + (cost.interval === 'monthly' ? safeNumber(cost.amount) : safeNumber(cost.amount) / 12), 0)).toFixed(2)}€</p>
      <p><strong>Abonnements:</strong> ${safeNumber(data.subscriptions.reduce((sum, sub) => sum + (sub.interval === 'monthly' ? safeNumber(sub.amount) : safeNumber(sub.amount) / 12), 0)).toFixed(2)}€</p>
      <p><strong>Ratenpläne:</strong> ${safeNumber(data.installmentPlans.reduce((sum, plan) => sum + safeNumber(plan.monthlyAmount), 0)).toFixed(2)}€</p>
      <p><strong>Sparziele:</strong> ${(data.savingsGoals as any[]).reduce((sum: number, goal: any) => sum + safeNumber(goal.currentAmount), 0).toFixed(2)}€ / ${(data.savingsGoals as any[]).reduce((sum: number, goal: any) => sum + safeNumber(goal.targetAmount), 0).toFixed(2)}€</p>
    </div>
    
    <div class="section">
      <h2>Fixkosten</h2>
  `
  
  data.fixedCosts.forEach(cost => {
    const member = data.familyMembers.find(m => m.id === cost.family_member_id)
    html += `
      <div class="item">
        <strong>${cost.name}:</strong> ${safeNumber(cost.amount).toFixed(2)}€ (${cost.interval}) - ${member ? member.name : 'Gemeinschaft'}
      </div>
    `
  })
  
  html += `
    </div>
    
    <div class="section">
      <h2>Abonnements</h2>
  `
  
  data.subscriptions.forEach(sub => {
    const member = data.familyMembers.find(m => m.id === sub.family_member_id)
    html += `
      <div class="item">
        <strong>${sub.name}:</strong> ${safeNumber(sub.amount).toFixed(2)}€ (${sub.interval}) - ${member ? member.name : 'Gemeinschaft'} (am ${sub.payment_date}.)
      </div>
    `
  })
  
  html += `
    </div>
    
    <div class="section">
      <h2>Ratenpläne</h2>
  `
  
  data.installmentPlans.forEach(plan => {
    const member = data.familyMembers.find(m => m.id === plan.family_member_id)
    html += `
      <div class="item">
        <strong>${plan.name}:</strong> ${safeNumber(plan.monthlyAmount).toFixed(2)}€/monat - ${member ? member.name : 'Gemeinschaft'}<br>
        <span class="total">Gesamt: ${plan.totalAmount ? safeNumber(plan.totalAmount).toFixed(2) : 'N/A'}€</span><br>
        <span>Laufzeit: ${plan.start_date} bis ${plan.end_date}</span>
      </div>
    `
  })
  
  html += `
    </div>
    
    <div class="section">
      <h2>Sparziele</h2>
  `
  
  ;(data.savingsGoals as any[]).forEach(goal => {
    const member = goal.familyMemberId ? data.familyMembers.find(m => m.id === goal.familyMemberId) : null
    const currentAmount = safeNumber(goal.currentAmount)
    const targetAmount = safeNumber(goal.targetAmount)
    const progress = targetAmount > 0 ? (currentAmount / targetAmount * 100).toFixed(1) : '0'
    const isSharedClass = goal.isShared ? 'shared' : ''
    
    html += `
      <div class="item ${isSharedClass}">
        <strong>${goal.name}:</strong> ${currentAmount.toFixed(2)}€ / ${targetAmount.toFixed(2)}€ (${progress}%)<br>
        <span>Monatlich: ${safeNumber(goal.monthly_contribution).toFixed(2)}€ - Ziel: ${goal.targetDate}</span><br>
        <span>${goal.isShared ? '👨‍👩‍👧‍👦 Gemeinsam' : (member ? member.name : 'Privat')}</span>
      </div>
    `
  })
  
  html += `
    </div>
    
    <div style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px;">
      <p>Generiert am ${new Date().toLocaleString('de-DE')} mit Budget Planner</p>
    </div>
  `
  
  return html
}

// Generiere PDF-Inhalt (vereinfachte Version)
const generatePDFContent = (data: ExportData): string => {
  let content = `Budget Report - ${new Date().toLocaleDateString('de-DE')}\n\n`
  content += `Exportiert am: ${data.exportDate}\n\n`
  content += `====================================\n\n`
  content += `Übersicht\n\n`
  
  content += `Gesamtausgaben: ${calculateTotalExpenses(data).toFixed(2)}€\n`
  content += `Fixkosten: ${data.fixedCosts.reduce((sum, cost) => sum + (cost.interval === 'monthly' ? cost.amount : cost.amount / 12), 0).toFixed(2)}€\n`
  content += `Abonnements: ${data.subscriptions.reduce((sum, sub) => sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12), 0).toFixed(2)}€\n`
  content += `Ratenpläne: ${data.installmentPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0).toFixed(2)}€\n`
  content += `Sparziele: ${(data.savingsGoals as any[]).reduce((sum: number, goal: any) => sum + goal.currentAmount, 0).toFixed(2)}€ / ${(data.savingsGoals as any[]).reduce((sum: number, goal: any) => sum + goal.targetAmount, 0).toFixed(2)}€\n`
  content += `====================================\n\n`
  
  content += `Fixkosten:\n`
  data.fixedCosts.forEach(cost => {
    const member = data.familyMembers.find(m => m.id === cost.family_member_id)
    content += `- ${cost.name}: ${cost.amount.toFixed(2)}€ (${cost.interval}) - ${member ? member.name : 'Gemeinschaft'}\n`
  })
  
  content += `\nAbonnements:\n`
  data.subscriptions.forEach(sub => {
    const member = data.familyMembers.find(m => m.id === sub.family_member_id)
    content += `- ${sub.name}: ${sub.amount.toFixed(2)}€ (${sub.interval}) - ${member ? member.name : 'Gemeinschaft'} (am ${sub.payment_date}.)\n`
  })
  
  content += `\nRatenpläne:\n`
  data.installmentPlans.forEach(plan => {
    const member = data.familyMembers.find(m => m.id === plan.family_member_id)
    content += `- ${plan.name}: ${plan.monthlyAmount.toFixed(2)}€/monat - ${member ? member.name : 'Gemeinschaft'}\n`
    content += `  Gesamt: ${plan.totalAmount ? plan.totalAmount.toFixed(2) : 'N/A'}€\n`
    content += `  Laufzeit: ${plan.start_date} bis ${plan.end_date}\n`
  })
  
  content += `\nSparziele:\n`
  ;(data.savingsGoals as any[]).forEach(goal => {
    const member = goal.familyMemberId ? data.familyMembers.find(m => m.id === goal.familyMemberId) : null
    content += `- ${goal.name}: ${goal.currentAmount.toFixed(2)}€ / ${goal.targetAmount.toFixed(2)}€ (${(goal.currentAmount / goal.targetAmount * 100).toFixed(1)}%)\n`
    content += `  Monatlich: ${goal.monthly_contribution.toFixed(2)}€ - Ziel: ${goal.targetDate}\n`
    content += `  ${goal.isShared ? '👨‍👩‍👧‍👦 Gemeinsam' : (member ? member.name : 'Privat')}\n`
  })
  
  return content
}

// Hilfsfunktion für Download
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Berechungsfunktionen
const calculateTotalExpenses = (data: ExportData): number => {
  const fixedTotal = data.fixedCosts.reduce((sum, cost) => sum + (cost.interval === 'monthly' ? cost.amount : cost.amount / 12), 0)
  const subsTotal = data.subscriptions.reduce((sum, sub) => sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12), 0)
  const installmentTotal = data.installmentPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0)
  return fixedTotal + subsTotal + installmentTotal
}

// Generiere Monatsübersicht für Export
export const generateMonthlySummaries = (data: ExportData): MonthlySummary[] => {
  const summaries: MonthlySummary[] = []
  const currentMonth = new Date()
  const currentYear = currentMonth.getFullYear()
  const currentMonthNum = currentMonth.getMonth()
  
  // Letzte 12 Monate generieren
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentMonthNum - i, 1)
    
    summaries.push({
      month: date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
      year: date.getFullYear(),
      totalExpenses: calculateTotalExpenses(data), // Vereinfacht - in echter Implementierung echte Monatsdaten
      fixedCosts: data.fixedCosts.reduce((sum, cost) => sum + (cost.interval === 'monthly' ? cost.amount : cost.amount / 12), 0),
      subscriptions: data.subscriptions.reduce((sum, sub) => sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12), 0),
      installmentPlans: data.installmentPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0),
      savingsGoals: {
        totalTarget: (data.savingsGoals as any[]).reduce((sum: number, goal: any) => sum + goal.targetAmount, 0),
        totalCurrent: (data.savingsGoals as any[]).reduce((sum: number, goal: any) => sum + goal.currentAmount, 0),
        goals: data.savingsGoals as any[]
      }
    })
  }
  
  return summaries.reverse() // Neueste zuerst
}

export default {
  exportToCSV,
  exportToPDF,
  generatePDFContent,
  generateMonthlySummaries,
  downloadFile
}
