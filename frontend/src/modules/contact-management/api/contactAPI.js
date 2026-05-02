import api from '../../../api';

// ─── Contacts ─────────────────────────────────────────────────────────

export const contactAPI = {
  list: (params = {}) => api.get('/contacts', { params }).then(r => r.data),
  get: (id) => api.get(`/contacts/${id}`).then(r => r.data),
  create: (data) => api.post('/contacts', data).then(r => r.data),
  update: (id, data) => api.put(`/contacts/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/contacts/${id}`).then(r => r.data),
  bulkDelete: (ids) => api.delete('/contacts/bulk', { data: { ids } }).then(r => r.data),
  bulkAddTags: (contactIds, tags) => api.post('/contacts/bulk/tags', { contact_ids: contactIds, tags }).then(r => r.data),

  // Tags
  getTags: () => api.get('/contacts/tags').then(r => r.data),
  setTags: (id, tags) => api.post(`/contacts/${id}/tags`, { tags }).then(r => r.data),

  // Relationships
  getRelationships: (id) => api.get(`/contacts/${id}/relationships`).then(r => r.data),
  addRelationship: (data) => api.post('/contacts/relationships', data).then(r => r.data),
  removeRelationship: (data) => api.delete('/contacts/relationships', { data }).then(r => r.data),

  // Activities
  getActivities: (id, limit = 50) => api.get(`/contacts/${id}/activities`, { params: { limit } }).then(r => r.data),
  addActivity: (id, data) => api.post(`/contacts/${id}/activities`, data).then(r => r.data),

  // Duplicates
  getDuplicates: () => api.get('/contacts/duplicates').then(r => r.data),

  // Custom Fields
  getCustomFields: () => api.get('/contacts/custom-fields').then(r => r.data),
  createCustomField: (data) => api.post('/contacts/custom-fields', data).then(r => r.data),
  updateCustomField: (id, data) => api.put(`/contacts/custom-fields/${id}`, data).then(r => r.data),
  deleteCustomField: (id) => api.delete(`/contacts/custom-fields/${id}`).then(r => r.data),
};

// ─── Accounts ─────────────────────────────────────────────────────────

export const accountAPI = {
  list: (params = {}) => api.get('/contacts/accounts', { params }).then(r => r.data),
  get: (id) => api.get(`/contacts/accounts/${id}`).then(r => r.data),
  create: (data) => api.post('/contacts/accounts', data).then(r => r.data),
  update: (id, data) => api.put(`/contacts/accounts/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/contacts/accounts/${id}`).then(r => r.data),
};
