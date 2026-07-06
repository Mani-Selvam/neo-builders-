import mongoose from 'mongoose';
import { MODULES, ACTIONS } from '../config/permissions.js';

const permissionShape = {};
for (const action of ACTIONS) {
  permissionShape[action] = { type: Boolean, default: false };
}

const modulePermissionsShape = {};
for (const mod of MODULES) {
  modulePermissionsShape[mod] = permissionShape;
}

const roleSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    isSystem: { type: Boolean, default: false },
    permissions: {
      type: Map,
      of: new mongoose.Schema(permissionShape, { _id: false }),
      default: {},
    },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

roleSchema.index({ companyId: 1, name: 1 }, { unique: true });

export default mongoose.model('Role', roleSchema);
