# TASK 0.3: Add API error handling and serializers

 - **Status**: BLOCKED
- **Dependencies**: [TASK_0.1]
- **Agent Type**: local

## Objective
Provide consistent JSON serialization and error responses for the new API.

## Requirements
1. Implement a base serializer module under `app/serializers/api` with `as_json` helpers.
2. Add global rescue handlers in `Api::BaseController` for `ActiveRecord::RecordNotFound` and `Pundit::NotAuthorizedError`.
3. Response bodies must follow `{ error: 'message' }` for errors.
4. Update example controller to use serializer for output.

## Acceptance Criteria
- [ ] Serializers present expected attributes for a model (e.g., invoice id and status).
- [ ] Standard 404 and 403 responses return JSON body with error message.

## Implementation Notes
- Reuse existing presenters when possible to avoid duplicate logic.
