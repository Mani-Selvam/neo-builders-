import mongoose from 'mongoose';

const PROFILE_FIELDS = [
  'companyName',
  'contactPerson',
  'mobileNo',
  'email',
  'gstNo',
  'panNo',
  'registrationNo',
  'address',
  'city',
  'state',
  'country',
  'pincode',
  'logo',
];

const companySchema = new mongoose.Schema(
  {
    companyCode: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true, trim: true },
    gstNo: { type: String, trim: true, default: '' },
    panNo: { type: String, trim: true, default: '' },
    registrationNo: { type: String, trim: true, default: '' },
    contactPerson: { type: String, required: true, trim: true },
    mobileNo: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    pincode: { type: String, default: '' },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    subscriptionPlanName: { type: String, default: 'Free' },
    subscriptionStartDate: { type: Date, default: Date.now },
    subscriptionExpiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    },
    status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
    profileCompleted: { type: Boolean, default: false },
    profileCompletionPercentage: { type: Number, default: 0 },
    profilePromptDismissed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

companySchema.methods.recalculateProfileCompletion = function () {
  let filled = 0;
  for (const field of PROFILE_FIELDS) {
    if (field === 'logo') {
      if (this.logo && this.logo.url) filled += 1;
    } else if (this[field] && String(this[field]).trim() !== '') {
      filled += 1;
    }
  }
  const pct = Math.round((filled / PROFILE_FIELDS.length) * 100);
  this.profileCompletionPercentage = pct;
  this.profileCompleted = pct === 100;
  return pct;
};

export const PROFILE_COMPLETION_FIELDS = PROFILE_FIELDS;

export default mongoose.model('Company', companySchema);
