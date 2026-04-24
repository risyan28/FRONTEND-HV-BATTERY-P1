# Frontend Runtime Update Notes

- Bundle mode: full
- Selected from: explicit --full
- Created at: 2026-04-20T04:20:01.900Z
- Changed files: 36

## Changed Files
- app/components/andon-screen/clock.tsx
- app/components/app-header.tsx
- app/components/manufacture/dashboard/header.tsx
- app/components/production/sequence-row.tsx
- app/components/realtime/completed-section.tsx
- app/components/realtime/processing-section.tsx
- app/components/realtime/sequence-table.tsx
- app/dashboard-user/manufacture/history-print/history-print.tsx
- app/dashboard-user/manufacture/man-bracket/completed-panel.tsx
- app/dashboard-user/manufacture/man-bracket/constants.ts
- app/dashboard-user/manufacture/man-bracket/index.tsx
- app/dashboard-user/manufacture/man-bracket/processing-panel.tsx
- app/dashboard-user/manufacture/man-bracket/settings-panel.tsx
- app/dashboard-user/manufacture/production-control/generate-sequence.tsx
- app/dashboard-user/manufacture/production-control/history-table.tsx
- app/dashboard-user/manufacture/production-control/index.tsx
- app/dashboard-user/manufacture/production-control/plan-setting.tsx
- app/dashboard-user/manufacture/production-control/summary-cards.tsx
- app/dashboard-user/manufacture/traceability-data/traceability-data-table.tsx
- app/hooks/use-man-bracket.ts
- app/hooks/use-print-history-query.ts
- app/hooks/use-print-history.ts
- app/hooks/use-production-control.ts
- app/hooks/use-traceability-query.ts
- app/hooks/use-traceability.ts
- app/lib/api.ts
- app/lib/auth.ts
- app/lib/datetime.ts
- app/lib/validation.ts
- app/services/manBracketApi.ts
- app/services/productionPlanApi.ts
- app/types/print-history.ts
- package.json
- scripts/build-frontend-bundle.mjs
- scripts/build-runtime-bundle.mjs
- tsconfig.json

## Deployment
- This bundle includes node_modules. Use this for first install or dependency changes.
- Restart PM2 or the Windows service after extract.
- If deploy fails, restore the previous runtime folder backup and check logs.
