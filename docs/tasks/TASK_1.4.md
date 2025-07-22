# TASK 1.4: CRUD endpoints for dividends

- **Status**: BLOCKED
- **Dependencies**: [TASK_0.2]
- **Agent Type**: local

## Objective
Provide RESTful access to dividend records for investor payouts.

## Requirements
1. Create `Api::V1::DividendsController` with full CRUD actions.
2. Use the `Dividend` model and associated `DividendRound` and `CompanyInvestor` relations.
3. Include pagination and ability to filter by year or status.
4. Serialize amounts in cents and expose `paid_at` timestamps when present.

## Acceptance Criteria
- [ ] Clients can list dividends for a company with optional filters.
- [ ] Creating dividends triggers standard validations from the model.
- [ ] Updating and deleting dividends works through the API.
- [ ] Request specs confirm route behaviour.

## Implementation Notes
- When creating dividends, ensure associated investor and round exist for the company.
- Build on existing services used in `DividendsGuide` if available.
