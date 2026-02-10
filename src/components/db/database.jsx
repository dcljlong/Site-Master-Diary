import PouchDB from 'pouchdb-browser';
import { v4 as uuidv4 } from 'uuid';

// Initialize databases
const jobsDB = new PouchDB('sitemaster_jobs');
const logsDB = new PouchDB('sitemaster_logs');
const tasksDB = new PouchDB('sitemaster_tasks');
const ordersDB = new PouchDB('sitemaster_orders');
const toolsDB = new PouchDB('sitemaster_tools');
const inventoryDB = new PouchDB('sitemaster_inventory');
const crewDB = new PouchDB('sitemaster_crew');
const checklistsDB = new PouchDB('sitemaster_checklists');
const settingsDB = new PouchDB('sitemaster_settings');
const timeEntriesDB = new PouchDB('sitemaster_time_entries');

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Validate required fields
export const validateRequired = (data, requiredFields) => {
  const errors = [];
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(`${field} is required`);
    }
  });
  return errors;
};

// Generic CRUD operations
const createDocument = async (db, data, requiredFields = []) => {
  const errors = validateRequired(data, requiredFields);
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  const doc = {
    _id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const response = await db.put(doc);
  return { ...doc, _rev: response.rev };
};

const updateDocument = async (db, id, data) => {
  const existing = await db.get(id);
  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString()
  };
  const response = await db.put(updated);
  return { ...updated, _rev: response.rev };
};

const deleteDocument = async (db, id) => {
  const doc = await db.get(id);
  return db.remove(doc);
};

const getDocument = async (db, id) => {
  return db.get(id);
};

const getAllDocuments = async (db) => {
  const result = await db.allDocs({ include_docs: true });
  return result.rows.map(row => row.doc).filter(doc => !doc._id.startsWith('_'));
};

const queryDocuments = async (db, filterFn) => {
  const all = await getAllDocuments(db);
  return all.filter(filterFn);
};

// Jobs API
export const JobsAPI = {
  create: (data) => createDocument(jobsDB, data, ['name', 'address']),
  update: (id, data) => updateDocument(jobsDB, id, data),
  delete: (id) => deleteDocument(jobsDB, id),
  get: (id) => getDocument(jobsDB, id),
  getAll: () => getAllDocuments(jobsDB),
  query: (filterFn) => queryDocuments(jobsDB, filterFn)
};

// Daily Logs API
export const LogsAPI = {
  create: (data) => createDocument(logsDB, data, ['jobId', 'date']),
  update: (id, data) => updateDocument(logsDB, id, data),
  delete: (id) => deleteDocument(logsDB, id),
  get: (id) => getDocument(logsDB, id),
  getAll: () => getAllDocuments(logsDB),
  getByJob: (jobId) => queryDocuments(logsDB, doc => doc.jobId === jobId),
  getByDate: (date) => queryDocuments(logsDB, doc => doc.date === date)
};

// Tasks API
export const TasksAPI = {
  create: (data) => createDocument(tasksDB, data, ['title', 'jobId']),
  update: (id, data) => updateDocument(tasksDB, id, data),
  delete: (id) => deleteDocument(tasksDB, id),
  get: (id) => getDocument(tasksDB, id),
  getAll: () => getAllDocuments(tasksDB),
  getByJob: (jobId) => queryDocuments(tasksDB, doc => doc.jobId === jobId),
  getByStatus: (status) => queryDocuments(tasksDB, doc => doc.status === status),
  getByPriority: (priority) => queryDocuments(tasksDB, doc => doc.priority === priority)
};

// Orders API
export const OrdersAPI = {
  create: (data) => createDocument(ordersDB, data, ['item', 'jobId']),
  update: (id, data) => updateDocument(ordersDB, id, data),
  delete: (id) => deleteDocument(ordersDB, id),
  get: (id) => getDocument(ordersDB, id),
  getAll: () => getAllDocuments(ordersDB),
  getByJob: (jobId) => queryDocuments(ordersDB, doc => doc.jobId === jobId),
  getPending: () => queryDocuments(ordersDB, doc => doc.status === 'pending')
};

// Tools API
export const ToolsAPI = {
  create: (data) => createDocument(toolsDB, data, ['name']),
  update: (id, data) => updateDocument(toolsDB, id, data),
  delete: (id) => deleteDocument(toolsDB, id),
  get: (id) => getDocument(toolsDB, id),
  getAll: () => getAllDocuments(toolsDB),
  getByJob: (jobId) => queryDocuments(toolsDB, doc => doc.assignedJobId === jobId)
};

// Inventory API
export const InventoryAPI = {
  create: (data) => createDocument(inventoryDB, data, ['name', 'quantity']),
  update: (id, data) => updateDocument(inventoryDB, id, data),
  delete: (id) => deleteDocument(inventoryDB, id),
  get: (id) => getDocument(inventoryDB, id),
  getAll: () => getAllDocuments(inventoryDB),
  getLowStock: (threshold = 10) => queryDocuments(inventoryDB, doc => doc.quantity <= threshold)
};

// Crew API
export const CrewAPI = {
  create: (data) => createDocument(crewDB, data, ['name']),
  update: (id, data) => updateDocument(crewDB, id, data),
  delete: (id) => deleteDocument(crewDB, id),
  get: (id) => getDocument(crewDB, id),
  getAll: () => getAllDocuments(crewDB)
};

// Checklists API
export const ChecklistsAPI = {
  create: (data) => createDocument(checklistsDB, data, ['name']),
  update: (id, data) => updateDocument(checklistsDB, id, data),
  delete: (id) => deleteDocument(checklistsDB, id),
  get: (id) => getDocument(checklistsDB, id),
  getAll: () => getAllDocuments(checklistsDB)
};

// Settings API
export const SettingsAPI = {
  get: async () => {
    try {
      return await settingsDB.get('app_settings');
    } catch (e) {
      return {
        _id: 'app_settings',
        darkMode: false,
        companyLogo: null,
        companyName: 'SiteMaster Diary',
        panoramicBackground: null
      };
    }
  },
  update: async (data) => {
    try {
      const existing = await settingsDB.get('app_settings');
      const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
      await settingsDB.put(updated);
      return updated;
    } catch (e) {
      const newSettings = {
        _id: 'app_settings',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await settingsDB.put(newSettings);
      return newSettings;
    }
  }
};

// Time Entries API
export const TimeEntriesAPI = {
  create: (data) => createDocument(timeEntriesDB, data, ['jobId', 'date', 'hours']),
  update: (id, data) => updateDocument(timeEntriesDB, id, data),
  delete: (id) => deleteDocument(timeEntriesDB, id),
  get: (id) => getDocument(timeEntriesDB, id),
  getAll: () => getAllDocuments(timeEntriesDB),
  getByJob: (jobId) => queryDocuments(timeEntriesDB, doc => doc.jobId === jobId),
  getByDateRange: (startDate, endDate) => queryDocuments(timeEntriesDB, doc => 
    doc.date >= startDate && doc.date <= endDate
  )
};

// Global Search
export const globalSearch = async (searchTerm) => {
  const term = searchTerm.toLowerCase();
  const results = {
    jobs: [],
    logs: [],
    tasks: [],
    orders: [],
    tools: [],
    inventory: [],
    crew: []
  };

  const jobs = await JobsAPI.getAll();
  results.jobs = jobs.filter(j => 
    j.name?.toLowerCase().includes(term) ||
    j.address?.toLowerCase().includes(term) ||
    j.notes?.toLowerCase().includes(term)
  );

  const logs = await LogsAPI.getAll();
  results.logs = logs.filter(l =>
    l.notes?.toLowerCase().includes(term) ||
    l.weather?.toLowerCase().includes(term) ||
    l.safetyObservations?.toLowerCase().includes(term)
  );

  const tasks = await TasksAPI.getAll();
  results.tasks = tasks.filter(t =>
    t.title?.toLowerCase().includes(term) ||
    t.description?.toLowerCase().includes(term)
  );

  const orders = await OrdersAPI.getAll();
  results.orders = orders.filter(o =>
    o.item?.toLowerCase().includes(term) ||
    o.notes?.toLowerCase().includes(term)
  );

  const tools = await ToolsAPI.getAll();
  results.tools = tools.filter(t =>
    t.name?.toLowerCase().includes(term) ||
    t.serialNumber?.toLowerCase().includes(term)
  );

  const inventory = await InventoryAPI.getAll();
  results.inventory = inventory.filter(i =>
    i.name?.toLowerCase().includes(term) ||
    i.category?.toLowerCase().includes(term)
  );

  const crew = await CrewAPI.getAll();
  results.crew = crew.filter(c =>
    c.name?.toLowerCase().includes(term) ||
    c.role?.toLowerCase().includes(term) ||
    c.phone?.toLowerCase().includes(term)
  );

  return results;
};

// Export all databases for potential CouchDB sync
export const databases = {
  jobs: jobsDB,
  logs: logsDB,
  tasks: tasksDB,
  orders: ordersDB,
  tools: toolsDB,
  inventory: inventoryDB,
  crew: crewDB,
  checklists: checklistsDB,
  settings: settingsDB,
  timeEntries: timeEntriesDB
};

// Sync setup for future CouchDB integration
export const setupSync = (remoteUrl) => {
  Object.entries(databases).forEach(([name, db]) => {
    const remoteDB = new PouchDB(`${remoteUrl}/${name}`);
    db.sync(remoteDB, { live: true, retry: true });
  });
};