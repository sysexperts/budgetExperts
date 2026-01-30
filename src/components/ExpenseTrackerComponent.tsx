import { useState, useEffect } from 'react'
import { ExpenseHistory, ExpenseTracker } from './ExpenseTracker'
import { FixedCost, Subscription, InstallmentPlan } from '../types'

interface ExpenseTrackerProps {
  fixedCosts: FixedCost[]
  subscriptions: Subscription[]
  installmentPlans: InstallmentPlan[]
}

export default function ExpenseTrackerComponent({ fixedCosts, subscriptions, installmentPlans }: ExpenseTrackerProps) {
  const [expenseData, setExpenseData] = useState<ExpenseTracker | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  // Calculate current total expenses
  const calculateCurrentTotal = () => {
    const fixedTotal = fixedCosts.reduce((sum, cost) => {
      return sum + (cost.interval === 'monthly' ? cost.amount : cost.amount / 12)
    }, 0)

    const subsTotal = subscriptions.reduce((sum, sub) => {
      return sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12)
    }, 0)

    const installmentTotal = installmentPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0)

    return fixedTotal + subsTotal + installmentTotal
  }

  // Get budget limit from localStorage
  const getBudgetLimit = () => {
    const storedBudgets = localStorage.getItem('budgets')
    let totalBudgetLimit = 5000 // Default fallback
    
    if (storedBudgets) {
      try {
        const budgets = JSON.parse(storedBudgets)
        const activeBudgets = budgets.filter((b: any) => b.isActive)
        
        totalBudgetLimit = activeBudgets.reduce((total: number, budget: any) => {
          const monthlyAmount = budget.type === 'yearly' ? budget.amount / 12 : budget.amount
          return total + monthlyAmount
        }, 0)
      } catch (error) {
        console.error('Error loading budgets:', error)
      }
    }
    
    return totalBudgetLimit
  }

  // Load expense history from localStorage
  const loadExpenseHistory = (): ExpenseTracker => {
    const stored = localStorage.getItem('expenseHistory')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Error loading expense history:', error)
      }
    }
    
    // Return default structure if none exists
    return {
      currentTotal: 0,
      previousTotal: 0,
      history: [],
      lastUpdated: new Date().toISOString()
    }
  }

  // Save expense history to localStorage
  const saveExpenseHistory = (data: ExpenseTracker) => {
    localStorage.setItem('expenseHistory', JSON.stringify(data))
  }

  // Track expense changes
  const trackExpenseChange = () => {
    const currentTotal = calculateCurrentTotal()
    const budgetLimit = getBudgetLimit()
    const expenseTracker = loadExpenseHistory()
    
    // Calculate change details
    const changeAmount = currentTotal - expenseTracker.currentTotal
    const changePercentage = expenseTracker.currentTotal > 0 
      ? (changeAmount / expenseTracker.currentTotal) * 100 
      : 0
    
    // Only track if there's a meaningful change (more than 0.01€ or initial entry)
    if (Math.abs(changeAmount) > 0.01 || expenseTracker.history.length === 0) {
      const newEntry: ExpenseHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        totalAmount: currentTotal,
        changeType: expenseTracker.history.length === 0 ? 'initial' : changeAmount > 0 ? 'increase' : 'decrease',
        changeAmount: Math.abs(changeAmount),
        changePercentage: Math.abs(changePercentage),
        description: expenseTracker.history.length === 0 
          ? 'Initial expense tracking started' 
          : changeAmount > 0 
            ? `Expenses increased by €${Math.abs(changeAmount).toFixed(2)}` 
            : `Expenses decreased by €${Math.abs(changeAmount).toFixed(2)}`,
        details: {
          fixedCosts: fixedCosts.reduce((sum, cost) => sum + (cost.interval === 'monthly' ? cost.amount : cost.amount / 12), 0),
          subscriptions: subscriptions.reduce((sum, sub) => sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12), 0),
          installmentPlans: installmentPlans.reduce((sum, plan) => sum + plan.monthlyAmount, 0),
          budgetLimit
        }
      }

      // Update expense tracker
      const updatedTracker: ExpenseTracker = {
        currentTotal,
        previousTotal: expenseTracker.currentTotal,
        history: [...expenseTracker.history, newEntry].slice(-30), // Keep last 30 entries
        lastUpdated: new Date().toISOString()
      }

      saveExpenseHistory(updatedTracker)
      setExpenseData(updatedTracker)
    }
  }

  // Initialize and track changes
  useEffect(() => {
    const tracker = loadExpenseHistory()
    setExpenseData(tracker)
    setIsTracking(true)
  }, [])

  // Track changes whenever data changes
  useEffect(() => {
    if (isTracking) {
      trackExpenseChange()
    }
  }, [fixedCosts, subscriptions, installmentPlans])

  // Manual tracking function for external calls
  const trackManualChange = () => {
    trackExpenseChange()
  }

  return {
    expenseData,
    trackManualChange,
    currentTotal: calculateCurrentTotal(),
    budgetLimit: getBudgetLimit()
  }
}
