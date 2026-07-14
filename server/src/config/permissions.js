export const MODULES = [
  'dashboard',
  'departments',
  'designations',
  'clients',
  'suppliers',
  'labourers',
  'employees',
  'expenses',
  'itemCategories',
  'itemUoms',
  'items',
  'labourTypes',
  'siteTypes',
  'sites',
  'vehicleTypes',
  'trucks',
  'works',
  'users',
  'roles',
  'auditLogs',
  'company',
  'purchaseStatus',
  'taxMasters',
  'otherChargesMaster',
  'productTypes',
  'priorityMasters',
  'paymentTypes',
];

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'print', 'export', 'approve'];

export function buildFullPermissions(value = true) {
  const perms = {};
  for (const mod of MODULES) {
    perms[mod] = {};
    for (const action of ACTIONS) {
      perms[mod][action] = value;
    }
  }
  return perms;
}

export function buildViewerPermissions() {
  const perms = buildFullPermissions(false);
  for (const mod of MODULES) {
    perms[mod].view = true;
  }
  return perms;
}

export const DEFAULT_ROLES = [
  { name: 'Company Admin', isSystem: true, permissions: buildFullPermissions(true) },
  { name: 'Manager', isSystem: true, permissions: buildFullPermissions(true) },
  { name: 'Site Manager', isSystem: true, permissions: buildViewerPermissions() },
  { name: 'Site Incharge', isSystem: true, permissions: buildViewerPermissions() },
  { name: 'QS / Data Entry', isSystem: true, permissions: buildViewerPermissions() },
  { name: 'Accountant', isSystem: true, permissions: buildViewerPermissions() },
  { name: 'HR', isSystem: true, permissions: buildViewerPermissions() },
  { name: 'Viewer', isSystem: true, permissions: buildViewerPermissions() },
];
