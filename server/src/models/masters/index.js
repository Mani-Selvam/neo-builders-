import mongoose from 'mongoose';
import { createMasterModel } from '../masterFactory.js';

export const Department = createMasterModel(
  'Department',
  {
    departmentName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { uniqueWith: 'departmentName' }
);

export const Designation = createMasterModel(
  'Designation',
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designationName: { type: String, required: true, trim: true },
  },
  { uniqueWith: 'designationName', refs: [{ path: 'departmentId', ref: 'Department' }] }
);

export const Client = createMasterModel('Client', {
  projectName: { type: String, required: true, trim: true },
  clientName: { type: String, required: true, trim: true },
  ongoingProjects: { type: String, default: '' },
  location: { type: String, default: '' },
  gstin: { type: String, default: '' },
  contactName: { type: String, default: '' },
  mobileNo: { type: String, default: '' },
  emailId: { type: String, default: '' },
  address: { type: String, default: '' },
});

export const Supplier = createMasterModel('Supplier', {
  companyName: { type: String, required: true, trim: true },
  contactName: { type: String, required: true, trim: true },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  mobileNo: { type: String, default: '' },
  mobileNo2: { type: String, default: '' },
  emailId: { type: String, default: '' },
  panNo: { type: String, default: '' },
  gstin: { type: String, default: '' },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    branchName: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
  },
  remarks: { type: String, default: '' },
});

export const Labourer = createMasterModel('Labourer', {
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  mobileNo: { type: String, default: '' },
  referredBy: { type: String, default: '' },
  address: { type: String, default: '' },
  pan: { type: String, default: '' },
  gst: { type: String, default: '' },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    branchName: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
  },
}, { uniqueWith: 'code' });

export const Employee = createMasterModel(
  'Employee',
  {
    empCode: { type: String, required: true, trim: true },
    empName: { type: String, required: true, trim: true },
    personalMobNo: { type: String, required: true },
    officeMobNo: { type: String, required: true },
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
    dateOfBirth: { type: Date, required: true },
    dateOfJoining: { type: Date, required: true },
    emailId: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    aadhaarNo: { type: String, required: true },
    panNo: { type: String, default: '' },
    pfNo: { type: String, default: '' },
    fatherSpouseName: { type: String, required: true },
    fatherSpouseMobNo: { type: String, required: true },
    basicPay: { type: Number, required: true },
    bankAccountNo: { type: String, default: '' },
    bankName: { type: String, default: '' },
    bankBranch: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    uniformIssuedOn: { type: Date },
    remarks1: { type: String, default: '' },
    remarks2: { type: String, default: '' },
  },
  {
    uniqueWith: 'empCode',
    refs: [
      { path: 'siteId', ref: 'Site' },
      { path: 'departmentId', ref: 'Department' },
      { path: 'designationId', ref: 'Designation' },
    ],
  }
);

export const Expense = createMasterModel(
  'Expense',
  { expenseName: { type: String, required: true, trim: true } },
  { uniqueWith: 'expenseName' }
);

export const ItemCategory = createMasterModel(
  'ItemCategory',
  {
    code: { type: String, required: true, trim: true },
    categoryName: { type: String, required: true, trim: true },
  },
  { uniqueWith: 'code' }
);

export const ItemUOM = createMasterModel(
  'ItemUOM',
  {
    code: { type: String, required: true, trim: true },
    uomName: { type: String, required: true, trim: true },
  },
  { uniqueWith: 'code' }
);

export const Item = createMasterModel(
  'Item',
  {
    code: { type: String, required: true, trim: true },
    tax: { type: Number, default: 0 },
    itemName: { type: String, required: true, trim: true },
    itemCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
    itemUomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemUOM', required: true },
  },
  {
    uniqueWith: 'code',
    refs: [
      { path: 'itemCategoryId', ref: 'ItemCategory' },
      { path: 'itemUomId', ref: 'ItemUOM' },
    ],
  }
);

export const LabourType = createMasterModel(
  'LabourType',
  { labourType: { type: String, required: true, trim: true } },
  { uniqueWith: 'labourType' }
);

export const SiteType = createMasterModel(
  'SiteType',
  { siteType: { type: String, required: true, trim: true } },
  { uniqueWith: 'siteType' }
);

export const Site = createMasterModel(
  'Site',
  {
    siteTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SiteType', required: true },
    siteName: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    projectManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    siteInchargeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    qsDataEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    schedules: [
      {
        date: Date,
        workId: { type: mongoose.Schema.Types.ObjectId, ref: 'Work' },
        notes: String,
      },
    ],
  },
  {
    uniqueWith: 'code',
    refs: [
      { path: 'siteTypeId', ref: 'SiteType' },
      { path: 'projectManagerId', ref: 'Employee' },
      { path: 'siteInchargeId', ref: 'Employee' },
      { path: 'qsDataEntryId', ref: 'Employee' },
    ],
  }
);

export const VehicleType = createMasterModel(
  'VehicleType',
  { vehicleType: { type: String, required: true, trim: true } },
  { uniqueWith: 'vehicleType' }
);

export const Truck = createMasterModel(
  'Truck',
  {
    siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    vehicleTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleType', required: true },
    vehicleNo: { type: String, required: true, trim: true },
  },
  {
    uniqueWith: 'vehicleNo',
    refs: [
      { path: 'siteId', ref: 'Site' },
      { path: 'vehicleTypeId', ref: 'VehicleType' },
    ],
  }
);

export const Work = createMasterModel(
  'Work',
  {
    workName: { type: String, required: true, trim: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemUOM', required: true },
  },
  { uniqueWith: 'workName', refs: [{ path: 'unitId', ref: 'ItemUOM' }] }
);

export const MASTER_REGISTRY = {
  departments: { model: Department, label: 'Department' },
  designations: { model: Designation, label: 'Designation' },
  clients: { model: Client, label: 'Client' },
  suppliers: { model: Supplier, label: 'Supplier' },
  labourers: { model: Labourer, label: 'Labourer' },
  employees: { model: Employee, label: 'Employee' },
  expenses: { model: Expense, label: 'Expense' },
  'item-categories': { model: ItemCategory, label: 'Item Category' },
  'item-uoms': { model: ItemUOM, label: 'Item UOM' },
  items: { model: Item, label: 'Item' },
  'labour-types': { model: LabourType, label: 'Labour Type' },
  'site-types': { model: SiteType, label: 'Site Type' },
  sites: { model: Site, label: 'Site' },
  'vehicle-types': { model: VehicleType, label: 'Vehicle Type' },
  trucks: { model: Truck, label: 'Truck' },
  works: { model: Work, label: 'Work' },
};
