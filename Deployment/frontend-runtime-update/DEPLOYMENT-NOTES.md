# Frontend Runtime Update Notes

- Bundle mode: slim
- Selected from: explicit --slim
- Created at: 2026-09-28T05:02:18.913Z
- Changed files: 44

## Changed Files
- .playwright-mcp/page-2026-08-14T02-11-22-355Z.yml
- .playwright-mcp/page-2026-08-14T02-11-47-791Z.yml
- .playwright-mcp/page-2026-08-14T02-15-55-383Z.yml
- .playwright-mcp/page-2026-08-14T02-16-05-707Z.yml
- .playwright-mcp/page-2026-08-14T02-18-22-021Z.yml
- .playwright-mcp/page-2026-08-14T02-18-35-979Z.yml
- .playwright-mcp/page-2026-08-14T02-19-10-344Z.yml
- .playwright-mcp/page-2026-08-14T02-19-35-400Z.png
- .playwright-mcp/page-2026-08-14T02-23-42-774Z.yml
- .playwright-mcp/page-2026-08-14T02-38-00-181Z.yml
- .playwright-mcp/page-2026-08-14T02-38-38-207Z.yml
- .playwright-mcp/page-2026-08-14T02-38-50-909Z.yml
- .playwright-mcp/page-2026-08-14T02-43-02-813Z.yml
- .playwright-mcp/page-2026-08-14T02-43-09-949Z.yml
- .playwright-mcp/page-2026-08-14T03-41-34-960Z.yml
- .playwright-mcp/page-2026-08-14T03-41-52-794Z.yml
- .playwright-mcp/page-2026-08-14T03-53-47-254Z.yml
- .playwright-mcp/page-2026-08-14T03-54-06-804Z.yml
- .playwright-mcp/page-2026-08-14T03-54-11-781Z.yml
- .playwright-mcp/page-2026-08-14T03-54-30-026Z.yml
- app/components/andon-screen/factory-layout.tsx
- app/components/manufacture/dashboard/QuickAccess.tsx
- app/components/production/sequence-table.tsx
- app/components/realtime/processing-section.tsx
- app/components/realtime/sequence-table.tsx
- app/components/ui/advanced-data-table.tsx
- app/dashboard-user/manufacture/man-bracket/index.tsx
- app/dashboard-user/manufacture/man-bracket/processing-panel.tsx
- app/dashboard-user/manufacture/man-bracket/settings-panel.tsx
- app/dashboard-user/manufacture/rfid-process/constants.ts
- app/dashboard-user/manufacture/rfid-process/index.tsx
- app/dashboard-user/manufacture/rfid-process/rfid-map-table.tsx
- app/dashboard-user/manufacture/traceability-data/traceability-data-table.tsx
- app/hooks/use-man-bracket.ts
- app/hooks/use-sequence-management.ts
- app/hooks/useMenuItems.ts
- app/routes.ts
- app/routes/dashboard-user/manufacture/rfid-process.tsx
- app/services/manBracketApi.ts
- app/services/rfidApi.ts
- package-lock.json
- package.json
- scripts/build-runtime-bundle.mjs
- server.js

## Deployment
- This bundle is overlay-only. Extract on top of an existing frontend-runtime folder.
- Restart PM2 or the Windows service after extract.
- If deploy fails, restore the previous runtime folder backup and check logs.
