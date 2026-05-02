import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../../../api';
import { AiOutlineAppstore } from 'react-icons/ai';

const ServicesTableWidget = ({ config }) => {
  const { title = 'Services', limit = 10 } = config;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    servicesAPI.getAll()
      .then(res => {
        if (mounted) {
          setServices((res.data || []).slice(0, limit));
          setLoading(false);
        }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [limit]);

  const filtered = search
    ? services.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
    : services;

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading services...</div>;
  }

  return (
    <div className="services-table-widget h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 font-primary text-sm flex items-center gap-2">
          <AiOutlineAppstore size={16} /> {title}
        </h3>
        <span className="text-xs text-gray-400 font-primary">{filtered.length} shown</span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary"
        />
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-auto space-y-2">
        {filtered.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: s.color || '#296374' }}>
              {s.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 font-primary truncate">{s.name}</p>
              <p className="text-[10px] text-gray-400 font-primary">{s.customers} customers · {s.revenue}</p>
            </div>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-primary capitalize flex-shrink-0 ${
              s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {s.status}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-4 text-gray-400 font-primary text-xs">No services found</div>
        )}
      </div>
    </div>
  );
};

export default ServicesTableWidget;
