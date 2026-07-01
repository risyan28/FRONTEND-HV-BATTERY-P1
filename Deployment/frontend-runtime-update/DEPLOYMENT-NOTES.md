# Frontend Runtime Update Notes

- Bundle mode: slim
- Selected from: code-only update
- Created at: 2026-07-01T01:54:32.603Z
- Changed files: 8

## Changed Files
- app/components/manufacture/dashboard/QuickAccess.tsx
- app/components/manufacture/dashboard/RealtimeStats.tsx
- app/components/manufacture/dashboard/SafetyCompliance.tsx
- app/dashboard-user/manufacture/MainMenu.tsx
- app/dashboard-user/manufacture/layout.tsx
- app/dashboard-user/manufacture/station-config/index.tsx
- app/services/stationConfigApi.ts
- public/images/cq5dam.web.400.400.webp

## Deployment
- This bundle is overlay-only. Extract on top of an existing frontend-runtime folder.
- Restart PM2 or the Windows service after extract.
- If deploy fails, restore the previous runtime folder backup and check logs.
