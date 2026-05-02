import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  AiOutlineUser, 
  AiOutlineTeam, 
  AiOutlineSafetyCertificate, 
  AiOutlineSearch,
  AiOutlineFilter,
  AiOutlineMerge,
  AiOutlineEye,
  AiOutlineDelete,
  AiOutlineHistory,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
  AiOutlineWarning,
  AiOutlineArrowRight,
  AiOutlineSetting,
  AiOutlineInfoCircle,
  AiOutlineThunderbolt,
  AiOutlineRobot,
  AiOutlineClockCircle
} from 'react-icons/ai';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { SMStatsCard, SMEmptyState } from '../../components/shared';
import { useCRM } from '../context/CRMContext';
import { useSMMToast } from '../../components/SMMToastProvider';
import { calculateConfidence, normalizePhone, getSimilarity } from '../utils/matchingLogic';
import DuplicateSettingsDrawer from '../components/DuplicateSettingsDrawer';

// ─── Constants & Mock Duplicate Groups ──────────────────────────

const ENTITY_TYPES = [
  { value: 'contacts', label: 'Contacts', icon: <AiOutlineUser /> },
  { value: 'accounts', label: 'Accounts', icon: <AiOutlineTeam /> },
  { value: 'cross-entity', label: 'Cross-Entity', icon: <AiOutlineRobot /> },
];

const FLAG_STYLES = {
  'High Confidence': 'bg-red-50 text-red-600 border-red-100',
  'Possible Duplicate': 'bg-amber-50 text-amber-600 border-amber-100',
  'Low Risk': 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

// ─── Main Component ─────────────────────────────────────────────────

const DuplicateDetectionPage = () => {
  const { contacts, accounts, updateContact, deleteContact, addActivity } = useCRM();
  const { showToast } = useSMMToast();

  // 1. State Management
  const [selectedEntity, setSelectedEntity] = useState('contacts');
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isAutoMergeEnabled, setIsAutoMergeEnabled] = useState(false);
  const [lastScan, setLastScan] = useState(new Date().toISOString());
  
  const [selectedRecords, setSelectedRecords] = useState([]); // For comparison/merge
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [matchingSettings, setMatchingSettings] = useState({
    weightName: 40,
    weightEmail: 30,
    weightPhone: 20,
    weightDomain: 10,
    autoMergeThreshold: 95,
    scanFrequency: 'manual',
    notifyOnFound: true,
    ignoreAccents: true,
    stripTitles: false,
    commonDomainExclusion: 'gmail.com, outlook.com, yahoo.com'
  });

  // Merge State
  const [mergeMasterId, setMergeMasterId] = useState(null);
  const [fieldOverrides, setFieldOverrides] = useState({}); // { field: value }

  // 2. Mock Detection Logic
  const runScan = useCallback(() => {
    setIsScanning(true);
    showToast('Scanning database for duplicates...', { type: 'info' });

    // Simulate detection delay
    setTimeout(() => {
      const records = selectedEntity === 'contacts' ? contacts : accounts;
      const groups = [];
      const processedIds = new Set();

      // Simple N^2 comparison for mock purposes (limited to first 50 for performance)
      const limit = Math.min(records.length, 50);
      
      for (let i = 0; i < limit; i++) {
        if (processedIds.has(records[i].id)) continue;
        
        const currentGroup = [records[i]];
        
        for (let j = i + 1; j < limit; j++) {
          if (processedIds.has(records[j].id)) continue;
          
          const detection = calculateConfidence(records[i], records[j]);
          
          if (detection.score >= confidenceThreshold) {
            currentGroup.push({
              ...records[j],
              confidence: detection.score,
              flag: detection.flag,
              matches: detection.matches
            });
            processedIds.add(records[j].id);
          }
        }

        if (currentGroup.length > 1) {
          groups.push({
            id: `group-${Date.now()}-${i}`,
            master: records[i],
            duplicates: currentGroup.slice(1)
          });
          processedIds.add(records[i].id);
        }
      }

      setDuplicateGroups(groups);
      setLastScan(new Date().toISOString());
      setIsScanning(false);
      showToast(`Scan complete. Found ${groups.length} duplicate groups.`, { type: 'success' });
    }, 1500);
  }, [contacts, accounts, selectedEntity, confidenceThreshold, showToast]);

  // Initial scan
  useEffect(() => {
    runScan();
  }, [selectedEntity]);

  // 3. Merging Logic
  const handleSelectForMerge = (records) => {
    setSelectedRecords(records);
    setMergeMasterId(records[0].id);
    setFieldOverrides({});
    setIsMerging(true);
  };

  const executeMerge = () => {
    if (!mergeMasterId) return;

    const master = selectedRecords.find(r => r.id === mergeMasterId);
    const others = selectedRecords.filter(r => r.id !== mergeMasterId);

    // Construct merged record
    const mergedData = { ...master, ...fieldOverrides };
    
    // In a real app, you would:
    // 1. Update master record
    // 2. Migrate activities/deals from others to master
    // 3. Delete other records
    
    // Simulate:
    updateContact(mergeMasterId, mergedData);
    others.forEach(r => deleteContact(r.id));

    const logEntry = {
      id: Date.now(),
      action: 'MERGE',
      master: master.name || `${master.first_name} ${master.last_name}`,
      duplicates: others.map(r => r.name || `${r.first_name} ${r.last_name}`),
      timestamp: new Date().toISOString()
    };

    setAuditLog(prev => [logEntry, ...prev]);
    setIsMerging(false);
    setSelectedRecords([]);
    runScan();
    showToast('Records merged successfully', { type: 'success' });
  };

  // 4. Render Helpers
  const renderConfidenceBadge = (score) => {
    let color = 'bg-emerald-500';
    if (score < 60) color = 'bg-amber-500';
    if (score < 40) color = 'bg-red-500';

    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-[10px] font-bold text-gray-500">{score}%</span>
      </div>
    );
  };

  return (
    <SMModuleGuard sectionId="core-crm" featureId="duplicate-detection">
      <SMModuleLayout
        title="Duplicate Detection & Merge"
        subtitle="Intelligent data cleanup and record consolidation"
        color="#E11D48"
        icon={<AiOutlineMerge className="text-white" size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={runScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-lg hover:shadow-primary/20 ${isScanning ? 'animate-pulse' : ''}`}
            >
              <AiOutlineThunderbolt size={18} />
              <span>{isScanning ? 'Scanning...' : 'Run Scan'}</span>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-500 shadow-sm"
            >
              <AiOutlineSetting size={20} />
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Left Panel: Filters & Controls */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                <AiOutlineFilter className="text-primary" /> Detection Controls
              </h3>

              <div className="space-y-6">
                {/* Entity Selection */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Entity</label>
                  <div className="grid grid-cols-1 gap-2">
                    {ENTITY_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedEntity(type.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                          selectedEntity === type.value 
                            ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        {type.icon}
                        <span className="text-sm font-bold">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Threshold Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confidence Threshold</label>
                    <span className="text-xs font-bold text-primary">{confidenceThreshold}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" step="5"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 italic">Higher threshold means stricter matching</p>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs font-medium text-gray-600">Include Inactive Records</span>
                    <div 
                      onClick={() => setIncludeInactive(!includeInactive)}
                      className={`w-10 h-5 rounded-full transition-all relative ${includeInactive ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeInactive ? 'left-6' : 'left-1'}`} />
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs font-medium text-gray-600">Auto-Merge High Confidence</span>
                    <div 
                      onClick={() => setIsAutoMergeEnabled(!isAutoMergeEnabled)}
                      className={`w-10 h-5 rounded-full transition-all relative ${isAutoMergeEnabled ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAutoMergeEnabled ? 'left-6' : 'left-1'}`} />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Automation Status */}
            <div className="bg-[#1e293b] rounded-3xl p-6 shadow-xl overflow-hidden relative">
               <div className="flex items-center gap-3 mb-4 relative z-10">
                 <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl">
                    <AiOutlineRobot size={20} />
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-white">Smart Cleanup</h3>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">Autonomous active</p>
                 </div>
               </div>
               
               <div className="space-y-4 relative z-10">
                 <div className="flex items-center justify-between">
                   <span className="text-[11px] text-slate-400">Last Scan</span>
                   <span className="text-[11px] text-white font-mono">{new Date(lastScan).toLocaleTimeString()}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-[11px] text-slate-400">Efficiency</span>
                   <span className="text-[11px] text-emerald-400 font-bold">+24% Improved</span>
                 </div>
               </div>

               <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            </div>

            {/* Audit Log */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                <AiOutlineHistory className="text-primary" /> Recent Activity
              </h3>
              <div className="space-y-4">
                {auditLog.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No recent merges</p>
                ) : (
                  auditLog.map(log => (
                    <div key={log.id} className="border-l-2 border-emerald-500 pl-4 py-1">
                      <p className="text-[11px] font-bold text-gray-800">Merged into {log.master}</p>
                      <p className="text-[10px] text-gray-500 mt-1 truncate">{log.duplicates.length} records consolidated</p>
                      <span className="text-[9px] text-gray-400 uppercase tracking-tighter">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Main View */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SMStatsCard 
                title="Duplicates Found" value={duplicateGroups.reduce((acc, g) => acc + g.duplicates.length, 0)} 
                icon={<AiOutlineWarning />} color="#E11D48" 
              />
              <SMStatsCard 
                title="Consolidated" value={auditLog.reduce((acc, l) => acc + l.duplicates.length, 0)} 
                icon={<AiOutlineMerge />} color="#2563EB" 
              />
              <SMStatsCard 
                title="Data Quality" value="94.2%" 
                icon={<AiOutlineSafetyCertificate />} color="#10B981" 
              />
              <SMStatsCard 
                title="Risk Level" value="Low" 
                icon={<AiOutlineInfoCircle />} color="#8B5CF6" 
              />
            </div>

            {/* Duplicate List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-800">Potential Duplicate Groups</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Found based on phonetic and fuzzy matching</p>
                </div>
                <div className="flex items-center gap-2">
                   <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-all uppercase tracking-widest">Ignore All</button>
                   <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all border border-gray-100">Bulk Merge</button>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {duplicateGroups.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AiOutlineCheckCircle size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">Database is Clean</h4>
                    <p className="text-sm text-gray-500 mt-2">No duplicate records were found based on your current filters.</p>
                  </div>
                ) : (
                  duplicateGroups.map((group) => (
                    <div key={group.id} className="p-6 hover:bg-gray-50/50 transition-all group">
                       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                         
                         {/* Master Record */}
                         <div className="flex-1">
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Master Record</span>
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                               <AiOutlineUser size={20} />
                             </div>
                             <div>
                               <h4 className="text-sm font-bold text-gray-800">{group.master.name || `${group.master.first_name} ${group.master.last_name}`}</h4>
                               <p className="text-xs text-gray-400">{group.master.email}</p>
                             </div>
                           </div>
                         </div>

                         {/* Potential Duplicates */}
                         <div className="flex-[2] border-l border-gray-100 lg:pl-6">
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Duplicates ({group.duplicates.length})</span>
                           <div className="space-y-3">
                             {group.duplicates.map((dup, idx) => (
                               <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary/20 transition-all">
                                 <div className="flex items-center gap-3">
                                    {renderConfidenceBadge(dup.confidence)}
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-gray-700 truncate">{dup.name || `${dup.first_name} ${dup.last_name}`}</p>
                                      <p className="text-[10px] text-gray-400 truncate">{dup.email}</p>
                                    </div>
                                 </div>
                                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${FLAG_STYLES[dup.flag]}`}>
                                   {dup.flag}
                                 </span>
                               </div>
                             ))}
                           </div>
                         </div>

                         {/* Actions */}
                         <div className="lg:pl-6 border-l border-gray-100 flex flex-col justify-center gap-2">
                           <button 
                             onClick={() => handleSelectForMerge([group.master, ...group.duplicates])}
                             className="w-full px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                           >
                             <AiOutlineMerge size={16} />
                             Review & Merge
                           </button>
                           <button className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
                             Ignore Group
                           </button>
                         </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── MERGE MODAL ────────────────────────────────────────────── */}
        {isMerging && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMerging(false)} />
            
            <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 bg-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Consolidate Records</h3>
                  <p className="text-sm text-gray-500">Compare fields and select data to keep in the final master record.</p>
                </div>
                <button onClick={() => setIsMerging(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <AiOutlineClose size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Modal Body - Comparison Table */}
              <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/4">Field</th>
                        {selectedRecords.map(record => (
                          <th key={record.id} className="px-6 py-4 w-1/3">
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <div 
                                  onClick={() => setMergeMasterId(record.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${mergeMasterId === record.id ? 'border-primary bg-primary' : 'border-gray-200 group-hover:border-primary/50'}`}
                                >
                                  {mergeMasterId === record.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className="text-xs font-bold text-gray-800">Master Record</span>
                              </label>
                              <div className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded self-start">ID: {record.id}</div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {['first_name', 'last_name', 'email', 'phone', 'company', 'job_title'].map(field => (
                        <tr key={field} className="hover:bg-gray-50/30 group">
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{field.replace('_', ' ')}</span>
                          </td>
                          {selectedRecords.map(record => (
                            <td 
                              key={record.id} 
                              className={`px-6 py-4 cursor-pointer transition-all ${fieldOverrides[field] === record[field] || (!fieldOverrides[field] && mergeMasterId === record.id) ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''}`}
                              onClick={() => setFieldOverrides(prev => ({ ...prev, [field]: record[field] }))}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <span className={`text-sm ${!record[field] ? 'text-gray-300 italic' : 'text-gray-700'}`}>
                                  {record[field] || 'Empty'}
                                </span>
                                {(fieldOverrides[field] === record[field] || (!fieldOverrides[field] && mergeMasterId === record.id)) && (
                                  <AiOutlineCheckCircle className="text-primary shrink-0" size={16} />
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Preview Results Panel */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AiOutlineEye className="text-primary" /> Merged Record Preview
                      </h4>
                      <div className="space-y-3">
                        {Object.keys(selectedRecords[0]).filter(k => !['id', 'created_at', 'updated_at'].includes(k)).map(k => (
                          <div key={k} className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-400 capitalize">{k.replace('_', ' ')}</span>
                            <span className="font-bold text-gray-700">{fieldOverrides[k] || selectedRecords.find(r => r.id === mergeMasterId)?.[k] || '-'}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500 text-white rounded-xl">
                          <AiOutlineSafetyCertificate size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900">Consolidation Impact</h4>
                          <p className="text-xs text-emerald-700">Merging will consolidate activities and timelines.</p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-xs text-emerald-700">
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                          Master record will retain all historical ID's
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                          Other {selectedRecords.length - 1} records will be permanently deleted
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                          System will create a redirect for email/phone
                        </li>
                      </ul>
                   </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <button 
                  onClick={() => setIsMerging(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-all"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Action cannot be undone</span>
                  <button 
                    onClick={executeMerge}
                    className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <AiOutlineMerge size={18} />
                    Confirm Consolidation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </SMModuleLayout>

      <DuplicateSettingsDrawer
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={matchingSettings}
        onSave={(newSettings) => {
          setMatchingSettings(newSettings);
          showToast('Detection settings updated', { type: 'success' });
        }}
      />

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #E11D48;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
    </SMModuleGuard>
  );
};

const AiOutlineClose = ({ size, className }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" className={className} height={size} width={size} xmlns="http://www.w3.org/2000/svg"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
);

export default DuplicateDetectionPage;
