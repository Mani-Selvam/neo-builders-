import { Router } from 'express';
import { createMasterController } from '../controllers/masterController.js';
import { authenticate, checkCompanyStatus, checkSubscription, authorize } from '../middleware/authenticate.js';
import { stripTenantFields } from '../middleware/validateRequest.js';
import { MASTER_REGISTRY } from '../models/masters/index.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });


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
  'purchase-status': ['status_name', 'status_no'],
  'tax-masters': ['tax_name'],
  'other-charges-master': ['other_charges_master'],
  'product-types': ['product_type'],
  'priority-masters': ['priority_name'],
  'payment-types': ['payment_type'],
  'material-requests': ['purpose', 'material', 'priority'],
  quotations: ['quoteRefNo', 'expectedDateOfDelivery', 'paymentTerms'],
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
  'purchase-status': 'purchaseStatus',
  'tax-masters': 'taxMasters',
  'other-charges-master': 'otherChargesMaster',
  'product-types': 'productTypes',
  'priority-masters': 'priorityMasters',
  'payment-types': 'paymentTypes',
  'material-requests': 'materialRequests',
  quotations: 'quotations',
};

const router = Router();

router.use(authenticate, checkCompanyStatus, checkSubscription);

router.post('/upload-attachment', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'No files uploaded' });
    }
    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ status: 'success', data: { fileUrls } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


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
