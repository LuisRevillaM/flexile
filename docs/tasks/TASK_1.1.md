# TASK 1.1: CRUD endpoints for invoices

- **Status**: BLOCKED
- **Dependencies**: [TASK_0.2]
- **Agent Type**: local

## Objective
Expose invoice management to external clients through RESTful endpoints.

## Requirements
1. Add `Api::V1::InvoicesController` with `index`, `show`, `create`, `update`, and `destroy` actions.
2. Permit creating invoices for the authenticated company using existing service `CreateOrUpdateInvoiceService`.
3. Use `InvoicePresenter` or a new serializer to return invoice attributes (id, status, total amount, etc.).
4. Add routes under `namespace :api do; namespace :v1 do; resources :invoices; end; end`.
5. Ensure authorization checks mirror those in `Internal::Companies::InvoicesController`.

## Acceptance Criteria
- [ ] API client can list and create invoices with a valid token.
- [ ] Updating an invoice reflects changes in the database.
- [ ] Deleting an invoice marks it as deleted using existing `Deletable` concern.
- [ ] Request specs cover the happy path for each action.

## Implementation Notes
- Reuse `InvoicePresenter.company_props` for consistent JSON structure.
- Use strong parameters similar to internal controller.
