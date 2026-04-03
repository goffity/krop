import type { Transaction, Category } from '@/types';

export interface SpendingInsight {
  type: 'increase' | 'decrease' | 'new' | 'top';
  message: string;
  icon: string;
}

export function analyzeSpending(
  currentTransactions: Transaction[],
  previousTransactions: Transaction[],
  categories: Category[]
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];

  const currentExpenses = currentTransactions.filter((t) => t.type === 'expense');
  const previousExpenses = previousTransactions.filter((t) => t.type === 'expense');

  const currentTotal = currentExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const previousTotal = previousExpenses.reduce((s, t) => s + Number(t.amount), 0);

  // Total spending comparison
  if (previousTotal > 0) {
    const changePct = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
    if (changePct > 10) {
      insights.push({
        type: 'increase',
        message: `เดือนนี้ใช้จ่ายเพิ่มขึ้น ${changePct}% จากเดือนก่อน`,
        icon: '📈',
      });
    } else if (changePct < -10) {
      insights.push({
        type: 'decrease',
        message: `เดือนนี้ใช้จ่ายลดลง ${Math.abs(changePct)}% จากเดือนก่อน`,
        icon: '📉',
      });
    }
  }

  // Category breakdown comparison
  const currentByCategory = groupByCategory(currentExpenses);
  const previousByCategory = groupByCategory(previousExpenses);

  // Top spending category
  const topCategory = [...currentByCategory.entries()]
    .sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    const cat = categories.find((c) => c.key === topCategory[0]);
    const pct = currentTotal > 0 ? Math.round((topCategory[1] / currentTotal) * 100) : 0;
    insights.push({
      type: 'top',
      message: `${cat?.icon ?? '📂'} ${cat?.label ?? topCategory[0]} เป็นหมวดที่ใช้มากสุด (${pct}%)`,
      icon: '🏆',
    });
  }

  // Per-category changes
  for (const [catKey, currentAmount] of currentByCategory) {
    const prevAmount = previousByCategory.get(catKey) ?? 0;
    const cat = categories.find((c) => c.key === catKey);
    const label = cat?.label ?? catKey;

    if (prevAmount === 0 && currentAmount > 0) {
      insights.push({
        type: 'new',
        message: `เริ่มมีรายจ่ายหมวด${label}เดือนนี้ ฿${currentAmount.toLocaleString()}`,
        icon: '🆕',
      });
    } else if (prevAmount > 0) {
      const changePct = Math.round(((currentAmount - prevAmount) / prevAmount) * 100);
      if (changePct > 30) {
        insights.push({
          type: 'increase',
          message: `หมวด${label}เพิ่มขึ้น ${changePct}% จากเดือนก่อน`,
          icon: cat?.icon ?? '📂',
        });
      }
    }
  }

  return insights.slice(0, 5); // Max 5 insights
}

function groupByCategory(transactions: Transaction[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    map.set(tx.category, (map.get(tx.category) ?? 0) + Number(tx.amount));
  }
  return map;
}
