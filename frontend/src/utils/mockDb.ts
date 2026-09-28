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

export const getDb = (collection: string): any[] => {
  const data = localStorage.getItem(`mockdb_${collection}`);
  return data ? JSON.parse(data) : [];
};

export const saveDb = (collection: string, data: any[]) => {
  localStorage.setItem(`mockdb_${collection}`, JSON.stringify(data));
};

export const addItem = (collection: string, item: any) => {
  const items = getDb(collection);
  const newItem = { ...item, id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9) };
  items.push(newItem);
  saveDb(collection, items);
  return newItem;
};

export const updateItem = (collection: string, id: string, updates: any) => {
  const items = getDb(collection);
  const index = items.findIndex((item: any) => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveDb(collection, items);
    return items[index];
  }
  return null;
};

export const deleteItem = (collection: string, id: string) => {
  const items = getDb(collection);
  const filtered = items.filter((item: any) => item.id !== id);
  saveDb(collection, filtered);
};

// Seeder logic for first run
export const seedMockData = () => {
  if (getDb('trainers').length === 0) {
    addItem('trainers', { name: 'Selvakumar', spec: 'Strength & Conditioning', email: 'selvakumar@gmail.com', status: 'Active' });
    addItem('trainers', { name: 'Priya Sharma', spec: 'Yoga & Functional Mobility', email: 'priya.trainer@gmail.com', status: 'Active' });
  }
  if (getDb('members').length === 0) {
    addItem('members', { name: 'Naveen Kumar', email: 'naveenkumar@gmail.com', plan: 'Gold Annual', status: 'Active' });
    addItem('members', { name: 'Ananya Iyer', email: 'ananya@gmail.com', plan: 'Premium', status: 'Active' });
    addItem('members', { name: 'Karthik Raja', email: 'karthik@gmail.com', plan: 'Premium Annual', status: 'Active' });
    addItem('members', { name: 'Sneha Patel', email: 'sneha@gmail.com', plan: 'Basic', status: 'Active' });
    addItem('members', { name: 'Rahul Verma', email: 'rahul@gmail.com', plan: 'Premium', status: 'Active' });
  }
  if (getDb('gymLeads').length === 0) {
    addItem('gymLeads', { gymName: 'PowerFit Gym & Fitness Hub', owner: 'Selva Kumar', email: 'selva@gmail.com', phone: '9876543212', location: 'Anna Nagar, Chennai', status: 'Contacted' });
    addItem('gymLeads', { gymName: 'Titan CrossFit Hub', owner: 'Manoj Kumar', email: 'manoj.k@gmail.com', phone: '9840123456', location: 'T. Nagar, Chennai', status: 'New' });
  }
  if (getDb('gyms').length === 0) {
    addItem('gyms', { gymName: 'PowerFit Gym & Fitness Hub', owner: 'Selva Kumar', location: 'Anna Nagar, Chennai', admin: 'Selva Kumar', trainersCount: 2, membersCapacity: 300, status: 'Active', onboardedDate: '2026-01-15' });
    addItem('gyms', { gymName: 'Gold Fitness Club', owner: 'Ramesh Patel', location: 'R.S. Puram, Coimbatore', admin: 'Ramesh Patel', trainersCount: 3, membersCapacity: 200, status: 'Active', onboardedDate: '2026-02-01' });
  }
  if (getDb('gymApplications').length === 0) {
    addItem('gymApplications', { gymName: 'PowerFit Gym & Fitness Hub', owner: 'Selva Kumar', email: 'selva@gmail.com', status: 'Approved', location: 'Chennai, TN', plan: 'Platinum' });
    addItem('gymApplications', { gymName: 'Gold Fitness Club', owner: 'Ramesh Patel', email: 'ramesh@goldfitness.com', status: 'Approved', location: 'Coimbatore, TN', plan: 'Gold' });
    addItem('gymApplications', { gymName: 'Titan CrossFit', owner: 'Vijay Anand', email: 'vijay@titancrossfit.com', status: 'Pending', location: 'Madurai, TN', plan: 'Silver' });
  }
  if (getDb('bookings').length === 0) {
    addItem('bookings', { member: 'Naveen Kumar', trainer: 'Selvakumar', type: 'Strength Training', status: 'Confirmed', date: '2026-09-29' });
    addItem('bookings', { member: 'Ananya Iyer', trainer: 'Priya Sharma', type: 'Yoga & Mobility', status: 'Pending', date: '2026-09-30' });
  }
};

// Auto seed on load in browser
if (typeof window !== 'undefined') {
  try {
    seedMockData();
  } catch (e) {
    // Ignore storage errors
  }
}

