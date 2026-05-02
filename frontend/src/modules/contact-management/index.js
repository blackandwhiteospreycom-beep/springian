// Contact Management Module — Public API
// Other modules import from here:
//   import { ContactListPage, ContactForm, contactAPI, useContacts } from '../contact-management';

// Pages
export { default as ContactListPage } from './pages/ContactListPage';
export { default as ContactDetailPage } from './pages/ContactDetailPage';

// Components (for reuse by other modules)
export { default as ContactCard } from './components/ContactCard';
export { default as ContactForm } from './components/ContactForm';

// Hooks
export { useContacts, useContact } from './hooks/useContacts';

// API
export { contactAPI, accountAPI } from './api/contactAPI';
