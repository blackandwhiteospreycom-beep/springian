import { useNavigate } from 'react-router-dom';
import { AiOutlineMail, AiOutlinePhone, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';

function ContactCard({ contact, selected, onSelect, onEdit, onDelete }) {
  const navigate = useNavigate();
  const fullName = `${contact.first_name} ${contact.last_name}`;
  const initials = `${(contact.first_name || '').charAt(0)}${(contact.last_name || '').charAt(0)}`.toUpperCase();

  const avatarColors = ['#296374', '#714B67', '#25A8E1', '#00AEEF', '#16A34A', '#DC2626'];
  const colorIndex = (contact.first_name || '').charCodeAt(0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  return (
    <tr
      className={`border-b border-gray-100 transition-colors ${
        selected ? 'bg-primary/5' : 'hover:bg-gray-50'
      }`}
    >
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected || false}
          onChange={onSelect}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </td>
      <td
        onClick={() => navigate(`/sales/contacts/${contact.id}`)}
        className="px-4 py-3 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {contact.avatar_url ? (
              <img src={contact.avatar_url} alt={fullName} className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{fullName}</p>
            {contact.title && (
              <p className="text-xs text-gray-500 truncate">{contact.title}{contact.department ? ` · ${contact.department}` : ''}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AiOutlineMail className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{contact.email || '—'}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AiOutlinePhone className="text-gray-400 flex-shrink-0" />
          <span>{contact.phone || '—'}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{contact.account_name || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {contact.tags && contact.tags.length > 0 ? (
            contact.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">No tags</span>
          )}
          {contact.tags && contact.tags.length > 2 && (
            <span className="text-xs text-gray-400">+{contact.tags.length - 2}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
          contact.status === 'active' ? 'bg-green-100 text-green-700' :
          contact.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {contact.status || 'active'}
        </span>
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-primary"
            title="Edit"
          >
            <AiOutlineEdit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-50 rounded transition-colors text-gray-500 hover:text-red-600"
            title="Delete"
          >
            <AiOutlineDelete size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default ContactCard;
