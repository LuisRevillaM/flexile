# TASK 0.2: Implement API token authentication

 - **Status**: BLOCKED
- **Dependencies**: [TASK_0.1]
- **Agent Type**: local

## Objective
Add authentication layer for the REST API using `ApiToken` records.

## Requirements
1. Add `before_action` in `Api::BaseController` to validate the token from the Authorization header.
2. Expose `current_api_user` and `current_api_company` helpers.
3. Return standardized JSON error when token is missing or invalid.
4. Document example usage in README under a new "REST API" section.

## Acceptance Criteria
- [ ] Valid tokens allow access to API endpoints.
- [ ] Invalid or missing tokens respond with 401.
- [ ] README includes brief instructions on generating and using tokens.

## Implementation Notes
- Use `TokenAuthenticationService` or similar to keep controller logic small.
- Consider seeding an initial token in `db/seeds.rb` for development.
