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

export type BusinessStatus = 
  | 'published' 
  | 'approved' 
  | 'pending' 
  | 'under_review' 
  | 'rejected' 
  | 'suspended' 
  | 'draft';

export interface LocalBusiness {
  id: string;
  name: string;
  category: 'restaurant' | 'cafe' | 'handicrafts' | 'guide' | 'hotel' | 'sweets' | 'attire';
  description: string;
  address: string;
  area: string;
  contactNumber: string;
  image: string;
  images?: string[];
  websiteUrl?: string;
  specialty: string;
  featured: boolean;
  status: BusinessStatus;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  partnerId?: string;
  openingHours?: string;
  priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  rejectionReason?: string;
  adminNotes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'user';
  avatar?: string;
  location?: string;
  bio?: string;
  savedBookmarkCount?: number;
  createdAt: string;
}

export interface BusinessPartnerAccount {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  phone: string;
  category: LocalBusiness['category'];
  role: 'partner';
  businessId?: string;
  createdAt: string;
}

export interface PublicSessionState {
  isAuthenticated: boolean;
  accountType: 'user' | 'partner' | null;
  user: UserAccount | null;
  partner: BusinessPartnerAccount | null;
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

export type VisitExperience = 
  | 'Solo Explorer' 
  | 'Family Trip' 
  | 'Friends Group' 
  | 'Couples & Romantic' 
  | 'Heritage Enthusiast' 
  | 'Foodie / Culinary Walk' 
  | 'Photography Tour' 
  | 'Local Resident';

export interface PlaceReview {
  id: string;
  placeId: string;
  placeName?: string;
  userName: string;
  userLocation?: string;
  rating: number; // 1 to 5
  reviewText: string;
  visitExperience?: VisitExperience;
  visitedDate?: string;
  createdAt: string;
  status: 'published' | 'hidden' | 'pending';
  helpfulVotes?: number;
}

export type PlatformFeedbackCategory = 
  | 'overall' 
  | 'navigation' 
  | 'map' 
  | 'planner' 
  | 'speed' 
  | 'content_quality' 
  | 'design_ui';

export interface PlatformFeedback {
  id: string;
  category: PlatformFeedbackCategory;
  rating: number; // 1 to 5
  message: string;
  userName?: string;
  email?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export type SuggestionCategory = 
  | 'new_place' 
  | 'hidden_gem' 
  | 'new_category' 
  | 'feature_idea' 
  | 'cultural_story' 
  | 'improvement';

export interface Suggestion {
  id: string;
  category: SuggestionCategory;
  title: string;
  description: string;
  locationArea?: string;
  suggestedBy?: string;
  contactEmail?: string;
  createdAt: string;
  status: 'pending' | 'under_review' | 'planned' | 'implemented' | 'archived';
}

export type IssueReportType = 
  | 'incorrect_timing' 
  | 'wrong_location' 
  | 'incorrect_pricing' 
  | 'outdated_info' 
  | 'broken_image_link' 
  | 'safety_concern' 
  | 'other';

export interface IssueReport {
  id: string;
  placeId?: string;
  placeName?: string;
  issueType: IssueReportType;
  description: string;
  reportedBy?: string;
  contactEmail?: string;
  createdAt: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  adminNotes?: string;
}

export interface ReviewFilterOptions {
  sortBy: 'recent' | 'highest' | 'lowest';
  ratingFilter: number | 'all';
}
