import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Place, LocalBusiness, EmergencyService } from '../types';

const env = (import.meta as any).env || {};
let resolvedUrl = (env.VITE_SUPABASE_URL || '').trim();
if (!resolvedUrl && env.VITE_SUPABASE_PROJECT_ID) {
  resolvedUrl = `https://${env.VITE_SUPABASE_PROJECT_ID.trim()}.supabase.co`;
}
const supabaseUrl = resolvedUrl;
// Supports VITE_SUPABASE_PUBLISHABLE_KEY as primary, with VITE_SUPABASE_ANON_KEY as fallback
const supabaseKey = (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '').trim();

let supabaseInstance: SupabaseClient | null = null;

/**
 * Checks if Supabase credentials are valid and provided in environment variables
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl.startsWith('https://') &&
    supabaseKey.length > 20
  );
}

/**
 * Returns the active Supabase client or null if unconfigured
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (e) {
      console.warn('Supabase client initialization error:', e);
      return null;
    }
  }
  return supabaseInstance;
}

/**
 * Tests the live connection to the remote Supabase database
 */
export async function testSupabaseConnection(): Promise<{ 
  success: boolean; 
  message: string; 
  count?: number;
  code?: string;
}> {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials (VITE_SUPABASE_URL or VITE_SUPABASE_PROJECT_ID, and VITE_SUPABASE_PUBLISHABLE_KEY) are not configured in environment.'
    };
  }

  try {
    const { count, error } = await client
      .from('places')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST205') {
        return {
          success: false,
          code: 'TABLES_NOT_FOUND',
          message: `Connected to Supabase project, but database tables are not initialized yet (PGRST205: table 'public.places' not found). Run supabase_schema.sql in your Supabase SQL Editor.`
        };
      }
      return {
        success: false,
        code: error.code,
        message: `Database error: ${error.message}`
      };
    }

    return {
      success: true,
      message: `Connected successfully to Supabase PostgreSQL database.`,
      count: count || 0
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network failure or timeout';
    return {
      success: false,
      message: `Connection failed: ${errorMsg}`
    };
  }
}

// ------------------------------------------------------------------------------
// DATA MAPPERS (Database snake_case <--> Application camelCase)
// ------------------------------------------------------------------------------

export function mapDbPlaceToModel(row: any): Place {
  return {
    id: row.id,
    name: row.name || '',
    slug: row.slug || row.id,
    hindiName: row.hindi_name || undefined,
    shortDescription: row.short_description || '',
    description: row.description || '',
    story: row.story || '',
    whyVisit: Array.isArray(row.why_visit) ? row.why_visit : [],
    category: row.category || 'historical',
    subCategory: row.sub_category || undefined,
    vibes: Array.isArray(row.vibes) ? row.vibes : [],
    coverImage: row.cover_image || '',
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    imageCredits: row.image_credits || undefined,
    address: row.address || 'Lucknow, Uttar Pradesh',
    area: row.area || 'Lucknow',
    latitude: Number(row.latitude) || 26.8467,
    longitude: Number(row.longitude) || 80.9462,
    openingTime: row.opening_time || '06:00 AM',
    closingTime: row.closing_time || '06:00 PM',
    entryFee: row.entry_fee || 'Free',
    estimatedBudget: Number(row.estimated_budget) || 0,
    bestTime: row.best_time || 'Any Time',
    recommendedDuration: row.recommended_duration || '2 Hours',
    howToReach: row.how_to_reach || {},
    nearbyPlaceIds: Array.isArray(row.nearby_place_ids) ? row.nearby_place_ids : [],
    featured: Boolean(row.featured),
    hiddenGem: Boolean(row.hidden_gem),
    status: row.status || 'published',
    rating: row.rating ? Number(row.rating) : 4.8,
    reviewsCount: row.reviews_count ? Number(row.reviews_count) : 100,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

export function mapModelPlaceToDb(place: Place): any {
  return {
    id: place.id,
    name: place.name,
    slug: place.slug,
    hindi_name: place.hindiName || null,
    short_description: place.shortDescription,
    description: place.description,
    story: place.story || '',
    why_visit: place.whyVisit || [],
    category: place.category,
    sub_category: place.subCategory || null,
    vibes: place.vibes || [],
    cover_image: place.coverImage,
    gallery_images: place.galleryImages || [],
    image_credits: place.imageCredits || null,
    address: place.address,
    area: place.area,
    latitude: place.latitude,
    longitude: place.longitude,
    opening_time: place.openingTime,
    closing_time: place.closingTime,
    entry_fee: place.entryFee,
    estimated_budget: place.estimatedBudget,
    best_time: place.bestTime,
    recommended_duration: place.recommendedDuration,
    how_to_reach: place.howToReach || {},
    nearby_place_ids: place.nearbyPlaceIds || [],
    featured: Boolean(place.featured),
    hidden_gem: Boolean(place.hiddenGem),
    status: place.status,
    rating: place.rating || 4.8,
    reviews_count: place.reviewsCount || 100,
    updated_at: new Date().toISOString()
  };
}

export function mapDbBusinessToModel(row: any): LocalBusiness {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || '',
    address: row.address,
    area: row.area,
    contactNumber: row.contact_number,
    image: row.image,
    websiteUrl: row.website_url || undefined,
    specialty: row.specialty || '',
    featured: Boolean(row.featured),
    status: row.status || 'published',
    createdAt: row.created_at || new Date().toISOString()
  };
}

export function mapModelBusinessToDb(biz: LocalBusiness): any {
  return {
    id: biz.id,
    name: biz.name,
    category: biz.category,
    description: biz.description,
    address: biz.address,
    area: biz.area,
    contact_number: biz.contactNumber,
    image: biz.image,
    website_url: biz.websiteUrl || null,
    specialty: biz.specialty,
    featured: biz.featured,
    status: biz.status,
    created_at: biz.createdAt || new Date().toISOString()
  };
}

export function mapDbEmergencyToModel(row: any): EmergencyService {
  return {
    id: row.id,
    serviceName: row.service_name,
    number: row.number,
    description: row.description || '',
    category: row.category,
    availability: row.availability || '24x7',
    address: row.address || undefined,
    officialSource: row.official_source || undefined,
    enabled: Boolean(row.enabled),
    displayOrder: Number(row.display_order) || 1
  };
}

export function mapModelEmergencyToDb(item: EmergencyService): any {
  return {
    id: item.id,
    service_name: item.serviceName,
    number: item.number,
    description: item.description,
    category: item.category,
    availability: item.availability,
    address: item.address || null,
    official_source: item.officialSource || null,
    enabled: item.enabled,
    display_order: item.displayOrder
  };
}
