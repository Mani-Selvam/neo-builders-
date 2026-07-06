import axiosClient from './axiosClient';

export function createMasterApi(endpoint) {
  return {
    list: (params) => axiosClient.get(`/${endpoint}`, { params }),
    listAll: () => axiosClient.get(`/${endpoint}/all`),
    getOne: (id) => axiosClient.get(`/${endpoint}/${id}`),
    create: (payload) => axiosClient.post(`/${endpoint}`, payload),
    update: (id, payload) => axiosClient.put(`/${endpoint}/${id}`, payload),
    updateStatus: (id, status) => axiosClient.patch(`/${endpoint}/${id}/status`, { status }),
    remove: (id) => axiosClient.delete(`/${endpoint}/${id}`),
  };
}

export const dashboardApi = {
  getStats: () => axiosClient.get('/dashboard/stats'),
};

export const companyApi = {
  getProfile: () => axiosClient.get('/company/profile'),
  updateProfile: (payload) => axiosClient.put('/company/profile', payload),
  dismissPrompt: () => axiosClient.post('/company/profile/dismiss-prompt'),
};

export const userApi = createMasterApi('users');
export const roleApi = {
  list: () => axiosClient.get('/roles'),
  getOne: (id) => axiosClient.get(`/roles/${id}`),
  create: (payload) => axiosClient.post('/roles', payload),
  update: (id, payload) => axiosClient.put(`/roles/${id}`, payload),
  remove: (id) => axiosClient.delete(`/roles/${id}`),
};
export const auditLogApi = {
  list: (params) => axiosClient.get('/audit-logs', { params }),
};
