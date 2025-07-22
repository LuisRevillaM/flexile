# TASK 0.1: Set up API base architecture

- **Status**: AVAILABLE
- **Dependencies**: None
- **Agent Type**: local

## Objective
Establish the base structure for the external REST API under `api/v1`.

## Requirements
1. Create `ApiToken` model and migration with `token`, `company_id`, `user_id` and `last_used_at` fields.
   - Add unique index on `token` for fast lookup.
   - Establish `belongs_to` associations for company and user.
2. Configure routes to mount new namespace `api/v1`.
3. Expand `Api::BaseController` to parse JSON and check authentication via `ApiToken`.
4. Ensure all API controllers inherit from `Api::V1::BaseController`.

## Acceptance Criteria
- [ ] `ApiToken` persisted with secure random tokens.
- [ ] Requests under `/api/v1` route through `Api::V1::BaseController`.
- [ ] Unauthorized requests return HTTP 401 with JSON body `{ error: "Unauthorized" }`.
- [ ] Example controller spec demonstrates token verification.

## Implementation Notes
- Token should be provided via `Authorization: Bearer <token>` header.
- Use `has_secure_token :token` in the model for generation.
- Index the `token` column and scope uniqueness by company to allow multiple tokens per company.
