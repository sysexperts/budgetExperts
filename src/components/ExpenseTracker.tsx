export interface ExpenseHistory {
  id: string;
  date: string;
  totalAmount: number;
  changeType: 'increase' | 'decrease' | 'initial';
  changeAmount: number;
  changePercentage: number;
  description: string;
  details: {
    fixedCosts: number;
    subscriptions: number;
    installmentPlans: number;
    budgetLimit: number;
  };
}

export interface ExpenseTracker {
  currentTotal: number;
  previousTotal: number;
  history: ExpenseHistory[];
  lastUpdated: string;
}
