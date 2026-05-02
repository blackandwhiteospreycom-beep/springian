import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { mockAccounts, mockContacts, mockActivities, mockCommunicationLogs } from '../utils/mockData';
import { 
  DEFAULT_FIELD_GROUPS, 
  DEFAULT_ACCOUNT_FIELD_GROUPS, 
  DEFAULT_ACTIVITY_FIELD_GROUPS,
  DEFAULT_ENRICHMENT_FIELD_GROUPS,
  DEFAULT_DUPLICATE_FIELD_GROUPS
} from '../utils/fieldRegistry';
import { v4 as uuidv4 } from 'uuid';

const CRMContext = createContext();

// Storage keys
const ACCOUNTS_KEY = 'crm_accounts';
const CONTACTS_KEY = 'crm_contacts';
const ACTIVITIES_KEY = 'crm_activities';
const COMM_LOGS_KEY = 'crm_communication_logs';
const ENRICHMENT_JOBS_KEY = 'crm_enrichment_jobs';
const DEALS_KEY = 'crm_deals';
const ACCOUNT_FIELDS_KEY = 'crm_account_fields';
const CONTACT_FIELDS_KEY = 'crm_contact_fields';
const ACTIVITY_FIELDS_KEY = 'crm_activity_fields';
const ENRICHMENT_FIELDS_KEY = 'crm_enrichment_fields';
const DUPLICATE_FIELDS_KEY = 'crm_duplicate_fields';
const CAPTURE_FORMS_KEY = 'crm_capture_forms';

export const CRMProvider = ({ children }) => {
  // ─── DATA STATE ───────────────────────────────────────────────────
  
  const [accounts, setAccounts] = useState(() => {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) return JSON.parse(stored);
    const accMap = {};
    mockAccounts.forEach(acc => accMap[acc.id] = acc);
    return accMap;
  });

  const [contacts, setContacts] = useState(() => {
    const stored = localStorage.getItem(CONTACTS_KEY);
    if (stored) return JSON.parse(stored);
    const conMap = {};
    mockContacts.forEach(con => conMap[con.id] = con);
    return conMap;
  });

  const [activities, setActivities] = useState(() => {
    const stored = localStorage.getItem(ACTIVITIES_KEY);
    if (stored) return JSON.parse(stored);
    const actMap = {};
    mockActivities.forEach(act => actMap[act.id] = act);
    return actMap;
  });

  const [communicationLogs, setCommunicationLogs] = useState(() => {
    const stored = localStorage.getItem(COMM_LOGS_KEY);
    if (stored) return JSON.parse(stored);
    const logMap = {};
    mockCommunicationLogs.forEach(log => logMap[log.id] = log);
    return logMap;
  });

  const [enrichmentJobs, setEnrichmentJobs] = useState(() => {
    const stored = localStorage.getItem(ENRICHMENT_JOBS_KEY);
    return stored ? JSON.parse(stored) : [
      { id: 'job-1', name: 'LinkedIn Contact Sync', status: 'completed', progress: 100, type: 'contact', source: 'LinkedIn', date: '2024-03-20T10:00:00Z', enriched: 145 },
      { id: 'job-2', name: 'Crunchbase Account Enrich', status: 'running', progress: 65, type: 'account', source: 'Crunchbase', date: '2024-03-22T14:00:00Z', enriched: 82 },
      { id: 'job-3', name: 'Email Verification Batch', status: 'pending', progress: 0, type: 'contact', source: 'ZeroBounce', date: '2024-03-23T09:00:00Z', enriched: 0 },
    ];
  });

  const [deals, setDeals] = useState(() => {
    const stored = localStorage.getItem(DEALS_KEY);
    if (stored) return JSON.parse(stored);
    return {};
  });

  // ─── FIELD GROUPS STATE ──────────────────────────────────────────

  const [accountFieldGroups, setAccountFieldGroups] = useState(() => {
    const stored = localStorage.getItem(ACCOUNT_FIELDS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ACCOUNT_FIELD_GROUPS;
  });

  const [contactFieldGroups, setContactFieldGroups] = useState(() => {
    const stored = localStorage.getItem(CONTACT_FIELDS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_FIELD_GROUPS;
  });

  const [activityFieldGroups, setActivityFieldGroups] = useState(() => {
    const stored = localStorage.getItem(ACTIVITY_FIELDS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ACTIVITY_FIELD_GROUPS;
  });

  const [enrichmentFieldGroups, setEnrichmentFieldGroups] = useState(() => {
    const stored = localStorage.getItem(ENRICHMENT_FIELDS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ENRICHMENT_FIELD_GROUPS;
  });

  const [duplicateFieldGroups, setDuplicateFieldGroups] = useState(() => {
    const stored = localStorage.getItem(DUPLICATE_FIELDS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_DUPLICATE_FIELD_GROUPS;
  });

  const [captureForms, setCaptureForms] = useState(() => {
    const stored = localStorage.getItem(CAPTURE_FORMS_KEY);
    return stored ? JSON.parse(stored) : [
      { 
        id: 'form-1', 
        name: 'Website Contact Us', 
        status: 'active', 
        fields: [
          { id: 'f1', label: 'Full Name', type: 'text', required: true, mapping: 'name', placeholder: 'Enter your full name' },
          { id: 'f2', label: 'Email', type: 'email', required: true, mapping: 'email', placeholder: 'john@example.com' },
          { id: 'f3', label: 'Phone Number', type: 'phone', required: false, mapping: 'phone', placeholder: '+1 (555) 000-0000' },
          { id: 'f4', label: 'Message', type: 'textarea', required: false, mapping: 'description', placeholder: 'How can we help?' },
        ],
        theme: { 
          primaryColor: '#3b82f6', 
          borderRadius: '12px',
          layout: 'single-column',
          showProgressBar: false
        },
        automation: {
          postSubmitAction: 'redirect',
          redirectUrl: '/thank-you',
          notificationEmails: ['admin@example.com'],
          autoAssignment: 'round-robin',
          pipelineStage: 'New Lead'
        },
        analytics: { 
          views: 1240, 
          submissions: 45, 
          conversionRate: 3.6,
          trend: '+12%',
          funnel: [
            { step: 'Views', count: 1240 },
            { step: 'Start Fill', count: 850 },
            { step: 'Validation Pass', count: 620 },
            { step: 'Submissions', count: 45 }
          ]
        },
        created_at: '2024-01-15T08:00:00Z'
      }
    ];
  });

  // ─── PERSISTENCE ──────────────────────────────────────────────────

  useEffect(() => { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem(COMM_LOGS_KEY, JSON.stringify(communicationLogs)); }, [communicationLogs]);
  useEffect(() => { localStorage.setItem(ENRICHMENT_JOBS_KEY, JSON.stringify(enrichmentJobs)); }, [enrichmentJobs]);
  useEffect(() => { localStorage.setItem(DEALS_KEY, JSON.stringify(deals)); }, [deals]);
  useEffect(() => { localStorage.setItem(ACCOUNT_FIELDS_KEY, JSON.stringify(accountFieldGroups)); }, [accountFieldGroups]);
  useEffect(() => { localStorage.setItem(CONTACT_FIELDS_KEY, JSON.stringify(contactFieldGroups)); }, [contactFieldGroups]);
  useEffect(() => { localStorage.setItem(ACTIVITY_FIELDS_KEY, JSON.stringify(activityFieldGroups)); }, [activityFieldGroups]);
  useEffect(() => { localStorage.setItem(ENRICHMENT_FIELDS_KEY, JSON.stringify(enrichmentFieldGroups)); }, [enrichmentFieldGroups]);
  useEffect(() => { localStorage.setItem(DUPLICATE_FIELDS_KEY, JSON.stringify(duplicateFieldGroups)); }, [duplicateFieldGroups]);
  useEffect(() => { localStorage.setItem(CAPTURE_FORMS_KEY, JSON.stringify(captureForms)); }, [captureForms]);

  // ─── SELECTORS ───────────────────────────────────────────────────────

  const getAccountById = useCallback((id) => accounts[id], [accounts]);
  const getContactById = useCallback((id) => contacts[id], [contacts]);
  
  const getContactsByAccount = useCallback((accountId) => {
    return Object.values(contacts).filter(c => c.account_id === accountId);
  }, [contacts]);

  const getActivitiesByAccount = useCallback((accountId) => {
    return Object.values(activities)
      .filter(a => a.account_id === accountId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activities]);

  const getActivitiesByContact = useCallback((contactId) => {
    return Object.values(activities)
      .filter(a => a.contact_id === contactId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activities]);

  const getCommLogsByContact = useCallback((contactId) => {
    return Object.values(communicationLogs)
      .filter(l => l.contact_id === contactId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [communicationLogs]);

  const getCommLogsByAccount = useCallback((accountId) => {
    return Object.values(communicationLogs)
      .filter(l => l.account_id === accountId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [communicationLogs]);

  const getCRMStats = useMemo(() => {
    const accValues = Object.values(accounts);
    const conValues = Object.values(contacts);
    return {
      totalAccounts: accValues.length,
      activeAccounts: accValues.filter(a => a.status === 'Active' || a.status === 'active').length,
      customerAccounts: accValues.filter(a => a.status === 'Customer' || a.status === 'customer').length,
      prospectAccounts: accValues.filter(a => a.status === 'Prospect' || a.status === 'prospect').length,
      totalContacts: conValues.length,
      activeContacts: conValues.filter(c => c.status === 'active').length,
      leadContacts: conValues.filter(c => c.status === 'lead').length,
      customerContacts: conValues.filter(c => c.status === 'customer').length,
    };
  }, [accounts, contacts]);

  // ─── ACTIONS ────────────────────────────────────────────────────────

  const addAccount = useCallback((data) => {
    const id = `acc-${uuidv4().slice(0, 8)}`;
    const newAcc = { ...data, id, created_at: new Date().toISOString() };
    setAccounts(prev => ({ ...prev, [id]: newAcc }));
    return newAcc;
  }, []);

  const updateAccount = useCallback((id, updates) => {
    setAccounts(prev => ({ ...prev, [id]: { ...prev[id], ...updates, updated_at: new Date().toISOString() } }));
  }, []);

  const deleteAccount = useCallback((id) => {
    setAccounts(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const addContact = useCallback((data) => {
    const id = `con-${uuidv4().slice(0, 8)}`;
    const newCon = { ...data, id, created_at: new Date().toISOString() };
    setContacts(prev => ({ ...prev, [id]: newCon }));
    return newCon;
  }, []);

  const updateContact = useCallback((id, updates) => {
    setContacts(prev => ({ ...prev, [id]: { ...prev[id], ...updates, updated_at: new Date().toISOString() } }));
  }, []);

  const deleteContact = useCallback((id) => {
    setContacts(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const updateActivity = useCallback((id, updates) => {
    setActivities(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates, updated_at: new Date().toISOString() }
    }));
  }, []);

  const addActivity = useCallback((data) => {
    const id = `act-${uuidv4().slice(0, 8)}`;
    const newActivity = { ...data, id, created_at: new Date().toISOString() };
    setActivities(prev => ({ ...prev, [id]: newActivity }));
    
    // Sync last activity to account/contact
    if (data.account_id) updateAccount(data.account_id, { last_activity_at: newActivity.created_at });
    if (data.contact_id) updateContact(data.contact_id, { last_activity_at: newActivity.created_at });
    
    return newActivity;
  }, [updateAccount, updateContact]);

  const addDeal = useCallback((data) => {
    const id = `deal-${uuidv4().slice(0,8)}`;
    const newDeal = { ...data, id, created_at: new Date().toISOString() };
    setDeals(prev => ({ ...prev, [id]: newDeal }));
    return newDeal;
  }, []);

  const updateDeal = useCallback((id, updates) => {
    setDeals(prev => ({ ...prev, [id]: { ...prev[id], ...updates, updated_at: new Date().toISOString() } }));
  }, []);

  const deleteDeal = useCallback((id) => {
    setDeals(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const addCommLog = useCallback((data) => {
    const id = `log-${uuidv4().slice(0, 8)}`;
    const newLog = { ...data, id, created_at: new Date().toISOString() };
    setCommunicationLogs(prev => ({ ...prev, [id]: newLog }));
    return newLog;
  }, []);

  const getDealsByAccount = useCallback((accountId) => {
    return Object.values(deals).filter(d => d.account_id === accountId).sort((a,b) => new Date(b.created_at)-new Date(a.created_at));
  }, [deals]);

  const triggerEnrichment = useCallback((data) => {
    console.log('CRMContext: Triggering enrichment', data);
    const newJob = {
      id: `job-${uuidv4().slice(0, 8)}`,
      name: data.companyName || data.domain || data.email || 'New Enrichment Job',
      status: 'running',
      progress: 0,
      type: data.entityType || 'contact',
      source: 'AI Engine',
      date: new Date().toISOString(),
      enriched: 0
    };
    
    setEnrichmentJobs(prev => [newJob, ...prev]);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setEnrichmentJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, progress: 100, status: 'completed', enriched: Math.floor(Math.random() * 50) + 10 } : job
        ));
      } else {
        setEnrichmentJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, progress } : job
        ));
      }
    }, 1000);
  }, []);

  const addForm = useCallback((data) => {
    const id = `form-${uuidv4().slice(0, 8)}`;
    const newForm = { 
      ...data, 
      id, 
      created_at: new Date().toISOString(),
      analytics: { views: 0, submissions: 0, conversionRate: 0 }
    };
    setCaptureForms(prev => [newForm, ...prev]);
    return newForm;
  }, []);

  const updateForm = useCallback((id, updates) => {
    setCaptureForms(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const deleteForm = useCallback((id) => {
    setCaptureForms(prev => prev.filter(f => f.id !== id));
  }, []);

  const value = {
    accounts: Object.values(accounts),
    contacts: Object.values(contacts),
    activities: Object.values(activities),
    communicationLogs: Object.values(communicationLogs),
    enrichmentJobs: Array.isArray(enrichmentJobs) ? enrichmentJobs : Object.values(enrichmentJobs),
    deals: Object.values(deals),
    captureForms,
    addForm,
    updateForm,
    deleteForm,
    accountFieldGroups,
    setAccountFieldGroups,
    contactFieldGroups,
    setContactFieldGroups,
    activityFieldGroups,
    setActivityFieldGroups,
    enrichmentFieldGroups,
    setEnrichmentFieldGroups,
    duplicateFieldGroups,
    setDuplicateFieldGroups,
    getAccountById,
    getContactById,
    getContactsByAccount,
    getActivitiesByAccount,
    getActivitiesByContact,
    getCommLogsByContact,
    getCommLogsByAccount,
    getDealsByAccount,
    getCRMStats,
    addAccount,
    updateAccount,
    deleteAccount,
    addContact,
    updateContact,
    deleteContact,
    updateActivity,
    addActivity,
    addDeal,
    updateDeal,
    deleteDeal,
    addCommLog,
    triggerEnrichment,
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within CRMProvider');
  return context;
};
