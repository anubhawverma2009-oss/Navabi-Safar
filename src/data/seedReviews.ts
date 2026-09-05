import { PlaceReview, PlatformFeedback, Suggestion, IssueReport } from '../types';

export const INITIAL_PLACE_REVIEWS: PlaceReview[] = [
  {
    id: 'rev-bara-1',
    placeId: 'bara-imambara',
    placeName: 'Bara Imambara & Bhool Bhulaiya',
    userName: 'Aarav Sharma',
    userLocation: 'Delhi',
    rating: 5,
    reviewText: 'A breathtaking masterpiece of Awadhi engineering! The acoustic whispering galleries in the Bhool Bhulaiya are mind-bending. Make sure to hire an authorized local guide at the entrance to hear the historical tales of Nawab Asaf-ud-Daula.',
    visitExperience: 'Heritage Enthusiast',
    visitedDate: '2026-02-15',
    createdAt: '2026-02-16T10:30:00Z',
    status: 'published',
    helpfulVotes: 24
  },
  {
    id: 'rev-bara-2',
    placeId: 'bara-imambara',
    placeName: 'Bara Imambara & Bhool Bhulaiya',
    userName: 'Fatima Zohra',
    userLocation: 'Lucknow Resident',
    rating: 5,
    reviewText: 'As a local, I visit every monsoon. The view of Rumi Darwaza and the Husainabad clock tower from the roof of the labyrinth at sunset is unmatchable. The pillarless central hall leaves you in awe.',
    visitExperience: 'Photography Tour',
    visitedDate: '2026-02-10',
    createdAt: '2026-02-11T14:15:00Z',
    status: 'published',
    helpfulVotes: 18
  },
  {
    id: 'rev-bara-3',
    placeId: 'bara-imambara',
    placeName: 'Bara Imambara & Bhool Bhulaiya',
    userName: 'Rohan Mehra',
    userLocation: 'Mumbai',
    rating: 4,
    reviewText: 'Incredible monument. Wear comfortable slip-off shoes as you have to leave them at the counter. The Shahi Baoli stepwell on the right side is equally fascinating and often overlooked by tourists.',
    visitExperience: 'Family Trip',
    visitedDate: '2026-01-28',
    createdAt: '2026-01-29T09:45:00Z',
    status: 'published',
    helpfulVotes: 12
  },
  {
    id: 'rev-tunday-1',
    placeId: 'tunday-kababi-chowk',
    placeName: 'Tunday Kababi (Original Chowk Branch)',
    userName: 'Kabir Verma',
    userLocation: 'Bengaluru',
    rating: 5,
    reviewText: 'The Galawati kababs with Ulte Tawe Ka Paratha literally melt on your tongue. The secret blend of 160+ spices is not a myth. Head to the original Chowk branch in the evening for the most authentic Awadhi atmosphere.',
    visitExperience: 'Foodie / Culinary Walk',
    visitedDate: '2026-02-18',
    createdAt: '2026-02-19T18:00:00Z',
    status: 'published',
    helpfulVotes: 35
  },
  {
    id: 'rev-tunday-2',
    placeId: 'tunday-kababi-chowk',
    placeName: 'Tunday Kababi (Original Chowk Branch)',
    userName: 'Pooja Nair',
    userLocation: 'Kolkata',
    rating: 5,
    reviewText: 'Worth every bit of the hype. The narrow Chowk alleyway can get crowded, but the speed of service and the legendary taste make it an unforgettable culinary pilgrimage.',
    visitExperience: 'Friends Group',
    visitedDate: '2026-02-05',
    createdAt: '2026-02-06T12:20:00Z',
    status: 'published',
    helpfulVotes: 15
  },
  {
    id: 'rev-chota-1',
    placeId: 'chota-imambara',
    placeName: 'Chota Imambara (Palace of Lights)',
    userName: 'Vikramaditya Rao',
    userLocation: 'Hyderabad',
    rating: 5,
    reviewText: 'The Belgian crystal chandeliers and ornate Arabic calligraphy are magnificent. It feels much more intimate and spiritually serene than the grander Bara Imambara. Do not miss the silver pulpit.',
    visitExperience: 'Couples & Romantic',
    visitedDate: '2026-02-12',
    createdAt: '2026-02-13T11:00:00Z',
    status: 'published',
    helpfulVotes: 14
  },
  {
    id: 'rev-residency-1',
    placeId: 'the-british-residency',
    placeName: 'The British Residency',
    userName: 'Meera Sengupta',
    userLocation: 'Pune',
    rating: 5,
    reviewText: 'One of the most evocative historical sites in India. The cannonball marks on the brick ruins tell poignant stories of the 1857 Siege. The museum in the basement has exceptional archival models and oil paintings.',
    visitExperience: 'Solo Explorer',
    visitedDate: '2026-02-14',
    createdAt: '2026-02-15T16:40:00Z',
    status: 'published',
    helpfulVotes: 21
  },
  {
    id: 'rev-hazratganj-1',
    placeId: 'hazratganj-promenade',
    placeName: 'Hazratganj & Janpath Market',
    userName: 'Sanya Mirza',
    userLocation: 'Lucknow Resident',
    rating: 5,
    reviewText: '"Ganjing" in the evening is the ultimate Lucknow tradition! The uniform Victorian-style cream facades, lovely lampposts, and century-old sweet shops make it a wonderful strolling experience.',
    visitExperience: 'Local Resident',
    visitedDate: '2026-02-20',
    createdAt: '2026-02-21T20:10:00Z',
    status: 'published',
    helpfulVotes: 19
  },
  {
    id: 'rev-janeshwar-1',
    placeId: 'janeshwar-mishra-park',
    placeName: 'Janeshwar Mishra Park',
    userName: 'Devansh Pandey',
    userLocation: 'Kanpur',
    rating: 4,
    reviewText: 'Asia’s largest city park! The sprawling water bodies with paddle boats and shaded cycling tracks are fantastic. Renting a tandem cycle in the morning was the highlight for our family.',
    visitExperience: 'Family Trip',
    visitedDate: '2026-02-08',
    createdAt: '2026-02-09T08:30:00Z',
    status: 'published',
    helpfulVotes: 11
  },
  {
    id: 'rev-rumi-1',
    placeId: 'rumi-darwaza',
    placeName: 'Rumi Darwaza (Turkish Gate)',
    userName: 'Ananya Roy',
    userLocation: 'Chandigarh',
    rating: 5,
    reviewText: 'Standing in front of the Turkish Gate at golden hour gives you goosebumps. The sheer scale and delicate plaster carvings are incredible. Best photos are taken from the Husainabad side lawn.',
    visitExperience: 'Photography Tour',
    visitedDate: '2026-02-17',
    createdAt: '2026-02-18T17:50:00Z',
    status: 'published',
    helpfulVotes: 28
  },
  {
    id: 'rev-prakash-1',
    placeId: 'prakash-kulfi-chowk',
    placeName: 'Prakash Kulfi (Aminabad & Chowk)',
    userName: 'Mohd. Tariq',
    userLocation: 'Lucknow Resident',
    rating: 5,
    reviewText: 'The pure saffron Kesar Pista Falooda Kulfi is heavenly! Rich, velvety, and served with rose syrup. It is the best dessert in North India without question.',
    visitExperience: 'Foodie / Culinary Walk',
    visitedDate: '2026-02-19',
    createdAt: '2026-02-20T21:15:00Z',
    status: 'published',
    helpfulVotes: 17
  },
  {
    id: 'rev-royal-cafe-1',
    placeId: 'royal-cafe-basket-chaat',
    placeName: 'Royal Cafe & The Famous Basket Chaat',
    userName: 'Ishaan Gupta',
    userLocation: 'Jaipur',
    rating: 4,
    reviewText: 'The huge crispy potato basket stuffed with spiced peas, pomegranate, yogurt, and chutneys is an explosion of flavours! One basket chaat is enough to fill two people.',
    visitExperience: 'Friends Group',
    visitedDate: '2026-02-02',
    createdAt: '2026-02-03T19:30:00Z',
    status: 'published',
    helpfulVotes: 13
  }
];

export const INITIAL_PLATFORM_FEEDBACK: PlatformFeedback[] = [
  {
    id: 'fb-1',
    category: 'planner',
    rating: 5,
    message: 'The "Build My Day" itinerary generator is phenomenal! It created a perfectly paced 1-day Awadhi heritage and food trail for my weekend visit to Lucknow. Saved us hours of research.',
    userName: 'Tanvi Saxena',
    email: 'tanvi.saxena@example.com',
    createdAt: '2026-02-18T11:20:00Z',
    status: 'reviewed'
  },
  {
    id: 'fb-2',
    category: 'map',
    rating: 5,
    message: 'Love the interactive Leaflet GPS map with filterable categories! The distance calculator and custom Awadhi heritage markers made navigating Chowk so much easier.',
    userName: 'Gaurav Joshi',
    email: 'gaurav.j@example.com',
    createdAt: '2026-02-14T15:40:00Z',
    status: 'reviewed'
  },
  {
    id: 'fb-3',
    category: 'design_ui',
    rating: 5,
    message: 'The Nawabi royal aesthetic with gold accents and warm parchment tones is sublime. It truly feels like an official luxury tourism portal for Awadh.',
    userName: 'Samarth Bhatnagar',
    createdAt: '2026-02-10T09:15:00Z',
    status: 'reviewed'
  }
];

export const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug-1',
    category: 'hidden_gem',
    title: 'Add Picture Gallery & Satkhanda Complex',
    description: 'The Husainabad Picture Gallery contains monumental life-size oil portraits of the Nawabs of Awadh where the eyes follow you from every angle. It sits right next to the incomplete Satkhanda minaret.',
    locationArea: 'Hussainabad',
    suggestedBy: 'Dr. Syed Masood (Historian)',
    contactEmail: 'masood.history@example.com',
    createdAt: '2026-02-15T14:30:00Z',
    status: 'planned'
  },
  {
    id: 'sug-2',
    category: 'new_place',
    title: 'Kukrail Reserve Forest & Gharial Breeding Center',
    description: 'A wonderful ecotourism spot on the outskirts of Lucknow with deer park, picnic trails, and freshwater crocodile sanctuary.',
    locationArea: 'Indira Nagar',
    suggestedBy: 'Priyanka Bajpai',
    createdAt: '2026-02-12T17:00:00Z',
    status: 'under_review'
  },
  {
    id: 'sug-3',
    category: 'feature_idea',
    title: 'Audio Guide Snippets for Historic Gates',
    description: 'Would be amazing to have short 30-second audio folklore stories embedded into the heritage monument pages for walking tours.',
    suggestedBy: 'Nitin Kapoor',
    createdAt: '2026-02-08T10:10:00Z',
    status: 'planned'
  }
];

export const INITIAL_ISSUE_REPORTS: IssueReport[] = [
  {
    id: 'rep-1',
    placeId: 'the-british-residency',
    placeName: 'The British Residency',
    issueType: 'incorrect_timing',
    description: 'The entry ticket counter closes at 5:00 PM rather than 6:00 PM during the winter months, though visitors can stay inside the garden until sunset.',
    reportedBy: 'Kunal Srivastava',
    contactEmail: 'kunal.s@example.com',
    createdAt: '2026-02-17T12:00:00Z',
    status: 'resolved',
    adminNotes: 'Timings updated in database to 07:00 AM - 05:30 PM.'
  },
  {
    id: 'rep-2',
    placeId: 'dastarkhwan-hazratganj',
    placeName: 'Dastarkhwan (Tulsi Theatre Complex)',
    issueType: 'incorrect_pricing',
    description: 'The average cost for two people is now around ₹700-₹800 due to updated menu prices.',
    reportedBy: 'Ayush Dubey',
    createdAt: '2026-02-16T19:30:00Z',
    status: 'investigating',
    adminNotes: 'Verifying with the restaurant management.'
  }
];
