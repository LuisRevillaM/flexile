# Waterfall Playground Design Challenge: World-Class Term Configuration UI

## Overview
We're building a client-side waterfall modeling playground that allows users to configure liquidation scenarios without storing anything in the database. The core challenge is creating an intuitive, powerful interface for configuring complex financial terms while maintaining clarity for both novice and expert users.

## Current State

### What We Get From The Backend
The backend provides basic cap table structure via tRPC endpoint (`frontend/trpc/routes/waterfallPlayground.ts`):

```typescript
// Example data from backend
{
  investors: [
    { id: "abc123", name: "Luis Revilla", totalShares: 12000000 },
    { id: "def456", name: "Acme Ventures", totalShares: 4000000 }
  ],
  shareClasses: [
    { id: 3, name: "Common", originalIssuePriceCents: 1 },
    { id: 4, name: "Preferred Series A", originalIssuePriceCents: 500 }
  ],
  shareHoldings: [
    { investorId: "abc123", shareClassId: 3, shares: 12000000 }
  ]
}
```

### What's Missing (Must Be Configured Client-Side)
All waterfall-specific terms are missing and need UI configuration:

#### Share Class Terms
- **Liquidation Preference Multiple** (e.g., 1x, 2x, 3x)
- **Participation Rights** (none, capped, full)
- **Participation Cap Multiple** (if capped participation)
- **Seniority Rank** (order in preference stack)
- **Dividend Rate** (annual %)
- **Cumulative/Compounding** toggles
- **Anti-dilution Protection** (weighted average, full ratchet, none)

#### Convertible Security Terms
- **Type** (SAFE, Convertible Note)
- **Valuation Cap**
- **Discount Rate**
- **Interest Rate** (for notes)
- **Maturity Date** (for notes)
- **Seniority Rank**

## Design Challenge

Create a world-class UI that allows users to:

1. **View existing cap table data** from the database (read-only)
2. **Configure all missing terms** for each share class and convertible
3. **Add hypothetical elements** for "what-if" analysis:
   - New share classes (e.g., Series B)
   - New convertibles (e.g., bridge SAFE)
   - Potentially new investors? (see open question below)
4. **See real-time waterfall calculations** as terms change
5. **Understand complex terms** through excellent UX

## Key Design Considerations

### 1. Information Hierarchy
- How do we show database data vs. user-configured terms?
- How do we indicate hypothetical vs. real elements?
- Should configuration be inline or in a separate panel?

### 2. Educational UX
- Many users don't understand liquidation preferences, participation caps, etc.
- How do we educate without cluttering the interface?
- Options: tooltips, inline explanations, collapsible help sections, visual examples?

### 3. Complex Interactions
- Seniority ranking needs drag-and-drop or similar
- Participation rights have conditional fields (cap only shows if "capped" selected)
- Some terms interact (e.g., liquidation preference affects participation)

### 4. Visual Feedback
- Real-time chart updates as terms change
- Clear indication of how changes affect payouts
- Possibly show "before/after" comparisons?

## Open Question: Investor Management

**Current thinking**: No investor management initially (can't edit existing investors)

**But consider**: Users evaluating a new funding round might want to:
- Add a hypothetical new investor (e.g., "Series B Lead")
- Specify their investment amount and terms
- See dilution impact on existing investors

**Question for designer**: Should we include limited investor management for modeling new rounds? If so, what's the minimal, elegant approach?

## Technical Context

### Key Files
- **Main playground page**: `frontend/app/equity/waterfall/playground/page.tsx`
- **State management**: `frontend/lib/equity-modeling/store.ts`
- **Types**: `frontend/lib/equity-modeling/types.ts`
- **Calculator**: `frontend/lib/equity-modeling/calculator.ts`
- **Chart component**: `frontend/components/WaterfallChartPro.tsx`

### Current UI Components
- `ExitAmountControl`: Slider for exit value
- `WaterfallChartPro`: Stacked bar chart showing payouts

### State Structure
```typescript
interface PlaygroundState {
  // From database (read-only)
  investors: PlaygroundInvestor[];
  shareClasses: PlaygroundShareClass[];
  shareHoldings: PlaygroundShareHolding[];
  
  // User-configured
  scenario: {
    exitValueCents: bigint;
    // Other scenario params
  };
  
  // Calculated
  payouts: PlaygroundPayout[];
}
```

## Design Deliverables Needed

1. **Wireframes/Mockups** for:
   - Share class configuration interface
   - Convertible securities builder
   - How to handle hypothetical additions
   - Educational/help system

2. **Interaction Patterns** for:
   - Inline editing vs. modal/panel editing
   - Adding/removing hypothetical elements
   - Reordering seniority
   - Showing/hiding advanced options

3. **Visual Design** considerations:
   - How to distinguish database vs. configured vs. hypothetical data
   - Color coding for different share classes
   - Icons/badges for special terms

4. **Information Architecture**:
   - Tab structure? (Configuration | Visualization | Scenarios)
   - Progressive disclosure of complex terms
   - Mobile responsiveness approach

## Success Criteria

A world-class solution should:
1. **Be immediately intuitive** for basic use cases (change liquidation preference, see impact)
2. **Scale gracefully** to complex scenarios (multiple share classes, convertibles, participation)
3. **Educate users** about financial terms without being patronizing
4. **Feel fast and responsive** with real-time updates
5. **Prevent errors** through smart defaults and validation
6. **Look professional** - this is for serious financial modeling

## Constraints

- **Client-side only**: No database writes, all configuration in browser state
- **Performance**: Must handle complex calculations without lag
- **Accuracy**: Financial calculations must be precise (using BigInt)
- **Responsive**: Should work on tablet/desktop (mobile nice-to-have)

## Inspiration & References

Consider looking at:
- Carta's cap table modeling
- AngelList's investment calculators  
- Excel's data modeling interfaces (familiar to finance users)
- Modern trading platforms (for real-time data visualization)

## Next Steps

Please provide:
1. Your recommended approach to the UI/UX challenges
2. Wireframes or sketches of key interfaces
3. Specific solutions for the educational aspects
4. Your thoughts on the investor management question
5. Any questions or clarifications needed

The goal is to create something that makes complex financial modeling accessible, accurate, and even enjoyable to use.