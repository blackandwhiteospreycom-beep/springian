import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '../hooks/useContacts';
import { contactAPI } from '../api/contactAPI';
import ContactCard from '../components/ContactCard';
import ContactForm from '../components/ContactForm';
import {
  AiOutlineSearch,
  AiOutlinePlus,
  AiOutlineReload,
  AiOutlineFilter,
  AiOutlineDelete,
} from 'react-icons/ai';

function ContactListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const limit = 20;

  // Debounce search
  const handleSearchChange = (value) => {
    setSearch(value);
    clearTimeout(window._searchTimeout);
    window._searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const { contacts, total, loading, error } = useContacts({
    page,
    limit,
    search: debouncedSearch,
    filters,
    refreshKey,
  });

  const totalPages = Math.ceil(total / limit);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const handleEdit = (contact) => {
    setEditContact(contact);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditContact(null);
  };

  const handleFormSave = () => {
    handleFormClose();
    handleRefresh();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact? This cannot be undone.')) return;
    try {
      await contactAPI.delete(id);
      handleRefresh();
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected contacts? This cannot be undone.`)) return;
    try {
      await contactAPI.bulkDelete(selectedIds);
      setSelectedIds([]);
      handleRefresh();
    } catch (err) {
      alert('Failed to delete contacts');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map(c => c.id));
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
            <p className="text-sm text-gray-500 mt-1">{total} total contacts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Refresh"
            >
              <AiOutlineReload size={18} />
            </button>
            <button
              onClick={() => { setEditContact(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm"
            >
              <AiOutlinePlus size={16} />
              New Contact
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* Filter: Status */}
          <select
            value={filters.status || ''}
            onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value || undefined })); setPage(1); }}
            className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          {/* Filter: Source */}
          <select
            value={filters.source || ''}
            onChange={(e) => { setFilters(f => ({ ...f, source: e.target.value || undefined })); setPage(1); }}
            className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Sources</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social Media</option>
            <option value="ad">Advertisement</option>
            <option value="event">Event</option>
          </select>

          {/* Clear Filters */}
          {(Object.keys(filters).length > 0 || debouncedSearch) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium"
            >
              Clear
            </button>
          )}

          {/* Bulk Delete */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <AiOutlineDelete size={16} />
              Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedIds.length === contacts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tags</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading contacts...
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="text-gray-400">
                      <AiOutlineSearch size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium text-gray-500 mb-2">No contacts found</p>
                      <p className="text-sm mb-4">
                        {debouncedSearch ? 'Try adjusting your search or filters' : 'Add your first contact to get started'}
                      </p>
                      {!debouncedSearch && (
                        <button
                          onClick={() => { setEditContact(null); setShowForm(true); }}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
                        >
                          Add Contact
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map(contact => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    selected={selectedIds.includes(contact.id)}
                    onSelect={() => toggleSelect(contact.id)}
                    onEdit={() => handleEdit(contact)}
                    onDelete={() => handleDelete(contact.id)}
                  />
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  // Smart page number display
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-primary text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ContactForm
          contact={editContact}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
}

export default ContactListPage;
