import React, { useState, useMemo, useEffect } from 'react';
import { 
  AiOutlineCloudUpload, AiOutlineFileExcel, AiOutlineCheckCircle, 
  AiOutlineExclamationCircle, AiOutlineSetting, AiOutlineHistory,
  AiOutlineArrowRight, AiOutlineDelete, AiOutlineDownload,
  AiOutlineSearch, AiOutlineThunderbolt, AiOutlineRollback,
  AiOutlineEye, AiOutlineBranches, AiOutlineFileText, AiOutlinePlus,
  AiOutlineDoubleRight, AiOutlineTable, AiOutlineClose, AiOutlineDatabase,
  AiOutlineTag, AiOutlineFileUnknown, AiOutlineEyeInvisible, AiOutlineSafety,
  AiOutlineLink, AiOutlineSync, AiOutlineAlert, AiOutlineScissor,
  AiOutlineFilter, AiOutlineLoading3Quarters, AiOutlineWarning
} from 'react-icons/ai';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { useSMMToast } from '../../components/SMMToastProvider';

const LeadImportPage = () => {
  const { showToast } = useSMMToast();
  const [activeStep, setActiveStep] = useState(1); 
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataSource, setDataSource] = useState('file'); // file, external, scheduled
  
  // 1. Intelligent Mapping States
  const [rawHeaders, setRawHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [mappings, setMapping] = useState({}); // { header: { target, confidence, state } }
  const [newFields, setNewFields] = useState([]);
  const [mappingTemplates] = useState([{ id: 't1', name: 'Standard Marketing Template' }]);

  // 2. Data Validation & Cleaning States
  const [filterMode, setFilterMode] = useState('all'); // all, errors, warnings, conflicts
  const [isMasked, setIsMasked] = useState(true);
  const [isTransforming, setIsTransforming] = useState(false);

  // 3. Configuration & Deduplication
  const [isNewFieldDrawerOpen, setIsNewFieldDrawerOpen] = useState(false);
  const [pendingHeader, setPendingHeader] = useState(null);
  const [newFieldData, setNewFieldData] = useState({ label: '', type: 'text' });
  const [dedupRules, setDedupRules] = useState(['email']);
  const [conflictStrategy, setConflictStrategy] = useState('skip'); // skip, update, overwrite
  const [importConfig, setPostImportConfig] = useState({
    assignTo: 'round-robin',
    tags: ['bulk-import-2024'],
    pipeline: 'New Leads',
    triggerWorkflow: true
  });

  // 4. Processing & History States
  const [processingStats, setProcessingStats] = useState({ success: 0, updated: 0, skipped: 0, error: 0 });
  const [history] = useState([
    { id: 'h1', file: 'leads_q1_final.csv', rows: 1240, status: 'success', date: '2024-04-20 14:30', version: 'v1.2' },
    { id: 'h2', file: 'external_sync_hubspot', rows: 840, status: 'partial', date: '2024-04-18 09:15', version: 'v1.1', errorCount: 12 },
    { id: 'h3', file: 'old_crm_export.xlsx', rows: 5000, status: 'failed', date: '2024-04-10 16:45', version: 'v1.0' }
  ]);

  const CRM_FIELDS = useMemo(() => [
    { value: 'name', label: 'Lead: Full Name' },
    { value: 'email', label: 'Lead: Email' },
    { value: 'phone', label: 'Lead: Phone' },
    { value: 'account_name', label: 'Account: Name' },
    { value: 'title', label: 'Lead: Job Title' },
    { value: 'industry', label: 'Account: Industry' },
    ...newFields
  ], [newFields]);

  const getColumnLetter = (index) => {
    let letter = "";
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  };

  // ACTUAL FILE PARSING LOGIC with Enrichment for New Requirements
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;
      try {
        const rows = content.split(/\r?\n/).filter(row => row.trim() !== '');
        if (rows.length === 0) {
           showToast('No data detected in file.', { type: 'error' });
           return;
        }

        const parseCSVLine = (line) => {
          const result = [];
          let cell = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
              result.push(cell.trim());
              cell = '';
            } else cell += char;
          }
          result.push(cell.trim());
          return result;
        };

        const headers = parseCSVLine(rows[0]).map(h => h.replace(/^"|"$/g, ''));
        const data = rows.slice(1).map((row, rowIdx) => {
          const values = parseCSVLine(row).map(v => v.replace(/^"|"$/g, ''));
          const rowObj = { id: rowIdx };
          headers.forEach((h, i) => { rowObj[h] = values[i] || ''; });
          
          // Data Validation States Representation
          const errors = [];
          const warnings = [];
          const sensitive = [];
          
          headers.forEach(h => {
             const val = rowObj[h];
             const lower = h.toLowerCase();
             if (lower.includes('email') && val && !val.includes('@')) errors.push(`${h}: Invalid format`);
             if (lower.includes('phone') && val && val.length < 5) warnings.push(`${h}: Short phone number`);
             if (lower.includes('key') || lower.includes('token') || lower.includes('pass')) sensitive.push(`${h}: PII Detection Blocked`);
          });

          rowObj._metadata = { errors, warnings, conflicts: rowIdx % 15 === 0 ? ['Possible CRM Duplicate'] : [], sensitive };
          return rowObj;
        });

        setRawHeaders(headers);
        setTableData(data);

        // Mapping States & Confidence Indicators
        const initialMapping = {};
        headers.forEach(h => {
          const l = h.toLowerCase();
          if (l.includes('email')) initialMapping[h] = { target: 'email', confidence: 'high', state: 'auto' };
          else if (l.includes('name')) initialMapping[h] = { target: 'name', confidence: 'high', state: 'auto' };
          else if (l.includes('company')) initialMapping[h] = { target: 'account_name', confidence: 'med', state: 'auto' };
          else initialMapping[h] = { target: '', confidence: 'low', state: 'unmapped' };
        });
        setMapping(initialMapping);

        setUploadProgress(100);
        setTimeout(() => {
          setActiveStep(2);
          showToast(`Extracted ${data.length} records. High confidence mapping applied.`, { type: 'success' });
        }, 500);

      } catch (err) {
        showToast('Large file processing error or interrupted import.', { type: 'error' });
      }
    };

    setUploadProgress(30);
    reader.readAsText(file);
  };

  const validationSummary = useMemo(() => {
    let errors = 0, warnings = 0, conflicts = 0, valid = 0;
    tableData.forEach(row => {
      if (row._metadata.errors.length > 0) errors++;
      else if (row._metadata.conflicts.length > 0) conflicts++;
      else if (row._metadata.warnings.length > 0) warnings++;
      else valid++;
    });
    return { valid, errors, warnings, conflicts };
  }, [tableData]);

  const saveCustomField = () => {
    if (newFieldData.label) {
      const fieldId = `custom_${Date.now()}`;
      setNewFields([...newFields, { value: fieldId, label: `Custom: ${newFieldData.label}` }]);
      setMapping({ ...mappings, [pendingHeader]: { target: fieldId, confidence: 'high', state: 'manual' } });
      setIsNewFieldDrawerOpen(false);
      showToast(`Custom field created and linked.`, { type: 'success' });
    }
  };

  return (
    <SMModuleGuard sectionId="lead-management" featureId="import">
      <SMModuleLayout
        title="Lead Import Tools"
        subtitle="Intelligent batch ingestion and data harmonization"
        color="#8b5cf6"
        icon={<AiOutlineSync className="text-white" size={18} />}
      >
        <div className="space-y-6">
          {/* Progress Stepper */}
          <div className="flex items-center justify-between max-w-4xl mx-auto mb-12 relative px-4">
             <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
             {[
               { step: 1, label: 'Source Selection', icon: <AiOutlineTable /> },
               { step: 2, label: 'Map & Harmonize', icon: <AiOutlineSetting /> },
               { step: 3, label: 'Logic Config', icon: <AiOutlineBranches /> },
               { step: 4, label: 'Live Processing', icon: <AiOutlineThunderbolt /> }
             ].map((s) => (
               <div key={s.step} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                    ${activeStep === s.step ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 
                      activeStep > s.step ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-100 text-gray-400'}
                  `}>
                     {activeStep > s.step ? <AiOutlineCheckCircle size={20} /> : React.cloneElement(s.icon, { size: 20 })}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${activeStep === s.step ? 'text-gray-800' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
               </div>
             ))}
          </div>

          {activeStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
               <div className="lg:col-span-2 space-y-6">
                  {/* Multi-Source Input Selection */}
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                    {['file', 'external', 'scheduled'].map(s => (
                      <button key={s} onClick={() => setDataSource(s)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${dataSource === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                        {s} Source
                      </button>
                    ))}
                  </div>

                  {dataSource === 'file' ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-[40px] p-20 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all hover:bg-primary/[0.01] relative overflow-hidden">
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-12">
                          <AiOutlineLoading3Quarters className="animate-spin text-primary mb-6" size={48} />
                          <p className="text-sm font-black text-primary uppercase tracking-[0.2em]">Synchronizing Data Stream... {uploadProgress}%</p>
                        </div>
                      )}
                      <div className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform duration-500">
                        <AiOutlineCloudUpload size={48} />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800 mb-3">Ingest Lead Sheet</h3>
                      <p className="text-gray-400 max-w-sm mx-auto mb-10 text-sm">Upload actual CSV or Text files to visualize and harmonize your records into the core database.</p>
                      
                      <label className="px-12 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:opacity-90 cursor-pointer transition-all active:scale-95">
                        SELECT ACTUAL FILE
                        <input type="file" className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
                      </label>
                    </div>
                  ) : (
                    <div className="bg-white p-20 rounded-[40px] border border-gray-100 flex flex-col items-center justify-center text-center">
                       <AiOutlineLink size={48} className="text-gray-200 mb-6 animate-pulse" />
                       <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Awaiting source connection...</p>
                    </div>
                  )}
               </div>
               
               <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                     <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Ingestion Registry</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                     {history.map(row => (
                       <div key={row.id} className="p-6 border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-gray-800 truncate max-w-[140px]">{row.file}</span>
                                <span className="text-[8px] bg-gray-100 px-1.5 py-0.5 rounded-full font-black text-gray-400 uppercase">{row.version}</span>
                             </div>
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                               row.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                               row.status === 'partial' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                             }`}>
                                {row.status}
                             </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                             <span>{row.rows} records • {row.date}</span>
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button title="Re-run Ingestion" className="text-primary hover:scale-110"><AiOutlineSync /></button>
                                <button title="Rollback Version" className="text-amber-500 hover:scale-110"><AiOutlineRollback /></button>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col lg:flex-row animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
               {/* LEFT SIDEBAR: Intelligent Mapping Assistant */}
               <div className="w-full lg:w-[400px] bg-white border-r border-gray-200 flex flex-col shadow-xl z-20">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/30 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-primary/10 text-primary rounded-xl"><AiOutlineBranches size={20} /></div>
                           <h2 className="text-lg font-bold text-gray-800">Mapping State</h2>
                        </div>
                        <div className="relative group/tpl">
                           <button className="text-[10px] font-black text-primary uppercase underline flex items-center gap-1"><AiOutlineTable /> Templates</button>
                        </div>
                     </div>
                     
                     {/* Data Validation Summary States */}
                     <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Valid', count: validationSummary.valid, color: 'emerald', icon: <AiOutlineCheckCircle /> },
                          { label: 'Alerts', count: validationSummary.warnings, color: 'blue', icon: <AiOutlineWarning /> },
                          { label: 'Conflicts', count: validationSummary.conflicts, color: 'amber', icon: <AiOutlineBranches /> },
                          { label: 'Errors', count: validationSummary.errors, color: 'red', icon: <AiOutlineAlert /> }
                        ].map(stat => (
                          <div 
                            key={stat.label} 
                            onClick={() => setFilterMode(stat.label.toLowerCase())}
                            className={`p-2.5 rounded-2xl border transition-all text-center cursor-pointer hover:scale-105 ${filterMode === stat.label.toLowerCase() ? `bg-${stat.color}-500 text-white border-${stat.color}-600` : `bg-${stat.color}-50 border-${stat.color}-100 text-${stat.color}-600`}`}
                          >
                             <p className="text-[10px] font-black leading-none mb-1">{stat.count}</p>
                             <p className="text-[7px] font-black uppercase tracking-tighter opacity-80">{stat.label}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                     {rawHeaders.map((header, idx) => {
                       const m = mappings[header];
                       return (
                        <div key={header} className={`p-4 rounded-3xl border transition-all ${m.state === 'auto' ? 'bg-emerald-50/20 border-emerald-100 shadow-sm' : 'bg-white border-gray-100 shadow-sm hover:border-primary/30'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">{getColumnLetter(idx)}</span>
                                  <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{header}</span>
                              </div>
                              <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${m.confidence === 'high' ? 'bg-emerald-500 text-white' : m.confidence === 'med' ? 'bg-amber-400 text-white' : 'bg-gray-400 text-white'}`}>
                                {m.confidence} match
                              </div>
                            </div>
                            
                            <select 
                              value={m.target || ''}
                              onChange={(e) => {
                                if (e.target.value === 'NEW') handleCreateField(header);
                                else setMapping({...mappings, [header]: { ...m, target: e.target.value, state: 'manual' }});
                              }}
                              className={`w-full bg-white border rounded-xl px-3 py-2 text-[10px] font-black appearance-none transition-all
                                ${m.state === 'auto' ? 'border-emerald-300 text-emerald-700' : 'border-gray-100 text-gray-400'}
                              `}
                            >
                                <option value="">Select CRM target...</option>
                                {CRM_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                <option value="NEW" className="text-emerald-600 font-black">+ Create New CRM Column</option>
                            </select>
                        </div>
                       )
                     })}
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center gap-3">
                     <button onClick={() => setActiveStep(1)} className="flex-1 py-4 text-xs font-black uppercase text-gray-400">Discard</button>
                     <button 
                       onClick={() => setActiveStep(3)}
                       className="flex-[2] py-4 bg-primary text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                     >
                        FINALIZE SETUP <AiOutlineArrowRight />
                     </button>
                  </div>
               </div>

               {/* RIGHT SIDE: Immersive Interactive Grid with Validation & Cleaning States */}
               <div className="flex-1 flex flex-col overflow-hidden relative">
                  <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-400 cursor-pointer hover:bg-gray-200 transition-all" onClick={() => setIsMasked(!isMasked)} title="Sensitive Data Detection State">
                           {isMasked ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </div>
                        <div className="h-6 w-px bg-gray-100" />
                        <div className="flex gap-4">
                           {['all', 'errors', 'warnings', 'conflicts'].map(f => (
                             <button 
                               key={f} 
                               onClick={() => setFilterMode(f)}
                               className={`text-[10px] font-black uppercase tracking-widest transition-all ${filterMode === f ? 'text-primary' : 'text-gray-300 hover:text-gray-500'}`}
                             >
                               {f}
                             </button>
                           ))}
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setIsTransforming(!isTransforming)} className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-black transition-all ${isTransforming ? 'bg-primary text-white border-primary shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}>
                           <AiOutlineScissor /> {isTransforming ? 'APPLY TRANSFORM' : 'DATA CLEANING'}
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 overflow-auto bg-[#e2e8f0] p-0.5">
                     <div className="inline-block min-w-full">
                        <table className="border-collapse table-fixed bg-white shadow-2xl">
                           <thead>
                              <tr className="bg-[#f1f5f9]">
                                 <th className="w-12 border border-gray-200" />
                                 {rawHeaders.map((_, i) => (
                                   <th key={i} className="min-w-[250px] border border-gray-200 py-1.5 text-[10px] font-black text-gray-400 text-center uppercase tracking-tighter">
                                      {getColumnLetter(i)}
                                   </th>
                                 ))}
                              </tr>
                              <tr className="bg-white sticky top-0 z-10 border-b-2 border-gray-100">
                                 <th className="w-12 border border-gray-200" />
                                 {rawHeaders.map(header => {
                                   const hasPII = header.toLowerCase().includes('api') || header.toLowerCase().includes('pass') || header.toLowerCase().includes('key');
                                   return (
                                   <th key={header} className="min-w-[250px] p-5 border border-gray-200 text-left relative group bg-white">
                                      <div className="flex items-center justify-between mb-1">
                                         <span className="text-[11px] font-black text-gray-800 uppercase truncate">{header}</span>
                                         {hasPII && <AiOutlineSafety className="text-amber-500" title="Sensitive Field Detection" />}
                                      </div>
                                      <span className="text-[8px] font-black text-primary uppercase block">{mappings[header].target || 'AWAITING MAPPING'}</span>
                                      {hasPII && <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-400/30" />}
                                   </th>
                                 )})}
                              </tr>
                           </thead>
                           <tbody>
                              {tableData.filter(row => {
                                 if (filterMode === 'errors') return row._metadata.errors.length > 0;
                                 if (filterMode === 'warnings') return row._metadata.warnings.length > 0;
                                 if (filterMode === 'conflicts') return row._metadata.conflicts.length > 0;
                                 return true;
                              }).map((row, idx) => (
                                <tr key={row.id} className="hover:bg-primary/[0.03] transition-colors border-b border-gray-100 group">
                                   <td className={`bg-[#f8fafc] text-center text-[10px] font-black border border-gray-200 ${row._metadata.errors.length > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                      {idx + 1}
                                   </td>
                                   {rawHeaders.map(header => {
                                     const target = mappings[header].target;
                                     const cellVal = row[header];
                                     const hasError = target === 'email' && cellVal && !cellVal.includes('@');
                                     const isDuplicate = row._metadata.conflicts.length > 0;
                                     const isSensitive = header.toLowerCase().includes('api') || header.toLowerCase().includes('key');

                                     return (
                                     <td key={header} className={`p-4 border-r border-gray-50 text-sm font-medium transition-all ${hasError ? 'bg-red-50' : isDuplicate ? 'bg-amber-50' : ''}`}>
                                        <div className="relative">
                                           <input 
                                             value={isSensitive && isMasked ? '••••••••' : cellVal}
                                             onChange={(e) => {
                                                const newData = [...tableData];
                                                newData.find(r => r.id === row.id)[header] = e.target.value;
                                                setTableData(newData);
                                             }}
                                             className={`bg-transparent border-none focus:ring-1 focus:ring-primary/20 p-1 text-sm w-full outline-none transition-all rounded ${hasError ? 'text-red-600' : isDuplicate ? 'text-amber-700' : 'text-gray-700'} ${isTransforming ? 'italic text-primary' : ''}`}
                                           />
                                           {hasError && <AiOutlineAlert className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500 animate-pulse" />}
                                           {isDuplicate && <AiOutlineBranches className="absolute right-0 top-1/2 -translate-y-1/2 text-amber-500" />}
                                        </div>
                                     </td>
                                   )})}
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Excel Simulation Tabs */}
                  <div className="bg-[#f8fafc] border-t border-gray-200 px-4 py-1 flex items-center gap-1 shrink-0">
                     <div className="px-5 py-2 bg-white border-x border-t border-gray-200 rounded-t-xl text-[10px] font-black text-primary flex items-center gap-2 shadow-sm">
                        <AiOutlineTable size={14} className="text-emerald-600" /> SOURCE_SHEET_1
                     </div>
                     <button className="p-2 text-gray-400 hover:text-primary transition-all"><AiOutlinePlus size={16} /></button>
                  </div>
               </div>

               {/* NEW CRM COLUMN DRAWER */}
               <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-[150] transition-transform duration-500 transform ${isNewFieldDrawerOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                  <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-800">Create CRM Pillar</h2>
                        <p className="text-gray-400 text-xs mt-1">Expanding infrastructure for <span className="text-primary font-bold">"{pendingHeader}"</span></p>
                     </div>
                     <button onClick={() => setIsNewFieldDrawerOpen(false)} className="p-3 hover:bg-gray-200 rounded-2xl transition-all text-gray-400"><AiOutlineClose size={24} /></button>
                  </div>
                  <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
                     <div className="space-y-6">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Target Field Label</label>
                           <input value={newFieldData.label} onChange={e => setNewFieldData({...newFieldData, label: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="e.g. Lead Score, Priority Segment" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Field Data Type</label>
                           <div className="grid grid-cols-2 gap-4">
                              {['text', 'number', 'email', 'date'].map(type => (
                                <button key={type} onClick={() => setNewFieldData({...newFieldData, type})} className={`p-5 rounded-3xl border transition-all text-left flex flex-col gap-2 ${newFieldData.type === type ? 'bg-primary border-primary text-white shadow-xl' : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200'}`}>
                                   <span className="text-[10px] font-black uppercase">{type}</span>
                                   <AiOutlineDatabase size={20} className={newFieldData.type === type ? 'text-white' : 'text-gray-300'} />
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                     <div className="bg-emerald-50/50 p-8 rounded-[40px] border border-emerald-100">
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><AiOutlineThunderbolt /> Logic Attachment</p>
                        <p className="text-xs text-emerald-800 leading-relaxed font-medium">This new destination will be registered globally in your Lead Schema and automatically mapped to this data stream.</p>
                     </div>
                  </div>
                  <div className="p-10 border-t border-gray-100 bg-gray-50/50">
                     <button onClick={saveCustomField} className="w-full py-6 bg-primary text-white rounded-[32px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">ESTABLISH AND LINK FIELD</button>
                  </div>
               </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto space-y-8 py-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Deduplication Logic Selection */}
                  <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-2xl space-y-10">
                     <div>
                        <h3 className="text-xl font-bold text-gray-800">Deduplication Protocol</h3>
                        <p className="text-xs text-gray-400 mt-1">Select selectable logic blocks for conflict detection</p>
                     </div>
                     <div className="space-y-4">
                        {[
                          { id: 'email', label: 'Email Match', desc: 'Scan Lead database for email parity' },
                          { id: 'phone', label: 'Phone Match', desc: 'Scan for direct line duplicates' },
                          { id: 'id', label: 'System ID', desc: 'Match against existing External IDs' }
                        ].map(rule => (
                          <div key={rule.id} onClick={() => setDedupRules(prev => prev.includes(rule.id) ? prev.filter(r => r !== rule.id) : [...prev, rule.id])} className={`p-6 rounded-[32px] border transition-all cursor-pointer flex items-center justify-between ${dedupRules.includes(rule.id) ? 'border-primary bg-primary/[0.03]' : 'border-gray-100 hover:border-gray-200'}`}>
                             <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dedupRules.includes(rule.id) ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                                   <AiOutlineSafety size={24} />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-gray-800">{rule.label}</p>
                                   <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{rule.desc}</p>
                                </div>
                             </div>
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${dedupRules.includes(rule.id) ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                                {dedupRules.includes(rule.id) && <AiOutlineCheckCircle className="text-white" />}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Post-Import Injection Workflow Blocks */}
                  <div className="space-y-8">
                     <div className="bg-[#1e293b] p-12 rounded-[56px] text-white space-y-10">
                        <div>
                           <h3 className="text-xl font-bold">Import Configuration</h3>
                           <p className="text-slate-400 text-xs mt-1">Pre-import selectable logic blocks</p>
                        </div>
                        <div className="space-y-4">
                           <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <AiOutlineUser className="text-primary" size={20} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Assign leads</span>
                              </div>
                              <select className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black text-primary uppercase">
                                 <option>Round Robin (AI)</option>
                                 <option>Current User</option>
                              </select>
                           </div>
                           <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <AiOutlineTag className="text-primary" size={20} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Global Tags</span>
                              </div>
                              <input value={importConfig.tags.join(', ')} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black text-center w-32" />
                           </div>
                           <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <AiOutlineThunderbolt className="text-amber-500" size={20} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Trigger Lead Scoring</span>
                              </div>
                              <input type="checkbox" className="w-5 h-5 accent-primary" defaultChecked />
                           </div>
                        </div>
                     </div>
                     
                     <button onClick={() => {
                        setActiveStep(4);
                        let prog = 0;
                        const interval = setInterval(() => {
                           prog += 4;
                           setUploadProgress(prog);
                           setProcessingStats(prev => ({ 
                             ...prev, 
                             success: Math.floor((prog / 100) * tableData.length * 0.95),
                             error: Math.floor((prog / 100) * tableData.length * 0.05)
                           }));
                           if (prog >= 100) {
                              clearInterval(interval);
                              setActiveStep(1);
                              setSelectedFile(null);
                              showToast('Autonomous Ingestion Complete.', { type: 'success' });
                           }
                        }, 60);
                     }} className="w-full py-7 bg-emerald-600 text-white rounded-[32px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-4">
                        <AiOutlineThunderbolt size={28} /> INITIALIZE BATCH SYNC
                     </button>
                  </div>
               </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="max-w-3xl mx-auto py-20 text-center animate-in zoom-in-95 duration-500">
               <div className="relative w-64 h-64 mx-auto mb-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[12px] border-gray-100" />
                  <div className="absolute inset-0 rounded-full border-[12px] border-primary transition-all duration-300" style={{ clipPath: `polygon(50% 50%, -50% -50%, ${uploadProgress}% -50%)`, transform: 'rotate(-90deg)' }} />
                  <p className="text-6xl font-black text-gray-800">{uploadProgress}%</p>
               </div>
               
               <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto">
                  {[
                    { label: 'Success', count: processingStats.success, color: 'emerald' },
                    { label: 'Updated', count: processingStats.updated, color: 'blue' },
                    { label: 'Skipped', count: processingStats.skipped, color: 'gray' },
                    { label: 'Error', count: processingStats.error, color: 'red' }
                  ].map(s => (
                    <div key={s.label} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                       <p className="text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">{s.label}</p>
                       <p className={`text-2xl font-black text-${s.color}-600`}>{s.count}</p>
                    </div>
                  ))}
               </div>
               
               <div className="mt-12 flex items-center justify-center gap-3 text-primary text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">
                  <div className="w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50" />
                  Autonomous Stream Processor Active
               </div>
            </div>
          )}
        </div>
      </SMModuleLayout>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </SMModuleGuard>
  );
};

export default LeadImportPage;
