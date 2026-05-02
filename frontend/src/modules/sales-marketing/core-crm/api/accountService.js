/**
 * Account Service
 * This layer is decoupled from UI. Currently using mock data.
 * When backend is ready, replace these with real axios/fetch calls.
 */
import { mockAccounts } from '../utils/mockData';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const accountService = {
  getAccounts: async () => {
    await delay(500); // Simulate network latency
    return [...mockAccounts];
  },

  getAccount: async (id) => {
    await delay(300);
    return mockAccounts.find(a => a.id === id);
  },

  createAccount: async (data) => {
    await delay(800);
    return { ...data, id: `acc-${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString() };
  },

  updateAccount: async (id, data) => {
    await delay(500);
    return { ...data, id };
  },

  deleteAccount: async (id) => {
    await delay(500);
    return { success: true };
  }
};
