# Plan: Finance Tracker App (Krop)

**Created:** 2026-04-03
**Status:** In Progress
**Language:** Thai

---

## Context

แอพ Personal Finance สำหรับติดตามรายรับ-รายจ่าย, วางแผนงบรายเดือน, ตั้งเป้าออม, วิเคราะห์พฤติกรรมการใช้เงิน
Tech Stack: React Native + Expo + Supabase + TypeScript

### Assumptions
- ใช้ Expo Development Build (EAS) เพราะต้องการ native modules (MMKV, Apple Sign-In)
- Single user app — ไม่ต้องมี multi-tenancy
- ฿0/month infrastructure (Supabase Free Tier)
- ใช้ pnpm เป็น package manager

---

## Current Flow
1. เปิดแอพ → เห็นหน้า default Expo template "Open up App.tsx"
2. ไม่มี feature ใดๆ ทั้งสิ้น
3. ไม่มี database, auth, หรือ navigation

## New Flow (after implementation)
1. เปิดแอพ → หน้า Login (Email / Google / Apple Sign-In)
2. เข้า Dashboard → เห็นสรุปรายรับ-รายจ่ายเดือนนี้ + กราฟ Donut + Bar
3. บันทึกรายรับ-รายจ่าย → เลือกหมวดหมู่ + จำนวน + โน้ต → บันทึกทันที (offline-first)
4. ดูงบประมาณ → Progress bar แต่ละหมวด + แจ้งเตือนเมื่อเกิน 70%/90%
5. ตั้งเป้าออม → ติดตามความคืบหน้า + คำนวณเดือนที่จะถึงเป้า
6. ดูประวัติ → กรองตามหมวด/เดือน
7. Export CSV → ส่งออกรายงาน
8. ไม่มีเน็ต → ใช้งานได้ปกติ → auto sync เมื่อมีเน็ต

---

## Tasks

| ID | Title | Type | Priority | Effort | Deps | Issue |
|----|-------|------|----------|--------|------|-------|
| T1 | Finance Tracker App — Full Implementation | feature | high | XL | - | #1 |
| T1.1 | Setup Expo project + pnpm + dependencies ทั้งหมด | chore | high | M | - | #2 |
| T1.2 | สร้าง Supabase project + schema + RLS policies | chore | high | M | - | #3 |
| T1.3 | ตั้งค่า Navigation (Bottom Tabs + Stack) | feature | high | M | T1.1 | #4 |
| T1.4 | Authentication — Email + Google + Apple Sign-In | feature | high | L | T1.1, T1.2 | #5 |
| T1.5 | TypeScript types + Supabase client init | chore | high | S | T1.1, T1.2 | #6 |
| T1.6 | Transaction CRUD (create, read, update, delete) | feature | high | L | T1.4, T1.5 | #7 |
| T1.7 | MMKV offline cache + sync queue | feature | high | L | T1.5, T1.6 | #8 |
| T1.8 | Dashboard screen + Monthly summary | feature | high | L | T1.6 | #9 |
| T1.9 | Donut Chart — สัดส่วนรายจ่ายแต่ละหมวด | feature | high | M | T1.8 | #10 |
| T1.10 | Bar Chart — เปรียบเทียบรายรับ-รายจ่าย 6 เดือน | feature | medium | M | T1.8 | #11 |
| T1.11 | Budget system — ตั้งงบ + Progress bar + แจ้งเตือน | feature | high | L | T1.6 | #12 |
| T1.12 | Savings Goals screen — ตั้งเป้า + ติดตามความคืบหน้า | feature | medium | L | T1.6 | #13 |
| T1.13 | History screen — กรองตามหมวด/เดือน | feature | medium | M | T1.6 | #14 |
| T1.14 | Auto-categorization logic | feature | medium | M | T1.6 | #15 |
| T1.15 | Export CSV | feature | medium | M | T1.6 | #16 |
| T1.16 | Push notifications + Over-budget alerts | feature | medium | L | T1.11 | #17 |
| T1.17 | Spending behavior analysis | feature | low | L | T1.8, T1.13 | #18 |
| T1.18 | UI polish + animations + App Store prep | chore | medium | XL | T1.1~T1.17 | #19 |
| T1.19 | Unit + Integration tests ทุก feature | test | high | XL | T1.1~T1.18 | #20 |

---

## Subtask Details

### T1.1: Setup Expo project + pnpm + dependencies ทั้งหมด
**Type:** chore | **Priority:** high | **Effort:** M (2-4h)
**Affected Files:** `package.json`, `tsconfig.json`, `app.json`, `.env.example`
- [ ] ลบ `package-lock.json` + `node_modules` แล้วใช้ `pnpm install`
- [ ] ติดตั้ง: zustand, @tanstack/react-query, react-native-mmkv, victory-native, @supabase/supabase-js, expo-router, @expo/vector-icons
- [ ] ติดตั้ง: expo-auth-session, expo-apple-authentication, expo-crypto
- [ ] สร้าง folder structure ตาม spec
- [ ] สร้าง `.env.example`
- [ ] `pnpm start` รันได้ไม่ error

### T1.2: สร้าง Supabase project + schema + RLS policies
**Type:** chore | **Priority:** high | **Effort:** M (2-4h)
**Affected Files:** `supabase/migrations/`, `.env`
- [ ] สร้าง Supabase project ผ่าน dashboard
- [ ] สร้างตาราง transactions, budgets, savings_goals ตาม schema
- [ ] เปิด RLS + สร้าง policies ทุกตาราง
- [ ] เปิด Auth providers: Email, Google, Apple
- [ ] บันทึก URL + Anon Key ใน `.env`
- [ ] สร้าง migration files

### T1.3: ตั้งค่า Navigation (Bottom Tabs + Stack)
**Type:** feature | **Priority:** high | **Effort:** M (2-4h)
**Affected Files:** `app/_layout.tsx`, `app/(tabs)/`, `app/(auth)/`
- [ ] Bottom Tab: Dashboard, Budget, Goals, History
- [ ] Auth Stack: Login, Register
- [ ] Protected routes — redirect ไป login ถ้ายังไม่ login
- [ ] Tab icons ใช้ @expo/vector-icons

### T1.4: Authentication — Email + Google + Apple Sign-In
**Type:** feature | **Priority:** high | **Effort:** L (4-8h)
**Affected Files:** `src/screens/LoginScreen.tsx`, `src/lib/supabase.ts`, `src/hooks/useAuth.ts`
- [ ] Login/Register ด้วย Email + Password
- [ ] Google Sign-In ทำงานบน iOS + Android
- [ ] Apple Sign-In ทำงานบน iOS
- [ ] Logout
- [ ] Session persistence
- [ ] Error handling ทุก auth call

### T1.5: TypeScript types + Supabase client init
**Type:** chore | **Priority:** high | **Effort:** S (< 2h)
**Affected Files:** `src/types/index.ts`, `src/lib/supabase.ts`
- [ ] Types: Transaction, Budget, SavingsGoal, Category
- [ ] Supabase client init พร้อม type-safe
- [ ] Category enum: อาหาร, เดินทาง, ช้อปปิ้ง, สุขภาพ, บันเทิง, ค่าบิล, การศึกษา

### T1.6: Transaction CRUD
**Type:** feature | **Priority:** high | **Effort:** L (4-8h)
**Affected Files:** `src/hooks/useTransactions.ts`, `src/screens/AddTransactionScreen.tsx`, `src/components/TransactionCard.tsx`
- [ ] สร้างรายการ: เลือก type, หมวดหมู่, จำนวน, โน้ต, วันที่
- [ ] แสดงรายการ: list view + pull to refresh
- [ ] แก้ไขรายการ
- [ ] ลบรายการ (confirm dialog)
- [ ] React Query สำหรับ caching + mutations
- [ ] Error handling

### T1.7: MMKV offline cache + sync queue
**Type:** feature | **Priority:** high | **Effort:** L (4-8h)
**Affected Files:** `src/lib/mmkv.ts`, `src/lib/offlineQueue.ts`
- [ ] MMKV instance + helpers
- [ ] Cache transactions, budgets, savings_goals
- [ ] Offline queue: บันทึก mutations เมื่อไม่มีเน็ต
- [ ] Auto sync เมื่อกลับมา online
- [ ] Network status detection

### T1.8: Dashboard screen + Monthly summary
**Type:** feature | **Priority:** high | **Effort:** L (4-8h)
**Affected Files:** `src/screens/DashboardScreen.tsx`, `src/hooks/useMonthSummary.ts`, `src/store/useFinanceStore.ts`
- [ ] แสดงรายรับ / รายจ่าย / คงเหลือ เดือนปัจจุบัน
- [ ] เลือกเดือนได้ (month picker)
- [ ] Zustand store สำหรับ selected month
- [ ] แสดงรายการล่าสุด 5 รายการ

### T1.9: Donut Chart — สัดส่วนรายจ่ายแต่ละหมวด
**Type:** feature | **Priority:** high | **Effort:** M (2-4h)
**Affected Files:** `src/components/DonutChart.tsx`
- [ ] Victory Native Donut chart
- [ ] แสดง % แต่ละหมวด
- [ ] สีแต่ละหมวดต่างกัน
- [ ] กด legend เพื่อ filter ได้

### T1.10: Bar Chart — เปรียบเทียบรายรับ-รายจ่าย 6 เดือน
**Type:** feature | **Priority:** medium | **Effort:** M (2-4h)
**Affected Files:** `src/components/BarChart.tsx`
- [ ] Victory Native grouped bar chart
- [ ] แสดง 6 เดือนย้อนหลัง
- [ ] สี income (เขียว) vs expense (แดง)

### T1.11: Budget system — ตั้งงบ + Progress bar + แจ้งเตือน
**Type:** feature | **Priority:** high | **Effort:** L (4-8h)
**Affected Files:** `src/screens/BudgetScreen.tsx`, `src/hooks/useBudgets.ts`, `src/components/BudgetProgressBar.tsx`
- [ ] ตั้งงบรายเดือนแต่ละหมวดหมู่
- [ ] Progress bar (เขียว < 70%, เหลือง 70-90%, แดง > 90%)
- [ ] แจ้งเตือน in-app เมื่อเกิน 70% และ 90%
- [ ] แก้ไข/ลบงบได้

### T1.12: Savings Goals screen
**Type:** feature | **Priority:** medium | **Effort:** L (4-8h)
**Affected Files:** `src/screens/GoalsScreen.tsx`, `src/hooks/useSavingsGoals.ts`, `src/components/SavingsGoalCard.tsx`
- [ ] สร้างเป้าหมาย: ชื่อ, จำนวนเป้า, ไอคอน, สี
- [ ] เพิ่มเงินออมเข้าเป้าหมาย
- [ ] Progress bar + %
- [ ] คำนวณเดือนที่จะถึงเป้า
- [ ] แก้ไข/ลบเป้าหมาย

### T1.13: History screen — กรองตามหมวด/เดือน
**Type:** feature | **Priority:** medium | **Effort:** M (2-4h)
**Affected Files:** `src/screens/HistoryScreen.tsx`
- [ ] แสดงรายการทั้งหมด (infinite scroll)
- [ ] กรองตามหมวดหมู่
- [ ] กรองตามเดือน
- [ ] ค้นหาจากโน้ต

### T1.14: Auto-categorization logic
**Type:** feature | **Priority:** medium | **Effort:** M (2-4h)
**Affected Files:** `src/lib/categorizer.ts`
- [ ] Keyword matching จากโน้ต
- [ ] จำหมวดหมู่ที่ใช้บ่อย
- [ ] แนะนำแต่ไม่บังคับ

### T1.15: Export CSV
**Type:** feature | **Priority:** medium | **Effort:** M (2-4h)
**Affected Files:** `src/lib/exportCsv.ts`
- [ ] Export รายการตามช่วงเวลา
- [ ] รูปแบบ CSV: วันที่, ประเภท, หมวดหมู่, จำนวน, โน้ต
- [ ] Share sheet

### T1.16: Push notifications + Over-budget alerts
**Type:** feature | **Priority:** medium | **Effort:** L (4-8h)
**Affected Files:** `src/lib/notifications.ts`
- [ ] expo-notifications setup
- [ ] แจ้งเตือนเมื่อใช้งบเกิน 70% และ 90%
- [ ] Permission request handling

### T1.17: Spending behavior analysis
**Type:** feature | **Priority:** low | **Effort:** L (4-8h)
**Affected Files:** `src/lib/analytics.ts`, `src/screens/DashboardScreen.tsx`
- [ ] เปรียบเทียบกับเดือนก่อน
- [ ] หมวดที่ใช้เงินมากที่สุด
- [ ] แนวโน้มรายจ่าย
- [ ] Insights text

### T1.18: UI polish + animations + App Store prep
**Type:** chore | **Priority:** medium | **Effort:** XL (> 8h)
**Affected Files:** ทุกไฟล์ screen + component
- [ ] Design system (colors, typography, spacing)
- [ ] Transitions + animations
- [ ] Loading/empty/error states
- [ ] App icon + splash screen
- [ ] EAS Build config
- [ ] App Store / Play Store metadata

### T1.19: Unit + Integration tests ทุก feature
**Type:** test | **Priority:** high | **Effort:** XL (> 8h)
**Affected Files:** `__tests__/`, `src/**/*.test.ts`
- [ ] Jest + React Native Testing Library setup
- [ ] Unit tests: hooks
- [ ] Unit tests: utilities
- [ ] Integration tests: offline queue sync
- [ ] Component tests
- [ ] Auth flow tests

---

## Execution Waves

| Wave | Tasks | รันพร้อมกันได้ | ระยะเวลา |
|------|-------|--------------|----------|
| 1 | T1.1, T1.2 | ได้ | 4h |
| 2 | T1.3, T1.4, T1.5 | ได้ | 8h |
| 3 | T1.6 | Solo | 8h |
| 4 | T1.7, T1.8, T1.11, T1.12, T1.13, T1.14 | ได้ | 8h |
| 5 | T1.9, T1.10, T1.15, T1.16 | ได้ | 8h |
| 6 | T1.17 | Solo | 8h |
| 7 | T1.18 | Solo | 16h |
| 8 | T1.19 | Solo | 16h |

**Total sequential:** ~160h | **With parallelization:** ~76h

---

## Dependency Graph

```
T1.1 (Setup) ────┬──→ T1.3 (Navigation)
                  ├──→ T1.4 (Auth) ──────┐
                  │                       ├──→ T1.6 (CRUD) ──┬──→ T1.7 (Offline)
T1.2 (Supabase) ──┼──→ T1.5 (Types) ─────┘                  ├──→ T1.8 (Dashboard) ──┬──→ T1.9 (Donut)
                  │                                           │                       └──→ T1.10 (Bar)
                  │                                           ├──→ T1.11 (Budget) ──→ T1.16 (Notifications)
                  │                                           ├──→ T1.12 (Goals)
                  │                                           ├──→ T1.13 (History)
                  │                                           ├──→ T1.14 (Auto-cat)
                  │                                           └──→ T1.15 (CSV)
                  │                              T1.8 + T1.13 ──→ T1.17 (Analytics)
                  └──────── T1.1~T1.17 ──→ T1.18 (Polish) ──→ T1.19 (Tests)
```

---

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| MMKV native build issues กับ Expo | high | medium | ใช้ EAS Dev Build, ทดสอบ early |
| Apple Sign-In ต้องมี Apple Developer Account | high | medium | สมัคร + ตั้งค่า provisioning profile |
| Supabase free tier limits | low | low | Single user — ไม่น่าถึง limit |
| Victory Native performance | medium | low | Paginate data, limit chart data points |
| Offline sync conflicts | medium | medium | Last-write-wins + conflict UI |

## Rollback Plan
1. ทุก phase มี branch แยก — revert ได้ทีละ phase
2. Supabase migrations สามารถ rollback ได้
3. ใช้ feature flags สำหรับ features ที่ยังไม่พร้อม
