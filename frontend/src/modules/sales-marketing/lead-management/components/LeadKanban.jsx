import React from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { AiOutlineEllipsis, AiOutlinePhone, AiOutlineMail, AiOutlineMessage } from 'react-icons/ai';

const LEAD_STAGES = [
  { id: 'new', label: 'New Leads', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-amber-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-emerald-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-pink-500' },
];

const ItemType = 'LEAD_CARD';

const LeadCard = ({ lead, onSelect }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { id: lead.id, currentStage: lead.stage },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [lead]);

  const scoreColor = lead.score >= 80 ? 'text-emerald-500' : lead.score >= 50 ? 'text-amber-500' : 'text-red-500';

  return (
    <div
      ref={drag}
      onClick={() => onSelect(lead)}
      className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer mb-3 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`text-[10px] font-black ${scoreColor} bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100`}>
          {lead.score || 0} SCORE
        </div>
        <button className="text-gray-400 hover:text-gray-600"><AiOutlineEllipsis /></button>
      </div>
      
      <h4 className="text-xs font-bold text-gray-800 mb-1">{lead.first_name} {lead.last_name}</h4>
      <p className="text-[10px] text-gray-400 mb-3 truncate">{lead.company || 'Private Lead'}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex -space-x-1">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary border border-white">
            {lead.first_name?.[0]}{lead.last_name?.[0]}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-all"><AiOutlinePhone size={12} /></button>
          <button className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-all"><AiOutlineMail size={12} /></button>
        </div>
      </div>
    </div>
  );
};

const KanbanColumn = ({ stage, leads, onMoveLead, onSelectLead }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: (item) => onMoveLead(item.id, stage.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [stage.id]);

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[280px] bg-gray-50/50 rounded-3xl p-4 transition-all ${isOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''}`}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stage.color}`} />
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">{stage.label}</h3>
        </div>
        <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">{leads.length}</span>
      </div>

      <div className="min-h-[500px]">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} onSelect={onSelectLead} />
        ))}
      </div>
    </div>
  );
};

const LeadKanban = ({ leads, onMoveLead, onSelectLead }) => {
  return (
    <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
      {LEAD_STAGES.map(stage => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          leads={leads.filter(l => (l.stage || 'new') === stage.id)}
          onMoveLead={onMoveLead}
          onSelectLead={onSelectLead}
        />
      ))}
    </div>
  );
};

export default LeadKanban;
