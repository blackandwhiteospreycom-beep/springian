// Field type registry — defines all supported field types and their properties
export const FIELD_TYPES = {
  text: {
    label: 'Text',
    icon: 'T',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'This field is required';
      if (field.minLength && val.length < field.minLength) return `Minimum ${field.minLength} characters`;
      if (field.maxLength && val.length > field.maxLength) return `Maximum ${field.maxLength} characters`;
      if (field.pattern && !new RegExp(field.pattern).test(val)) return field.patternMessage || 'Invalid format';
      return null;
    },
    render: 'input',
  },
  email: {
    label: 'Email',
    icon: '@',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'Email is required';
      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Invalid email format';
      return null;
    },
    render: 'input',
    inputType: 'email',
  },
  phone: {
    label: 'Phone',
    icon: '📞',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'Phone is required';
      if (val && !/^[\d\s\-\+\(\)]{7,}$/.test(val)) return 'Invalid phone format';
      return null;
    },
    render: 'input',
    inputType: 'tel',
  },
  number: {
    label: 'Number',
    icon: '#',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'This field is required';
      if (val && isNaN(val)) return 'Must be a number';
      if (field.min !== undefined && Number(val) < field.min) return `Minimum value is ${field.min}`;
      if (field.max !== undefined && Number(val) > field.max) return `Maximum value is ${field.max}`;
      return null;
    },
    render: 'input',
    inputType: 'number',
  },
  date: {
    label: 'Date',
    icon: '📅',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'Date is required';
      if (field.minDate && val < field.minDate) return `Date must be after ${field.minDate}`;
      if (field.maxDate && val > field.maxDate) return `Date must be before ${field.maxDate}`;
      return null;
    },
    render: 'input',
    inputType: 'date',
  },
  textarea: {
    label: 'Text Area',
    icon: '¶',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'This field is required';
      if (field.maxLength && val.length > field.maxLength) return `Maximum ${field.maxLength} characters`;
      return null;
    },
    render: 'textarea',
  },
  dropdown: {
    label: 'Dropdown',
    icon: '▾',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'Please select an option';
      return null;
    },
    render: 'select',
    options: [],
  },
  multiselect: {
    label: 'Multi-Select',
    icon: '☑',
    defaultValue: [],
    validate: (val, field) => {
      if (field.required && (!val || val.length === 0)) return 'Please select at least one option';
      return null;
    },
    render: 'multiselect',
    options: [],
  },
  checkbox: {
    label: 'Checkbox',
    icon: '☐',
    defaultValue: false,
    validate: () => null,
    render: 'checkbox',
  },
  url: {
    label: 'Website',
    icon: '🔗',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'URL is required';
      if (val && !/^https?:\/\/.+/.test(val) && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(val)) return 'Invalid URL';
      return null;
    },
    render: 'input',
    inputType: 'url',
  },
  file: {
    label: 'File Upload',
    icon: '📎',
    defaultValue: null,
    validate: (val, field) => {
      if (field.required && !val) return 'File is required';
      if (field.accept && val) {
        const ext = val.name.split('.').pop().toLowerCase();
        if (!field.accept.includes(ext)) return `Only ${field.accept.join(', ')} files allowed`;
      }
      return null;
    },
    render: 'file',
  },
  currency: {
    label: 'Currency',
    icon: '$',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'Amount is required';
      if (val && isNaN(Number(val))) return 'Must be a valid amount';
      return null;
    },
    render: 'input',
    inputType: 'number',
  },
  time: {
    label: 'Time',
    icon: '🕐',
    defaultValue: '',
    validate: (val, field) => {
      if (field.required && !val) return 'Time is required';
      return null;
    },
    render: 'input',
    inputType: 'time',
  },
};

// Default field groups for contact management
export const DEFAULT_FIELD_GROUPS = [
  {
    id: 'personal-info',
    label: 'Personal Information',
    collapsed: false,
    fields: [
      { id: 'first_name', key: 'first_name', label: 'First Name', type: 'text', required: true, group: 'personal-info', order: 0 },
      { id: 'last_name', key: 'last_name', label: 'Last Name', type: 'text', required: true, group: 'personal-info', order: 1 },
      { id: 'email', key: 'email', label: 'Email', type: 'email', required: true, group: 'personal-info', order: 2 },
      { id: 'phone', key: 'phone', label: 'Phone', type: 'phone', required: false, group: 'personal-info', order: 3 },
      { id: 'mobile', key: 'mobile', label: 'Mobile', type: 'phone', required: false, group: 'personal-info', order: 4 },
    ],
  },
  {
    id: 'business-info',
    label: 'Business Information',
    collapsed: false,
    fields: [
      { id: 'company', key: 'company', label: 'Company', type: 'text', required: false, group: 'business-info', order: 0 },
      { id: 'job_title', key: 'job_title', label: 'Job Title', type: 'text', required: false, group: 'business-info', order: 1 },
      { id: 'department', key: 'department', label: 'Department', type: 'text', required: false, group: 'business-info', order: 2 },
      { id: 'website', key: 'website', label: 'Website', type: 'url', required: false, group: 'business-info', order: 3 },
    ],
  },
  {
    id: 'location',
    label: 'Location',
    collapsed: false,
    fields: [
      { id: 'address', key: 'address', label: 'Address', type: 'textarea', required: false, group: 'location', order: 0 },
      { id: 'city', key: 'city', label: 'City', type: 'text', required: false, group: 'location', order: 1 },
      { id: 'state', key: 'state', label: 'State', type: 'text', required: false, group: 'location', order: 2 },
      { id: 'country', key: 'country', label: 'Country', type: 'dropdown', required: false, group: 'location', order: 3, options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'de', label: 'Germany' },
        { value: 'fr', label: 'France' },
        { value: 'in', label: 'India' },
        { value: 'au', label: 'Australia' },
        { value: 'other', label: 'Other' },
      ]},
      { id: 'postal_code', key: 'postal_code', label: 'Postal Code', type: 'text', required: false, group: 'location', order: 4 },
    ],
  },
  {
    id: 'classification',
    label: 'Classification',
    collapsed: false,
    fields: [
      { id: 'status', key: 'status', label: 'Status', type: 'dropdown', required: false, group: 'classification', order: 0, options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'lead', label: 'Lead' },
        { value: 'prospect', label: 'Prospect' },
        { value: 'customer', label: 'Customer' },
      ]},
      { id: 'source', key: 'source', label: 'Source', type: 'dropdown', required: false, group: 'classification', order: 1, options: [
        { value: 'website', label: 'Website' },
        { value: 'referral', label: 'Referral' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'event', label: 'Event' },
        { value: 'import', label: 'Import' },
        { value: 'manual', label: 'Manual' },
      ]},
      { id: 'tags', key: 'tags', label: 'Tags', type: 'multiselect', required: false, group: 'classification', order: 2, options: [
        { value: 'vip', label: 'VIP' },
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'startup', label: 'Startup' },
        { value: 'tech', label: 'Tech' },
        { value: 'finance', label: 'Finance' },
        { value: 'healthcare', label: 'Healthcare' },
      ]},
    ],
  },
];

// Default field groups for account management
export const DEFAULT_ACCOUNT_FIELD_GROUPS = [
  {
    id: 'business-info',
    label: 'Company Information',
    collapsed: false,
    fields: [
      { id: 'name', key: 'name', label: 'Company Name', type: 'text', required: true, group: 'business-info', order: 0 },
      { id: 'industry', key: 'industry', label: 'Industry', type: 'dropdown', required: false, group: 'business-info', order: 1, options: [
        { value: 'Software', label: 'Software' },
        { value: 'Logistics', label: 'Logistics' },
        { value: 'Energy', label: 'Energy' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Manufacturing', label: 'Manufacturing' },
        { value: 'Other', label: 'Other' },
      ]},
      { id: 'website', key: 'website', label: 'Website', type: 'url', required: false, group: 'business-info', order: 2 },
      { id: 'email', key: 'email', label: 'Primary Email', type: 'email', required: false, group: 'business-info', order: 3 },
      { id: 'phone', key: 'phone', label: 'Primary Phone', type: 'phone', required: false, group: 'business-info', order: 4 },
    ],
  },
  {
    id: 'details',
    label: 'Business Details',
    collapsed: false,
    fields: [
      { id: 'employee_count', key: 'employee_count', label: 'Employee Count', type: 'number', required: false, group: 'details', order: 0 },
      { id: 'annual_revenue', key: 'annual_revenue', label: 'Annual Revenue', type: 'currency', required: false, group: 'details', order: 1 },
      { id: 'owner', key: 'owner', label: 'Account Owner', type: 'text', required: false, group: 'details', order: 2 },
      { id: 'description', key: 'description', label: 'Description', type: 'textarea', required: false, group: 'details', order: 3 },
    ],
  },
  {
    id: 'location',
    label: 'Location',
    collapsed: false,
    fields: [
      { id: 'address', key: 'address', label: 'Address', type: 'textarea', required: false, group: 'location', order: 0 },
      { id: 'city', key: 'city', label: 'City', type: 'text', required: false, group: 'location', order: 1 },
      { id: 'state', key: 'state', label: 'State', type: 'text', required: false, group: 'location', order: 2 },
      { id: 'country', key: 'country', label: 'Country', type: 'dropdown', required: false, group: 'location', order: 3, options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'de', label: 'Germany' },
        { value: 'fr', label: 'France' },
        { value: 'in', label: 'India' },
        { value: 'au', label: 'Australia' },
        { value: 'other', label: 'Other' },
      ]},
      { id: 'postal_code', key: 'postal_code', label: 'Postal Code', type: 'text', required: false, group: 'location', order: 4 },
    ],
  },
  {
    id: 'classification',
    label: 'Classification',
    collapsed: false,
    fields: [
      { id: 'status', key: 'status', label: 'Status', type: 'dropdown', required: false, group: 'classification', order: 0, options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Prospect', label: 'Prospect' },
        { value: 'Customer', label: 'Customer' },
      ]},
      { id: 'tier', key: 'tier', label: 'Account Tier', type: 'dropdown', required: false, group: 'classification', order: 1, options: [
        { value: 'tier1', label: 'Tier 1 (Enterprise)' },
        { value: 'tier2', label: 'Tier 2 (Mid-Market)' },
        { value: 'tier3', label: 'Tier 3 (SMB)' },
      ]},
      { id: 'tags', key: 'tags', label: 'Tags', type: 'multiselect', required: false, group: 'classification', order: 2, options: [
        { value: 'vip', label: 'VIP' },
        { value: 'strategic', label: 'Strategic' },
        { value: 'partner', label: 'Partner' },
        { value: 'competitor', label: 'Competitor' },
      ]},
    ],
  },
];

// Default field groups for activity management
export const DEFAULT_ACTIVITY_FIELD_GROUPS = [
  {
    id: 'basic-info',
    label: 'Interaction Details',
    collapsed: false,
    fields: [
      { id: 'type', key: 'type', label: 'Activity Type', type: 'dropdown', required: true, group: 'basic-info', order: 0, options: [
        { value: 'call', label: 'Call' },
        { value: 'email', label: 'Email' },
        { value: 'note', label: 'Note' },
        { value: 'meeting', label: 'Meeting' },
      ]},
      { id: 'description', key: 'description', label: 'Description', type: 'textarea', required: true, group: 'basic-info', order: 1 },
      { id: 'performer', key: 'performer', label: 'Performed By', type: 'text', required: true, group: 'basic-info', order: 2, defaultValue: 'System User' },
    ],
  },
  {
    id: 'classification',
    label: 'Classification',
    collapsed: false,
    fields: [
      { id: 'priority', key: 'priority', label: 'Priority', type: 'dropdown', required: false, group: 'classification', order: 0, options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
      ]},
      { id: 'sentiment', key: 'sentiment', label: 'Sentiment', type: 'dropdown', required: false, group: 'classification', order: 1, options: [
        { value: 'positive', label: 'Positive' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'negative', label: 'Negative' },
      ]},
      { id: 'status', key: 'status', label: 'Status', type: 'dropdown', required: false, group: 'classification', order: 2, options: [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'awaiting_reply', label: 'Awaiting Reply' },
      ]},
    ],
  },
];

// Predefined field templates for quick addition
export const PRESET_FIELDS = {
  social: [
    { id: 'linkedin', key: 'linkedin', label: 'LinkedIn', type: 'url', required: false },
    { id: 'twitter', key: 'twitter', label: 'Twitter', type: 'url', required: false },
    { id: 'facebook', key: 'facebook', label: 'Facebook', type: 'url', required: false },
  ],
  sales: [
    { id: 'annual_revenue', key: 'annual_revenue', label: 'Annual Revenue', type: 'currency', required: false },
    { id: 'employee_count', key: 'employee_count', label: 'Employee Count', type: 'number', required: false },
    { id: 'lead_score', key: 'lead_score', label: 'Lead Score', type: 'number', required: false, min: 0, max: 100 },
  ],
  marketing: [
    { id: 'industry', key: 'industry', label: 'Industry', type: 'dropdown', required: false, options: [
      { value: 'tech', label: 'Technology' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'finance', label: 'Finance' },
      { value: 'retail', label: 'Retail' },
      { value: 'education', label: 'Education' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'other', label: 'Other' },
    ]},
    { id: 'preferred_contact', key: 'preferred_contact', label: 'Preferred Contact Method', type: 'dropdown', required: false, options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'mail', label: 'Mail' },
    ]},
    { id: 'newsletter_subscribed', key: 'newsletter_subscribed', label: 'Newsletter Subscribed', type: 'checkbox', required: false },
  ],
};

// Default field groups for enrichment settings
export const DEFAULT_ENRICHMENT_FIELD_GROUPS = [
  {
    id: 'enrichment-api',
    label: 'API Settings',
    collapsed: false,
    fields: [
      { id: 'apiKey', key: 'apiKey', label: 'Enrichment API Key', type: 'text', required: true, placeholder: 'Enter your API key', group: 'enrichment-api', order: 0 },
      { id: 'defaultSource', key: 'defaultSource', label: 'Default Source', type: 'dropdown', options: [{ value: 'linkedin', label: 'LinkedIn' }, { value: 'clearbit', label: 'Clearbit' }, { value: 'manual', label: 'Manual' }], required: false, group: 'enrichment-api', order: 1 },
      { id: 'enrichmentLimit', key: 'enrichmentLimit', label: 'Daily Limit', type: 'number', required: false, placeholder: 'e.g., 1000', group: 'enrichment-api', order: 2 },
    ]
  },
  {
    id: 'crm-integration',
    label: 'CRM Integration',
    collapsed: true,
    fields: [
      { id: 'crmMapping', key: 'crmMapping', label: 'CRM Field Mapping', type: 'textarea', placeholder: 'JSON or custom mapping for CRM fields', group: 'crm-integration', order: 0 },
    ]
  }
];

// Default field groups for duplicate detection settings
export const DEFAULT_DUPLICATE_FIELD_GROUPS = [
  {
    id: 'logic-weights',
    label: 'Matching Logic Weights',
    collapsed: false,
    fields: [
      { id: 'weightName', key: 'weightName', label: 'Name Weight (%)', type: 'number', min: 0, max: 100, group: 'logic-weights', order: 0 },
      { id: 'weightEmail', key: 'weightEmail', label: 'Email Weight (%)', type: 'number', min: 0, max: 100, group: 'logic-weights', order: 1 },
      { id: 'weightPhone', key: 'weightPhone', label: 'Phone Weight (%)', type: 'number', min: 0, max: 100, group: 'logic-weights', order: 2 },
      { id: 'weightDomain', key: 'weightDomain', label: 'Domain Weight (%)', type: 'number', min: 0, max: 100, group: 'logic-weights', order: 3 },
    ]
  },
  {
    id: 'automation',
    label: 'Automation & Scheduling',
    collapsed: false,
    fields: [
      { id: 'autoMergeThreshold', key: 'autoMergeThreshold', label: 'Auto-Merge Threshold (%)', type: 'number', min: 80, max: 100, group: 'automation', order: 0 },
      { id: 'scanFrequency', key: 'scanFrequency', label: 'Scan Frequency', type: 'dropdown', options: [{ value: 'manual', label: 'Manual Only' }, { value: 'daily', label: 'Daily (Midnight)' }, { value: 'weekly', label: 'Weekly (Sunday)' }, { value: 'realtime', label: 'Real-time (On Entry)' }], group: 'automation', order: 1 },
      { id: 'notifyOnFound', key: 'notifyOnFound', label: 'Notify on Duplicates Found', type: 'checkbox', group: 'automation', order: 2 }
    ]
  },
  {
    id: 'normalization',
    label: 'Normalization Rules',
    collapsed: true,
    fields: [
      { id: 'ignoreAccents', key: 'ignoreAccents', label: 'Ignore Accents (é -> e)', type: 'checkbox', group: 'normalization', order: 0 },
      { id: 'stripTitles', key: 'stripTitles', label: 'Strip Job Titles (CEO, Manager)', type: 'checkbox', group: 'normalization', order: 1 },
      { id: 'commonDomainExclusion', key: 'commonDomainExclusion', label: 'Exclude Common Domains', type: 'textarea', placeholder: 'gmail.com, outlook.com, yahoo.com', group: 'normalization', order: 2 }
    ]
  }
];
