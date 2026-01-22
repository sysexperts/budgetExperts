export interface FamilyMember {
  id: number;
  name: string;
  role?: string;
}

export interface FixedCost {
  id: number;
  name: string;
  category: string;
  amount: number;
  interval: 'monthly' | 'yearly';
  familyMemberId?: number;
}

export interface Subscription {
  id: number;
  name: string;
  category: string;
  amount: number;
  interval: 'monthly' | 'yearly';
  paymentDate: number;
  familyMemberId?: number;
}

export interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
  paid: boolean;
  type: 'fixed' | 'subscription' | 'variable';
  familyMemberId?: number;
}

export interface MonthSummary {
  totalExpenses: number;
  paid: number;
  open: number;
  remaining: number;
  transactions: Transaction[];
}

export interface Statistics {
  byCategory: { [key: string]: number };
  fixedVsVariable: { fixed: number; variable: number };
  subscriptionTotal: number;
  byFamilyMember: { [key: string]: number };
}
