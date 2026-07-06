import { failure } from '../utils/apiResponse.js';

export function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = {};
      for (const issue of result.error.issues) {
        errors[issue.path.join('.') || 'form'] = issue.message;
      }
      return failure(res, { message: 'Validation failed', statusCode: 422, errors });
    }
    req.body = result.data;
    next();
  };
}

const TENANT_OWNED_FIELDS = ['companyId', 'createdBy', 'updatedBy', 'passwordHash', 'subscriptionPlanId', '_id', 'id'];

export function stripTenantFields(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const field of TENANT_OWNED_FIELDS) {
      delete req.body[field];
    }
  }
  next();
}
