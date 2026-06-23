const fs = require('fs');
const path = require('path');

const routeFiles = [
  'modules/attendance/attendance.routes.ts',
  'modules/batches/batch.routes.ts',
  'modules/fee-plans/fee-plan.routes.ts',
  'modules/fees/fee.routes.ts',
  'modules/institute-settings/settings.routes.ts',
  'modules/notifications/notification.routes.ts',
  'modules/reports/report.routes.ts',
  'modules/staff/staff.routes.ts',
  'modules/students/student.routes.ts'
];

for (const file of routeFiles) {
  const filePath = path.join('d:/vidyaplus2.0/apps/api/src', file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('enforceTrialStatus')) {
    content = content.replace('enforceTenantIsolation,', 'enforceTenantIsolation, enforceTrialStatus,');
    content = content.replace('enforceTenantIsolation }', 'enforceTenantIsolation, enforceTrialStatus }');
    content = content.replace('router.use(enforceTenantIsolation);', 'router.use(enforceTenantIsolation);\nrouter.use(enforceTrialStatus);');
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
}

const authPath = 'd:/vidyaplus2.0/apps/api/src/modules/auth/auth.routes.ts';
let authContent = fs.readFileSync(authPath, 'utf8');
if (!authContent.includes('enforceTrialStatus')) {
  authContent = authContent.replace(`import { authenticate } from '../../middleware/auth.middleware';`, `import { authenticate, enforceTrialStatus } from '../../middleware/auth.middleware';`);
  authContent = authContent.replace(`router.get('/me', authenticate, authController.me);`, `router.get('/me', authenticate, enforceTrialStatus, authController.me);`);
  fs.writeFileSync(authPath, authContent);
  console.log('Updated auth.routes.ts');
}
