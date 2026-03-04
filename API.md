# Mall Admin API Contract (Draft)

## Base
- Prefix: `/mall-admin`
- Auth: `Authorization: Bearer <token>`
- Response envelope:
```json
{ "code": 0, "message": "ok", "data": {} }
```

## Namespaces
- `/mall-admin/auth/*`
- `/mall-admin/products/*`
- `/mall-admin/product-reviews/*`
- `/mall-admin/orders/*`
- `/mall-admin/after-sales/*`
- `/mall-admin/merchant-collab/*`
- `/mall-admin/finance/*`
- `/mall-admin/risk/*`
- `/mall-admin/messages/*`
- `/mall-admin/exports/*`

## Key Endpoints (Phase-1)

### Product Reviews
- `GET /mall-admin/product-reviews`
  - Query: `status`, `merchantId`, `riskLevel`, `slaSort`, `page`, `pageSize`
  - Returns: review pool with SLA and risk tags.
- `POST /mall-admin/product-reviews/:id/approve`
- `POST /mall-admin/product-reviews/:id/reject`
  - Body: `rejectReasons[]`, `requiredFixes[]`, `deadline`

### Orders
- `GET /mall-admin/orders`
  - Query: `status`, `riskFlag`, `merchantId`, `timeFrom`, `timeTo`, `page`, `pageSize`
- `POST /mall-admin/orders/:id/intervene`
  - Body: `interventionType`, `reason`, `notifyMerchant`

### Merchant Collaboration
- `POST /mall-admin/merchant-collab/tasks`
  - Body: `bizType`, `bizId`, `merchantId`, `deadline`, `requireEvidence[]`
- `GET /mall-admin/merchant-collab/tasks`

### Messages
- `GET /mall-admin/messages`
- `POST /mall-admin/messages`
  - Used by workflow nodes (approve/reject/intervene/export done).

### Async Exports
- `POST /mall-admin/exports`
- `GET /mall-admin/exports`
- `GET /mall-admin/exports/:id`
- `GET /mall-admin/exports/:id/download`

## Collaboration State Models

### Product Review State
`submitted -> in_review -> approved | rejected | need_fix -> resubmitted`

### Order Collaboration State
`detected -> task_created -> merchant_processing -> evidence_submitted -> platform_decision -> closed`

## Notes
- Current frontend uses local mock data and reserved DTO fields.
- Replace mock adapters with real API adapters in `/src/api` when backend is ready.
