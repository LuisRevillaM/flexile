# TASK 1.3: CRUD endpoints for documents

- **Status**: BLOCKED
- **Dependencies**: [TASK_0.2]
- **Agent Type**: local

## Objective
Expose document management for companies via the API.

## Requirements
1. Implement `Api::V1::DocumentsController` with `index`, `show`, `create`, `update`, and `destroy` actions.
2. Support uploading attachments via multipart requests using Active Storage.
3. Document records should include name, type, year and signatory IDs.
4. For signed documents, expose download URLs to latest attachment.

## Acceptance Criteria
- [ ] Clients can upload new documents and list existing ones.
- [ ] Signatures can still be tracked via `DocumentSignature` records.
- [ ] Deleting a document marks it as deleted.
- [ ] Request specs verify upload and retrieval.

## Implementation Notes
- Consider reusing `Document` model scopes for filtering (e.g., `unsigned`).
- Use `rails_blob_url` helper for attachment URLs.
