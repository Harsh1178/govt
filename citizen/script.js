import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, addDoc, query, where, onSnapshot, doc, updateDoc, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Cloudinary config (replaces Firebase Storage — no plan upgrade needed)
const CLOUDINARY_CLOUD = 'rflmfzx0';
const CLOUDINARY_PRESET = 'ggovt_harsh';

const firebaseConfig = {
  apiKey: 'AIzaSyCHQTHvCkMN5-Z1XjOl3PQ6ItZ4RBWFjzI',
  authDomain: 'govt-8686e.firebaseapp.com',
  projectId: 'govt-8686e',
  storageBucket: 'govt-8686e.firebasestorage.app',
  messagingSenderId: '470046436438',
  appId: '1:470046436438:web:e12b16a5cf6c090d63dff7'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM helper defined at the top
const $ = id => document.getElementById(id);

// Brand coupons configuration
const COUPONS = [
  { brand:'Zomato', icon:'🍕', offer:'₹100 off on ₹199+ order', points:300, color:'#E23744' },
  { brand:'Myntra', icon:'👗', offer:'20% off sitewide', points:400, color:'#FF3F6C' },
  { brand:'Lenskart', icon:'👓', offer:'₹250 off on eyewear', points:500, color:'#00BAC6' },
  { brand:'Bombay Shaving Co.', icon:'🪒', offer:'15% off + free razor', points:350, color:'#2D2D2D' },
  { brand:'Mamaearth', icon:'🌿', offer:'20% off on ₹499+', points:300, color:'#5B8C00' },
  { brand:'boAt', icon:'🎧', offer:'₹500 off on earbuds', points:700, color:'#D62027' },
  { brand:'Airtel', icon:'📡', offer:'1GB free data for 7 days', points:250, color:'#CC0000' }
];

// Rich Demo Complaints Dataset (Shared with official portal)
const DEMO_COMPLAINTS = [
  {
    id: 'demo1', title: 'Pothole on NH-48 near railway overbridge',
    description: 'Large pothole cluster on NH-48 near railway overbridge causing accidents. 3 two-wheelers skidded last week. Urgent repair needed.',
    department: 'Roads Department', status: 'Under review',
    citizenName: 'Ravi Sharma', citizenEmail: 'ravi@demo.in',
    location: { town: 'Patna Junction', city: 'Patna', state: 'Bihar', pincode: '800001', lat: 25.6, lon: 85.1 },
    photoUrl: '', isPublic: true, upvotes: 42, createdAt: { seconds: Math.floor(Date.now()/1000 - 86400) }
  },
  {
    id: 'demo2', title: 'Water supply disrupted — pipeline burst Ward 7',
    description: 'No water supply in Ward 7 for 3 days. Pipeline burst near Shastri Nagar junction. Residents buying tanker water at ₹800/day.',
    department: 'Water Department', status: 'In progress',
    citizenName: 'Priya Patel', citizenEmail: 'priya@demo.in',
    location: { town: 'Naranpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380013', lat: 23.0, lon: 72.5 },
    photoUrl: '', isPublic: true, upvotes: 28, createdAt: { seconds: Math.floor(Date.now()/1000 - 172800) }
  },
  {
    id: 'demo3', title: 'All 12 street lights dead on Nehru Street',
    description: 'All 12 street lights on Nehru Street non-functional for 2 weeks. Incidents of snatching reported after dark. Women feel unsafe.',
    department: 'Electricity Department', status: 'Resolved',
    citizenName: 'Amit Kumar', citizenEmail: 'amit@demo.in',
    location: { town: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', lat: 26.8, lon: 80.9 },
    photoUrl: '', isPublic: true, resolvedAt: new Date(Date.now() - 43200000).toISOString(), resolvedBy: 'Electricity Dept — UP',
    resolvedPhotoUrl: '', upvotes: 56, createdAt: { seconds: Math.floor(Date.now()/1000 - 259200) }
  },
  {
    id: 'demo4', title: 'Garbage piling up — sanitation failure, Ward 14',
    description: 'Municipal waste collection not done for 5 days in Ward 14 colony. Flies and stray animals. Residents filing health complaint.',
    department: 'Sanitation Department', status: 'Under review',
    citizenName: 'Sunita Rao', citizenEmail: 'sunita@demo.in',
    location: { town: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', lat: 17.4, lon: 78.4 },
    photoUrl: '', isPublic: true, upvotes: 19, createdAt: { seconds: Math.floor(Date.now()/1000 - 43200) }
  },
  {
    id: 'demo5', title: 'Drainage overflow flooding 3 streets',
    description: 'Main drainage pipe burst. Sewage water flooding Palarivattom Road, MG Road cross, and Market Lane. Residents cannot step out.',
    department: 'Municipal Corporation', status: 'In progress',
    citizenName: 'Deepak Nair', citizenEmail: 'deepak@demo.in',
    location: { town: 'Palarivattom', city: 'Kochi', state: 'Kerala', pincode: '682025', lat: 9.9, lon: 76.3 },
    photoUrl: '', isPublic: false, upvotes: 14, createdAt: { seconds: Math.floor(Date.now()/1000 - 345600) }
  },
  {
    id: 'demo6', title: 'Government Primary School roof collapsed — 200 students at risk',
    description: 'Section of roof at GPS Block C has collapsed after rains. School still operating. Children sitting under open sky. Urgent repair needed.',
    department: 'Education Department', status: 'Under review',
    citizenName: 'Meena Verma', citizenEmail: 'meena@demo.in',
    location: { town: 'Vaishali Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302021', lat: 26.9, lon: 75.7 },
    photoUrl: '', isPublic: true, upvotes: 84, createdAt: { seconds: Math.floor(Date.now()/1000 - 7200) }
  },
  {
    id: 'demo7', title: 'Potholes on MG Road — accidents daily',
    description: 'Multiple potholes on MG Road stretch from Silk Board to Koramangala. Daily accidents. Ambulance stuck for 40 mins last Tuesday.',
    department: 'Roads Department', status: 'In progress',
    citizenName: 'Kavitha Reddy', citizenEmail: 'kavitha@demo.in',
    location: { town: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', lat: 12.9, lon: 77.6 },
    photoUrl: '', isPublic: true, upvotes: 62, createdAt: { seconds: Math.floor(Date.now()/1000 - 432000) }
  },
  {
    id: 'demo8', title: 'Road repair completed — Sector 15 Main Road',
    description: 'The pothole-ridden Sector 15 Main Road has been fully repaired. Work done in 48 hours after complaint. Excellent response!',
    department: 'Roads Department', status: 'Resolved',
    citizenName: 'Vijay Singh', citizenEmail: 'vijay@demo.in',
    location: { town: 'Sector 15', city: 'Gurugram', state: 'Haryana', pincode: '122001', lat: 28.4, lon: 77.0 },
    photoUrl: '', isPublic: true, resolvedAt: new Date(Date.now() - 86400000).toISOString(), resolvedBy: 'Roads Dept — Haryana PWD',
    resolvedPhotoUrl: '', upvotes: 31, createdAt: { seconds: Math.floor(Date.now()/1000 - 518400) }
  },
  {
    id: 'demo9', title: 'No electricity for 14 hours — transformer blown',
    description: 'Transformer blew at 8am. Entire colony without power. Hospital backup running. Senior citizens suffering in heat. 14 hours and counting.',
    department: 'Electricity Department', status: 'Under review',
    citizenName: 'Ramesh Gupta', citizenEmail: 'ramesh@demo.in',
    location: { town: 'Civil Lines', city: 'Allahabad', state: 'Uttar Pradesh', pincode: '211001', lat: 25.4, lon: 81.8 },
    photoUrl: '', isPublic: true, upvotes: 45, createdAt: { seconds: Math.floor(Date.now()/1000 - 50400) }
  },
  {
    id: 'demo10', title: 'Open manhole on Highway — 2 accidents',
    description: 'Open manhole on NH-7 near Toll Plaza 3. Two motorbikes fell in last night. No warning signs or barriers placed. Life-threatening.',
    department: 'Roads Department', status: 'In progress',
    citizenName: 'Arjun Mehta', citizenEmail: 'arjun@demo.in',
    location: { town: 'Nagpur Bypass', city: 'Nagpur', state: 'Maharashtra', pincode: '440001', lat: 21.1, lon: 79.0 },
    photoUrl: '', isPublic: true, upvotes: 39, createdAt: { seconds: Math.floor(Date.now()/1000 - 21600) }
  },
  {
    id: 'demo11', title: 'Water pipeline installed successfully — Sector 8',
    description: 'New water pipeline successfully installed in Sector 8 after 3 months of complaints. Water now available 24/7. Thank you JanConnect!',
    department: 'Water Department', status: 'Resolved',
    citizenName: 'Lakshmi Iyer', citizenEmail: 'lakshmi@demo.in',
    location: { town: 'Sector 8', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', lat: 13.0, lon: 80.2 },
    photoUrl: '', isPublic: true, resolvedAt: new Date(Date.now() - 172800000).toISOString(), resolvedBy: 'Water Board — Tamil Nadu',
    resolvedPhotoUrl: '', upvotes: 77, createdAt: { seconds: Math.floor(Date.now()/1000 - 604800) }
  },
  {
    id: 'demo12', title: 'Public park completely flooded after rain',
    description: 'Nehru Park fully waterlogged since last week rains. Drainage choked. Children cannot use play area. Mosquito breeding ground forming.',
    department: 'Municipal Corporation', status: 'Under review',
    citizenName: 'Pooja Agarwal', citizenEmail: 'pooja@demo.in',
    location: { town: 'Rajouri Garden', city: 'Delhi', state: 'Delhi', pincode: '110027', lat: 28.6, lon: 77.1 },
    photoUrl: '', isPublic: true, upvotes: 23, createdAt: { seconds: Math.floor(Date.now()/1000 - 14400) }
  },
  {
    id: 'demo13', title: 'Primary Health Centre lacks basic medicines and anti-rabies vaccine',
    description: 'Government PHC at Block B has had zero stock of anti-rabies and tetanus injections for 3 weeks. Patients forced to go to private clinics.',
    department: 'Health Department', status: 'Under review',
    citizenName: 'Dr. Vivek Saxena', citizenEmail: 'vivek@demo.in',
    location: { town: 'Muzaffarpur Rural', city: 'Muzaffarpur', state: 'Bihar', pincode: '842001', lat: 26.1, lon: 85.3 },
    photoUrl: '', isPublic: true, upvotes: 41, createdAt: { seconds: Math.floor(Date.now()/1000 - 32000) }
  },
  {
    id: 'demo14', title: 'Government ambulance service non-responsive in emergency ward',
    description: '108 Ambulance helpline took 90 minutes to dispatch an ambulance for accident victims. Staff reported fuel shortage.',
    department: 'Health Department', status: 'In progress',
    citizenName: 'Sneha Deshmukh', citizenEmail: 'sneha@demo.in',
    location: { town: 'Kalyan West', city: 'Thane', state: 'Maharashtra', pincode: '421301', lat: 19.2, lon: 73.1 },
    photoUrl: '', isPublic: true, upvotes: 38, createdAt: { seconds: Math.floor(Date.now()/1000 - 64000) }
  },
  {
    id: 'demo15', title: 'Dengue prevention fogging and medical camp conducted',
    description: 'Comprehensive mosquito fogging completed across 8 sectors. Free dengue diagnostic camp set up at local community centre.',
    department: 'Health Department', status: 'Resolved',
    citizenName: 'Kunal Kapoor', citizenEmail: 'kunal@demo.in',
    location: { town: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201309', lat: 28.6, lon: 77.3 },
    photoUrl: '', isPublic: true, resolvedAt: new Date(Date.now() - 90000000).toISOString(), resolvedBy: 'District Chief Medical Officer',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80', upvotes: 65, createdAt: { seconds: Math.floor(Date.now()/1000 - 450000) }
  },
  {
    id: 'demo16', title: 'Government Hospital boundary wall collapsed onto footpath',
    description: '50-meter section of District Hospital boundary wall collapsed during storm. Rubble blocking pedestrian footpath and exposing premises.',
    department: 'Public Works Department', status: 'Under review',
    citizenName: 'Alok Mishra', citizenEmail: 'alok@demo.in',
    location: { town: 'Cantt', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221002', lat: 25.3, lon: 82.9 },
    photoUrl: '', isPublic: true, upvotes: 29, createdAt: { seconds: Math.floor(Date.now()/1000 - 41000) }
  },
  {
    id: 'demo17', title: 'Community hall roof leakage during monsoon rains',
    description: 'Municipal Community Centre roof has massive cracks. Water pouring into the main auditorium during public vaccination drives.',
    department: 'Public Works Department', status: 'In progress',
    citizenName: 'Bhavna Sen', citizenEmail: 'bhavna@demo.in',
    location: { town: 'Arera Colony', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462016', lat: 23.2, lon: 77.4 },
    photoUrl: '', isPublic: true, upvotes: 35, createdAt: { seconds: Math.floor(Date.now()/1000 - 92000) }
  },
  {
    id: 'demo18', title: 'Pedestrian subway lighting and wall tiling completed',
    description: 'Underpass on Ring Road fully renovated with 24/7 CCTV surveillance, bright anti-glare LED illumination, and anti-slip ramps.',
    department: 'Public Works Department', status: 'Resolved',
    citizenName: 'Tanya Grover', citizenEmail: 'tanya@demo.in',
    location: { town: 'Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001', lat: 28.6, lon: 77.2 },
    photoUrl: '', isPublic: true, resolvedAt: new Date(Date.now() - 130000000).toISOString(), resolvedBy: 'Delhi PWD Electrical & Civil Division',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80', upvotes: 72, createdAt: { seconds: Math.floor(Date.now()/1000 - 520000) }
  },
  {
    id: 'demo19', title: 'Traffic signals dysfunctional at busy 4-way intersection',
    description: 'Signals blinking amber for 4 days at 100 Feet Road junction. Heavy traffic gridlocks and 2 near-fatal collisions reported.',
    department: 'Traffic Police', status: 'Under review',
    citizenName: 'Girish Murthy', citizenEmail: 'girish@demo.in',
    location: { town: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', lat: 12.9, lon: 77.6 },
    photoUrl: '', isPublic: true, upvotes: 51, createdAt: { seconds: Math.floor(Date.now()/1000 - 19000) }
  },
  {
    id: 'demo20', title: 'Illegal commercial parking blocking emergency fire tender lane',
    description: 'Commercial shop owners and valet drivers illegally double parking across marked fire emergency lane outside shopping plaza.',
    department: 'Traffic Police', status: 'In progress',
    citizenName: 'Farhan Merchant', citizenEmail: 'farhan@demo.in',
    location: { town: 'Dadar West', city: 'Mumbai', state: 'Maharashtra', pincode: '400028', lat: 19.0, lon: 72.8 },
    photoUrl: '', isPublic: true, upvotes: 44, createdAt: { seconds: Math.floor(Date.now()/1000 - 48000) }
  },
  {
    id: 'demo21', title: 'Speed breakers and zebra crossing marked near school zone',
    description: 'Installed 2 scientific rubber speed breakers and thermoplastic reflective zebra crossing markings with warning signage.',
    department: 'Traffic Police', status: 'Resolved',
    citizenName: 'Neelam Chawla', citizenEmail: 'neelam@demo.in',
    location: { town: 'Sector 14', city: 'Gurugram', state: 'Haryana', pincode: '122001', lat: 28.4, lon: 77.0 },
    photoUrl: '', isPublic: true, resolvedAt: new Date(Date.now() - 95000000).toISOString(), resolvedBy: 'Traffic Police Engineering Cell',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80', upvotes: 58, createdAt: { seconds: Math.floor(Date.now()/1000 - 290000) }
  },
  {
    id: 'demo22', title: 'Encroachment of storm water layout in residential colony',
    description: 'Private developers constructing illegal boundary wall directly across municipal storm water drainage easement in New Colony.',
    department: 'Urban Development Department', status: 'Under review',
    citizenName: 'Sanjay Oraon', citizenEmail: 'sanjay@demo.in',
    location: { town: 'Morabadi', city: 'Ranchi', state: 'Jharkhand', pincode: '834008', lat: 23.3, lon: 85.3 },
    photoUrl: '', isPublic: true, upvotes: 33, createdAt: { seconds: Math.floor(Date.now()/1000 - 24000) }
  },
  {
    id: 'demo23', title: 'Delay in layout regularisation approvals for 6 months',
    description: 'Layout regularisation files pending despite all fee receipts submitted and on-site town planning inspection completed.',
    department: 'Urban Development Department', status: 'In progress',
    citizenName: 'Prakash Kulkarni', citizenEmail: 'prakash@demo.in',
    location: { town: 'Baner', city: 'Pune', state: 'Maharashtra', pincode: '411045', lat: 18.5, lon: 73.7 },
    photoUrl: '', isPublic: true, upvotes: 27, createdAt: { seconds: Math.floor(Date.now()/1000 - 80000) }
  },
  {
    id: 'demo24', title: 'Gram Panchayat borewell pump dysfunctional for 2 weeks',
    description: 'Solar submersible pump at Gram Panchayat water kiosk has burnt wiring. 220 rural households walking 3km for drinking water.',
    department: 'Rural Development Department', status: 'Under review',
    citizenName: 'Ramprasad Yadav', citizenEmail: 'ramprasad@demo.in',
    location: { town: 'Ujiarpur', city: 'Samastipur', state: 'Bihar', pincode: '848132', lat: 25.8, lon: 85.7 },
    photoUrl: '', isPublic: true, upvotes: 49, createdAt: { seconds: Math.floor(Date.now()/1000 - 38000) }
  },
  {
    id: 'demo25', title: 'Kisan community storage shed construction stalled',
    description: 'Grain storage shed funded under PMGSY stalled for 4 months due to lack of cement supply. Harvest grains at risk of monsoon rot.',
    department: 'Rural Development Department', status: 'In progress',
    citizenName: 'Babulal Meena', citizenEmail: 'babulal@demo.in',
    location: { town: 'Tijara', city: 'Alwar', state: 'Rajasthan', pincode: '301411', lat: 27.9, lon: 76.8 },
    photoUrl: '', isPublic: true, upvotes: 36, createdAt: { seconds: Math.floor(Date.now()/1000 - 70000) }
  },
  {
    id: 'demo26', title: 'Delay in issuing income & domicile certificates at Tehsil office',
    description: 'Online e-District applications pending over 45 days. Students cannot complete polytechnic admission counseling without certificate.',
    department: 'District Administration', status: 'Under review',
    citizenName: 'Mohd. Salim', citizenEmail: 'salim@demo.in',
    location: { town: 'Civil Lines', city: 'Meerut', state: 'Uttar Pradesh', pincode: '250001', lat: 28.9, lon: 77.7 },
    photoUrl: '', isPublic: true, upvotes: 52, createdAt: { seconds: Math.floor(Date.now()/1000 - 16000) }
  },
  {
    id: 'demo27', title: 'Ration card biometric iris scanner offline for 10 days',
    description: 'PDS ration dealer unable to disburse subsidized food grains because biometric scanner device has corrupted firmware.',
    department: 'District Administration', status: 'In progress',
    citizenName: 'Kamla Devi', citizenEmail: 'kamla@demo.in',
    location: { town: 'Bodh Gaya', city: 'Gaya', state: 'Bihar', pincode: '824231', lat: 24.7, lon: 84.9 },
    photoUrl: '', isPublic: true, upvotes: 61, createdAt: { seconds: Math.floor(Date.now()/1000 - 60000) }
  }
];

const DEMO_POSTS = DEMO_COMPLAINTS.filter(c => c.isPublic);

// State variables
let currentUser = null;
let userData = null;
let userPoints = 1280;
let complaints = [];
let myPostsData = [];
let feedPostsData = [];
let currentFeedFilter = 'all'; // 'all', 'nearby', 'top'
let stream = null;
let photo = null;

const defaultTags = [
  "Municipal Corporation", "Water Department", "Electricity Department",
  "Roads Department", "Public Works Department", "Health Department",
  "Sanitation Department", "Traffic Police", "District Administration",
  "Urban Development Department", "Rural Development Department", "Education Department"
];
let tags = [...defaultTags];

fetch("list.txt")
  .then(r => r.ok ? r.text() : "")
  .then(text => {
    const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
    if (lines.length) tags = lines;
  }).catch(() => {});

// Utility functions
function formatDate(ts) {
  if (!ts) return 'Just now';
  if (typeof ts === 'string') return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatLocation(loc) {
  if (!loc) return '';
  return [loc.town, loc.city, loc.state].filter(Boolean).join(", ");
}

function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

function setStatus(msg, type = "") {
  const el = $("status");
  if (!el) return;
  el.textContent = msg;
  el.className = "status-indicator" + (type ? ` ${type}` : "");
}

// Navigation between views
function nav(view) {
  document.querySelectorAll(".view").forEach(x => x.classList.remove("active"));
  const target = $(view);
  if (target) target.classList.add("active");

  document.querySelectorAll("[data-view]").forEach(x => {
    x.classList.toggle("active", x.dataset.view === view);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (view === 'profile') renderProfileView();
  else if (view === 'explore') renderFeed();
  else if (view === 'mine') renderComplaints();
  else if (view === 'myposts') renderMyPosts();
  else if (view === 'rewards') renderCoupons();
}

// User display updates
function updateUserDisplay(data) {
  const name = data.name || 'Citizen User';
  const initial = name.charAt(0).toUpperCase();
  if ($('userNameDisplay')) $('userNameDisplay').innerHTML = `${name}<br><small>Citizen</small>`;
  if ($('userInitial')) $('userInitial').textContent = initial;
  if ($('profileName')) $('profileName').textContent = name;
  if ($('profileInitial')) $('profileInitial').textContent = initial;
  if ($('profileEmail')) $('profileEmail').textContent = data.email || 'Citizen Account';
  if ($('welcomeHeading')) $('welcomeHeading').textContent = `Welcome, ${name} 👋`;
}

// Render Profile View with all requested fields: Name, phone, email, raised complaints, address, rewards
function renderProfileView() {
  const d = userData || {};
  const el = id => document.getElementById(id);

  if (el('pf-header-name')) el('pf-header-name').textContent = d.name || 'Citizen User';
  if (el('pf-name')) el('pf-name').textContent = d.name || '—';
  if (el('pf-email')) el('pf-email').textContent = d.email || '—';
  if (el('pf-phone')) el('pf-phone').textContent = d.phone || '+91 98765 43210';
  if (el('pf-address')) el('pf-address').textContent = d.address || 'Civil Lines, Ward 12, New Delhi';
  if (el('profileAvatarLg')) el('profileAvatarLg').textContent = (d.name || 'U').charAt(0).toUpperCase();

  // Populate edit form values
  if (el('editName')) el('editName').value = d.name || '';
  if (el('editEmail')) el('editEmail').value = d.email || '';
  if (el('editPhone')) el('editPhone').value = d.phone || '+91 98765 43210';
  if (el('editAddress')) el('editAddress').value = d.address || 'Civil Lines, Ward 12, New Delhi';

  // Deduplicated complaints calculation
  const allMap = new Map();
  (window._myComplaints || complaints || []).forEach(c => allMap.set(c.id, c));
  DEMO_COMPLAINTS.forEach(c => { if (!allMap.has(c.id)) allMap.set(c.id, c); });
  const allC = Array.from(allMap.values());

  const raised = allC.length;
  const resolved = allC.filter(c => c.status === 'Resolved').length;
  const inProgress = allC.filter(c => c.status === 'In progress').length;
  const active = allC.filter(c => c.status !== 'Resolved').length;

  if (el('pf-raised')) el('pf-raised').textContent = raised;
  if (el('pf-resolved')) el('pf-resolved').textContent = resolved;
  if (el('pf-active')) el('pf-active').textContent = active;
  if (el('pf-points')) el('pf-points').textContent = (userPoints || 1280).toLocaleString('en-IN');

  // Mini raised complaints list inside profile view
  const compListEl = el('pf-complaints-list');
  if (compListEl) {
    compListEl.innerHTML = allC.slice(0, 5).map(c => `
      <div class="pf-complaint-mini">
        <div>
          <h4>${c.title}</h4>
          <small>#${c.department} • 📍 ${formatLocation(c.location) || 'Location specified'} • ${formatDate(c.createdAt)}</small>
        </div>
        <span class="status-pill ${c.status === 'Resolved' ? 'resolved' : c.status === 'In progress' ? 'progress' : 'review'}">${c.status}</span>
      </div>
    `).join('');
  }

  // Rewards list inside profile view
  const rewEl = el('pf-rewards-list');
  if (rewEl) {
    const redeemed = JSON.parse(sessionStorage.getItem('janconnect_redeemed') || '{}');
    const pills = Object.keys(redeemed);
    if (pills.length) {
      rewEl.innerHTML = pills.map(b => `<span class="pf-reward-pill">🎁 ${b} Coupon Claimed ✓</span>`).join('');
    } else {
      rewEl.innerHTML = '<span style="color:#64748b;font-size:11px;">1,280 points ready to redeem. Claim brand coupons in Rewards tab!</span>';
    }
  }
}

// Summary statistics counters for sidebar and tracker
function updateSummaryCounters() {
  const allMap = new Map();
  (window._myComplaints || complaints || []).forEach(c => allMap.set(c.id, c));
  DEMO_COMPLAINTS.forEach(c => { if (!allMap.has(c.id)) allMap.set(c.id, c); });
  const allC = Array.from(allMap.values());

  const resolved = allC.filter(c => c.status === "Resolved").length;
  const inProgress = allC.filter(c => c.status === "In progress").length;
  const underReview = allC.filter(c => c.status === "Under review" || c.status === "New").length;
  const total = allC.length;
  const active = inProgress + underReview;

  if ($("statTotal")) $("statTotal").textContent = total;
  if ($("statResolved")) $("statResolved").textContent = resolved;
  if ($("statActive")) $("statActive").textContent = active;
  if ($("sideBadge")) $("sideBadge").textContent = active;

  if ($("sumTotal")) $("sumTotal").textContent = total;
  if ($("sumResolved")) $("sumResolved").textContent = resolved;
  if ($("sumProgress")) $("sumProgress").textContent = inProgress;
  if ($("sumReview")) $("sumReview").textContent = underReview;
}

// Update reward points display
function updatePointsDisplay() {
  if ($("points")) $("points").textContent = userPoints.toLocaleString("en-IN");
  if ($("rpoints")) $("rpoints").textContent = userPoints.toLocaleString("en-IN");
  if (userData) {
    userData.points = userPoints;
    sessionStorage.setItem('janconnect_user', JSON.stringify(userData));
  }
}

// Render Community Feed
function renderFeed() {
  const feedEl = $("feed");
  if (!feedEl) return;

  const searchInput = $("cityFilterInput") ? $("cityFilterInput").value.trim().toLowerCase() : "";

  let list = [...feedPostsData];

  // Apply icon filters
  if (currentFeedFilter === 'nearby') {
    list = list.filter(p => {
      const loc = formatLocation(p.location).toLowerCase();
      return loc.includes("delhi") || loc.includes("patna") || loc.includes("lucknow") || loc.includes("ahmedabad") || loc.includes("bengaluru");
    });
  } else if (currentFeedFilter === 'top') {
    list = [...list].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  }

  // Apply search/city filter
  if (searchInput) {
    list = list.filter(p => {
      const locStr = formatLocation(p.location).toLowerCase();
      const titleStr = (p.title || "").toLowerCase();
      const deptStr = (p.department || "").toLowerCase();
      return locStr.includes(searchInput) || titleStr.includes(searchInput) || deptStr.includes(searchInput);
    });
  }

  if (!list.length) {
    feedEl.innerHTML = `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:30px;text-align:center;color:#64748b;">
      <p style="font-size:14px;font-weight:700;margin-bottom:6px;">No posts match your filter</p>
      <small>Try clearing the search filter or switching to ⭐ All posts.</small>
    </div>`;
    return;
  }

  feedEl.innerHTML = list.map(p => {
    const isUpvoted = sessionStorage.getItem(`upvoted_${p.id}`) === 'true';
    return `
      <article class="post" id="post-${p.id}">
        <div class="posthead">
          <div class="postav">${(p.citizenName || 'U').charAt(0)}</div>
          <div class="postuser"><strong>${p.citizenName || 'Citizen'}</strong><small>${formatDate(p.createdAt)} • 📍 ${formatLocation(p.location) || 'India'}</small></div>
          <span class="tag">#${p.department}</span>
        </div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="images">
          ${p.photoUrl ? `<img src="${p.photoUrl}" alt="Evidence">` : ""}
          ${p.resolvedPhotoUrl ? `<img src="${p.resolvedPhotoUrl}" alt="Resolved state">` : ""}
        </div>
        <div class="actions">
          <button class="up ${isUpvoted ? 'active' : ''}" data-post-id="${p.id}">▲ <span>${(p.upvotes || 12) + (isUpvoted ? 1 : 0)}</span> Upvote</button>
          <button class="commentbtn" data-post-id="${p.id}">💬 Comments</button>
          <button class="sharebtn" data-title="${encodeURIComponent(p.title)}">↗ Share</button>
        </div>
        <div class="post-comment-box hidden" id="comment-box-${p.id}">
          <input type="text" class="post-comment-input" placeholder="Write a supportive comment or update..." id="comment-input-${p.id}">
          <button class="post-comment-send" data-post-id="${p.id}">Post</button>
        </div>
      </article>
    `;
  }).join("");

  // Attach post interaction listeners
  feedEl.querySelectorAll('.up').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.postId;
      const key = `upvoted_${pid}`;
      const currentlyUpvoted = sessionStorage.getItem(key) === 'true';
      sessionStorage.setItem(key, (!currentlyUpvoted).toString());
      toast(currentlyUpvoted ? 'Upvote removed' : '✓ Upvoted this issue!');
      renderFeed();
    };
  });

  feedEl.querySelectorAll('.commentbtn').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.postId;
      const box = $(`comment-box-${pid}`);
      if (box) box.classList.toggle('hidden');
    };
  });

  feedEl.querySelectorAll('.post-comment-send').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.dataset.postId;
      const inp = $(`comment-input-${pid}`);
      if (inp && inp.value.trim()) {
        toast('Comment added to discussion!');
        inp.value = '';
        const box = $(`comment-box-${pid}`);
        if (box) box.classList.add('hidden');
      }
    };
  });

  feedEl.querySelectorAll('.sharebtn').forEach(btn => {
    btn.onclick = () => {
      const title = decodeURIComponent(btn.dataset.title || 'Civic Issue');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${title} - View on JanConnect http://localhost:3001`).then(() => {
          toast('✓ Link copied to clipboard!');
        }).catch(() => {
          toast('✓ Shared!');
        });
      } else {
        toast('✓ Shared!');
      }
    };
  });
}

// Render My Posts
function renderMyPosts() {
  const listEl = $("myPostsList");
  if (!listEl) return;

  if (myPostsData.length === 0) {
    listEl.innerHTML = `<div style="padding:40px; text-align:center; color:#64748b; background:#fff; border-radius:14px; border:1px solid #e2e8f0;">
      <h3 style="margin:0 0 6px;color:#1e293b;">No community posts yet</h3>
      <p style="margin:0;font-size:12px;">You haven't posted any complaints to the public community feed yet.</p>
    </div>`;
    return;
  }

  listEl.innerHTML = myPostsData.map(c => renderComplaintCard(c, false)).join("");
}

// Render Complaints List
function renderComplaints() {
  const listEl = $("complaints");
  if (!listEl) return;
  listEl.innerHTML = complaints.map(c => renderComplaintCard(c, true)).join("");

  // Attach post-to-community listeners
  document.querySelectorAll('.post-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const cid = btn.dataset.id;
      if (btn.classList.contains('posted')) return;

      const targetComp = complaints.find(c => c.id === cid);
      if (targetComp) targetComp.isPublic = true;

      // Add to feed if not already present
      if (targetComp && !feedPostsData.find(p => p.id === cid)) {
        feedPostsData.unshift(targetComp);
      }
      if (targetComp && !myPostsData.find(p => p.id === cid)) {
        myPostsData.unshift(targetComp);
      }

      btn.classList.add('posted');
      btn.textContent = 'Posted ✓';
      toast('✓ Complaint published to public community feed!');

      try {
        await updateDoc(doc(db, 'complaints', cid), { isPublic: true });
      } catch (err) {
        console.warn("Firestore update skipped (local demo updated):", err.message);
      }
    };
  });
}

function renderComplaintCard(c, showPostBtn) {
  const addressFormatted = formatLocation(c.location);
  const isResolved = c.status === "Resolved";
  const postBtnHtml = showPostBtn ? `<button class="post-btn ${c.isPublic?'posted':''}" data-id="${c.id}">${c.isPublic?'Posted ✓':'📢 Post to Community'}</button>` : '';

  return `
    <article class="complaint">
      ${postBtnHtml}
      <div class="cmain">
        <div class="chead">
          <div style="padding-right: 90px;">
            <h3>${c.title}</h3>
            <div class="meta">
              <span>Ticket #${c.id.substring(0, 8)}</span>
              <span>${formatDate(c.createdAt)}</span>
              <span>#${c.department}</span>
              ${addressFormatted ? `<span>📍 ${addressFormatted}</span>` : ""}
            </div>
          </div>
          <span class="status ${isResolved ? "resolved" : c.status === "In progress" ? "progress" : "review"}">${c.status}</span>
        </div>
        <div class="timeline">
          <div class="tl">
            <i class="dot"></i>
            <div>
              <strong>Department: ${c.department}</strong>
              <small>Responsible official: ${c.resolvedBy || 'Assigned to Executive Officer'}</small>
            </div>
          </div>
          <div class="tl">
            <i class="dot"></i>
            <div>
              <strong>${isResolved ? "Complaint resolved and verified" : "Action in progress (Status: " + c.status + ")"}</strong>
              <small>${isResolved ? "Resolution completed on " + formatDate(c.resolvedAt) + "." : "Official response initiated. Active ticket on department board."}</small>
            </div>
          </div>
          ${c.photoUrl ? `
            <div class="resolution">
              <img src="${c.photoUrl}" alt="Complaint evidence">
              ${c.resolvedPhotoUrl ? `<img src="${c.resolvedPhotoUrl}" alt="Resolved state">` : ""}
            </div>
          ` : ""}
        </div>
      </div>
    </article>
  `;
}

// Coupons rendering
function renderCoupons() {
  const g = $("couponsGrid");
  if (!g) return;

  const redeemed = JSON.parse(sessionStorage.getItem('janconnect_redeemed') || '{}');

  g.innerHTML = COUPONS.map((c, i) => {
    const isRedeemed = redeemed[c.brand];
    const canAfford = userPoints >= c.points;
    let btnHtml = '';

    if (isRedeemed) {
      btnHtml = `<button class="redeem-btn redeemed" disabled>Already Redeemed ✓</button>`;
    } else if (canAfford) {
      btnHtml = `<button class="redeem-btn" onclick="redeemCoupon(${i})">Redeem Now</button>`;
    } else {
      btnHtml = `<button class="redeem-btn" disabled>Need ${c.points - userPoints} more pts</button>`;
    }

    return `
      <div class="coupon-card">
        <div class="coupon-brand" style="color: ${c.color}">${c.icon} ${c.brand}</div>
        <div class="coupon-offer">${c.offer}</div>
        <div class="coupon-pts">⭐ ${c.points} pts</div>
        ${btnHtml}
      </div>
    `;
  }).join('');
}

window.redeemCoupon = function(index) {
  const c = COUPONS[index];
  if (userPoints >= c.points) {
    userPoints -= c.points;
    updatePointsDisplay();

    const redeemed = JSON.parse(sessionStorage.getItem('janconnect_redeemed') || '{}');
    redeemed[c.brand] = true;
    sessionStorage.setItem('janconnect_redeemed', JSON.stringify(redeemed));

    renderCoupons();
    renderProfileView();

    const code = c.brand.toUpperCase().replace(/\s/g, '') + Math.random().toString(36).substring(2, 8).toUpperCase();
    if ($('couponCode')) $('couponCode').textContent = code;
    if ($('couponModal')) $('couponModal').classList.remove('hidden');

    try {
      updateDoc(doc(db, 'users', currentUser.uid), { points: userPoints });
    } catch (e) {}
  }
};

// Modal open/close controls
function openModal() {
  const m = $("modal");
  if (m) {
    m.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      const textEl = $("text");
      if (textEl) textEl.focus();
    }, 50);
  }
}

function closeModal() {
  const m = $("modal");
  if (m) m.classList.add("hidden");
  document.body.style.overflow = "";
  stopCamera();
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  const video = $("video");
  if (video) video.srcObject = null;
  const panel = $("cameraPanel");
  if (panel) panel.classList.add("hidden");
}

function resetComplaintForm() {
  if ($("form")) $("form").reset();
  if ($("count")) $("count").textContent = "0 / 800";
  photo = null;
  if ($("image")) $("image").value = "";
  if ($("preview")) $("preview").classList.add("hidden");
  if ($("lat")) $("lat").textContent = "—";
  if ($("lon")) $("lon").textContent = "—";
  if ($("latitude")) $("latitude").value = "";
  if ($("longitude")) $("longitude").value = "";
  setStatus("");
  hideSuggestions();
  hideGhostSuggestion();
  stopCamera();
}

function hideSuggestions() {
  const suggestionsEl = $("suggestions");
  if (suggestionsEl) {
    suggestionsEl.classList.add("hidden");
    suggestionsEl.innerHTML = "";
  }
}

function handleMentionInput() {
  const textEl = $("text");
  const suggestionsEl = $("suggestions");
  if (!textEl || !suggestionsEl) return;

  const textBeforeCursor = textEl.value.slice(0, textEl.selectionStart);
  const match = textBeforeCursor.match(/@([a-zA-Z0-9 _-]*)$/);

  if (!match) {
    hideSuggestions();
    return;
  }

  const queryTxt = match[1].trim().toLowerCase();
  let matches = tags.filter(t => !queryTxt || t.toLowerCase().includes(queryTxt));

  // Prioritize AI-suggested departments at top of list
  const aiList = (window._llmSuggestions || []).map(d => d.toLowerCase());
  matches.sort((a, b) => {
    const aIsAi = aiList.includes(a.toLowerCase());
    const bIsAi = aiList.includes(b.toLowerCase());
    if (aIsAi && !bIsAi) return -1;
    if (!aIsAi && bIsAi) return 1;
    return 0;
  });
  matches = matches.slice(0, 8);

  if (!matches.length) {
    hideSuggestions();
    return;
  }

  suggestionsEl.innerHTML = "";
  matches.forEach(name => {
    const isAi = aiList.includes(name.toLowerCase());
    const badgeText = isAi ? "✨ AI Recommended" : "Official Dept";
    const badgeClass = isAi ? "suggestion-badge ai-badge" : "suggestion-badge";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "suggestion-btn";
    btn.innerHTML = `<span><strong>@</strong>${name}</span><span class="${badgeClass}">${badgeText}</span>`;
    btn.onclick = () => {
      const caret = textEl.selectionStart;
      const before = textEl.value.slice(0, caret);
      const after = textEl.value.slice(caret);
      const tagStart = before.length - match[0].length;
      textEl.value = (before.slice(0, tagStart) + "@" + name + " " + after).replace(/@@+/g, '@');
      hideSuggestions();
      hideGhostSuggestion();
      textEl.focus();
      const newPos = tagStart + name.length + 2;
      textEl.setSelectionRange(newPos, newPos);
      if ($("count")) $("count").textContent = `${textEl.value.length} / 800`;
    };
    suggestionsEl.appendChild(btn);
  });

  suggestionsEl.classList.remove("hidden");
}

function fetchLocation() {
  if (!navigator.geolocation) {
    setStatus("Geolocation is not supported by your browser.", "error");
    return;
  }

  setStatus("Requesting GPS coordinates…", "loading");
  navigator.geolocation.getCurrentPosition(
    async pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = Math.round(pos.coords.accuracy);

      if ($("latitude")) $("latitude").value = lat;
      if ($("longitude")) $("longitude").value = lon;
      if ($("lat")) $("lat").textContent = lat.toFixed(5);
      if ($("lon")) $("lon").textContent = lon.toFixed(5);

      setStatus(`Coordinates found (±${accuracy}m). Looking up address…`, "loading");

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1`);
        if (res.ok) {
          const raw = await res.json();
          const a = raw.address || {};
          const town = a.town || a.suburb || a.village || a.neighbourhood || a.municipality || "";
          const city = a.city || a.city_district || a.county || "";
          const state = a.state || "";
          const pincode = a.postcode || "";

          if ($("town") && town) $("town").value = town;
          if ($("city") && city) $("city").value = city;
          if ($("state") && state) $("state").value = state;
          if ($("pincode") && pincode) $("pincode").value = pincode;

          const locSummary = [town, city].filter(Boolean).join(", ");
          setStatus(`✓ Location detected: ${locSummary || "Address found"}`, "success");
          return;
        }
      } catch (e) {
        console.warn("Client-side geocoding failed or offline:", e);
      }

      setStatus("Coordinates captured. You can edit address fields.", "success");
    },
    err => {
      setStatus(err.code === 1 ? "Location permission denied. You can fill address manually." : "Could not retrieve GPS location.", "error");
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
}

// Real-time Firestore loaders with seamless demo data merging
function loadMyComplaints(uid) {
  try {
    const q = query(collection(db, 'complaints'), where('citizenUid', '==', uid), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      let live = [];
      snapshot.forEach((doc) => live.push({ id: doc.id, ...doc.data() }));

      const mergedMap = new Map();
      live.forEach(c => mergedMap.set(c.id, c));
      DEMO_COMPLAINTS.forEach(demo => {
        if (!mergedMap.has(demo.id)) mergedMap.set(demo.id, { ...demo, citizenUid: uid });
      });

      // Merge citizen-submitted shared complaints
      try {
        const shared = JSON.parse(localStorage.getItem('janconnect_shared_complaints') || '[]');
        shared.forEach(c => { if (c.citizenUid === uid || !c.citizenUid) mergedMap.set(c.id, c); });
      } catch(e) {}

      // Apply resolution records if marked resolved by official
      try {
        const records = JSON.parse(localStorage.getItem('janconnect_resolved_records') || '{}');
        for (const [id, rec] of Object.entries(records)) {
          if (mergedMap.has(id)) {
            const item = mergedMap.get(id);
            mergedMap.set(id, { ...item, status: 'Resolved', ...rec });
          }
        }
      } catch(e) {}

      complaints = Array.from(mergedMap.values());
      window._myComplaints = [...complaints];
      renderComplaints();
      updateSummaryCounters();
      renderProfileView();
    }, (err) => {
      console.warn("Firestore complaints listener error:", err.message);
    });
  } catch (e) {
    console.warn("Could not attach complaints listener:", e);
  }
}

function loadCommunityFeed() {
  try {
    const q = query(collection(db, 'complaints'), where('isPublic', '==', true), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      let live = [];
      snapshot.forEach((doc) => live.push({ id: doc.id, ...doc.data() }));

      const mergedMap = new Map();
      live.forEach(c => mergedMap.set(c.id, c));
      DEMO_POSTS.forEach(demo => {
        if (!mergedMap.has(demo.id)) mergedMap.set(demo.id, demo);
      });

      feedPostsData = Array.from(mergedMap.values()).sort((a, b) => {
        const aTime = a.createdAt?.seconds || (typeof a.createdAt === 'number' ? a.createdAt : Date.now()/1000);
        const bTime = b.createdAt?.seconds || (typeof b.createdAt === 'number' ? b.createdAt : Date.now()/1000);
        return bTime - aTime;
      });

      renderFeed();
    }, (err) => {
      console.warn("Firestore community feed listener error:", err.message);
    });
  } catch (e) {
    console.warn("Could not attach feed listener:", e);
  }
}

function loadMyPosts(uid) {
  try {
    const q = query(collection(db, 'complaints'), where('citizenUid', '==', uid), where('isPublic', '==', true), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      let live = [];
      snapshot.forEach((doc) => live.push({ id: doc.id, ...doc.data() }));

      const mergedMap = new Map();
      live.forEach(c => mergedMap.set(c.id, c));
      DEMO_POSTS.forEach(demo => {
        if (!mergedMap.has(demo.id)) mergedMap.set(demo.id, { ...demo, citizenUid: uid });
      });

      myPostsData = Array.from(mergedMap.values());
      renderMyPosts();
    }, (err) => {
      console.warn("Firestore my posts listener error:", err.message);
    });
  } catch (e) {
    console.warn("Could not attach my posts listener:", e);
  }
}

// MAIN INITIALIZATION FUNCTION
function initCitizenSession() {
  const sessionUser = JSON.parse(sessionStorage.getItem('janconnect_user') || 'null');
  if (!sessionUser || sessionUser.role !== 'citizen') {
    window.location.href = '../citizen-login.html';
    return;
  }
  currentUser = sessionUser;
  userData = sessionUser;

  // Ensure default fallback values for phone and address if not already set
  if (!userData.phone) userData.phone = "+91 98765 43210";
  if (!userData.address) userData.address = "Sector 14, Civil Lines, New Delhi, 110001";
  if (userData.points !== undefined) userPoints = userData.points;

  updateUserDisplay(userData);

  // 1. Immediately seed and render all demo complaints
  complaints = [...DEMO_COMPLAINTS];
  window._myComplaints = [...complaints];
  renderComplaints();
  updateSummaryCounters();

  // 2. Immediately seed and render community feed
  feedPostsData = [...DEMO_POSTS];
  renderFeed();

  // 3. Immediately seed and render my posts
  myPostsData = [...DEMO_POSTS];
  renderMyPosts();

  // 4. Render coupons, rewards & profile view
  renderCoupons();
  updatePointsDisplay();
  renderProfileView();

  // 5. Connect real-time Firestore listeners to merge any live submissions
  loadMyComplaints(currentUser.uid);
  loadCommunityFeed();
  loadMyPosts(currentUser.uid);
}

// ATTACH ALL DOM EVENT LISTENERS
// Navigation buttons
document.querySelectorAll("[data-view]").forEach(x => {
  x.onclick = (e) => {
    e.stopPropagation();
    nav(x.dataset.view);
  };
});

// Logout button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.onclick = (e) => {
    e.stopPropagation();
    signOut(auth).catch(() => {}).finally(() => {
      sessionStorage.clear();
      window.location.href = '../citizen-login.html';
    });
  };
}

// Modal open buttons
["raise1", "raise2", "raise3", "sideRaise"].forEach(id => {
  const btn = $(id);
  if (btn) btn.onclick = openModal;
});

// Modal close buttons
if ($("close")) $("close").onclick = closeModal;
if ($("cancel")) $("cancel").onclick = closeModal;
if ($("modal")) {
  $("modal").onclick = e => {
    if (e.target.id === "modal") closeModal();
  };
}

// Help Centre button
if ($("helpCentreBtn")) {
  $("helpCentreBtn").onclick = () => {
    toast("💡 JanConnect Help: Raise issues, tag officials with @, attach photo/GPS to earn 25 points!");
  };
}

// Text-in-box filter tabs ('Explore all', 'Nearby', 'Most upvoted')
document.querySelectorAll(".filter-tab").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFeedFilter = btn.dataset.filter || 'all';
    renderFeed();
  };
});

// Downward expandable area/city filter toggle button
const toggleFilterBtn = $("toggleCityFilterBtn");
const filterDropdown = $("cityFilterDropdown");
const closeFilterDropdown = $("closeCityFilterDropdown");

function updateFilterButtonBadge() {
  const hasValue = $("cityFilterInput") && $("cityFilterInput").value.trim().length > 0;
  if (toggleFilterBtn) {
    toggleFilterBtn.classList.toggle("has-filter", hasValue);
  }
}

if (toggleFilterBtn && filterDropdown) {
  toggleFilterBtn.onclick = () => {
    const isHidden = filterDropdown.classList.contains("hidden");
    filterDropdown.classList.toggle("hidden");
    toggleFilterBtn.classList.toggle("active", isHidden);
    toggleFilterBtn.classList.toggle("expanded", isHidden);
    if (isHidden && $("cityFilterInput")) {
      setTimeout(() => $("cityFilterInput").focus(), 80);
    }
  };
}

if (closeFilterDropdown && filterDropdown) {
  closeFilterDropdown.onclick = () => {
    filterDropdown.classList.add("hidden");
    if (toggleFilterBtn) {
      toggleFilterBtn.classList.remove("expanded");
      if (!$("cityFilterInput") || !$("cityFilterInput").value.trim()) {
        toggleFilterBtn.classList.remove("active");
      }
    }
  };
}

// Quick city chips inside the expanded area/city panel
document.querySelectorAll(".city-chip").forEach(chip => {
  chip.onclick = () => {
    const city = chip.dataset.city || "";
    const input = $("cityFilterInput");
    if (input) {
      if (input.value.toLowerCase() === city.toLowerCase()) {
        input.value = "";
        chip.classList.remove("active");
      } else {
        input.value = city;
        document.querySelectorAll(".city-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
      }
      renderFeed();
      updateFilterButtonBadge();
    }
  };
});

// Search and city filter input
if ($("cityFilterInput")) {
  $("cityFilterInput").addEventListener("input", () => {
    renderFeed();
    updateFilterButtonBadge();
  });
}
if ($("clearCityFilter")) {
  $("clearCityFilter").addEventListener("click", () => {
    if ($("cityFilterInput")) $("cityFilterInput").value = "";
    document.querySelectorAll(".city-chip").forEach(c => c.classList.remove("active"));
    renderFeed();
    updateFilterButtonBadge();
  });
}

// Trending hashtag clicks (auto-opens the filter dropdown and fills search)
document.querySelectorAll(".trend-tag").forEach(tagEl => {
  tagEl.onclick = () => {
    const tag = tagEl.dataset.tag || "";
    if ($("cityFilterInput")) {
      $("cityFilterInput").value = tag;
      if (filterDropdown) filterDropdown.classList.remove("hidden");
      if (toggleFilterBtn) {
        toggleFilterBtn.classList.add("active");
        toggleFilterBtn.classList.add("expanded");
      }
      renderFeed();
      updateFilterButtonBadge();
    }
  };
});

// Profile inline editing toggle and submission
if ($("toggleEditProfileBtn")) {
  $("toggleEditProfileBtn").onclick = () => {
    const form = $("profileEditForm");
    const displayFields = $("profileDisplayFields");
    if (form) form.classList.toggle("hidden");
    if (displayFields) displayFields.classList.toggle("hidden");
  };
}

if ($("cancelEditBtn")) {
  $("cancelEditBtn").onclick = () => {
    if ($("profileEditForm")) $("profileEditForm").classList.add("hidden");
    if ($("profileDisplayFields")) $("profileDisplayFields").classList.remove("hidden");
  };
}

if ($("profileEditForm")) {
  $("profileEditForm").onsubmit = (e) => {
    e.preventDefault();
    const newName = $("editName") ? $("editName").value.trim() : userData.name;
    const newEmail = $("editEmail") ? $("editEmail").value.trim() : userData.email;
    const newPhone = $("editPhone") ? $("editPhone").value.trim() : userData.phone;
    const newAddress = $("editAddress") ? $("editAddress").value.trim() : userData.address;

    if (!newName) {
      toast("Name cannot be empty.");
      return;
    }

    userData.name = newName;
    userData.email = newEmail;
    userData.phone = newPhone;
    userData.address = newAddress;

    sessionStorage.setItem('janconnect_user', JSON.stringify(userData));
    updateUserDisplay(userData);
    renderProfileView();

    if ($("profileEditForm")) $("profileEditForm").classList.add("hidden");
    if ($("profileDisplayFields")) $("profileDisplayFields").classList.remove("hidden");

    toast("✓ Profile details updated!");

    try {
      updateDoc(doc(db, 'users', currentUser.uid), {
        name: newName,
        email: newEmail,
        phone: newPhone,
        address: newAddress
      });
    } catch (err) {}
  };
}

// Coupon modal close
if ($('closeCoupon')) {
  $('closeCoupon').onclick = () => {
    if ($('couponModal')) $('couponModal').classList.add('hidden');
  };
}

// Character counter and @mention autocomplete
const textInput = $("text");

// ── Helper: escape HTML for safe rendering in ghost overlay ──────────────────
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── LLM inline ghost department suggestion (supports multiple departments) ────
let llmSuggestions = [];
let llmActiveIndex = 0;
let llmDebounceTimer = null;

function getAvailableSuggestions(val) {
  if (!val || !llmSuggestions.length) return [];
  const lower = val.toLowerCase();
  // Filter out any department already tagged in text
  return llmSuggestions.filter(d => !lower.includes('@' + d.toLowerCase()));
}

function renderGhostOverlay() {
  const overlay = $("ghostOverlay");
  if (!overlay || !textInput) return;

  const val = textInput.value;
  if (!val) {
    overlay.innerHTML = "";
    return;
  }

  const available = getAvailableSuggestions(val);
  if (!available.length) {
    overlay.innerHTML = "";
    return;
  }

  // Ensure index is within range
  if (llmActiveIndex >= available.length) {
    llmActiveIndex = 0;
  }
  const currentDept = available[llmActiveIndex];

  // Only render inline ghost when cursor is at or near the end of typed text
  const cursorPos = textInput.selectionStart ?? val.length;
  if (cursorPos < val.length) {
    overlay.innerHTML = "";
    return;
  }

  let ghostText = "";
  // Check if text ends with an @mention pattern (e.g. "... @" or "... @Road")
  const mentionMatch = val.match(/@([a-zA-Z0-9 _-]*)$/);

  if (mentionMatch) {
    const typedPrefix = mentionMatch[1].toLowerCase();
    const deptLower = currentDept.toLowerCase();

    if (typedPrefix.length === 0) {
      // User just typed "@" -> show DeptName with NO duplicate @
      ghostText = currentDept;
    } else if (deptLower.startsWith(typedPrefix)) {
      // User typed partial prefix -> show remainder
      ghostText = currentDept.slice(typedPrefix.length);
    } else {
      overlay.innerHTML = "";
      return;
    }
  } else {
    // User hasn't typed @
    const lead = (val.endsWith(" ") || val.endsWith("\n")) ? "" : " ";
    ghostText = lead + "@" + currentDept;
  }

  // Safe construction
  const safeTyped = escapeHtml(val);
  const safeGhost = escapeHtml(ghostText);
  const trailingNl = val.endsWith("\n") ? " " : "";

  // Show alternate suggestion hint if more than 1 available
  let altHintHtml = "";
  if (available.length > 1) {
    const nextDept = available[(llmActiveIndex + 1) % available.length];
    altHintHtml = ` <span class="ghost-alt-hint">(${llmActiveIndex + 1}/${available.length} · press ↓ for @${escapeHtml(nextDept)})</span>`;
  }

  overlay.innerHTML = `<span class="ghost-typed">${safeTyped}${trailingNl}</span><span class="ghost-inline-suggestion">${safeGhost}<span class="ghost-inline-tab">Tab ↹</span>${altHintHtml}</span>`;
  overlay.scrollTop = textInput.scrollTop;
  overlay.scrollLeft = textInput.scrollLeft;
}

function showGhostSuggestions(departments) {
  if (Array.isArray(departments)) {
    llmSuggestions = departments.filter(Boolean);
  } else if (departments) {
    llmSuggestions = [departments];
  } else {
    llmSuggestions = [];
  }
  window._llmSuggestions = [...llmSuggestions];
  llmActiveIndex = 0;
  renderGhostOverlay();
}

function hideGhostSuggestion() {
  llmSuggestions = [];
  window._llmSuggestions = [];
  llmActiveIndex = 0;
  const overlay = $("ghostOverlay");
  if (overlay) overlay.innerHTML = "";
}

async function fetchLLMSuggestion(text) {
  try {
    const res = await fetch('http://localhost:3001/api/suggest-department', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) return;
    const data = await res.json();
    const depts = data.departments || (data.department ? [data.department] : []);
    if (depts.length > 0 && textInput) {
      showGhostSuggestions(depts);
    }
  } catch (e) {
    // Silently ignore
  }
}

if (textInput) {
  // Sync scroll between textarea and overlay
  textInput.addEventListener("scroll", () => {
    const overlay = $("ghostOverlay");
    if (overlay) {
      overlay.scrollTop = textInput.scrollTop;
      overlay.scrollLeft = textInput.scrollLeft;
    }
  });

  textInput.addEventListener("keydown", (e) => {
    const available = getAvailableSuggestions(textInput.value);

    // Down Arrow → cycle through alternate AI suggested departments
    if ((e.key === "ArrowDown" || e.key === "Down") && available.length > 1) {
      if ((textInput.selectionStart ?? 0) === textInput.value.length) {
        e.preventDefault();
        llmActiveIndex = (llmActiveIndex + 1) % available.length;
        renderGhostOverlay();
        return;
      }
    }

    // Tab key → accept LLM ghost suggestion (never duplicate @)
    if (e.key === "Tab" && available.length > 0) {
      e.preventDefault();
      if (llmActiveIndex >= available.length) llmActiveIndex = 0;
      const acceptedDept = available[llmActiveIndex];

      const pos = textInput.selectionStart;
      const text = textInput.value;
      const before = text.slice(0, pos);
      const after = text.slice(pos);

      let newBefore;
      const match = before.match(/@([a-zA-Z0-9 _-]*)$/);
      if (match) {
        // User already typed @ (and possibly partial dept name) -> replace from @ onwards
        const atIndex = before.length - match[0].length;
        newBefore = before.slice(0, atIndex) + "@" + acceptedDept + " ";
      } else {
        // User did not type @ -> append " @DeptName "
        const trimmed = before.trimEnd();
        newBefore = (trimmed.length > 0 ? trimmed + " " : "") + "@" + acceptedDept + " ";
      }

      // Guarantee NO duplicate @@ ever
      newBefore = newBefore.replace(/@@+/g, '@');

      // Strip leading @ or spaces from 'after' to avoid duplicate tag/spacing
      const cleanAfter = after.replace(/^[@\s]+/, ' ');
      textInput.value = (newBefore + cleanAfter).replace(/@@+/g, '@');

      const newPos = newBefore.length;
      textInput.setSelectionRange(newPos, newPos);

      if ($("count")) $("count").textContent = `${textInput.value.length} / 800`;
      hideSuggestions();
      textInput.focus();

      // Reset index to 0 and render next available suggestion if any
      llmActiveIndex = 0;
      renderGhostOverlay();
      return;
    }

    // Escape → dismiss ghost
    if (e.key === "Escape" && llmSuggestions.length > 0) {
      hideGhostSuggestion();
    }
  });

  textInput.oninput = () => {
    // 1. Sanitize any double @@ in the input immediately
    if (textInput.value.includes("@@")) {
      const cur = textInput.selectionStart;
      textInput.value = textInput.value.replace(/@@+/g, '@');
      textInput.setSelectionRange(Math.min(cur, textInput.value.length), Math.min(cur, textInput.value.length));
    }

    const val = textInput.value;
    const countEl = $("count");
    if (countEl) countEl.textContent = `${val.length} / 800`;

    // 2. Re-render ghost overlay inline as text changes
    renderGhostOverlay();

    // 3. Existing @mention dropdown
    handleMentionInput();

    // 4. Debounce LLM fetch
    clearTimeout(llmDebounceTimer);
    if (val.trim().length < 12) {
      hideGhostSuggestion();
      return;
    }

    llmDebounceTimer = setTimeout(() => fetchLLMSuggestion(val), 400);
  };
}

document.addEventListener("click", e => {
  if (!e.target.closest(".composer")) {
    hideSuggestions();
  }
});

// Camera controls
const cameraBtn = $("camera");
if (cameraBtn) {
  cameraBtn.onclick = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      const video = $("video");
      if (video) video.srcObject = stream;
      if ($("cameraPanel")) $("cameraPanel").classList.remove("hidden");
      setStatus("Camera active. Requesting location…", "loading");
      fetchLocation();
    } catch (err) {
      setStatus("Camera permission denied or camera device unavailable.", "error");
    }
  };
}

const captureBtn = $("capture");
if (captureBtn) {
  captureBtn.onclick = () => {
    const video = $("video");
    const canvas = $("canvas");
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      photo = blob;
      if ($("img")) $("img").src = URL.createObjectURL(blob);
      if ($("preview")) $("preview").classList.remove("hidden");
      const info = $("previewInfo");
      if (info) info.textContent = `Captured from live camera (${canvas.width}×${canvas.height})`;
      stopCamera();
      setStatus("✓ Photo captured successfully.", "success");
    }, "image/jpeg", 0.9);
  };
}

if ($("stop")) $("stop").onclick = stopCamera;

// Image upload via file input
const imageInput = $("image");
if (imageInput) {
  imageInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select a valid image file.");
      return;
    }
    photo = file;
    if ($("img")) $("img").src = URL.createObjectURL(file);
    if ($("preview")) $("preview").classList.remove("hidden");
    const info = $("previewInfo");
    if (info) info.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
    setStatus("✓ Photo attached from file.", "success");
  };
}

if ($("remove")) {
  $("remove").onclick = () => {
    photo = null;
    if ($("image")) $("image").value = "";
    if ($("preview")) $("preview").classList.add("hidden");
    setStatus("Attached photo removed.");
  };
}

if ($("location")) $("location").onclick = fetchLocation;

// Complaint form submit
const form = $("form");
if (form) {
  form.onsubmit = async e => {
    e.preventDefault();
    const text = $("text") ? $("text").value.trim() : "";
    if (!text) {
      toast("Please describe the complaint issue.");
      return;
    }

    const mentionMatch = text.match(/@([a-zA-Z0-9 &_-]+)/);
    let detectedDept = mentionMatch ? mentionMatch[1].trim() : "Municipal Corporation";
    const matchedApproved = tags.find(t => t.toLowerCase() === detectedDept.toLowerCase() || detectedDept.toLowerCase().includes(t.toLowerCase()));
    if (matchedApproved) detectedDept = matchedApproved;

    const town = $("town") ? $("town").value.trim() : "";
    const city = $("city") ? $("city").value.trim() : "";
    const state = $("state") ? $("state").value.trim() : "";
    const pincode = $("pincode") ? $("pincode").value.trim() : "";
    const lat = $("latitude") ? parseFloat($("latitude").value) : null;
    const lon = $("longitude") ? parseFloat($("longitude").value) : null;

    const submitBtn = $("submitBtn");
    const submitText = $("submitText");
    const submitSpinner = $("submitSpinner");

    if (submitBtn) submitBtn.disabled = true;
    if (submitSpinner) submitSpinner.classList.remove("hidden");
    if (submitText) submitText.textContent = "Recording Complaint...";

    let photoUrl = "";
    if (photo) {
      try {
        const formData = new FormData();
        formData.append('file', photo);
        formData.append('upload_preset', CLOUDINARY_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        photoUrl = data.secure_url || '';
      } catch (err) {
        console.warn("Cloudinary upload failed:", err);
      }
    }

    const newId = 'c_' + Date.now().toString(36);
    const complaintData = {
      id: newId,
      title: text.length > 55 ? text.slice(0, 52) + "..." : text,
      description: text,
      department: detectedDept.includes("Department") || detectedDept.includes("Corporation") || detectedDept.includes("Police") ? detectedDept : `${detectedDept} Department`,
      status: 'Under review',
      citizenUid: currentUser ? currentUser.uid : 'anon',
      citizenName: (userData && userData.name) || 'Citizen',
      citizenEmail: (userData && userData.email) || '',
      location: { town, city, state, pincode, lat, lon },
      photoUrl: photoUrl,
      isPublic: true,
      resolvedPhotoUrl: '',
      resolvedBy: '',
      resolvedAt: null,
      createdAt: { seconds: Math.floor(Date.now() / 1000) }
    };

    // Add to local state immediately
    complaints.unshift(complaintData);
    feedPostsData.unshift(complaintData);
    myPostsData.unshift(complaintData);
    window._myComplaints = [...complaints];

    // Save to shared complaints storage for immediate sync with official portal
    try {
      const shared = JSON.parse(localStorage.getItem('janconnect_shared_complaints') || '[]');
      shared.unshift(complaintData);
      localStorage.setItem('janconnect_shared_complaints', JSON.stringify(shared));
    } catch(e) {
      console.warn("Failed to persist shared complaint:", e);
    }

    userPoints += 25;
    updatePointsDisplay();
    renderComplaints();
    renderFeed();
    renderMyPosts();
    updateSummaryCounters();
    renderProfileView();

    toast(`✓ Complaint submitted! (+25 pts)`);
    closeModal();
    resetComplaintForm();

    if (submitBtn) submitBtn.disabled = false;
    if (submitSpinner) submitSpinner.classList.add("hidden");
    if (submitText) submitText.textContent = "Submit Complaint (+25 pts)";

    // Send confirmation email via backend API (non-blocking)
    const addressFormatted = [town, city, state, pincode].filter(Boolean).join(", ");
    fetch('http://localhost:3001/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userData.email,
        citizenName: userData.name || 'Citizen',
        complaintId: newId,
        department: detectedDept,
        location: addressFormatted,
        status: 'Under review'
      })
    }).catch(e => console.warn("Email notification error:", e));

    // Persist to Firestore (non-blocking)
    try {
      addDoc(collection(db, 'complaints'), {
        ...complaintData,
        createdAt: serverTimestamp()
      }).catch(err => console.warn("Firestore addDoc skipped:", err.message));
    } catch (e) {}
  };
}

// Start citizen portal session
initCitizenSession();
