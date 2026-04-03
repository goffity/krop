# Finance Tracker App — Project Spec

## Overview
Personal finance mobile app for daily income/expense tracking, monthly budget planning,
savings goal tracking, and spending behavior analysis. Single user, ฿0/month infrastructure.

---

## Tech Stack

### Frontend
- **React Native + Expo** (iOS + Android)
- **Zustand** — global state management
- **React Query / TanStack Query** — server state, caching, background sync
- **MMKV** — local storage, offline-first cache (faster than AsyncStorage 10x)
- **Victory Native** — charts (Donut, Bar, Line)
- **TypeScript** — strict mode

### Backend
- **Supabase (Free Tier)**
  - PostgreSQL database
  - Auth (Email + Google + Apple)
  - Realtime API
  - Edge Functions (serverless)

---

## Database Schema

```sql
-- transactions
CREATE TABLE transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  type        text CHECK (type IN ('income', 'expense')) NOT NULL,
  amount      numeric NOT NULL,
  category    varchar NOT NULL,
  note        text,
  date        date NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- budgets
CREATE TABLE budgets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  category    varchar NOT NULL,
  amount      numeric NOT NULL,
  month       varchar NOT NULL, -- format: '2026-03'
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, category, month)
);

-- savings_goals
CREATE TABLE savings_goals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  name        varchar NOT NULL,
  target      numeric NOT NULL,
  current     numeric DEFAULT 0,
  icon        varchar,
  color       varchar,
  created_at  timestamptz DEFAULT now()
);
```

### RLS Policies (Row Level Security)
All tables must have RLS enabled. Users can only read/write their own data:
```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own data" ON transactions
  FOR ALL USING (auth.uid() = user_id);
-- Repeat for budgets and savings_goals
```

---

## Folder Structure

```
src/
  screens/
    DashboardScreen.tsx
    BudgetScreen.tsx
    GoalsScreen.tsx
    HistoryScreen.tsx
  components/
    DonutChart.tsx
    BarChart.tsx
    TransactionCard.tsx
    BudgetProgressBar.tsx
    SavingsGoalCard.tsx
  store/
    useFinanceStore.ts      ← Zustand: UI state, selected month
  hooks/
    useTransactions.ts      ← React Query: fetch/mutate transactions
    useBudgets.ts
    useSavingsGoals.ts
    useMonthSummary.ts
  lib/
    supabase.ts             ← Supabase client init
    mmkv.ts                 ← MMKV instance + helpers
    offlineQueue.ts         ← Queue mutations when offline
  types/
    index.ts                ← Transaction, Budget, SavingsGoal types
```

---

## Features

### Core
- บันทึกรายรับ-รายจ่าย พร้อมหมวดหมู่, วันที่, โน้ต
- หมวดหมู่อัตโนมัติ (อาหาร, เดินทาง, ช้อปปิ้ง, สุขภาพ, บันเทิง, ค่าบิล, การศึกษา)
- ดูประวัติรายการ กรองตามหมวด/เดือน

### Analytics
- กราฟ Donut: สัดส่วนรายจ่ายแต่ละหมวด
- กราฟ Bar: เปรียบเทียบรายรับ-รายจ่าย 6 เดือน
- สรุปยอดรายเดือน (รายรับ / รายจ่าย / คงเหลือ)
- วิเคราะห์พฤติกรรมการใช้เงิน

### Budget
- ตั้งงบรายเดือนแต่ละหมวด
- Progress bar แสดงการใช้งบ
- แจ้งเตือนเมื่อใช้เงินเกิน 70% และ 90%

### Savings Goals
- ตั้งเป้าหมายการออมพร้อมชื่อ, ไอคอน, สี
- ติดตามความคืบหน้า
- คำนวณเดือนที่จะถึงเป้าโดยประมาณ

### Export
- Export รายงานเป็น CSV

---

## Offline-First Strategy (MMKV)

```
เปิดแอพ → โหลดจาก MMKV cache ทันที (ไม่มี loading)
          → fetch จาก Supabase ใน background
          → อัปเดต MMKV cache

ไม่มีเน็ต → บันทึกลง MMKV offline queue
           → มีเน็ต → auto sync ขึ้น Supabase
```

---

## Development Phases

### Phase 1 — Core Foundation (สัปดาห์ 1–2)
- [ ] Setup Expo project + TypeScript
- [ ] Supabase schema + RLS policies
- [ ] Authentication (Email + Google)
- [ ] Transaction CRUD (create, read, list)
- [ ] MMKV offline cache + sync queue

### Phase 2 — Features (สัปดาห์ 3–5)
- [ ] Dashboard screen + charts
- [ ] Budget system (ตั้งงบ + progress bar)
- [ ] Savings goals screen
- [ ] Over-budget notifications
- [ ] Auto-categorization logic

### Phase 3 — Polish & Deploy (สัปดาห์ 6–8)
- [ ] Export CSV / PDF
- [ ] Push notifications
- [ ] Spending behavior analysis
- [ ] UI polish + animations
- [ ] App Store + Play Store deployment

---

## Package Manager
- ใช้ **pnpm** เสมอ ห้ามใช้ npm หรือ yarn
- `pnpm install` / `pnpm add <pkg>` / `pnpm remove <pkg>`

---

## Code Conventions
- TypeScript strict mode เสมอ
- ใช้ `async/await` ไม่ใช้ `.then().catch()`
- Component files: PascalCase (`TransactionCard.tsx`)
- Hooks: camelCase ขึ้นต้นด้วย `use` (`useTransactions.ts`)
- ไม่ใช้ `any` type
- Error handling ทุก Supabase call

---

## Environment Variables
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```
