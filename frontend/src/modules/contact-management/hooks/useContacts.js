import { useState, useEffect, useCallback } from 'react';
import { contactAPI } from '../api/contactAPI';

export function useContacts({ page = 1, limit = 20, search = '', filters = {}, sortBy = 'last_name', sortOrder = 'ASC', refreshKey = 0 } = {}) {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit, search, sortBy, sortOrder };
      if (filters.status) params.status = filters.status;
      if (filters.source) params.source = filters.source;
      if (filters.account_id) params.account_id = filters.account_id;
      if (filters.owner_id) params.owner_id = filters.owner_id;
      if (filters.tags && filters.tags.length > 0) params.tags = filters.tags.join(',');

      const res = await contactAPI.list(params);
      setContacts(res.data.rows);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filters, sortBy, sortOrder, refreshKey]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, total, loading, error, refetch: fetchContacts };
}

export function useContact(id) {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    contactAPI.get(id)
      .then(res => setContact(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { contact, loading, error, refetch: () => contactAPI.get(id).then(r => setContact(r.data)) };
}
