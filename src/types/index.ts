export type PlaceCategory = 
  | 'historical'
  | 'food'
  | 'shopping'
  | 'parks'
  | 'culture'
  | 'entertainment'
  | 'landmarks'
  | 'religious'
  | 'hidden-gems'
  | 'experiences';

export type PlaceVibe = 
  | 'Heritage'
  | 'Photography'
  | 'Peaceful'
  | 'Family'
  | 'Food'
  | 'Shopping'
  | 'Culture'
  | 'Entertainment'
  | 'Outdoor'
  | 'Sunset'
  | 'Budget Friendly'
  | 'Hidden Gem'
  | 'Architecture'
  | 'Romantic'
  | 'Nightlife'
  | 'Spiritual';

export type BestTimeToVisit = 'Morning' | 'Afternoon' | 'Evening' | 'Sunset' | 'Night' | 'Any Time';

export interface Place {
  id: string;
  name: string;
  slug: string;
  hindiName?: string;
  shortDescription: string;
  description: string;
  story: string;
  whyVisit: string[];
  
  category: PlaceCategory;
  subCategory?: string;
  vibes: PlaceVibe[];
  
  coverImage: string;
  galleryImages: string[];
  imageCredits?: string;
  
  address: string;
  area: string; // e.g. "Hussainabad", "Hazratganj", "Gomti Nagar", "Chowk"
  latitude: number;
  longitude: number;
  
  openingTime: string; // e.g. "06:00 AM"
  closingTime: string; // e.g. "06:00 PM"
  entryFee: string; // e.g. "₹50 (Indians), ₹500 (Foreigners)", "Free"
  estimatedBudget: number; // in INR per person
  bestTime: BestTimeToVisit;
  recommendedDuration: string; // e.g. "2-3 Hours", "1 Hour"
  
  howToReach: {
    nearestMetro?: string;
    busRoute?: string;
    autoCabTips?: string;
    parking?: string;
  };
  nearbyPlaceIds?: string[];
  
  featured: boolean;
  hiddenGem: boolean;
  status: 'published' | 'draft' | 'archived';
  
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: PlaceCategory;
  name: string;
  hindiName?: string;
  description: string;
  iconName: string;
  image: string;
  featuredOrder: number;
  enabled: boolean;
}

export interface VibeInfo {
  id: string;
  name: PlaceVibe;
  description: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  coverImage?: string;
}

export interface LocalBusiness {
  id: string;
  name: string;
  category: 'restaurant' | 'cafe' | 'handicrafts' | 'guide' | 'hotel' | 'sweets' | 'attire';
  description: string;
  address: string;
  area: string;
  contactNumber: string;
  image: string;
  websiteUrl?: string;
  specialty: string;
  featured: boolean;
  status: 'published' | 'draft';
  createdAt: string;
}

export interface EmergencyService {
  id: string;
  serviceName: string;
  number: string;
  description: string;
  category: 'police' | 'medical' | 'fire' | 'women' | 'tourist' | 'child' | 'helpline';
  availability: string; // e.g. "24x7"
  address?: string;
  officialSource?: string;
  enabled: boolean;
  displayOrder: number;
}

export interface SiteStats {
  totalVisitors: number;
  todayVisitors: number;
  monthVisitors: number;
  totalSavedItineraries: number;
}

export interface DayPlanRequest {
  durationHours: number;
  budgetPerPerson: number;
  vibes: PlaceVibe[];
  categories: PlaceCategory[];
  startTiming: 'morning' | 'afternoon' | 'evening';
  pace: 'relaxed' | 'moderate' | 'packed';
}

export interface ItineraryStop {
  timeSlot: string;
  place: Place;
  activityHint: string;
  estimatedExpense: number;
  durationMins: number;
  travelTips?: string;
}

export interface ItineraryResult {
  id: string;
  title: string;
  totalBudget: number;
  totalDurationHours: number;
  stops: ItineraryStop[];
  summary: string;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  category: PlaceCategory | 'all';
  vibe: PlaceVibe | 'all';
  budgetMax: number;
  duration: 'all' | '1hr' | '2-3hrs' | 'half-day' | 'full-day';
  bestTime: BestTimeToVisit | 'all';
  area: string | 'all';
  onlyFeatured: boolean;
  onlyHiddenGems: boolean;
  sortBy: 'featured' | 'name' | 'budget-asc' | 'budget-desc' | 'newest';
}
