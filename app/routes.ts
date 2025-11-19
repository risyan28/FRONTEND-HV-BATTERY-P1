import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/index.tsx'),
  route('/dashboard-user/manufacture', 'routes/manufacture.tsx'),
  route(
    '/dashboard-user/manufacture/production-plan',
    'routes/dashboard-user/manufacture/production-plan.tsx'
  ),
  route(
    '/dashboard-user/manufacture/my-profile',
    'routes/dashboard-user/manufacture/my-profile.tsx'
  ),
  route('/dashboard-master', 'routes/dashboard-master.tsx'),
  route(
    '/dashboard-user/manufacture/sequence-monitor',
    'routes/dashboard-user/manufacture/Sequence-Monitor.tsx'
  ),
  route(
    '/dashboard-user/manufacture/history-print',
    'routes/dashboard-user/manufacture/history-print.tsx'
  ),
  route(
    '/dashboard-user/manufacture/andon-screen',
    'routes/dashboard-user/manufacture/andon-screen.tsx'
  ),
] satisfies RouteConfig
