import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../../api';
import { AiOutlineUser, AiOutlineSearch } from 'react-icons/ai';

const UsersTableWidget = ({ config }) => {
  const { title = 'Users', limit = 5 } = config;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    usersAPI.getAll()
      .then(res => {
        if (mounted) {
          setUsers((res.data || []).slice(0, limit));
          setLoading(false);
        }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [limit]);

  const filtered = search
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.company?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading users...</div>;
  }

  return (
    <div className="users-table-widget h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 font-primary text-sm flex items-center gap-2">
          <AiOutlineUser size={16} /> {title}
        </h3>
        <span className="text-xs text-gray-400 font-primary">{filtered.length} shown</span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <AiOutlineSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary"
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-1.5 px-2 font-semibold text-gray-500 font-primary">Name</th>
              <th className="text-left py-1.5 px-2 font-semibold text-gray-500 font-primary hidden sm:table-cell">Company</th>
              <th className="text-left py-1.5 px-2 font-semibold text-gray-500 font-primary">Role</th>
              <th className="text-left py-1.5 px-2 font-semibold text-gray-500 font-primary">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-1.5 px-2 font-medium text-gray-800 font-primary truncate max-w-[120px]">{u.name}</td>
                <td className="py-1.5 px-2 text-gray-500 font-primary hidden sm:table-cell truncate max-w-[100px]">{u.company}</td>
                <td className="py-1.5 px-2 text-gray-500 font-primary">{u.role}</td>
                <td className="py-1.5 px-2">
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-primary capitalize ${
                    u.status === 'active' ? 'bg-green-100 text-green-700' :
                    u.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="4" className="text-center py-4 text-gray-400 font-primary">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTableWidget;
