# Waterfall Playground - Remaining Implementation Plan

## Overview
The waterfall playground is a fully client-side tool for modeling liquidation scenarios. Users can configure ALL waterfall and convertible terms in the UI without database storage. This document outlines the remaining work to complete the playground.

## ✅ Completed Features
1. **Core Infrastructure**
   - Zustand store for client-side state management (`lib/equity-modeling/store.ts`)
   - tRPC endpoint to fetch existing cap table data (`trpc/routes/waterfallPlayground.ts`)
   - Data loading hook with proper error handling (`lib/equity-modeling/useLoadCapTable.ts`)
   - Basic playground page with authorization (`app/equity/waterfall/playground/page.tsx`)
   - Comprehensive TypeScript types (`lib/equity-modeling/types.ts`)

2. **Calculation Engine**
   - Full waterfall calculation logic (`lib/equity-modeling/calculator.ts`)
   - Liquidation preference handling
   - Participation rights
   - Convertible securities conversion
   - Seniority ranking
   - BigInt financial precision

3. **Visualization**
   - WaterfallChartPro component (fixed phantom undistributed bar)
   - ExitAmountControl with slider and input
   - Real-time calculation updates
   - Loading and error states

4. **Navigation**
   - Added to equity sidebar menu (`app/equity/index.ts`)
   - Proper routing setup
   - Admin/lawyer access control

5. **Database Integration** ✨ NEW
   - Model validations reverted to work without waterfall columns
   - `seeds_minimal_equity.rb` script for creating test data
   - Validated client-side approach works with clean database
   - 4 test investors with 18M total shares across Common and Preferred Series A

## 🚧 Remaining Features

### 1. ShareClassConfiguration Component (Priority: HIGH)
**Purpose**: Allow users to configure ALL waterfall terms for each share class

**Requirements**:
- Editable table/list of share classes
- For each share class, allow editing:
  - Name
  - Preferred vs Common toggle
  - Original issue price
  - Liquidation preference multiple (e.g., 1x, 2x)
  - Participation rights (none, capped, full)
  - Participation cap multiple
  - Seniority rank (for preference stack)
  - Dividend rate
  - Cumulative/compounding toggles
  - Anti-dilution protection type
- Add new hypothetical share classes
- Delete hypothetical share classes (not DB ones)
- Visual indicators for hypothetical vs DB data

**Implementation Notes**:
```typescript
// Component structure
<ShareClassConfiguration>
  <ShareClassList>
    <ShareClassRow editable={true} />
  </ShareClassList>
  <AddShareClassButton />
</ShareClassConfiguration>
```

### 2. ConvertibleSecuritiesBuilder Component (Priority: HIGH)
**Purpose**: Configure ALL terms for convertible securities (SAFEs, Notes)

**Requirements**:
- List existing convertibles from DB
- For each convertible, allow editing:
  - Type (SAFE, Convertible Note)
  - Principal amount
  - Valuation cap
  - Discount rate
  - Interest rate (for notes)
  - Maturity date (for notes)
  - Seniority rank
- Add hypothetical convertibles
- Delete hypothetical convertibles
- Preview conversion calculations

**Implementation Notes**:
```typescript
// Component structure
<ConvertibleSecuritiesBuilder>
  <ConvertibleList>
    <ConvertibleRow editable={true} />
  </ConvertibleList>
  <AddConvertibleButton />
  <ConversionPreview />
</ConvertibleSecuritiesBuilder>
```

### 3. InvestorManagement Component (Priority: MEDIUM)
**Purpose**: Add/remove hypothetical investors (not editing DB investors)

**Requirements**:
- List existing investors from DB (read-only)
- Add hypothetical investors
- Assign holdings to hypothetical investors
- Delete hypothetical investors
- Bulk actions (e.g., create investor pool)

### 4. ScenarioComparison Feature (Priority: MEDIUM)
**Purpose**: Compare multiple scenarios side-by-side

**Requirements**:
- Save current configuration as named scenario
- Load saved scenarios
- Side-by-side comparison view
- Diff highlighting
- Export comparison report

### 5. Import/Export Enhancement (Priority: LOW)
**Current**: Basic JSON export
**Enhance with**:
- Excel export with detailed breakdown
- PDF report generation
- Import from Excel template
- Share via URL (encode config in URL params)

### 6. UI Polish & Responsive Design (Priority: LOW)
- Mobile-responsive layouts
- Keyboard shortcuts
- Undo/redo functionality
- Better loading states
- Tooltips and help content
- Preset templates (YC SAFE, Series A, etc.)

## Technical Considerations

### State Management
- All changes are client-side only
- Clear visual distinction between DB data and hypothetical data
- Efficient recalculation on every change
- Debouncing for performance

### Data Structure
```typescript
// Hypothetical entities use negative IDs
const newShareClass = {
  id: `-${Date.now()}`, // Negative ID for hypothetical
  isHypothetical: true,
  // ... other fields
};
```

### Performance
- Memoize heavy calculations
- Virtual scrolling for large investor lists
- Web Workers for complex scenarios (if needed)

## Current Status & Next Steps

### 🎉 Recent Progress
- ✅ **Database validation completed** - Playground works without waterfall database columns
- ✅ **Model validations fixed** - Removed dependencies on non-existent fields
- ✅ **Test data created** - 4 realistic investors with proper cap table structure
- ✅ **Foundation validated** - Client-side approach proven to work

### 🚀 Immediate Next Steps

1. **Build ShareClassConfiguration** (Priority: HIGH)
   - This unlocks the core value proposition
   - Users can finally configure liquidation preferences, participation, etc.
   - Component structure already planned (see section above)

2. **Build ConvertibleSecuritiesBuilder** (Priority: HIGH)
   - Completes the term configuration capability
   - Enables SAFE and convertible note modeling
   - Critical for complete waterfall scenarios

3. **Add scenario saving/comparison** (Priority: MEDIUM)
   - Enables "what-if" analysis workflows
   - Local storage for client-side persistence

4. **Polish and optimize** (Priority: LOW)
   - Make it production-ready
   - Performance optimizations
   - UI/UX improvements

## User Journey
1. User navigates to Waterfall Playground
2. Existing cap table loads from database
3. User modifies terms (liquidation prefs, participation, etc.)
4. Chart updates in real-time
5. User adds hypothetical investors/securities
6. User saves and compares scenarios
7. User exports final analysis

## Success Criteria
- ✅ Users can model any liquidation scenario
- ✅ All terms are configurable in the UI
- ✅ No database writes (client-side only)
- ✅ Real-time visualization
- ✅ Works with clean database (no waterfall columns required)
- ✅ Loads existing cap table data properly
- ⬜ Easy to understand and use
- ⬜ Handles complex cap tables efficiently
- ⬜ ShareClass configuration UI complete
- ⬜ Convertible securities configuration UI complete

## File References
### Frontend Components
- `frontend/app/equity/waterfall/playground/page.tsx` - Main playground page
- `frontend/lib/equity-modeling/store.ts` - Zustand state management
- `frontend/lib/equity-modeling/calculator.ts` - Waterfall calculation engine
- `frontend/lib/equity-modeling/types.ts` - TypeScript definitions
- `frontend/lib/equity-modeling/useLoadCapTable.ts` - Data loading hook
- `frontend/trpc/routes/waterfallPlayground.ts` - API endpoint

### Backend Models & Seeds
- `backend/app/models/share_class.rb` - ShareClass model (validations reverted)
- `backend/app/models/convertible_security.rb` - ConvertibleSecurity model (validations reverted)
- `backend/db/seeds_minimal_equity.rb` - Test data creation script