// Mock database interacting with localStorage
// Structure:
// - trainers: Trainer[]
// - members: Member[]
// - equipment: Equipment[]
// - memberships: Membership[]
// - bookings: Booking[]
// - gyms: Gym[]
// - gymLeads: GymLead[]
// - gymApplications: GymApplication[]
// - gymInvitations: GymInvitation[]

export const getDb = (collection) => {
  const data = localStorage.getItem(`mockdb_${collection}`);
  return data ? JSON.parse(data) : [];
};

export const saveDb = (collection, data) => {
  localStorage.setItem(`mockdb_${collection}`, JSON.stringify(data));
};

export const addItem = (collection, item) => {
  const items = getDb(collection);
  const newItem = { ...item, id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9) };
  items.push(newItem);
  saveDb(collection, items);
  return newItem;
};

export const updateItem = (collection, id, updates) => {
  const items = getDb(collection);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveDb(collection, items);
    return items[index];
  }
  return null;
};

export const deleteItem = (collection, id) => {
  const items = getDb(collection);
  const filtered = items.filter(item => item.id !== id);
  saveDb(collection, filtered);
};

// Seeder logic for first run
export const seedMockData = () => {
  if (getDb('trainers').length === 0) {
    addItem('trainers', { name: 'John Doe', spec: 'Weight Loss', email: 'john@example.com', status: 'Active' });
  }
  if (getDb('members').length === 0) {
    addItem('members', { name: 'Jane Smith', email: 'jane@example.com', plan: 'Gold', status: 'Active' });
  }
  if (getDb('gymLeads').length === 0) {
    addItem('gymLeads', { gymName: 'Powerhouse Fitness', owner: 'Mike Tyson', email: 'mike@powerhouse.com', phone: '555-1234', location: 'New York', status: 'New' });
  }
  if (getDb('gyms').length === 0) {
    addItem('gyms', { gymName: 'AI Gym Elite', owner: 'Owner', location: 'Austin, TX', admin: 'Admin User', trainersCount: 5, membersCapacity: 500, status: 'Active', onboardedDate: '2025-01-01' });
  }
  if (getDb('subscriptionPlans').length === 0) {
    // Initializer to prevent errors
  }
  if (getDb('gymAdmins').length === 0) {
    // Initializer
  }
  if (getDb('gymOperatingHours').length === 0) {}
  if (getDb('gymSessions').length === 0) {}
};
