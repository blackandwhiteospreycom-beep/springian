import { useState, useEffect, useCallback } from 'react';
import { AiOutlineClose, AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineApartment, AiOutlineWarning, AiOutlineUserAdd } from 'react-icons/ai';
import { contactAPI, accountAPI } from '../api/contactAPI';
import { useCRM } from '../../sales-marketing/core-crm/context/CRMContext';
import { calculateConfidence } from '../../sales-marketing/core-crm/utils/matchingLogic';

function ContactForm({ contact, onClose, onSave }) {
  const { contacts: crmContacts } = useCRM();
  const isEdit = !!contact;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [duplicateSuggestions, setDuplicateSuggestions] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    title: '',
    department: '',
    linkedin: '',
    twitter: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    account_id: '',
    owner_id: '',
    source: '',
    status: 'active',
    custom_fields: {},
  });

  // Load accounts for dropdown
  useEffect(() => {
    accountAPI.list({ limit: 200 })
      .then(res => setAccounts(res.data.rows || []))
      .catch(() => {});
  }, []);

  // Pre-fill form for edit
  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        title: contact.title || '',
        department: contact.department || '',
        linkedin: contact.linkedin || '',
        twitter: contact.twitter || '',
        address: contact.address || '',
        city: contact.city || '',
        state: contact.state || '',
        country: contact.country || '',
        postal_code: contact.postal_code || '',
        account_id: contact.account_id || '',
        owner_id: contact.owner_id || '',
        source: contact.source || '',
        status: contact.status || 'active',
        custom_fields: contact.custom_fields || {},
      });
    }
  }, [contact]);

  // Real-time duplicate check
  useEffect(() => {
    if (isEdit || (!formData.first_name && !formData.email)) {
      setDuplicateSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      const suggestions = crmContacts
        .map(c => ({
          record: c,
          detection: calculateConfidence(formData, c)
        }))
        .filter(s => s.detection.score > 40)
        .sort((a, b) => b.detection.score - a.detection.score)
        .slice(0, 3);

      setDuplicateSuggestions(suggestions);
      if (suggestions.some(s => s.detection.score >= 85)) {
        setShowDuplicateWarning(true);
      } else {
        setShowDuplicateWarning(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.first_name, formData.last_name, formData.email, crmContacts, isEdit]);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First name and last name are required');
      return;
    }

    if (showDuplicateWarning) {
      setError('A high-confidence duplicate already exists. Please use the existing record or resolve the conflict.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await contactAPI.update(contact.id, formData);
      } else {
        await contactAPI.create(formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Contact' : 'New Contact'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          
          {/* Duplicate Suggestions Warning */}
          {duplicateSuggestions.length > 0 && (
            <div className={`p-4 rounded-xl border ${showDuplicateWarning ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'} animate-in fade-in slide-in-from-top-2 duration-300`}>
              <div className="flex items-center gap-2 mb-3">
                <AiOutlineWarning className={showDuplicateWarning ? 'text-red-500' : 'text-amber-500'} size={18} />
                <h4 className={`text-xs font-bold uppercase tracking-wider ${showDuplicateWarning ? 'text-red-700' : 'text-amber-700'}`}>
                  {showDuplicateWarning ? 'High-Confidence Duplicate Detected' : 'Similar Records Found'}
                </h4>
              </div>
              <div className="space-y-2">
                {duplicateSuggestions.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/50 p-2 rounded-lg border border-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-100">
                        <AiOutlineUser size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{s.record.name || `${s.record.first_name} ${s.record.last_name}`}</p>
                        <p className="text-[10px] text-gray-500">{s.record.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black ${s.detection.score >= 85 ? 'text-red-500' : 'text-amber-500'}`}>
                        {s.detection.score}% Match
                      </span>
                      <button 
                        type="button"
                        onClick={() => window.open(`/sm/core-crm/contacts/${s.record.id}`, '_blank')}
                        className="p-1.5 hover:bg-white rounded-md transition-all text-gray-400 hover:text-primary"
                      >
                        <AiOutlineEye size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {showDuplicateWarning && (
                <p className="mt-3 text-[10px] text-red-600 italic">
                  * Submission is restricted for high-confidence duplicates to prevent data fragmentation.
                </p>
              )}
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <div className="relative">
                <AiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => updateForm('first_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => updateForm('last_name', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <AiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <AiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>

          {/* Mobile + Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => updateForm('mobile', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateForm('title', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="CEO"
              />
            </div>
          </div>

          {/* Department + Account */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => updateForm('department', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account / Company</label>
              <div className="relative">
                <AiOutlineApartment className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={formData.account_id}
                  onChange={(e) => updateForm('account_id', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select account...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateForm('city', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => updateForm('state', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => updateForm('country', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => updateForm('linkedin', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => updateForm('twitter', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="@username"
              />
            </div>
          </div>

          {/* Source + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => updateForm('source', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select source...</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social">Social Media</option>
                <option value="ad">Advertisement</option>
                <option value="event">Event</option>
                <option value="import">Import</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => updateForm('status', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-medium"
          >
            {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Contact')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactForm;
