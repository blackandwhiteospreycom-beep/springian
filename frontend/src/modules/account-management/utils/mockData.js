import { v4 as uuidv4 } from 'uuid';

export const mockAccounts = [
  {
    id: 'acc-1',
    name: 'TechFlow Systems',
    industry: 'Software',
    status: 'Customer',
    website: 'https://techflow.io',
    employee_count: 250,
    annual_revenue: '$12M',
    owner: 'Alex Smith',
    created_at: '2023-01-15T10:00:00Z',
  },
  {
    id: 'acc-2',
    name: 'Global Logistics Corp',
    industry: 'Logistics',
    status: 'Prospect',
    website: 'https://globallogistics.com',
    employee_count: 1200,
    annual_revenue: '$85M',
    owner: 'Sarah Johnson',
    created_at: '2023-05-20T14:30:00Z',
  },
  {
    id: 'acc-3',
    name: 'GreenEnergy Solutions',
    industry: 'Energy',
    status: 'Active',
    website: 'https://greenenergy.net',
    employee_count: 45,
    annual_revenue: '$2.5M',
    owner: 'Michael Chen',
    created_at: '2024-02-10T09:15:00Z',
  }
];

export const mockContacts = [
  {
    id: 'con-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@techflow.io',
    role: 'CTO',
    account_id: 'acc-1',
  },
  {
    id: 'con-2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@techflow.io',
    role: 'Engineering Manager',
    account_id: 'acc-1',
  },
  {
    id: 'con-3',
    first_name: 'Robert',
    last_name: 'Wilson',
    email: 'rwilson@globallogistics.com',
    role: 'Procurement Lead',
    account_id: 'acc-2',
  }
];

export const mockActivities = [
  {
    id: 'act-1',
    type: 'call',
    description: 'Introductory discovery call with TechFlow CTO',
    contact_id: 'con-1',
    account_id: 'acc-1',
    created_at: '2024-03-01T10:00:00Z',
    performer: 'Alex Smith',
  },
  {
    id: 'act-2',
    type: 'email',
    description: 'Follow-up email with pricing proposal',
    contact_id: 'con-1',
    account_id: 'acc-1',
    created_at: '2024-03-02T14:20:00Z',
    performer: 'Alex Smith',
  },
  {
    id: 'act-3',
    type: 'note',
    description: 'Global Logistics is looking for a new ERP partner.',
    contact_id: 'con-3',
    account_id: 'acc-2',
    created_at: '2024-03-05T09:00:00Z',
    performer: 'Sarah Johnson',
  }
];
