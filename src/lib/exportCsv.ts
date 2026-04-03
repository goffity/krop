import { Platform, Share } from 'react-native';
import type { Transaction } from '@/types';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportTransactionsCsv(
  transactions: Transaction[],
  categoryLabels: Map<string, string>
): Promise<void> {
  const header = 'วันที่,ประเภท,หมวดหมู่,จำนวน,โน้ต';
  const rows = transactions.map((tx) => {
    const type = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย';
    const category = categoryLabels.get(tx.category) ?? tx.category;
    const note = tx.note ?? '';
    return [tx.date, type, category, String(tx.amount), note].map(escapeCsv).join(',');
  });

  const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM for Thai encoding

  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krop-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // Native: use Share API with the CSV content
  await Share.share({
    message: csv,
    title: `krop-export-${new Date().toISOString().split('T')[0]}.csv`,
  });
}
