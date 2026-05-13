export function calculateRemainingTime(targetDateStr: string) {
  const now = new Date();
  const targetDate = new Date(targetDateStr);
  
  if (targetDate <= now) {
    return { months: 0, weeks: 0, days: 0 };
  }

  const diffTime = Math.abs(targetDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = diffDays / 7;
  const diffMonths = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());

  return {
    months: Math.max(1, diffMonths),
    weeks: Math.max(1, diffWeeks),
    days: diffDays
  };
}

export function calculateRequiredSavings(goal: number | string, current: number | string, targetDateStr: string) {
  const g = parseFloat(String(goal)) || 0;
  const c = parseFloat(String(current)) || 0;
  const gap = Math.max(0, g - c);
  const time = calculateRemainingTime(targetDateStr);
  
  return {
    gap,
    monthly: gap / time.months,
    weekly: gap / time.weeks
  };
}

export function formatCurrency(amount: number | string) {
  const val = parseFloat(String(amount)) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}
