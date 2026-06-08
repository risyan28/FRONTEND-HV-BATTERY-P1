# Frontend Runtime Update Notes

- Bundle mode: slim
- Selected from: code-only update
- Created at: 2026-05-29T07:45:56.936Z
- Changed files: 7

## Changed Files
- app/dashboard-user/manufacture/man-bracket/constants.ts
- app/dashboard-user/manufacture/man-bracket/index.tsx
- app/dashboard-user/manufacture/man-bracket/settings-panel.tsx
- app/dashboard-user/manufacture/production-control/plan-setting.tsx
- app/hooks/use-man-bracket.ts
- app/hooks/use-production-control.ts
- app/services/manBracketApi.ts

## Deployment
- This bundle is overlay-only. Extract on top of an existing frontend-runtime folder.
- Restart PM2 or the Windows service after extract.
- If deploy fails, restore the previous runtime folder backup and check logs.
