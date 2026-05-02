import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../../modules/sales-marketing/core-crm/context/CRMContext';
import { AiOutlineUser, AiOutlineHistory, AiOutlineLink } from 'react-icons/ai';

const Customer360Widget = ({ config = {} }) => {
  const navigate = useNavigate();
  const { accounts, contacts, getActivitiesByAccount, getContactsByAccount } = useCRM();

  // Resolve entity: if entityId provided, find it; otherwise pick first account
  const entityId = config.entityId || (accounts && accounts.length > 0 && accounts[0].id) || null;
  const entityType = config.entityType || 'account';

  const account = accounts.find(a => a.id === entityId) || null;
  const contactList = account ? getContactsByAccount(account.id) : [];
  const activities = account ? getActivitiesByAccount(account.id) : [];

  const open360 = () => {
    if (!entityId) return;
    navigate(`/sm/core-crm/customer-360/${entityId}`);
  };

  if (!account && !entityId) {
    return (
      <div className="p-4 h-full flex flex-col justify-center items-center text-gray-400">
        <div className="text-sm font-medium">Customer 360</div>
        <div className="text-xs mt-2">No accounts available</div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">{config.title || 'Customer 360'}</div>
            <div className="text-sm font-bold text-gray-800 truncate mt-1">{account?.name || '—'}</div>
            <div className="text-xs text-gray-500 mt-1">{account?.industry || ''}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-400">Contacts</div>
            <div className="font-bold text-sm">{contactList.length}</div>
          </div>
        </div>

        <div className="mt-3 bg-gray-50 p-3 rounded-lg">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Recent Activities</div>
          <div className="text-sm font-medium mt-2">{activities.length} activity items</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={open360} className="flex-1 px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2">
          <AiOutlineLink /> Open 360
        </button>
        <button onClick={() => {}} className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">⋯</button>
      </div>
    </div>
  );
};

export default Customer360Widget;
