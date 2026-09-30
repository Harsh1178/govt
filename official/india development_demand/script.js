import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Cloudinary config for resolution photo uploads
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

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE DEMO COMPLAINTS DATASET (ALL 12 DEPARTMENTS)
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_COMPLAINTS = [
  // 1. Roads Department
  {
    id: 'demo1',
    title: 'Pothole on NH-48 near railway overbridge',
    description: 'Large pothole cluster on NH-48 near railway overbridge causing accidents. 3 two-wheelers skidded last week. Urgent repair needed.',
    department: 'Roads Department',
    status: 'Under review',
    citizenName: 'Ravi Sharma',
    citizenEmail: 'ravi@demo.in',
    location: { town: 'Patna Junction', city: 'Patna', state: 'Bihar', pincode: '800001' },
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 86400) }
  },
  {
    id: 'demo7',
    title: 'Potholes on MG Road — accidents daily',
    description: 'Multiple potholes MG Road stretch from Silk Board to Koramangala. Daily accidents. Ambulance stuck 40 mins last Tuesday.',
    department: 'Roads Department',
    status: 'In progress',
    citizenName: 'Kavitha Reddy',
    citizenEmail: 'kavitha@demo.in',
    location: { town: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 432000) }
  },
  {
    id: 'demo10',
    title: 'Open manhole on NH-7 near Toll Plaza',
    description: 'Open manhole NH-7 near Toll Plaza 3. Two motorbikes fell last night. No warning signs or barriers placed. Life-threatening.',
    department: 'Roads Department',
    status: 'In progress',
    citizenName: 'Arjun Mehta',
    citizenEmail: 'arjun@demo.in',
    location: { town: 'Nagpur Bypass', city: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 21600) }
  },
  {
    id: 'demo8',
    title: 'Sector 15 road repair completed',
    description: 'Pothole-ridden Sector 15 Main Road fully repaired and recarpeted with asphalt. Work done in 48 hours.',
    department: 'Roads Department',
    status: 'Resolved',
    citizenName: 'Vijay Singh',
    citizenEmail: 'vijay@demo.in',
    location: { town: 'Sector 15', city: 'Gurugram', state: 'Haryana', pincode: '122001' },
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'Roads Dept — Haryana PWD',
    resolvedAt: new Date(Date.now() - 86400000).toISOString(),
    resolveNote: 'Full asphalt resurfacing completed over 1.2km stretch with new road markings.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 518400) }
  },

  // 2. Water Department
  {
    id: 'demo2',
    title: 'Water supply disrupted — pipeline burst Ward 7',
    description: 'No water supply in Ward 7 for 3 days. Pipeline burst near Shastri Nagar. Residents paying ₹800/day for private water tankers.',
    department: 'Water Department',
    status: 'In progress',
    citizenName: 'Priya Patel',
    citizenEmail: 'priya@demo.in',
    location: { town: 'Naranpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380013' },
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 172800) }
  },
  {
    id: 'demo28',
    title: 'Contaminated tap water with foul smell in Sector 4',
    description: 'Tap water coming murky brown with strong chemical odor. Children reporting stomach infection. Urgent pipeline inspection needed.',
    department: 'Water Department',
    status: 'Under review',
    citizenName: 'Manoj Tiwari',
    citizenEmail: 'manoj@demo.in',
    location: { town: 'Sector 4', city: 'Bokaro', state: 'Jharkhand', pincode: '827004' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 28800) }
  },
  {
    id: 'demo11',
    title: 'Water pipeline installed — Sector 8 resolved',
    description: 'New 4-inch drinking water pipeline installed in Sector 8 after complaints. Clean municipal water available 24/7 now!',
    department: 'Water Department',
    status: 'Resolved',
    citizenName: 'Lakshmi Iyer',
    citizenEmail: 'lakshmi@demo.in',
    location: { town: 'Sector 8', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'Chennai MetroWater Board',
    resolvedAt: new Date(Date.now() - 172800000).toISOString(),
    resolveNote: 'New pressure booster pipeline laid and connected to primary underground reservoir.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 604800) }
  },

  // 3. Electricity Department
  {
    id: 'demo9',
    title: 'No electricity 14hrs — transformer blown',
    description: 'Distribution transformer blew at 8am. Entire colony without power. Hospital backup running. Senior citizens suffering in summer heat.',
    department: 'Electricity Department',
    status: 'Under review',
    citizenName: 'Ramesh Gupta',
    citizenEmail: 'ramesh@demo.in',
    location: { town: 'Civil Lines', city: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211001' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 50400) }
  },
  {
    id: 'demo29',
    title: 'Hanging live electrical wires near primary school',
    description: 'High-voltage overhead wire snapped and dangling 5 feet above the ground directly outside St. Mary Primary School. Severe hazard.',
    department: 'Electricity Department',
    status: 'In progress',
    citizenName: 'Suresh Patil',
    citizenEmail: 'suresh@demo.in',
    location: { town: 'Kothrud', city: 'Pune', state: 'Maharashtra', pincode: '411038' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 36000) }
  },
  {
    id: 'demo3',
    title: 'All 12 street lights dead on Nehru Street',
    description: 'All 12 street lights on Nehru Street non-functional for 2 weeks. Snatching incident reported after dark. Ladies feel unsafe.',
    department: 'Electricity Department',
    status: 'Resolved',
    citizenName: 'Amit Kumar',
    citizenEmail: 'amit@demo.in',
    location: { town: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'Madhyanchal Vidyut Vitaran Nigam Ltd',
    resolvedAt: new Date(Date.now() - 259200000).toISOString(),
    resolveNote: 'Repaired underground control junction and replaced 12 non-functional luminaires with 45W LEDs.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 259200) }
  },

  // 4. Sanitation Department
  {
    id: 'demo4',
    title: 'Garbage piling — sanitation failure Ward 14',
    description: 'Municipal waste not collected for 5 days in Ward 14. Heavy fly infestation and stray cattle scattering garbage across road.',
    department: 'Sanitation Department',
    status: 'Under review',
    citizenName: 'Sunita Rao',
    citizenEmail: 'sunita@demo.in',
    location: { town: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034' },
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 43200) }
  },
  {
    id: 'demo30',
    title: 'Open garbage dump overflowing near vegetable market',
    description: 'Secondary waste bin broken. Vegetables and plastic waste rotting on public pavement. Unbearable stench in market zone.',
    department: 'Sanitation Department',
    status: 'In progress',
    citizenName: 'Rajesh Goud',
    citizenEmail: 'rajesh@demo.in',
    location: { town: 'Kacheguda', city: 'Hyderabad', state: 'Telangana', pincode: '500027' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 18000) }
  },
  {
    id: 'demo31',
    title: 'Market dump cleared and sanitised with bleaching powder',
    description: 'Compactor trucks cleared 8 tonnes of accumulated garbage. Ground disinfected and new bins installed.',
    department: 'Sanitation Department',
    status: 'Resolved',
    citizenName: 'Anand Joshi',
    citizenEmail: 'anand@demo.in',
    location: { town: 'Navrangpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'Sanitation Division — AMC',
    resolvedAt: new Date(Date.now() - 72000000).toISOString(),
    resolveNote: 'Waste evacuated to treatment facility and daily collection schedule enforced.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 360000) }
  },

  // 5. Health Department
  {
    id: 'demo13',
    title: 'Primary Health Centre lacks basic medicines and anti-rabies vaccine',
    description: 'Government PHC at Block B has had zero stock of anti-rabies and tetanus injections for 3 weeks. Patients forced to go to private clinics 25km away.',
    department: 'Health Department',
    status: 'Under review',
    citizenName: 'Dr. Vivek Saxena',
    citizenEmail: 'vivek@demo.in',
    location: { town: 'Muzaffarpur Rural', city: 'Muzaffarpur', state: 'Bihar', pincode: '842001' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 32000) }
  },
  {
    id: 'demo14',
    title: 'Government ambulance service non-responsive in emergency ward',
    description: '108 Ambulance helpline took 90 minutes to dispatch an ambulance for accident victims. Staff reported fuel shortage.',
    department: 'Health Department',
    status: 'In progress',
    citizenName: 'Sneha Deshmukh',
    citizenEmail: 'sneha@demo.in',
    location: { town: 'Kalyan West', city: 'Thane', state: 'Maharashtra', pincode: '421301' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 64000) }
  },
  {
    id: 'demo15',
    title: 'Dengue prevention fogging and medical camp conducted',
    description: 'Comprehensive mosquito fogging completed across 8 sectors. Free dengue diagnostic camp set up at local community centre.',
    department: 'Health Department',
    status: 'Resolved',
    citizenName: 'Kunal Kapoor',
    citizenEmail: 'kunal@demo.in',
    location: { town: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201309' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'District Chief Medical Officer',
    resolvedAt: new Date(Date.now() - 90000000).toISOString(),
    resolveNote: 'Larvicidal treatment applied to all open water bodies; 340 citizens tested and advised.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 450000) }
  },

  // 6. Municipal Corporation
  {
    id: 'demo5',
    title: 'Drainage overflow flooding 3 residential streets',
    description: 'Main drainage pipe burst. Sewage water flooding Palarivattom Road, MG Road cross, and Market Lane. Residents cannot step out.',
    department: 'Municipal Corporation',
    status: 'In progress',
    citizenName: 'Deepak Nair',
    citizenEmail: 'deepak@demo.in',
    location: { town: 'Palarivattom', city: 'Kochi', state: 'Kerala', pincode: '682025' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 345600) }
  },
  {
    id: 'demo12',
    title: 'Public park flooded after monsoon — mosquito hazard',
    description: 'Nehru Park completely waterlogged. Drainage choked. Children cannot use play equipment. Stagnant green water breeding mosquitoes.',
    department: 'Municipal Corporation',
    status: 'Under review',
    citizenName: 'Pooja Agarwal',
    citizenEmail: 'pooja@demo.in',
    location: { town: 'Rajouri Garden', city: 'Delhi', state: 'Delhi', pincode: '110027' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 14400) }
  },
  {
    id: 'demo32',
    title: 'Choked storm water drain desilted and cleared',
    description: 'High-power suction machines extracted 12 tonnes of silt. Concrete slab replaced and rainwater draining smoothly.',
    department: 'Municipal Corporation',
    status: 'Resolved',
    citizenName: 'Harish Varma',
    citizenEmail: 'harish@demo.in',
    location: { town: 'Alwarpet', city: 'Chennai', state: 'Tamil Nadu', pincode: '600018' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'Greater Chennai Corporation',
    resolvedAt: new Date(Date.now() - 140000000).toISOString(),
    resolveNote: 'Stormwater drain widened by 0.5m and linked to regional canal outfall.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 480000) }
  },

  // 7. Education Department
  {
    id: 'demo6',
    title: 'School roof collapsed — 200 students at risk',
    description: 'Section of roof at GPS Block C has collapsed after heavy rains. Children sitting under open sky in summer. Urgent structural repair needed.',
    department: 'Education Department',
    status: 'Under review',
    citizenName: 'Meena Verma',
    citizenEmail: 'meena@demo.in',
    location: { town: 'Vaishali Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302021' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 7200) }
  },
  {
    id: 'demo33',
    title: 'Drinking water RO plant broken at Girls High School',
    description: 'The sole drinking water cooler and purification plant has been defunct for 2 months. 450 girl students bringing water bottles from home.',
    department: 'Education Department',
    status: 'In progress',
    citizenName: 'Anita Ghosh',
    citizenEmail: 'anita@demo.in',
    location: { town: 'Salt Lake', city: 'Kolkata', state: 'West Bengal', pincode: '700091' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 55000) }
  },
  {
    id: 'demo34',
    title: 'Classroom ceiling repaired and solar fans installed',
    description: 'Damaged ceiling completely reconstructed with waterproof plastering. 8 solar ceiling fans installed in classrooms.',
    department: 'Education Department',
    status: 'Resolved',
    citizenName: 'Rajinder Kaur',
    citizenEmail: 'rajinder@demo.in',
    location: { town: 'Sector 22', city: 'Chandigarh', state: 'Chandigarh', pincode: '160022' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'Dept of School Education',
    resolvedAt: new Date(Date.now() - 110000000).toISOString(),
    resolveNote: 'Structural audit completed by PWD engineer; new safe roofing certified.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 390000) }
  },

  // 8. Public Works Department
  {
    id: 'demo16',
    title: 'Government Hospital boundary wall collapsed onto footpath',
    description: '50-meter section of District Hospital boundary wall collapsed during storm. Rubble blocking pedestrian footpath and exposing premises.',
    department: 'Public Works Department',
    status: 'Under review',
    citizenName: 'Alok Mishra',
    citizenEmail: 'alok@demo.in',
    location: { town: 'Cantt', city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221002' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 41000) }
  },
  {
    id: 'demo17',
    title: 'Community hall roof leakage during monsoon rains',
    description: 'Municipal Community Centre roof has massive cracks. Water pouring into the main auditorium during public vaccination drives.',
    department: 'Public Works Department',
    status: 'In progress',
    citizenName: 'Bhavna Sen',
    citizenEmail: 'bhavna@demo.in',
    location: { town: 'Arera Colony', city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462016' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 92000) }
  },
  {
    id: 'demo18',
    title: 'Pedestrian subway lighting and wall tiling completed',
    description: 'Underpass on Ring Road fully renovated with 24/7 CCTV surveillance, bright anti-glare LED illumination, and anti-slip ramps.',
    department: 'Public Works Department',
    status: 'Resolved',
    citizenName: 'Tanya Grover',
    citizenEmail: 'tanya@demo.in',
    location: { town: 'Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'Delhi PWD Electrical & Civil Division',
    resolvedAt: new Date(Date.now() - 130000000).toISOString(),
    resolveNote: 'Subway water leakages sealed, 36 LED floodlights installed, ramp railing fortified.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 520000) }
  },

  // 9. Traffic Police
  {
    id: 'demo19',
    title: 'Traffic signals dysfunctional at busy 4-way intersection',
    description: 'Signals blinking amber for 4 days at 100 Feet Road junction. Heavy traffic gridlocks and 2 near-fatal collisions reported.',
    department: 'Traffic Police',
    status: 'Under review',
    citizenName: 'Girish Murthy',
    citizenEmail: 'girish@demo.in',
    location: { town: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 19000) }
  },
  {
    id: 'demo20',
    title: 'Illegal commercial parking blocking emergency fire tender lane',
    description: 'Commercial shop owners and valet drivers illegally double parking across marked fire emergency lane outside shopping plaza.',
    department: 'Traffic Police',
    status: 'In progress',
    citizenName: 'Farhan Merchant',
    citizenEmail: 'farhan@demo.in',
    location: { town: 'Dadar West', city: 'Mumbai', state: 'Maharashtra', pincode: '400028' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 48000) }
  },
  {
    id: 'demo21',
    title: 'Speed breakers and zebra crossing marked near school zone',
    description: 'Installed 2 scientific rubber speed breakers and thermoplastic reflective zebra crossing markings with warning signage.',
    department: 'Traffic Police',
    status: 'Resolved',
    citizenName: 'Neelam Chawla',
    citizenEmail: 'neelam@demo.in',
    location: { town: 'Sector 14', city: 'Gurugram', state: 'Haryana', pincode: '122001' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'Traffic Police Engineering Cell',
    resolvedAt: new Date(Date.now() - 95000000).toISOString(),
    resolveNote: 'Speed mitigation plan executed; pedestrian crossing sign boards erected.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 290000) }
  },

  // 10. Urban Development Department
  {
    id: 'demo22',
    title: 'Encroachment of storm water layout in residential colony',
    description: 'Private developers constructing illegal boundary wall directly across municipal storm water drainage easement in New Colony.',
    department: 'Urban Development Department',
    status: 'Under review',
    citizenName: 'Sanjay Oraon',
    citizenEmail: 'sanjay@demo.in',
    location: { town: 'Morabadi', city: 'Ranchi', state: 'Jharkhand', pincode: '834008' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 24000) }
  },
  {
    id: 'demo23',
    title: 'Delay in layout regularisation approvals for 6 months',
    description: 'Layout regularisation files pending despite all fee receipts submitted and on-site town planning inspection completed.',
    department: 'Urban Development Department',
    status: 'In progress',
    citizenName: 'Prakash Kulkarni',
    citizenEmail: 'prakash@demo.in',
    location: { town: 'Baner', city: 'Pune', state: 'Maharashtra', pincode: '411045' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 80000) }
  },
  {
    id: 'demo35',
    title: 'Public green belt demarcated and boundary fencing completed',
    description: 'Encroached green belt surveyed via drone; illegal tin sheds removed and eco-friendly chain-link fencing installed.',
    department: 'Urban Development Department',
    status: 'Resolved',
    citizenName: 'Devika Rani',
    citizenEmail: 'devika@demo.in',
    location: { town: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', pincode: '500032' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'Hyderabad Metropolitan Development Authority',
    resolvedAt: new Date(Date.now() - 160000000).toISOString(),
    resolveNote: 'Green belt protected from commercial encroachment; sapling plantation initiated.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 490000) }
  },

  // 11. Rural Development Department
  {
    id: 'demo24',
    title: 'Gram Panchayat borewell pump dysfunctional for 2 weeks',
    description: 'Solar submersible pump at Gram Panchayat water kiosk has burnt wiring. 220 rural households walking 3km for drinking water.',
    department: 'Rural Development Department',
    status: 'Under review',
    citizenName: 'Ramprasad Yadav',
    citizenEmail: 'ramprasad@demo.in',
    location: { town: 'Ujiarpur', city: 'Samastipur', state: 'Bihar', pincode: '848132' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 38000) }
  },
  {
    id: 'demo25',
    title: 'Kisan community storage shed construction stalled',
    description: 'Grain storage shed funded under PMGSY stalled for 4 months due to lack of cement supply. Harvest grains at risk of monsoon rot.',
    department: 'Rural Development Department',
    status: 'In progress',
    citizenName: 'Babulal Meena',
    citizenEmail: 'babulal@demo.in',
    location: { town: 'Tijara', city: 'Alwar', state: 'Rajasthan', pincode: '301411' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 70000) }
  },
  {
    id: 'demo36',
    title: 'Panchayat solar micro-grid and street illumination operational',
    description: '5kW solar micro-grid established. 28 solar street lamps installed across village lanes and primary school approach road.',
    department: 'Rural Development Department',
    status: 'Resolved',
    citizenName: 'Santosh Kumar',
    citizenEmail: 'santosh@demo.in',
    location: { town: 'Barabanki Village', city: 'Barabanki', state: 'Uttar Pradesh', pincode: '225001' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'UP Rural Development Agency',
    resolvedAt: new Date(Date.now() - 180000000).toISOString(),
    resolveNote: 'Solar micro-grid energized and handed over to village maintenance committee.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 540000) }
  },

  // 12. District Administration
  {
    id: 'demo26',
    title: 'Delay in issuing income & domicile certificates at Tehsil office',
    description: 'Online e-District applications pending over 45 days. Students cannot complete polytechnic admission counseling without certificate.',
    department: 'District Administration',
    status: 'Under review',
    citizenName: 'Mohd. Salim',
    citizenEmail: 'salim@demo.in',
    location: { town: 'Civil Lines', city: 'Meerut', state: 'Uttar Pradesh', pincode: '250001' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 16000) }
  },
  {
    id: 'demo27',
    title: 'Ration card biometric iris scanner offline for 10 days',
    description: 'PDS ration dealer unable to disburse subsidized food grains because biometric scanner device has corrupted firmware.',
    department: 'District Administration',
    status: 'In progress',
    citizenName: 'Kamla Devi',
    citizenEmail: 'kamla@demo.in',
    location: { town: 'Bodh Gaya', city: 'Gaya', state: 'Bihar', pincode: '824231' },
    photoUrl: '',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 60000) }
  },
  {
    id: 'demo37',
    title: 'Tehsil single-window fast-track counter established',
    description: 'Deployed 4 additional e-District operators with backup 4G biometric terminals. Backlog of 380 applications cleared in 72 hours.',
    department: 'District Administration',
    status: 'Resolved',
    citizenName: 'Gaurav Singhal',
    citizenEmail: 'gaurav@demo.in',
    location: { town: 'Collectorate', city: 'Agra', state: 'Uttar Pradesh', pincode: '282001' },
    photoUrl: '',
    resolvedPhotoUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    resolvedBy: 'District Magistrate Office — Public Grievance Cell',
    resolvedAt: new Date(Date.now() - 150000000).toISOString(),
    resolveNote: 'Single-window verification token system introduced; average processing time reduced to 48 hours.',
    isPublic: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000 - 470000) }
  }
];

// Helper: Match department names robustly (handles 'Roads' vs 'Roads Department')
function matchDept(complaintDept, filterDept) {
  if (!filterDept || filterDept === 'All Departments') return true;
  if (!complaintDept) return false;
  const c = complaintDept.toLowerCase().replace(/ department/g, '').replace(/ corporation/g, '').replace(/ police/g, '').trim();
  const f = filterDept.toLowerCase().replace(/ department/g, '').replace(/ corporation/g, '').replace(/ police/g, '').trim();
  return c === f || c.includes(f) || f.includes(c);
}

// Helpers for cross-portal shared storage
function getSharedComplaints() {
  try {
    return JSON.parse(localStorage.getItem('janconnect_shared_complaints') || '[]');
  } catch(e) { return []; }
}

function getResolvedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem('janconnect_resolved_ids') || '[]'));
  } catch(e) { return new Set(); }
}

function saveResolvedRecord(complaintId, record) {
  try {
    const ids = Array.from(getResolvedIds());
    if (!ids.includes(complaintId)) ids.push(complaintId);
    localStorage.setItem('janconnect_resolved_ids', JSON.stringify(ids));

    const records = JSON.parse(localStorage.getItem('janconnect_resolved_records') || '{}');
    records[complaintId] = record;
    localStorage.setItem('janconnect_resolved_records', JSON.stringify(records));

    // Update shared complaints if present
    const shared = getSharedComplaints();
    const item = shared.find(c => c.id === complaintId);
    if (item) {
      item.status = 'Resolved';
      item.resolvedPhotoUrl = record.resolvedPhotoUrl;
      item.resolvedBy = record.resolvedBy;
      item.resolvedAt = record.resolvedAt;
      item.resolveNote = record.resolveNote;
      localStorage.setItem('janconnect_shared_complaints', JSON.stringify(shared));
    }
  } catch(e) {}
}

function toast(msg) {
  const t = document.getElementById('toast');
  if(t) {
    t.textContent = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3500);
  }
}

function showLoading(msg) {
  const overlay = document.getElementById('loading-overlay');
  const text = document.getElementById('loading-text');
  if(overlay && text) {
    text.textContent = msg;
    overlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if(overlay) overlay.classList.add('hidden');
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTH GUARD & SESSION SETUP
// ─────────────────────────────────────────────────────────────────────────────
function initOfficialSession() {
  let sessionUser = JSON.parse(sessionStorage.getItem('janconnect_user') || 'null');
  if (!sessionUser || sessionUser.role !== 'official') {
    // Check saved session in localStorage
    sessionUser = JSON.parse(localStorage.getItem('janconnect_official_saved') || 'null');
    if (sessionUser && sessionUser.role === 'official') {
      sessionStorage.setItem('janconnect_user', JSON.stringify(sessionUser));
    } else {
      window.location.href = '../../official-login.html';
      return;
    }
  }
  
  window.currentUser = sessionUser;
  window.currentDept = sessionUser.department || 'Roads Department';

  const nameEl = document.getElementById('officer-name');
  if (nameEl) nameEl.textContent = sessionUser.name || 'Official';

  const updateHeaderBadge = (dept) => {
    const deptLabelEl = document.getElementById('officer-dept-label');
    if (deptLabelEl) {
      deptLabelEl.textContent = dept === 'All Departments' ? 'All' : dept.replace(' Department', '');
    }
  };
  updateHeaderBadge(window.currentDept);

  // Sync Department Dropdowns
  const deptSelect = document.getElementById('dept-select');
  const deptSelectResolved = document.getElementById('dept-select-resolved');

  const onDeptChange = (newDept) => {
    window.currentDept = newDept;
    updateHeaderBadge(newDept);
    if (deptSelect && deptSelect.value !== newDept) deptSelect.value = newDept;
    if (deptSelectResolved && deptSelectResolved.value !== newDept) deptSelectResolved.value = newDept;

    sessionUser.department = newDept;
    sessionStorage.setItem('janconnect_user', JSON.stringify(sessionUser));

    // Reset AI groups section on department change
    const sec = document.getElementById('groups-section');
    if (sec) sec.classList.add('hidden');
    const list = document.getElementById('groups-list');
    if (list) list.innerHTML = '';

    loadDeptComplaints(window.currentDept);
    loadResolvedComplaints(window.currentDept);
  };

  if (deptSelect) {
    deptSelect.value = window.currentDept;
    deptSelect.onchange = () => onDeptChange(deptSelect.value);
  }
  if (deptSelectResolved) {
    deptSelectResolved.value = window.currentDept;
    deptSelectResolved.onchange = () => onDeptChange(deptSelectResolved.value);
  }
  
  loadDeptComplaints(window.currentDept);
  loadResolvedComplaints(window.currentDept);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TAB SWITCHING
// ─────────────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    btn.classList.add('active');
    const targetTab = document.getElementById(btn.dataset.tab + '-tab');
    if (targetTab) targetTab.classList.remove('hidden');
    if (btn.dataset.tab === 'heatmap') {
      setTimeout(() => { if (typeof map !== 'undefined') map.invalidateSize(); }, 120);
    }
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. LOAD DEPARTMENT COMPLAINTS
// ─────────────────────────────────────────────────────────────────────────────
let allComplaints = [];
function loadDeptComplaints(department) {
  const resolvedIds = getResolvedIds();

  // 1. Merge demo complaints (exclude already resolved)
  const demoList = DEMO_COMPLAINTS.filter(c => c.status !== 'Resolved' && !resolvedIds.has(c.id));
  
  // 2. Merge citizen-submitted shared complaints
  const sharedList = getSharedComplaints().filter(c => c.status !== 'Resolved' && !resolvedIds.has(c.id));

  const mapById = new Map();
  [...demoList, ...sharedList].forEach(c => mapById.set(c.id, c));

  let combined = Array.from(mapById.values()).filter(c => matchDept(c.department, department));

  allComplaints = combined;
  renderComplaintsList(allComplaints);

  // 3. Merge Firestore live complaints if available
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = (department && department !== 'All Departments')
      ? query(complaintsRef, where('department', '==', department))
      : complaintsRef;

    onSnapshot(q, (snap) => {
      const firestoreComplaints = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => c.status !== 'Resolved' && !resolvedIds.has(c.id));

      firestoreComplaints.forEach(c => mapById.set(c.id, c));
      let updated = Array.from(mapById.values()).filter(c => matchDept(c.department, department));
      allComplaints = updated;
      renderComplaintsList(allComplaints);
    }, (err) => {
      console.warn('Firestore live complaints note:', err.message);
    });
  } catch(e) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RENDER COMPLAINTS LIST
// ─────────────────────────────────────────────────────────────────────────────
function renderComplaintsList(complaints) {
  const list = document.getElementById('complaints-list');
  if(!list) return;
  list.innerHTML = '';
  if(!complaints.length) {
    list.innerHTML = `
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:32px; text-align:center; color:#64748b; grid-column:1/-1;">
        <p style="margin:0; font-size:15px; font-weight:600;">No pending complaints in this department.</p>
        <p style="margin:6px 0 0; font-size:12px; color:#94a3b8;">Use the department selector above to switch departments or select "All Departments (Show All)".</p>
      </div>`;
    return;
  }
  
  complaints.forEach(c => {
    const card = document.createElement('div');
    card.className = 'complaint-card';
    const locText = c.location ? `${c.location.town || ''} ${c.location.city || ''} ${c.location.state || ''}`.trim() : 'Location specified';
    const dateFormatted = c.createdAt ? (c.createdAt.toDate ? c.createdAt.toDate().toLocaleDateString('en-IN') : (c.createdAt.seconds ? new Date(c.createdAt.seconds*1000).toLocaleDateString('en-IN') : new Date(c.createdAt).toLocaleDateString('en-IN'))) : 'Recent';

    card.innerHTML = `
      <div class="complaint-content">
        <h4>${c.title} <span class="id-badge">#${c.id.substring(0,6)}</span></h4>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:11px; background:#eff6ff; color:#1d4ed8; padding:3px 9px; border-radius:4px; font-weight:700;">${c.department || 'Civic'}</span>
          <span class="status-badge status-${(c.status || 'review').toLowerCase().replace(/\s+/g,'')}">${c.status || 'Under review'}</span>
        </div>
        <p class="citizen-info">👤 <strong>${c.citizenName || 'Citizen'}</strong> • 📍 ${locText || 'Ward Area'}</p>
        <p style="font-size:12px; color:#475569; line-height:1.45; margin:6px 0 8px;">${c.description || c.title}</p>
        <p class="date">📅 Submitted: ${dateFormatted}</p>
      </div>
      ${c.photoUrl ? '<img src="' + c.photoUrl + '" class="complaint-photo" alt="Issue photo" onerror="this.style.display=\'none\'">' : ''}
      <button class="primary-btn resolve-btn" style="width:100%; margin-top:8px; cursor:pointer;">✅ Mark as Resolved</button>
    `;
    card.querySelector('.resolve-btn').onclick = () => openResolveModal('single', c);
    list.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. QWEN2.5 & GEMINI AI GROUPING
// ─────────────────────────────────────────────────────────────────────────────
let currentAiGroups = [];
const analyzeBtn = document.getElementById('analyzeBtn');
if (analyzeBtn) {
  analyzeBtn.onclick = async () => {
    if (!allComplaints.length) { 
      toast('No complaints to analyse in current department view. Switch to another department or All Departments.'); 
      return; 
    }
    
    showLoading('Analysing & clustering complaints with AI (Qwen2.5)...');
    
    const payload = {
      complaints: allComplaints.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description || c.title,
        location: c.location ? `${c.location.town || ''} ${c.location.city || ''} ${c.location.state || ''}`.trim() : '',
        department: c.department || window.currentDept
      })),
      department: window.currentDept
    };
    
    try {
      const res = await fetch('http://localhost:3001/api/group-complaints', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      hideLoading();
      if (data.groups && data.groups.length > 0) {
        currentAiGroups = data.groups;
        renderGroups(currentAiGroups);
        const sec = document.getElementById('groups-section');
        if (sec) sec.classList.remove('hidden');
        toast(`✅ AI clustered ${allComplaints.length} complaints into ${data.groups.length} actionable groups!`);
      } else {
        toast('Complaints are distinct individual issues. No multi-complaint clusters identified.');
      }
    } catch(e) {
      hideLoading();
      toast('AI clustering error: ' + e.message + ' (Ensure Node server is running)');
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. RENDER GROUPS
// ─────────────────────────────────────────────────────────────────────────────
function renderGroups(groups) {
  const list = document.getElementById('groups-list');
  if(!list) return;
  list.innerHTML = '';
  if(!groups || !groups.length) {
    const sec = document.getElementById('groups-section');
    if (sec) sec.classList.add('hidden');
    return;
  }
  
  groups.forEach((g, gIdx) => {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.id = `group-cluster-${gIdx}`;
    const count = g.complaintIds ? g.complaintIds.length : 1;

    // Find detailed items for each complaint in group
    const matchedItems = (g.complaintIds || []).map(id => {
      const found = allComplaints.find(c => c.id === id);
      return found ? { id, title: found.title, citizenName: found.citizenName || 'Citizen', loc: found.location?.town || '' } 
                   : { id, title: `Complaint #${id.slice(0,6)}`, citizenName: 'Citizen', loc: '' };
    });

    const itemsHtml = matchedItems.map(item => `
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; margin-top:5px; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
        <span style="color:#1e293b; font-weight:600;">• ${item.title}</span>
        <span style="color:#64748b; font-size:11px; white-space:nowrap; margin-left:8px;">${item.citizenName} ${item.loc ? '• ' + item.loc : ''}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="group-header">
        <h4>${g.groupTitle}</h4>
        <span class="priority-badge priority-${(g.priority || 'medium').toLowerCase()}">${g.priority || 'HIGH'} PRIORITY</span>
      </div>
      <p class="group-area">📍 Area Cluster: <strong>${g.area}</strong></p>
      <p class="group-reason">🤖 AI Analysis: ${g.reason}</p>
      <p class="group-count" style="font-weight:700; color:#1e293b; margin-top:8px;">📦 Contains ${count} Complaint(s) in this Cluster:</p>
      <div class="group-items-list" style="margin-bottom:12px;">
        ${itemsHtml}
      </div>
      <button class="primary-btn resolve-group-btn" style="margin-top:4px; width:100%; background:#16a34a; font-weight:700; cursor:pointer;">✅ Mark Entire Group Resolved (${count})</button>
    `;
    card.querySelector('.resolve-group-btn').onclick = () => openResolveModal('group', g);
    list.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. RESOLVE MODAL & WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────
let resolveTarget = null;
let currentResolvePhotoData = '';

function openResolveModal(type, data) {
  resolveTarget = { type, data };
  currentResolvePhotoData = '';

  const headingEl = document.getElementById('resolve-modal-heading');
  const titleEl = document.getElementById('resolve-group-title');
  
  if (type === 'group') {
    if (headingEl) headingEl.textContent = 'Mark AI Group as Resolved';
    if (titleEl) titleEl.textContent = `Group: ${data.groupTitle} (${data.complaintIds.length} complaints)`;
  } else {
    if (headingEl) headingEl.textContent = 'Mark Complaint as Resolved';
    if (titleEl) titleEl.textContent = `Complaint #${data.id.slice(0,6)}: ${data.title}`;
  }

  const modal = document.getElementById('resolve-modal');
  if (modal) modal.classList.remove('hidden');

  const fileInput = document.getElementById('resolve-photo');
  if (fileInput) fileInput.value = '';
  const preview = document.getElementById('resolve-preview');
  if (preview) preview.classList.add('hidden');
  const noteEl = document.getElementById('resolve-note');
  if (noteEl) noteEl.value = '';
}

const photoInput = document.getElementById('resolve-photo');
if(photoInput) {
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentResolvePhotoData = e.target.result;
        const img = document.getElementById('resolve-img');
        if(img) img.src = currentResolvePhotoData;
        const preview = document.getElementById('resolve-preview');
        if(preview) preview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });
}

const closeX = document.getElementById('resolve-cancel-x');
if (closeX) closeX.onclick = () => document.getElementById('resolve-modal').classList.add('hidden');

const resolveCancel = document.getElementById('resolve-cancel');
if(resolveCancel) resolveCancel.onclick = () => document.getElementById('resolve-modal').classList.add('hidden');

const resolveSubmit = document.getElementById('resolve-submit');
if(resolveSubmit) {
  resolveSubmit.onclick = async () => {
    showLoading('Recording resolution & updating status...');

    const resolvedAt = new Date().toISOString();
    const officerName = (window.currentUser && window.currentUser.name) || 'Department Official';
    const officerDept = window.currentDept || 'Civic Department';
    const resolvedBy = `${officerName} • ${officerDept}`;
    const resolveNote = document.getElementById('resolve-note')?.value.trim() || 'Work completed and verified on-site by department officials.';

    const photoFile = document.getElementById('resolve-photo')?.files[0];
    let resolvedPhotoUrl = currentResolvePhotoData || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';

    // Cloudinary upload with 3.5s timeout; falls back to currentResolvePhotoData
    if (photoFile) {
      try {
        const formData = new FormData();
        formData.append('file', photoFile);
        formData.append('upload_preset', CLOUDINARY_PRESET);
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(3500)
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.secure_url) resolvedPhotoUrl = uploadData.secure_url;
        }
      } catch(err) {
        console.warn('Cloudinary upload note (using immediate photo):', err.message);
      }
    }

    const complaintIds = resolveTarget.type === 'group' 
      ? resolveTarget.data.complaintIds 
      : [resolveTarget.data.id];

    // Save resolution record for each complaint
    complaintIds.forEach(id => {
      saveResolvedRecord(id, {
        resolvedPhotoUrl,
        resolvedBy,
        resolvedAt,
        resolveNote
      });
    });

    // Non-blocking Firestore update
    try {
      const batch = writeBatch(db);
      complaintIds.forEach(id => {
        batch.update(doc(db, 'complaints', id), {
          status: 'Resolved',
          resolvedPhotoUrl,
          resolvedBy,
          resolvedAt: serverTimestamp(),
          resolveNote
        });
      });
      batch.commit().catch(() => {});
    } catch(err) {}

    // Send email notification to affected citizens (non-blocking)
    const affectedComplaints = allComplaints.filter(c => complaintIds.includes(c.id));
    for (const c of affectedComplaints) {
      if (c.citizenEmail) {
        fetch('http://localhost:3001/api/send-resolved', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            to: c.citizenEmail,
            citizenName: c.citizenName || 'Citizen',
            complaintId: c.id,
            department: c.department || window.currentDept,
            resolvedBy,
            resolvedAt
          })
        }).catch(() => {});
      }
    }

    // If resolving group, remove it from active groups
    if (resolveTarget.type === 'group') {
      currentAiGroups = currentAiGroups.filter(g => g !== resolveTarget.data);
      renderGroups(currentAiGroups);
    }

    hideLoading();
    const modal = document.getElementById('resolve-modal');
    if (modal) modal.classList.add('hidden');

    toast(`✅ ${complaintIds.length} complaint(s) marked as Resolved!`);

    // Reload both tabs immediately
    loadDeptComplaints(window.currentDept);
    loadResolvedComplaints(window.currentDept);
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. RESOLVED TAB
// ─────────────────────────────────────────────────────────────────────────────
function loadResolvedComplaints(department) {
  const resolvedRecords = JSON.parse(localStorage.getItem('janconnect_resolved_records') || '{}');
  const resolvedIds = getResolvedIds();

  // 1. Static demo resolved
  const demoResolved = DEMO_COMPLAINTS.filter(c => c.status === 'Resolved' || resolvedIds.has(c.id)).map(c => {
    if (resolvedRecords[c.id]) {
      return { ...c, ...resolvedRecords[c.id], status: 'Resolved' };
    }
    return c;
  });

  // 2. Shared citizen resolved complaints
  const sharedResolved = getSharedComplaints().filter(c => c.status === 'Resolved' || resolvedIds.has(c.id)).map(c => {
    if (resolvedRecords[c.id]) {
      return { ...c, ...resolvedRecords[c.id], status: 'Resolved' };
    }
    return c;
  });

  const mapById = new Map();
  [...demoResolved, ...sharedResolved].forEach(c => mapById.set(c.id, c));

  let combined = Array.from(mapById.values()).filter(c => matchDept(c.department, department));
  renderResolved(combined);

  // 3. Merge Firestore resolved in background
  try {
    const complaintsRef = collection(db, 'complaints');
    const q = (department && department !== 'All Departments')
      ? query(complaintsRef, where('department', '==', department))
      : complaintsRef;

    onSnapshot(q, (snap) => {
      const firestoreResolved = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(c => c.status === 'Resolved' || resolvedIds.has(c.id));

      firestoreResolved.forEach(c => mapById.set(c.id, c));
      let updated = Array.from(mapById.values()).filter(c => matchDept(c.department, department));
      renderResolved(updated);
    }, () => {});
  } catch(e) {}
}

function renderResolved(resolved) {
  const list = document.getElementById('resolved-list');
  if(!list) return;
  list.innerHTML = '';
  if(!resolved.length) {
    list.innerHTML = `
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:32px; text-align:center; color:#64748b;">
        <p style="margin:0; font-size:15px; font-weight:600;">No resolved complaints recorded yet for this department.</p>
        <p style="margin:6px 0 0; font-size:12px; color:#94a3b8;">When complaints are marked as resolved, they will appear here with before/after photo verification.</p>
      </div>`;
    return;
  }
  
  resolved.forEach(r => {
    const card = document.createElement('div');
    card.className = 'resolved-card';
    const locText = r.location ? `${r.location.town || ''} ${r.location.city || ''} ${r.location.state || ''}`.trim() : 'Civic Zone';
    const dateStr = r.resolvedAt ? (r.resolvedAt.toDate ? r.resolvedAt.toDate().toLocaleDateString('en-IN') : new Date(r.resolvedAt).toLocaleDateString('en-IN')) : 'Verified';
    
    card.innerHTML = `
      <div class="resolved-header">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h4 style="margin:0; font-size:16px;">${r.title} <span class="id-badge">#${r.id.substring(0,6)}</span></h4>
          <span style="background:#dcfce7; color:#15803d; font-size:11px; font-weight:800; padding:4px 10px; border-radius:99px;">✓ RESOLVED</span>
        </div>
        <p style="margin:6px 0 2px; font-size:12px; color:#475569;">📍 ${locText} • 🏛️ <strong>${r.department || 'Civic Department'}</strong></p>
        <p style="margin:2px 0 4px; font-size:12px; color:#64748b;">👤 Resolved by: <strong>${r.resolvedBy || 'Department Engineer'}</strong> • 📅 ${dateStr}</p>
        ${r.resolveNote ? `<p style="margin:8px 0 0; font-size:12px; color:#166534; background:#f0fdf4; padding:8px 12px; border-radius:6px; border-left:3px solid #16a34a;"><strong>Resolution Action:</strong> ${r.resolveNote}</p>` : ''}
      </div>
      <div class="photos-grid" style="display:flex; gap:16px; margin-top:12px;">
        ${r.photoUrl ? `<div style="flex:1;"><p style="font-size:11px; font-weight:700; color:#8491a2; margin:0 0 4px;">INITIAL COMPLAINT PHOTO</p><img src="${r.photoUrl}" alt="Before" style="width:100%; height:140px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0;" onerror="this.style.display='none'"></div>` : ''}
        ${r.resolvedPhotoUrl ? `<div style="flex:1;"><p style="font-size:11px; font-weight:700; color:#16a34a; margin:0 0 4px;">VERIFIED RESOLUTION PHOTO</p><img src="${r.resolvedPhotoUrl}" alt="After" style="width:100%; height:140px; object-fit:cover; border-radius:8px; border:1.5px solid #86efac;" onerror="this.style.display='none'"></div>` : ''}
      </div>
    `;
    list.appendChild(card);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) {
  logoutBtn.onclick = () => {
    sessionStorage.clear();
    try { signOut(auth).catch(() => {}); } catch(e){}
    window.location.href = '../../index.html';
  };
}

initOfficialSession();

// ─────────────────────────────────────────────────────────────────────────────
// 10. RICH NATIONAL 23-STATE DATASET
// ─────────────────────────────────────────────────────────────────────────────
const DEMANDS = {
  "Uttar Pradesh": {
    demand: "Road infrastructure & sanitation",
    population: "24.1 Cr",
    requests: 45600,
    work: 27,
    investment: "₹55,000 Cr",
    demographics: { populationCr: 24.1, ruralPct: 77, urbanPct: 23, literacyPct: 67.7, gdpPerCapitaRs: 68400, sexRatio: 912, infantMortalityRate: 43 },
    investmentPlan: { plannedCr: 55000, allocatedCr: 38500, utilizationPct: 70, keyProjects: ["Ganga Expressway","Bundelkhand Industrial Corridor","Smart Cities — Varanasi & Lucknow"] },
    infrastructure: { roadDensityKmPerLakh: 1063, puccaRoadPct: 54, drinkingWaterCovPct: 59, sewerCovPct: 38, powerUptimePct: 71, schoolsPer1000: 4.1, hospitalsPer1000: 0.31, deficitScore: 72 },
    schemes: { activeCount: 34, completedCount: 12, completionPct: 26, flagship: ["PM Awas Yojana","Jal Jeevan Mission","PMGSY Road Connectivity"] },
    districts: { total: 75, criticalCount: 28, mostAffected: "Sitapur", avgDevIndex: 0.41 },
    scoreBreakdown: { citizenRequestScore: 91, populationAdjustedDemand: 88, infrastructureDeficit: 72, urgency: 90, existingInfrastructure: 27, alreadyPlannedInvestment: 35 },
    demandScore: 85
  },
  "Maharashtra": {
    demand: "Drought relief & public transit",
    population: "12.6 Cr",
    requests: 41200,
    work: 48,
    investment: "₹62,000 Cr",
    demographics: { populationCr: 12.6, ruralPct: 55, urbanPct: 45, literacyPct: 82.3, gdpPerCapitaRs: 228000, sexRatio: 929, infantMortalityRate: 19 },
    investmentPlan: { plannedCr: 62000, allocatedCr: 49600, utilizationPct: 80, keyProjects: ["Samruddhi Mahamarg Phase II","Marathwada Water Grid","Pune Metro Line 3"] },
    infrastructure: { roadDensityKmPerLakh: 2430, puccaRoadPct: 78, drinkingWaterCovPct: 76, sewerCovPct: 62, powerUptimePct: 88, schoolsPer1000: 5.6, hospitalsPer1000: 0.74, deficitScore: 49 },
    schemes: { activeCount: 28, completedCount: 17, completionPct: 60, flagship: ["Jalyukt Shivar 2.0","MahaDBT Farmer Support","Smart Transit Pune"] },
    districts: { total: 36, criticalCount: 11, mostAffected: "Beed", avgDevIndex: 0.63 },
    scoreBreakdown: { citizenRequestScore: 82, populationAdjustedDemand: 68, infrastructureDeficit: 49, urgency: 75, existingInfrastructure: 48, alreadyPlannedInvestment: 42 },
    demandScore: 72
  },
  "Bihar": {
    demand: "Flood management & healthcare access",
    population: "13.1 Cr",
    requests: 38900,
    work: 19,
    investment: "₹38,000 Cr",
    demographics: { populationCr: 13.1, ruralPct: 89, urbanPct: 11, literacyPct: 61.8, gdpPerCapitaRs: 46200, sexRatio: 918, infantMortalityRate: 47 },
    investmentPlan: { plannedCr: 38000, allocatedCr: 22800, utilizationPct: 60, keyProjects: ["Kosi-Mechi River Link","Patna Metro Rail","District Medical Colleges × 6"] },
    infrastructure: { roadDensityKmPerLakh: 980, puccaRoadPct: 48, drinkingWaterCovPct: 62, sewerCovPct: 22, powerUptimePct: 65, schoolsPer1000: 3.8, hospitalsPer1000: 0.22, deficitScore: 81 },
    schemes: { activeCount: 24, completedCount: 7, completionPct: 29, flagship: ["Saat Nischay Part 2","Har Ghar Nal Ka Jal","Rural Solar Street Lights"] },
    districts: { total: 38, criticalCount: 22, mostAffected: "Saharsa", avgDevIndex: 0.36 },
    scoreBreakdown: { citizenRequestScore: 78, populationAdjustedDemand: 85, infrastructureDeficit: 81, urgency: 88, existingInfrastructure: 19, alreadyPlannedInvestment: 24 },
    demandScore: 88
  },
  "Karnataka": {
    demand: "Tech corridor roads & power reliability",
    population: "6.8 Cr",
    requests: 36400,
    work: 41,
    investment: "₹45,000 Cr",
    demographics: { populationCr: 6.8, ruralPct: 61, urbanPct: 39, literacyPct: 75.4, gdpPerCapitaRs: 266000, sexRatio: 973, infantMortalityRate: 21 },
    investmentPlan: { plannedCr: 45000, allocatedCr: 33750, utilizationPct: 75, keyProjects: ["Bengaluru Peripheral Ring Road","Upper Krishna Project Stage III","KWIN City Knowledge Park"] },
    infrastructure: { roadDensityKmPerLakh: 2120, puccaRoadPct: 71, drinkingWaterCovPct: 74, sewerCovPct: 58, powerUptimePct: 83, schoolsPer1000: 5.1, hospitalsPer1000: 0.81, deficitScore: 46 },
    schemes: { activeCount: 26, completedCount: 14, completionPct: 54, flagship: ["Gruha Jyothi Power Scheme","Shakti Public Transport","Smart City Belagavi"] },
    districts: { total: 31, criticalCount: 9, mostAffected: "Raichur", avgDevIndex: 0.61 },
    scoreBreakdown: { citizenRequestScore: 73, populationAdjustedDemand: 52, infrastructureDeficit: 46, urgency: 65, existingInfrastructure: 41, alreadyPlannedInvestment: 32 },
    demandScore: 66
  },
  "Delhi": {
    demand: "Waste management & air quality",
    population: "2.0 Cr",
    requests: 32100,
    work: 56,
    investment: "₹18,500 Cr",
    demographics: { populationCr: 2.0, ruralPct: 11, urbanPct: 89, literacyPct: 86.2, gdpPerCapitaRs: 398700, sexRatio: 868, infantMortalityRate: 12 },
    investmentPlan: { plannedCr: 18500, allocatedCr: 15200, utilizationPct: 82, keyProjects: ["Delhi Metro Phase IV","Waste-to-Energy Plants × 3","Yamuna Rejuvenation"] },
    infrastructure: { roadDensityKmPerLakh: 3820, puccaRoadPct: 97, drinkingWaterCovPct: 91, sewerCovPct: 88, powerUptimePct: 94, schoolsPer1000: 8.2, hospitalsPer1000: 1.82, deficitScore: 31 },
    schemes: { activeCount: 18, completedCount: 11, completionPct: 61, flagship: ["Electric Bus Fleet Expansion","Smog Tower & Green Buffer","Rainwater Harvesting Subsidy"] },
    districts: { total: 11, criticalCount: 3, mostAffected: "North East Delhi", avgDevIndex: 0.72 },
    scoreBreakdown: { citizenRequestScore: 64, populationAdjustedDemand: 22, infrastructureDeficit: 31, urgency: 60, existingInfrastructure: 56, alreadyPlannedInvestment: 26 },
    demandScore: 47
  },
  "Gujarat": {
    demand: "Renewable energy grid & coastal roads",
    population: "7.1 Cr",
    requests: 34100,
    work: 58,
    investment: "₹52,000 Cr",
    demographics: { populationCr: 7.1, ruralPct: 57, urbanPct: 43, literacyPct: 78.0, gdpPerCapitaRs: 241000, sexRatio: 919, infantMortalityRate: 25 },
    investmentPlan: { plannedCr: 52000, allocatedCr: 41600, utilizationPct: 80, keyProjects: ["Dholera SIR Coastal Expressway","Khavda Hybrid Solar Park","Ahmedabad Metro Phase 2"] },
    infrastructure: { roadDensityKmPerLakh: 2200, puccaRoadPct: 85, drinkingWaterCovPct: 88, sewerCovPct: 72, powerUptimePct: 96, schoolsPer1000: 5.8, hospitalsPer1000: 0.95, deficitScore: 36 },
    schemes: { activeCount: 29, completedCount: 18, completionPct: 62, flagship: ["Kisan Suryodaya Yojana","Sujalam Sufalam Jal Abhiyan","Vibrant Coastal Highway"] },
    districts: { total: 33, criticalCount: 6, mostAffected: "Dahod", avgDevIndex: 0.69 },
    scoreBreakdown: { citizenRequestScore: 68, populationAdjustedDemand: 45, infrastructureDeficit: 36, urgency: 55, existingInfrastructure: 58, alreadyPlannedInvestment: 44 },
    demandScore: 59
  },
  "Rajasthan": {
    demand: "Canal irrigation & rural drinking water",
    population: "8.1 Cr",
    requests: 39500,
    work: 32,
    investment: "₹41,000 Cr",
    demographics: { populationCr: 8.1, ruralPct: 75, urbanPct: 25, literacyPct: 66.1, gdpPerCapitaRs: 135000, sexRatio: 928, infantMortalityRate: 35 },
    investmentPlan: { plannedCr: 41000, allocatedCr: 27000, utilizationPct: 65, keyProjects: ["Eastern Rajasthan Canal Project (ERCP)","Solar Corridor Pokhran","Jaipur Ring Road Phase 2"] },
    infrastructure: { roadDensityKmPerLakh: 1650, puccaRoadPct: 62, drinkingWaterCovPct: 48, sewerCovPct: 35, powerUptimePct: 79, schoolsPer1000: 4.8, hospitalsPer1000: 0.52, deficitScore: 64 },
    schemes: { activeCount: 27, completedCount: 11, completionPct: 40, flagship: ["Chiranjeevi Health Scheme","Jal Jeevan Mission Deserts","Kisan Urja Mitra"] },
    districts: { total: 50, criticalCount: 18, mostAffected: "Barmer", avgDevIndex: 0.49 },
    scoreBreakdown: { citizenRequestScore: 79, populationAdjustedDemand: 72, infrastructureDeficit: 64, urgency: 82, existingInfrastructure: 32, alreadyPlannedInvestment: 30 },
    demandScore: 78
  },
  "Tamil Nadu": {
    demand: "Water management & industrial corridors",
    population: "7.7 Cr",
    requests: 38200,
    work: 45,
    investment: "₹48,000 Cr",
    demographics: { populationCr: 7.7, ruralPct: 51, urbanPct: 49, literacyPct: 80.1, gdpPerCapitaRs: 242000, sexRatio: 996, infantMortalityRate: 15 },
    investmentPlan: { plannedCr: 48000, allocatedCr: 36000, utilizationPct: 75, keyProjects: ["Chennai Metro Phase 2","Cauvery-Gundar River Link","Hosur Tech Corridor"] },
    infrastructure: { roadDensityKmPerLakh: 2750, puccaRoadPct: 82, drinkingWaterCovPct: 78, sewerCovPct: 66, powerUptimePct: 91, schoolsPer1000: 6.2, hospitalsPer1000: 1.15, deficitScore: 42 },
    schemes: { activeCount: 31, completedCount: 16, completionPct: 51, flagship: ["Makkalai Thedi Maruthuvam","Singara Chennai 2.0","Rural Water Desalination"] },
    districts: { total: 38, criticalCount: 8, mostAffected: "Ramanathapuram", avgDevIndex: 0.68 },
    scoreBreakdown: { citizenRequestScore: 76, populationAdjustedDemand: 55, infrastructureDeficit: 42, urgency: 68, existingInfrastructure: 45, alreadyPlannedInvestment: 38 },
    demandScore: 68
  },
  "West Bengal": {
    demand: "Flood embankment & urban drainage",
    population: "10.3 Cr",
    requests: 36700,
    work: 34,
    investment: "₹39,000 Cr",
    demographics: { populationCr: 10.3, ruralPct: 68, urbanPct: 32, literacyPct: 76.3, gdpPerCapitaRs: 121000, sexRatio: 950, infantMortalityRate: 22 },
    investmentPlan: { plannedCr: 39000, allocatedCr: 25350, utilizationPct: 65, keyProjects: ["Ghatal Master Plan (Flood Control)","Kolkata Green Line Metro","Tajpur Deep Sea Port Corridor"] },
    infrastructure: { roadDensityKmPerLakh: 1820, puccaRoadPct: 61, drinkingWaterCovPct: 58, sewerCovPct: 44, powerUptimePct: 82, schoolsPer1000: 5.0, hospitalsPer1000: 0.68, deficitScore: 58 },
    schemes: { activeCount: 28, completedCount: 12, completionPct: 43, flagship: ["Pathashree Road Scheme","Banglar Awas","Jal Swapna Clean Water"] },
    districts: { total: 23, criticalCount: 9, mostAffected: "Murshidabad", avgDevIndex: 0.52 },
    scoreBreakdown: { citizenRequestScore: 74, populationAdjustedDemand: 69, infrastructureDeficit: 58, urgency: 74, existingInfrastructure: 34, alreadyPlannedInvestment: 29 },
    demandScore: 73
  },
  "Madhya Pradesh": {
    demand: "Tribal road connectivity & public healthcare",
    population: "8.5 Cr",
    requests: 33400,
    work: 39,
    investment: "₹44,000 Cr",
    demographics: { populationCr: 8.5, ruralPct: 72, urbanPct: 28, literacyPct: 69.3, gdpPerCapitaRs: 124000, sexRatio: 931, infantMortalityRate: 46 },
    investmentPlan: { plannedCr: 44000, allocatedCr: 30800, utilizationPct: 70, keyProjects: ["Narmada Pragati Path","Chambal Expressway","AIIMS Bhopal Expansion"] },
    infrastructure: { roadDensityKmPerLakh: 1450, puccaRoadPct: 58, drinkingWaterCovPct: 54, sewerCovPct: 36, powerUptimePct: 80, schoolsPer1000: 4.9, hospitalsPer1000: 0.44, deficitScore: 61 },
    schemes: { activeCount: 25, completedCount: 10, completionPct: 40, flagship: ["Ladli Behna Empowerment","Jal Jeevan Malwa","Tribal Hostel Modernisation"] },
    districts: { total: 55, criticalCount: 16, mostAffected: "Alirajpur", avgDevIndex: 0.48 },
    scoreBreakdown: { citizenRequestScore: 67, populationAdjustedDemand: 66, infrastructureDeficit: 61, urgency: 72, existingInfrastructure: 39, alreadyPlannedInvestment: 31 },
    demandScore: 71
  },
  "Kerala": {
    demand: "Coastal protection & waste processing",
    population: "3.5 Cr",
    requests: 22100,
    work: 64,
    investment: "₹24,000 Cr",
    demographics: { populationCr: 3.5, ruralPct: 52, urbanPct: 48, literacyPct: 94.0, gdpPerCapitaRs: 245000, sexRatio: 1084, infantMortalityRate: 6 },
    investmentPlan: { plannedCr: 24000, allocatedCr: 19200, utilizationPct: 80, keyProjects: ["SilverLine High Speed Feasibility","Coastal Sea Wall Geotextiles","Vizhinjam Port Connectivity"] },
    infrastructure: { roadDensityKmPerLakh: 5200, puccaRoadPct: 91, drinkingWaterCovPct: 82, sewerCovPct: 71, powerUptimePct: 94, schoolsPer1000: 7.8, hospitalsPer1000: 1.95, deficitScore: 28 },
    schemes: { activeCount: 22, completedCount: 15, completionPct: 68, flagship: ["Aardram Health Mission","LIFE Housing Mission","K-FON Free Internet"] },
    districts: { total: 14, criticalCount: 2, mostAffected: "Wayanad", avgDevIndex: 0.79 },
    scoreBreakdown: { citizenRequestScore: 44, populationAdjustedDemand: 28, infrastructureDeficit: 28, urgency: 50, existingInfrastructure: 64, alreadyPlannedInvestment: 32 },
    demandScore: 41
  },
  "Telangana": {
    demand: "Urban flyovers & drinking water pipeline",
    population: "3.9 Cr",
    requests: 28900,
    work: 52,
    investment: "₹37,000 Cr",
    demographics: { populationCr: 3.9, ruralPct: 61, urbanPct: 39, literacyPct: 72.8, gdpPerCapitaRs: 312000, sexRatio: 988, infantMortalityRate: 23 },
    investmentPlan: { plannedCr: 37000, allocatedCr: 29600, utilizationPct: 80, keyProjects: ["Regional Ring Road (RRR)","Mission Bhagiratha Water Network","Hyderabad Pharma City Transit"] },
    infrastructure: { roadDensityKmPerLakh: 2350, puccaRoadPct: 76, drinkingWaterCovPct: 86, sewerCovPct: 64, powerUptimePct: 93, schoolsPer1000: 5.4, hospitalsPer1000: 0.88, deficitScore: 39 },
    schemes: { activeCount: 25, completedCount: 14, completionPct: 56, flagship: ["Mission Kakatiya Tank Rejuvenation","Mana Ooru Mana Badi","Rythu Bandhu Infrastructure"] },
    districts: { total: 33, criticalCount: 6, mostAffected: "Kumuram Bheem Asifabad", avgDevIndex: 0.65 },
    scoreBreakdown: { citizenRequestScore: 58, populationAdjustedDemand: 46, infrastructureDeficit: 39, urgency: 62, existingInfrastructure: 52, alreadyPlannedInvestment: 36 },
    demandScore: 58
  },
  "Andhra Pradesh": {
    demand: "Port connectivity & highway expansion",
    population: "5.3 Cr",
    requests: 29800,
    work: 41,
    investment: "₹43,000 Cr",
    demographics: { populationCr: 5.3, ruralPct: 70, urbanPct: 30, literacyPct: 67.4, gdpPerCapitaRs: 219000, sexRatio: 993, infantMortalityRate: 26 },
    investmentPlan: { plannedCr: 43000, allocatedCr: 30100, utilizationPct: 70, keyProjects: ["Bhogapuram International Airport","Machilipatnam Deep Sea Port","Polavaram Irrigation Link"] },
    infrastructure: { roadDensityKmPerLakh: 1980, puccaRoadPct: 70, drinkingWaterCovPct: 71, sewerCovPct: 49, powerUptimePct: 86, schoolsPer1000: 5.2, hospitalsPer1000: 0.79, deficitScore: 48 },
    schemes: { activeCount: 24, completedCount: 11, completionPct: 45, flagship: ["Nadu-Nedu School Modernisation","YSR Jalakala Borewells","Coastal Corridor Highway"] },
    districts: { total: 26, criticalCount: 7, mostAffected: "Alluri Sitharama Raju", avgDevIndex: 0.58 },
    scoreBreakdown: { citizenRequestScore: 60, populationAdjustedDemand: 52, infrastructureDeficit: 48, urgency: 66, existingInfrastructure: 41, alreadyPlannedInvestment: 34 },
    demandScore: 63
  },
  "Haryana": {
    demand: "Industrial waste treatment & storm drains",
    population: "2.9 Cr",
    requests: 26400,
    work: 55,
    investment: "₹31,000 Cr",
    demographics: { populationCr: 2.9, ruralPct: 65, urbanPct: 35, literacyPct: 75.5, gdpPerCapitaRs: 296000, sexRatio: 879, infantMortalityRate: 28 },
    investmentPlan: { plannedCr: 31000, allocatedCr: 24800, utilizationPct: 80, keyProjects: ["Kundli-Manesar-Palwal Expressway Upgrades","Faridabad-Noida Direct Corridor","Hissar Aviation Hub"] },
    infrastructure: { roadDensityKmPerLakh: 2600, puccaRoadPct: 88, drinkingWaterCovPct: 85, sewerCovPct: 74, powerUptimePct: 91, schoolsPer1000: 5.7, hospitalsPer1000: 0.82, deficitScore: 35 },
    schemes: { activeCount: 21, completedCount: 13, completionPct: 61, flagship: ["Mera Pani Meri Virasat","Kisan Mitra Solar Grids","Clean Yamuna Industrial Plan"] },
    districts: { total: 22, criticalCount: 4, mostAffected: "Nuh", avgDevIndex: 0.67 },
    scoreBreakdown: { citizenRequestScore: 53, populationAdjustedDemand: 36, infrastructureDeficit: 35, urgency: 58, existingInfrastructure: 55, alreadyPlannedInvestment: 32 },
    demandScore: 52
  },
  "Punjab": {
    demand: "Canal rejuvenation & stubble management",
    population: "3.0 Cr",
    requests: 25100,
    work: 48,
    investment: "₹28,000 Cr",
    demographics: { populationCr: 3.0, ruralPct: 62, urbanPct: 38, literacyPct: 75.8, gdpPerCapitaRs: 173000, sexRatio: 895, infantMortalityRate: 23 },
    investmentPlan: { plannedCr: 28000, allocatedCr: 19600, utilizationPct: 70, keyProjects: ["Sirhind Feeder Canal Relining","Ludhiana Clean Buddha Nullah","Amritsar-Katra Expressway Link"] },
    infrastructure: { roadDensityKmPerLakh: 2890, puccaRoadPct: 92, drinkingWaterCovPct: 81, sewerCovPct: 69, powerUptimePct: 89, schoolsPer1000: 5.9, hospitalsPer1000: 0.85, deficitScore: 38 },
    schemes: { activeCount: 20, completedCount: 11, completionPct: 55, flagship: ["Aam Aadmi Clinics","Pani Bachao Paisa Kamao","Bio-CNG Plants for Straw"] },
    districts: { total: 23, criticalCount: 5, mostAffected: "Fazilka", avgDevIndex: 0.64 },
    scoreBreakdown: { citizenRequestScore: 50, populationAdjustedDemand: 38, infrastructureDeficit: 38, urgency: 60, existingInfrastructure: 48, alreadyPlannedInvestment: 29 },
    demandScore: 54
  },
  "Odisha": {
    demand: "Cyclone resilient housing & rural electrification",
    population: "4.6 Cr",
    requests: 31200,
    work: 46,
    investment: "₹36,000 Cr",
    demographics: { populationCr: 4.6, ruralPct: 83, urbanPct: 17, literacyPct: 72.9, gdpPerCapitaRs: 148000, sexRatio: 979, infantMortalityRate: 36 },
    investmentPlan: { plannedCr: 36000, allocatedCr: 27000, utilizationPct: 75, keyProjects: ["Coastal Highway Gopalpur-Digha","Puri Heritage Corridor","Mahanadi River Basin Barrage"] },
    infrastructure: { roadDensityKmPerLakh: 1780, puccaRoadPct: 64, drinkingWaterCovPct: 62, sewerCovPct: 38, powerUptimePct: 81, schoolsPer1000: 5.3, hospitalsPer1000: 0.65, deficitScore: 56 },
    schemes: { activeCount: 26, completedCount: 13, completionPct: 50, flagship: ["Biju Pucca Ghar Yojana","Mo School Transformation","Drink from Tap Sujal"] },
    districts: { total: 30, criticalCount: 11, mostAffected: "Kalahandi", avgDevIndex: 0.51 },
    scoreBreakdown: { citizenRequestScore: 62, populationAdjustedDemand: 64, infrastructureDeficit: 56, urgency: 72, existingInfrastructure: 46, alreadyPlannedInvestment: 31 },
    demandScore: 69
  },
  "Assam": {
    demand: "Brahmaputra flood control & highway bridges",
    population: "3.6 Cr",
    requests: 27800,
    work: 35,
    investment: "₹33,000 Cr",
    demographics: { populationCr: 3.6, ruralPct: 86, urbanPct: 14, literacyPct: 72.2, gdpPerCapitaRs: 102000, sexRatio: 958, infantMortalityRate: 38 },
    investmentPlan: { plannedCr: 33000, allocatedCr: 21450, utilizationPct: 65, keyProjects: ["Dhubri-Phulbari Brahmaputra Bridge","Guwahati Ring Road Expressway","Majuli Island Geo-Bag Embankment"] },
    infrastructure: { roadDensityKmPerLakh: 1620, puccaRoadPct: 52, drinkingWaterCovPct: 49, sewerCovPct: 29, powerUptimePct: 75, schoolsPer1000: 5.1, hospitalsPer1000: 0.48, deficitScore: 68 },
    schemes: { activeCount: 23, completedCount: 9, completionPct: 39, flagship: ["Asom Mala Road Network","Orunodoi Financial Security","Jal Jeevan Hills Mission"] },
    districts: { total: 31, criticalCount: 12, mostAffected: "Dhemaji", avgDevIndex: 0.46 },
    scoreBreakdown: { citizenRequestScore: 56, populationAdjustedDemand: 67, infrastructureDeficit: 68, urgency: 79, existingInfrastructure: 35, alreadyPlannedInvestment: 26 },
    demandScore: 75
  },
  "Jharkhand": {
    demand: "Mining area rehabilitation & clean drinking water",
    population: "3.9 Cr",
    requests: 28500,
    work: 31,
    investment: "₹30,000 Cr",
    demographics: { populationCr: 3.9, ruralPct: 76, urbanPct: 24, literacyPct: 66.4, gdpPerCapitaRs: 88500, sexRatio: 948, infantMortalityRate: 34 },
    investmentPlan: { plannedCr: 30000, allocatedCr: 18000, utilizationPct: 60, keyProjects: ["Dhanbad Coalfield Underground Fire Containment","Subarnarekha Multi-Purpose Project","Ranchi Smart Ring Road"] },
    infrastructure: { roadDensityKmPerLakh: 1350, puccaRoadPct: 53, drinkingWaterCovPct: 46, sewerCovPct: 28, powerUptimePct: 72, schoolsPer1000: 4.6, hospitalsPer1000: 0.38, deficitScore: 71 },
    schemes: { activeCount: 22, completedCount: 8, completionPct: 36, flagship: ["Birsa Harit Gram Yojana","Nilamber Pitamber Jal Samridhi","Aapki Yojana Aapki Sarkar"] },
    districts: { total: 24, criticalCount: 11, mostAffected: "Pakur", avgDevIndex: 0.43 },
    scoreBreakdown: { citizenRequestScore: 57, populationAdjustedDemand: 68, infrastructureDeficit: 71, urgency: 81, existingInfrastructure: 31, alreadyPlannedInvestment: 24 },
    demandScore: 77
  }
};

const stateNameAliases = {
  "NCT of Delhi": "Delhi",
  "National Capital Territory of Delhi": "Delhi",
  "AndhraPradesh": "Andhra Pradesh",
  "WestBengal": "West Bengal",
  "UttarPradesh": "Uttar Pradesh",
  "MadhyaPradesh": "Madhya Pradesh",
  "TamilNadu": "Tamil Nadu",
  "HimachalPradesh": "Himachal Pradesh",
  "Jammu & Kashmir": "Jammu and Kashmir"
};

const demandEntries = Object.entries(DEMANDS);
const maxRequests = Math.max(...demandEntries.map(([, item]) => item.requests));
const minRequests = Math.min(...demandEntries.map(([, item]) => item.requests));

const map = L.map("map", {
  zoomControl: true,
  attributionControl: false,
  zoomSnap: 0.25,
  minZoom: 3,
  maxZoom: 8
});

let indiaLayer;
let highlightedLayers = [];

function getStateName(feature) {
  const p = feature.properties || {};
  const candidates = [p.st_nm, p.ST_NM, p.state, p.State, p.STATE, p.NAME_1, p.name, p.NAME];
  for (const candidate of candidates) {
    if (candidate) {
      const trimmed = candidate.trim();
      return stateNameAliases[trimmed] || trimmed;
    }
  }
  return "";
}

function demandColor(requests) {
  if (!requests) return "#e8edf3";
  const ratio = (requests - minRequests) / Math.max(1, maxRequests - minRequests);
  const colors = ["#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#991b1b"];
  const index = Math.min(colors.length - 1, Math.floor(ratio * colors.length));
  return colors[index];
}

function demandLevel(requests) {
  if (requests >= 38000) return "VERY HIGH";
  if (requests >= 30000) return "HIGH";
  if (requests >= 20000) return "MEDIUM";
  return "LOW";
}

function styleFeature(feature) {
  const state = getStateName(feature);
  const data = DEMANDS[state];
  return {
    fillColor: data ? demandColor(data.requests) : "#e2e8f0",
    fillOpacity: data ? 0.88 : 0.65,
    color: "#ffffff",
    weight: data ? 1.0 : 0.6,
    opacity: 1
  };
}

function highlightState(stateName) {
  resetStateHighlight();
  if (!indiaLayer) return;
  indiaLayer.eachLayer(layer => {
    if (getStateName(layer.feature) === stateName) {
      layer.setStyle({ weight: 2.2, color: "#7f1d1d", fillOpacity: 0.96 });
      if (layer.bringToFront) layer.bringToFront();
      highlightedLayers.push(layer);
    }
  });
}

function resetStateHighlight() {
  highlightedLayers.forEach(l => {
    if (l && l.feature) l.setStyle(styleFeature(l.feature));
  });
  highlightedLayers = [];
}

function positionTooltip(e) {
  const tip = document.getElementById("state-tooltip");
  if (!tip || !tip.classList.contains("visible")) return;

  const clientX = e?.originalEvent ? e.originalEvent.clientX : (e?.clientX !== undefined ? e.clientX : null);
  const clientY = e?.originalEvent ? e.originalEvent.clientY : (e?.clientY !== undefined ? e.clientY : null);

  if (clientX === null || clientY === null) return;

  const tipWidth = tip.offsetWidth || 315;
  const tipHeight = tip.offsetHeight || 420;
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;

  // Increased distance to the left of the cursor
  const offset = 38;

  // Position to the left of the mouse cursor
  let left = clientX - tipWidth - offset;

  // If approaching the left edge of the screen, only flip if the cursor is at the far left edge of the window
  if (left < 10) {
    if (clientX < 180) {
      left = clientX + offset;
    } else {
      left = 10;
    }
  }

  // Vertical: align smoothly near cursor level
  let top = clientY - 24;
  if (top + tipHeight > winHeight - 12) {
    top = winHeight - tipHeight - 12;
  }
  if (top < 12) top = 12;

  tip.style.left = left + "px";
  tip.style.top = top + "px";
  tip.style.right = "auto";
  tip.style.bottom = "auto";
}

function showTooltip(stateName, e = null) {
  cancelHideTooltip();
  const data = DEMANDS[stateName];
  if (!data) {
    hideTooltip();
    return;
  }

  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setT("tip-state", stateName);
  setT("tip-demand", data.demand);
  setT("tip-population", data.population);
  setT("tip-requests", data.requests.toLocaleString("en-IN"));
  setT("tip-work", data.work + "%");
  setT("tip-investment", data.investment);
  setT("tip-progress", data.work + "%");
  setT("tip-level", demandLevel(data.requests));

  const bar = document.getElementById("tip-progress-bar");
  if (bar) bar.style.width = data.work + "%";

  const sb = data.scoreBreakdown || {};
  const dm = data.demographics || {};
  const inv = data.investmentPlan || {};
  const inf = data.infrastructure || {};
  const sc = data.schemes || {};
  const di = data.districts || {};

  const scoreEl = document.getElementById("tip-demand-score");
  if (scoreEl) {
    scoreEl.innerHTML = `
      <div style="margin-top:8px;border-top:1px solid #e5eaf3;padding-top:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <span style="font-size:10px;font-weight:700;color:#5a6a82;text-transform:uppercase;letter-spacing:.5px;">Demand Score</span>
          <span style="font-size:16px;font-weight:900;color:${data.demandScore >= 70 ? '#dc2626' : data.demandScore >= 50 ? '#ea580c' : '#16a34a'}">${data.demandScore}<span style="font-size:10px;color:#8491a2;">/100</span></span>
        </div>
        <div style="background:#f1f5f9;border-radius:8px;height:6px;overflow:hidden;margin-bottom:8px;">
          <div style="height:100%;width:${data.demandScore}%;background:${data.demandScore >= 70 ? '#dc2626' : data.demandScore >= 50 ? '#ea580c' : '#16a34a'};border-radius:8px;transition:width .3s;"></div>
        </div>
        <div style="font-size:9px;color:#64748b;margin-bottom:3px;font-weight:600;">Score Breakdown:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 8px;font-size:9.5px;color:#64748b;">
          <span>+ Citizen Requests</span><span style="color:#172b45;font-weight:700;text-align:right;">${sb.citizenRequestScore || 0}</span>
          <span>+ Pop. Demand</span><span style="color:#172b45;font-weight:700;text-align:right;">${sb.populationAdjustedDemand || 0}</span>
          <span>+ Infra Deficit</span><span style="color:#172b45;font-weight:700;text-align:right;">${sb.infrastructureDeficit || 0}</span>
          <span>+ Urgency</span><span style="color:#172b45;font-weight:700;text-align:right;">${sb.urgency || 0}</span>
          <span style="color:#16a34a;">− Existing Infra</span><span style="color:#16a34a;font-weight:700;text-align:right;">${sb.existingInfrastructure || 0}</span>
          <span style="color:#16a34a;">− Planned Invest.</span><span style="color:#16a34a;font-weight:700;text-align:right;">${sb.alreadyPlannedInvestment || 0}</span>
        </div>
      </div>
      <div style="margin-top:8px;border-top:1px solid #e5eaf3;padding-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:9.5px;">
        <div><span style="color:#8491a2;">Literacy</span><br><strong>${dm.literacyPct || '—'}%</strong></div>
        <div><span style="color:#8491a2;">GDP/Capita</span><br><strong>₹${dm.gdpPerCapitaRs ? dm.gdpPerCapitaRs.toLocaleString('en-IN') : '—'}</strong></div>
        <div><span style="color:#8491a2;">Water Cover</span><br><strong>${inf.drinkingWaterCovPct || '—'}%</strong></div>
        <div><span style="color:#8491a2;">Power Uptime</span><br><strong>${inf.powerUptimePct || '—'}%</strong></div>
        <div><span style="color:#8491a2;">Active Schemes</span><br><strong>${sc.activeCount || '—'}</strong></div>
        <div><span style="color:#8491a2;">Districts</span><br><strong>${di.total || '—'} (${di.criticalCount || 0} critical)</strong></div>
      </div>
      ${inv.keyProjects ? `<div style="margin-top:6px;border-top:1px solid #e5eaf3;padding-top:5px;"><div style="font-size:9.5px;color:#64748b;font-weight:600;margin-bottom:2px;">Key Projects:</div>${inv.keyProjects.map(p => `<div style="font-size:9px;color:#172b45;padding:1px 0;">• ${p}</div>`).join('')}</div>` : ''}
    `;
  }

  const tip = document.getElementById("state-tooltip");
  if (tip) {
    tip.classList.add("visible");
    if (e) {
      positionTooltip(e);
      requestAnimationFrame(() => positionTooltip(e));
    }
  }
  highlightState(stateName);
  
  document.querySelectorAll(".state-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.state === stateName);
  });
}

let hideTimeout = null;

function cancelHideTooltip() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

function scheduleHideTooltip(delay = 40) {
  cancelHideTooltip();
  hideTimeout = setTimeout(() => {
    hideTooltip();
  }, delay);
}

function hideTooltip() {
  cancelHideTooltip();
  const tip = document.getElementById("state-tooltip");
  if (tip) {
    tip.classList.remove("visible");
  }
  resetStateHighlight();
  document.querySelectorAll(".state-item").forEach((item) => {
    item.classList.remove("active");
  });
}

function zoomToState(stateName) {
  if (!indiaLayer) return;
  const bounds = L.latLngBounds([]);
  let found = false;
  indiaLayer.eachLayer((layer) => {
    const name = getStateName(layer.feature);
    if (name === stateName) {
      bounds.extend(layer.getBounds());
      found = true;
    }
  });
  if (found && bounds.isValid()) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6, animate: true });
    highlightState(stateName);
  }
}

function buildStateList() {
  const list = document.getElementById("state-list");
  if(!list) return;
  list.innerHTML = '';
  const sorted = [...demandEntries].sort((a, b) => b[1].requests - a[1].requests);
  sorted.forEach(([name, data]) => {
    const item = document.createElement("div");
    item.className = "state-item";
    item.dataset.state = name;
    const width = Math.round((data.requests / maxRequests) * 100);
    item.innerHTML = `
      <div class="state-row">
        <div class="state-name">
          <span class="state-dot" style="background:${demandColor(data.requests)}"></span>
          ${name}
        </div>
        <span class="level-pill">${demandLevel(data.requests)}</span>
      </div>
      <div class="state-demand">${data.demand}</div>
      <div class="mini-stats">
        <div><span>Requests</span><strong>${data.requests.toLocaleString("en-IN")}</strong></div>
        <div><span>Work done</span><strong>${data.work}%</strong></div>
        <div><span>Population</span><strong>${data.population}</strong></div>
      </div>
      <div class="state-bar"><div style="width:${width}%"></div></div>
    `;
    item.addEventListener("mouseenter", (e) => showTooltip(name, e));
    item.addEventListener("mousemove", (e) => positionTooltip(e));
    item.addEventListener("mouseleave", () => hideTooltip());
    item.addEventListener("click", () => zoomToState(name));
    list.appendChild(item);
  });
}

function updateOverview() {
  const totalRequests = demandEntries.reduce((sum, [, item]) => sum + item.requests, 0);
  const averageWork = Math.round(demandEntries.reduce((sum, [, item]) => sum + item.work, 0) / demandEntries.length);
  const stateCountEl = document.getElementById("stateCount");
  const requestTotalEl = document.getElementById("requestTotal");
  const workAverageEl = document.getElementById("workAverage");
  
  if(stateCountEl) stateCountEl.textContent = demandEntries.length;
  if(requestTotalEl) requestTotalEl.textContent = totalRequests.toLocaleString("en-IN");
  if(workAverageEl) workAverageEl.textContent = averageWork + "%";
}

async function loadMap() {
  let geojson = null;
  
  // 1. Try local cached GeoJSON first (instant loading, offline compatible)
  try {
    const localRes = await fetch('./india.geojson');
    if (localRes.ok) geojson = await localRes.json();
  } catch(e) {}

  // 2. Fallback to jsdelivr CDN if local fetch failed
  if (!geojson) {
    try {
      const response = await fetch("https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@main/geojson/india.geojson");
      if (response.ok) geojson = await response.json();
    } catch (e) {}
  }

  if (geojson) {
    indiaLayer = L.geoJSON(geojson, {
      style: styleFeature,
      onEachFeature: (feature, layer) => {
        const stateName = getStateName(feature);
        layer.on({
          mouseover: (e) => { 
            cancelHideTooltip();
            if (DEMANDS[stateName]) {
              showTooltip(stateName, e);
            } else {
              hideTooltip();
            }
          },
          mousemove: (e) => {
            cancelHideTooltip();
            if (DEMANDS[stateName]) {
              positionTooltip(e);
            }
          },
          mouseout: () => {
            scheduleHideTooltip(40);
          },
          click: () => { 
            if (DEMANDS[stateName]) zoomToState(stateName); 
          }
        });
      }
    }).addTo(map);

    map.on("mouseout", () => {
      hideTooltip();
    });

    map.on("mousemove", (e) => {
      if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.tagName !== 'path') {
        hideTooltip();
      }
    });

    document.addEventListener("mouseleave", () => {
      hideTooltip();
    });

    map.fitBounds(indiaLayer.getBounds(), { padding: [30, 30] });
  } else {
    const mapEl = document.getElementById("map");
    if(mapEl) mapEl.innerHTML = `
      <div style="height:100%; display:grid; place-items:center; padding:30px; text-align:center; color:#718096; font-size:13px;">
        <div>
          <strong style="display:block;color:#173b69;margin-bottom:7px">India map preview</strong>
          Interactive metrics and State Demands list are active in the sidebars.
        </div>
      </div>
    `;
  }
}

const closeBtn = document.querySelector(".close-tooltip");
if(closeBtn) {
  closeBtn.addEventListener("click", () => { hideTooltip(); });
}

buildStateList();
updateOverview();
loadMap();
