import { Router } from 'express';
import { createMasterController } from '../controllers/masterController.js';
import { authenticate, checkCompanyStatus, checkSubscription, authorize } from '../middleware/authenticate.js';
import { stripTenantFields } from '../middleware/validateRequest.js';
import { MASTER_REGISTRY } from '../models/masters/index.js';

const SEARCH_FIELDS = {
  departments: ['departmentName', 'description'],
  designations: ['designationName'],
  clients: ['projectName', 'clientName', 'contactName', 'emailId'],
  suppliers: ['companyName', 'contactName', 'emailId', 'gstin'],
  labourers: ['code', 'name', 'mobileNo'],
  employees: ['empCode', 'empName', 'personalMobNo', 'emailId'],
  expenses: ['expenseName'],
  'item-categories': ['code', 'categoryName'],
  'item-uoms': ['code', 'uomName'],
  items: ['code', 'itemName'],
  'labour-types': ['labourType'],
  'site-types': ['siteType'],
  sites: ['siteName', 'code'],
  'vehicle-types': ['vehicleType'],
  trucks: ['vehicleNo'],
  works: ['workName'],
};

const MODULE_KEY = {
  departments: 'departments',
  designations: 'designations',
  clients: 'clients',
  suppliers: 'suppliers',
  labourers: 'labourers',
  employees: 'employees',
  expenses: 'expenses',
  'item-categories': 'itemCategories',
  'item-uoms': 'itemUoms',
  items: 'items',
  'labour-types': 'labourTypes',
  'site-types': 'siteTypes',
  sites: 'sites',
  'vehicle-types': 'vehicleTypes',
  trucks: 'trucks',
  works: 'works',
};

const router = Router();

router.use(authenticate, checkCompanyStatus, checkSubscription);

for (const [slug, { model, label }] of Object.entries(MASTER_REGISTRY)) {
  const controller = createMasterController(model, label, SEARCH_FIELDS[slug] || []);
  const moduleKey = MODULE_KEY[slug];
  const base = `/${slug}`;

  router.get(`${base}/all`, authorize(moduleKey, 'view'), controller.listAll);
  router.get(base, authorize(moduleKey, 'view'), controller.list);
  router.get(`${base}/:id`, authorize(moduleKey, 'view'), controller.getOne);
  router.post(base, authorize(moduleKey, 'create'), stripTenantFields, controller.create);
  router.put(`${base}/:id`, authorize(moduleKey, 'edit'), stripTenantFields, controller.update);
  router.patch(`${base}/:id/status`, authorize(moduleKey, 'edit'), controller.updateStatus);
  router.delete(`${base}/:id`, authorize(moduleKey, 'delete'), controller.remove);
}

export default router;
