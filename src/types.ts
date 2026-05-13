export interface AllocationItem {
  id: string;
  name: string;
  amount: number;
}

export interface CategoryData {
  goal: number;
  current: number;
  allocations?: AllocationItem[];
}

export interface FinancialProfile {
  userId: string;
  goalDate: string;
  updatedAt: any;
  categories: {
    salary: CategoryData;
    etf: CategoryData;
    stocks: CategoryData;
    mutual_funds: CategoryData;
    emergency_funds: CategoryData;
    travel_fund: CategoryData;
    gold_silver: CategoryData;
    international_stocks: CategoryData;
  };
}

export type CategoryKey = keyof FinancialProfile['categories'];
 
export interface IncomeRecord {
  amount: number;
  month: number;
  year: number;
  updatedAt: any;
}

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  salary: 'Salary',
  etf: 'ETF',
  stocks: 'Stocks',
  mutual_funds: 'Mutual Funds',
  emergency_funds: 'Emergency Funds',
  travel_fund: 'Travel Fund',
  gold_silver: 'Gold / Silver',
  international_stocks: 'International Stocks'
};
