import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContact } from '../hooks/useContacts';
import ContactForm from '../components/ContactForm';
import {
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineArrowLeft,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineLink,
  AiOutlineEnvironment,
  AiOutlineClockCircle,
} from 'react-icons/ai';
import { contactAPI } from '../api/contactAPI';

const ACTIVITY_ICONS = {
  call: '📞',
  email: '📧',
  meeting: '📅',
  note: '📝',
  task: '✅',
};

function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contact, loading, error, refetch } = useContact(id);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');

  const handleDelete = async () => {
    if (!confirm('Delete this contact? This cannot be undone.')) return;
    try {
      await contactAPI.delete(id);
      navigate('/sales/contacts');
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading contact...
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-lg font-medium mb-2">Contact not found</p>
          <button onClick={() => navigate('/sales/contacts')} className="text-primary hover:underline">
            ← Back to contacts
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const initials = `${contact.first_name.charAt(0)}${contact.last_name.charAt(0)}`.toUpperCase();

  const tabs = [
    { key: 'timeline', label: 'Activity Timeline' },
    { key: 'details', label: 'Details' },
    { key: 'relationships', label: 'Relationships' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales/contacts')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <AiOutlineArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: contact.avatar_url ? 'transparent' : '#296374' }}
              >
                {contact.avatar_url ? (
                  <img src={contact.avatar_url} alt={fullName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{fullName}</h1>
                {contact.title && <p className="text-sm text-gray-500">{contact.title}{contact.department ? ` · ${contact.department}` : ''}</p>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors font-medium"
            >
              <AiOutlineEdit size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors font-medium"
            >
              <AiOutlineDelete size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center gap-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === 'timeline' && (
          <div className="max-w-3xl">
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <AiOutlineClockCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Activity Timeline</h3>
              <p className="text-sm text-gray-400">
                Calls, emails, meetings, and notes will appear here.
                <br />This feature will be available in Phase 2.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <AiOutlineMail className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{contact.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AiOutlinePhone className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{contact.phone || '—'}</p>
                  </div>
                </div>
                {contact.mobile && (
                  <div className="flex items-center gap-3">
                    <AiOutlinePhone className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Mobile</p>
                      <p className="text-sm text-gray-900">{contact.mobile}</p>
                    </div>
                  </div>
                )}
                {contact.linkedin && (
                  <div className="flex items-center gap-3">
                    <AiOutlineLink className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">LinkedIn</p>
                      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
                        {contact.linkedin}
                      </a>
                    </div>
                  </div>
                )}
                {(contact.city || contact.state || contact.country) && (
                  <div className="flex items-start gap-3">
                    <AiOutlineEnvironment className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm text-gray-900">
                        {[contact.city, contact.state, contact.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account & Meta */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Account & Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Account / Company</p>
                  <p className="text-sm text-gray-900">{contact.account_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Source</p>
                  <p className="text-sm text-gray-900 capitalize">{contact.source || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                    contact.status === 'active' ? 'bg-green-100 text-green-700' :
                    contact.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {contact.status || 'active'}
                  </span>
                </div>
                {contact.tags && contact.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{new Date(contact.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">{new Date(contact.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="max-w-3xl">
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <AiOutlineLink size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Relationships</h3>
              <p className="text-sm text-gray-400">
                Links to related contacts will appear here.
                <br />This feature will be available in Phase 2.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Form */}
      {showForm && (
        <ContactForm
          contact={contact}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); refetch(); }}
        />
      )}
    </div>
  );
}

export default ContactDetailPage;
