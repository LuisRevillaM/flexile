# TASK 1.2: CRUD endpoints for people

- **Status**: BLOCKED
- **Dependencies**: [TASK_0.2]
- **Agent Type**: local

## Objective
Manage users associated with a company (contractors, administrators, investors) via the API.

## Requirements
1. Create `Api::V1::PeopleController` exposing `index`, `show`, `create`, `update`, and `destroy`.
2. Leverage existing models `CompanyWorker`, `CompanyAdministrator`, and `CompanyInvestor` when creating records.
3. Include pagination and filtering by role (worker, investor, admin).
4. Serialize user data with email, name, role and status fields.
5. Respect existing invitations flow when creating new people (use `InviteWorker` service).

## Acceptance Criteria
- [ ] API can list all people for an authenticated company.
- [ ] New people records trigger the standard invitation email workflow.
- [ ] Updating and deleting records respect policy rules.
- [ ] Request specs cover creating and listing people.

## Implementation Notes
- The "people" page in the dashboard is built using TRPC; mimic its params for consistency.
- Use Pundit policies already defined for internal controllers.
