# TASK 2.1: API integration tests

- **Status**: BLOCKED
- **Dependencies**: [TASK_1.1, TASK_1.2, TASK_1.3, TASK_1.4, TASK_1.5]
- **Agent Type**: local

## Objective
Ensure the newly created REST API endpoints work as expected via request specs.

## Requirements
1. Add RSpec request specs covering authentication and each CRUD operation.
2. Include test helpers to generate and use `ApiToken` records.
3. Exercise error cases such as unauthorized access and record not found.
4. Update CI configuration to run these specs by default.

## Acceptance Criteria
- [ ] `bundle exec rspec spec/requests/api/v1` passes locally.
- [ ] CI pipeline includes the new specs and reports success.

## Implementation Notes
- Use `rails_helper` and existing spec factories for models.
- Mock external services (Stripe, etc.) as done in other specs.
