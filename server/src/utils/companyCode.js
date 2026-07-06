import Company from '../models/Company.js';

export async function generateCompanyCode() {
  const count = await Company.countDocuments();
  const next = count + 1;
  return `CMP-${String(next).padStart(6, '0')}`;
}
