# TASK 1.5: CRUD endpoints for stock buybacks

- **Status**: BLOCKED
- **Dependencies**: [TASK_0.2]
- **Agent Type**: local

## Objective
Expose stock buyback functionality including tender offers and buyback rounds.

## Requirements
1. Implement `Api::V1::TenderOffersController` and `Api::V1::BuybacksController` for managing tender offers and equity buybacks.
2. Endpoints should allow creation of tender offers, submission of bids and generation of buyback records.
3. Include endpoints to list buyback rounds and accepted bids.
4. Reuse models `TenderOffer`, `EquityBuybackRound`, and `EquityBuyback`.

## Acceptance Criteria
- [ ] API client can create a tender offer and submit bids.
- [ ] Listing buyback rounds returns accepted price and share counts.
- [ ] Deleting tender offers cascades to bids and buybacks as in current models.
- [ ] Request specs verify end-to-end flow.

## Implementation Notes
- Reference `docs/stock-buybacks.md` for manual steps that can be automated.
- Authorization should restrict access to company administrators.
