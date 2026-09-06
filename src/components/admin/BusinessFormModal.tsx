import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LocalBusiness, BusinessStatus } from '../../types';
import { DraftService } from '../../services/draftService';
import { 
  X, Save, Store, Image as ImageIcon, MapPin, Phone, 
  Sparkles, ExternalLink, AlertCircle, Eye, Clock, User,
  Navigation, CheckCircle2, RotateCcw
} from 'lucide-react';

interface BusinessFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (businessData: Partial<LocalBusiness>) => Promise<void>;
  initialData?: LocalBusiness | null;
  existingBusinesses: LocalBusiness[];
  isSaving?: boolean;
}

const DEFAULT_BUSINESS_CATEGORIES = [
  { id: 'attire', label: 'Chikan & Handicrafts' },
  { id: 'food', label: 'Food & Awadhi Delicacies' },
  { id: 'attar', label: 'Perfumes & Attar (Ittar)' },
  { id: 'jewelry', label: 'Jewelry & Antiques' },
  { id: 'heritage', label: 'Heritage Goods & Souvenirs' },
  { id: 'guide', label: 'Local Guides & Services' },
  { id: 'restaurant', label: 'Restaurant & Fine Dining' },
  { id: 'cafe', label: 'Heritage Cafe & Chai' },
  { id: 'sweets', label: 'Traditional Awadhi Sweets' },
  { id: 'hotel', label: 'Heritage Stay & Hotel' }
];

const POPULAR_BUSINESS_AREAS = [
  'Chowk',
  'Aminabad',
  'Hazratganj',
  'Hussainabad',
  'Kaiserbagh',
  'Gomti Nagar',
  'Nakhas',
  'Alambagh',
  'Charbagh',
  'Indira Nagar'
];

export const BusinessFormModal: React.FC<BusinessFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingBusinesses,
  isSaving = false
}) => {
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('attire');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [description, setDescription] = useState('');
  const [priceRange, setPriceRange] = useState<'₹' | '₹₹' | '₹₹₹' | '₹₹₹₹'>('₹₹');

  // Media
  const [image, setImage] = useState('');
  const [imageError, setImageError] = useState(false);

  // Location & Contact
  const [area, setArea] = useState('Chowk');
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [customArea, setCustomArea] = useState('');
  const [address, setAddress] = useState('Lucknow, Uttar Pradesh');
  const [ownerName, setOwnerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [googleMapsUrlError, setGoogleMapsUrlError] = useState<string | null>(null);
  const [openingHours, setOpeningHours] = useState('10:00 AM - 10:00 PM');

  // Visibility
  const [featured, setFeatured] = useState(true);
  const [status, setStatus] = useState<BusinessStatus>('published');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Draft Management
  const [draftRestoredTime, setDraftRestoredTime] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const lastActiveSessionKeyRef = useRef<string | null>(null);

  const draftRecordId = initialData?.id || 'new';

  // URL Validator
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleGoogleMapsUrlChange = (val: string) => {
    setGoogleMapsUrl(val);
    const trimmed = val.trim();
    if (trimmed && !validateUrl(trimmed)) {
      setGoogleMapsUrlError('Please enter a valid URL starting with http:// or https://');
    } else {
      setGoogleMapsUrlError(null);
    }
  };

  // Collect all unique categories
  const allKnownCategories = React.useMemo(() => {
    const map = new Map<string, string>();
    DEFAULT_BUSINESS_CATEGORIES.forEach(c => map.set(c.id, c.label));
    existingBusinesses.forEach(b => {
      if (b.category && !map.has(b.category)) {
        const formatted = b.category.charAt(0).toUpperCase() + b.category.slice(1).replace(/-/g, ' ');
        map.set(b.category, formatted);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [existingBusinesses]);

  /**
   * Resets form state back to original database record or defaults
   */
  const resetToOriginalOrDefaults = useCallback(() => {
    setValidationError(null);
    setImageError(false);

    if (initialData) {
      setName(initialData.name || '');
      
      const isStandard = DEFAULT_BUSINESS_CATEGORIES.some(c => c.id === initialData.category);
      if (isStandard || allKnownCategories.some(c => c.id === initialData.category)) {
        setCategory(initialData.category || 'attire');
        setIsCustomCategory(false);
      } else {
        setCategory(initialData.category || 'attire');
        setIsCustomCategory(true);
        setCustomCategoryInput(initialData.category || '');
      }

      setSpecialty(initialData.specialty || '');
      setDescription(initialData.description || '');
      setPriceRange(initialData.priceRange || '₹₹');
      setImage(initialData.image || '');

      if (POPULAR_BUSINESS_AREAS.includes(initialData.area)) {
        setArea(initialData.area);
        setIsCustomArea(false);
      } else {
        setArea('custom');
        setIsCustomArea(true);
        setCustomArea(initialData.area || '');
      }

      setAddress(initialData.address || 'Lucknow, Uttar Pradesh');
      setOwnerName(initialData.ownerName || '');
      setContactNumber(initialData.contactNumber || '');
      setWebsiteUrl(initialData.websiteUrl || '');
      setGoogleMapsUrl(initialData.googleMapsUrl || '');
      setGoogleMapsUrlError(null);
      setOpeningHours(initialData.openingHours || '10:00 AM - 10:00 PM');
      setFeatured(Boolean(initialData.featured));
      setStatus(initialData.status || 'published');
    } else {
      setName('');
      setCategory('attire');
      setIsCustomCategory(false);
      setCustomCategoryInput('');
      setSpecialty('Authentic Chikankari Work & Royal Embroidery');
      setDescription('Generations-old artisan establishment renowned in Old Lucknow.');
      setPriceRange('₹₹');
      setImage('https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80');

      setArea('Chowk');
      setIsCustomArea(false);
      setCustomArea('');
      setAddress('Chowk, Lucknow, Uttar Pradesh');
      setOwnerName('');
      setContactNumber('+91 522 2256000');
      setWebsiteUrl('');
      setGoogleMapsUrl('');
      setGoogleMapsUrlError(null);
      setOpeningHours('10:00 AM - 10:00 PM');
      setFeatured(true);
      setStatus('published');
    }
  }, [initialData, allKnownCategories]);

  /**
   * Applies draft data
   */
  const applyDraftData = (draftData: any) => {
    if (!draftData) return;
    if (typeof draftData.name === 'string') setName(draftData.name);
    if (typeof draftData.category === 'string') setCategory(draftData.category);
    if (typeof draftData.isCustomCategory === 'boolean') setIsCustomCategory(draftData.isCustomCategory);
    if (typeof draftData.customCategoryInput === 'string') setCustomCategoryInput(draftData.customCategoryInput);
    if (typeof draftData.specialty === 'string') setSpecialty(draftData.specialty);
    if (typeof draftData.description === 'string') setDescription(draftData.description);
    if (draftData.priceRange) setPriceRange(draftData.priceRange);
    if (typeof draftData.image === 'string') setImage(draftData.image);
    if (typeof draftData.area === 'string') setArea(draftData.area);
    if (typeof draftData.isCustomArea === 'boolean') setIsCustomArea(draftData.isCustomArea);
    if (typeof draftData.customArea === 'string') setCustomArea(draftData.customArea);
    if (typeof draftData.address === 'string') setAddress(draftData.address);
    if (typeof draftData.ownerName === 'string') setOwnerName(draftData.ownerName);
    if (typeof draftData.contactNumber === 'string') setContactNumber(draftData.contactNumber);
    if (typeof draftData.websiteUrl === 'string') setWebsiteUrl(draftData.websiteUrl);
    if (typeof draftData.googleMapsUrl === 'string') setGoogleMapsUrl(draftData.googleMapsUrl);
    if (typeof draftData.openingHours === 'string') setOpeningHours(draftData.openingHours);
    if (typeof draftData.featured === 'boolean') setFeatured(draftData.featured);
    if (draftData.status) setStatus(draftData.status);
  };

  /**
   * Serializes current form data
   */
  const getCurrentFormData = useCallback(() => {
    return {
      name,
      category,
      isCustomCategory,
      customCategoryInput,
      specialty,
      description,
      priceRange,
      image,
      area,
      isCustomArea,
      customArea,
      address,
      ownerName,
      contactNumber,
      websiteUrl,
      googleMapsUrl,
      openingHours,
      featured,
      status
    };
  }, [
    name, category, isCustomCategory, customCategoryInput, specialty, description,
    priceRange, image, area, isCustomArea, customArea, address, ownerName,
    contactNumber, websiteUrl, googleMapsUrl, openingHours, featured, status
  ]);

  // Session-isolated modal initialization (ONLY RUNS ON MODAL OPEN OR RECORD ID CHANGE)
  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false;
      lastActiveSessionKeyRef.current = null;
      setDraftRestoredTime(null);
      return;
    }

    const currentSessionKey = initialData?.id || 'new';
    if (lastActiveSessionKeyRef.current === currentSessionKey && isInitializedRef.current) {
      return;
    }

    lastActiveSessionKeyRef.current = currentSessionKey;

    const existingDraft = DraftService.getDraft('business', draftRecordId);
    if (existingDraft && existingDraft.data) {
      resetToOriginalOrDefaults();
      applyDraftData(existingDraft.data);
      setDraftRestoredTime(existingDraft.savedAt);
    } else {
      resetToOriginalOrDefaults();
      setDraftRestoredTime(null);
    }

    isInitializedRef.current = true;
  }, [isOpen, initialData?.id, draftRecordId, resetToOriginalOrDefaults]);

  // Debounced Autosave to LocalStorage
  useEffect(() => {
    if (!isOpen || !isInitializedRef.current) return;

    const timer = setTimeout(() => {
      const data = getCurrentFormData();
      if (data.name.trim() || data.specialty.trim() || data.googleMapsUrl.trim() || initialData) {
        DraftService.saveDraft('business', draftRecordId, data);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [isOpen, draftRecordId, getCurrentFormData, initialData]);

  // Flush on tab switch / before unload
  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityOrUnload = () => {
      if (isInitializedRef.current) {
        const data = getCurrentFormData();
        if (data.name.trim() || data.specialty.trim() || initialData) {
          DraftService.saveDraft('business', draftRecordId, data);
        }
      }
    };

    window.addEventListener('beforeunload', handleVisibilityOrUnload);
    document.addEventListener('visibilitychange', handleVisibilityOrUnload);

    return () => {
      window.removeEventListener('beforeunload', handleVisibilityOrUnload);
      document.removeEventListener('visibilitychange', handleVisibilityOrUnload);
    };
  }, [isOpen, draftRecordId, getCurrentFormData, initialData]);

  const handleDiscardDraft = () => {
    DraftService.clearDraft('business', draftRecordId);
    setDraftRestoredTime(null);
    resetToOriginalOrDefaults();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Business Name is required.');
      return;
    }
    if (!specialty.trim()) {
      setValidationError('Specialty / Subtitle is required.');
      return;
    }

    if (googleMapsUrl.trim() && !validateUrl(googleMapsUrl.trim())) {
      setValidationError('Google Maps / Directions Link must be a valid URL (e.g. https://maps.app.goo.gl/... or https://www.google.com/maps/...)');
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim().toLowerCase().replace(/\s+/g, '-') || 'attire'
      : category;

    const finalArea = isCustomArea ? customArea.trim() || 'Lucknow' : area;

    const payload: Partial<LocalBusiness> = {
      name: trimmedName,
      category: finalCategory as any,
      specialty: specialty.trim(),
      description: description.trim(),
      priceRange,
      image: image.trim() || 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80',
      area: finalArea,
      address: address.trim() || 'Lucknow, Uttar Pradesh',
      ownerName: ownerName.trim() || undefined,
      contactNumber: contactNumber.trim() || '+91 522 2256000',
      websiteUrl: websiteUrl.trim() || undefined,
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      openingHours: openingHours.trim() || undefined,
      featured,
      status
    };

    try {
      await onSave(payload);
      // ONLY on confirmed successful database persistence:
      DraftService.clearDraft('business', draftRecordId);
      setDraftRestoredTime(null);
    } catch (err: any) {
      // KEEP DRAFT ON ERROR
      setValidationError(err.message || 'Failed to save local business in database');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="business-form-modal">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-300 my-auto overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {initialData ? 'Edit Merchant / Artisan' : 'Add Local Merchant'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-300 border border-stone-700">
                  PostgreSQL Master
                </span>
                {DraftService.hasDraft('business', draftRecordId) && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Draft Saved Locally
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-heading text-white truncate max-w-md">
                {name || 'New Local Business'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs sm:text-sm">
          
          {/* DRAFT RESTORATION BANNER */}
          {draftRestoredTime && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm" id="biz-draft-restored-banner">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-stone-900">
                    Unsaved Local Draft Restored
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Recovered your unsaved merchant edits from {DraftService.formatDraftTime(draftRestoredTime)}.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                  id="discard-biz-draft-btn"
                >
                  Discard Draft
                </button>
                <button
                  type="button"
                  onClick={() => setDraftRestoredTime(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors cursor-pointer"
                  id="continue-biz-draft-btn"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          )}

          {validationError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <div className="font-bold">Validation Issue</div>
                <div className="text-xs text-red-600 mt-0.5">{validationError}</div>
              </div>
            </div>
          )}

          {/* SECTION 1: BASIC INFORMATION */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Store className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                1. Merchant Profile & Category
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Business / Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Tunday Kababi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-900"
                  id="biz-name-input"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                {!isCustomCategory ? (
                  <select
                    value={category}
                    onChange={e => {
                      if (e.target.value === '__add_custom__') {
                        setIsCustomCategory(true);
                        setCustomCategoryInput('');
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                    id="biz-category-select"
                  >
                    {allKnownCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                    <option value="__add_custom__" className="text-amber-800 font-bold">+ Custom Category...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={customCategoryInput}
                      onChange={e => setCustomCategoryInput(e.target.value)}
                      placeholder="e.g. Zardozi Embroidery"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-500 bg-amber-50/50 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="px-3 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                    >
                      List
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-700 block mb-1">
                  Specialty / Subtitle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  placeholder="e.g. Authentic Galawati Kebabs Since 1905"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  id="biz-specialty-input"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Price Tier
                </label>
                <select
                  value={priceRange}
                  onChange={e => setPriceRange(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                >
                  <option value="₹">₹ - Budget Friendly</option>
                  <option value="₹₹">₹₹ - Moderate</option>
                  <option value="₹₹₹">₹₹₹ - Premium</option>
                  <option value="₹₹₹₹">₹₹₹₹ - Royal Luxury</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Heritage Story & Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Details of lineage, traditional recipes, authentic craft techniques..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 2: MEDIA */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <ImageIcon className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                2. Visual Showcase
              </h4>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Image URL (Direct CDN / Unsplash / High-Res)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={image}
                  onChange={e => {
                    setImage(e.target.value);
                    setImageError(false);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono text-xs text-stone-800"
                  id="biz-image-input"
                />
                {image && (
                  <a
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 flex items-center justify-center shrink-0"
                    title="Open image in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {image && (
                <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-4">
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-stone-900 border border-stone-300 shrink-0">
                    <img
                      src={image}
                      alt="Business Preview"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-stone-600">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      Live Image Preview
                    </div>
                    {imageError ? (
                      <p className="text-[11px] text-red-600 font-bold">Image Failed to Load. Check URL.</p>
                    ) : (
                      <p className="text-[11px] text-stone-500">Rendered on business cards and listings.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: LOCATION & CONTACT */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <MapPin className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                3. Location & Contact Coordinates
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Area / Neighborhood
                </label>
                {!isCustomArea ? (
                  <select
                    value={area}
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setIsCustomArea(true);
                        setCustomArea('');
                      } else {
                        setArea(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                  >
                    {POPULAR_BUSINESS_AREAS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                    <option value="custom" className="text-amber-800 font-bold">+ Custom Locality...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customArea}
                      onChange={e => setCustomArea(e.target.value)}
                      placeholder="e.g. Yahiyaganj"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-500 bg-amber-50/50 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomArea(false)}
                      className="px-3 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                    >
                      List
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Full Postal Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Shop 14, Aminabad Market, Lucknow"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Owner / Manager Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Haji Murad Ali"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Phone / Helpline Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    placeholder="e.g. +91 522 2256000"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* GOOGLE MAPS / DIRECTIONS LINK */}
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5" htmlFor="business-google-maps-url">
                  <Navigation className="w-4 h-4 text-amber-700" />
                  <span>Google Maps / Directions Link</span>
                </label>
                <span className="text-[11px] text-stone-500 font-normal">
                  Workflow: Google Maps → Share → Copy link → Paste below
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    id="business-google-maps-url"
                    value={googleMapsUrl}
                    onChange={e => handleGoogleMapsUrlChange(e.target.value)}
                    placeholder="https://maps.app.goo.gl/xyz or https://goo.gl/maps/..."
                    className={`w-full pl-3.5 pr-8 py-2.5 rounded-xl border bg-white text-xs font-mono text-stone-900 transition-colors ${
                      googleMapsUrlError 
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                        : 'border-stone-300 focus:border-amber-600'
                    }`}
                  />
                  {googleMapsUrl && !googleMapsUrlError && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600" title="Valid URL Format">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {googleMapsUrl && !googleMapsUrlError && validateUrl(googleMapsUrl) && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm"
                    id="test-business-google-maps-link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Link</span>
                  </a>
                )}
              </div>

              {googleMapsUrlError ? (
                <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{googleMapsUrlError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Saved in Supabase PostgreSQL master. The public &ldquo;Directions&rdquo; button opens this destination URL directly in Google Maps.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Operating Hours
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={openingHours}
                    onChange={e => setOpeningHours(e.target.value)}
                    placeholder="10:00 AM - 10:00 PM"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Website / Social Link
                </label>
                <div className="relative">
                  <ExternalLink className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: VISIBILITY */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                4. Visibility & Verification
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as BusinessStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-semibold"
                >
                  <option value="published">Published (Live to Public)</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Review</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer w-full transition-all ${
                  featured ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-stone-50 border-stone-200'
                }`}>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <div>
                    <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Featured Business Spotlight
                    </div>
                    <div className="text-[10px] text-stone-500">Highlighted in food trails and craft markets</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="bg-stone-100 px-6 py-4 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-2">
            <span>Saves directly to Supabase PostgreSQL table with Realtime sync.</span>
            {DraftService.hasDraft('business', draftRecordId) && (
              <span className="text-amber-700 font-semibold">• Local draft active</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {DraftService.hasDraft('business', draftRecordId) && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleDiscardDraft}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                id="footer-discard-biz-draft-btn"
                title="Discard unsaved local draft and reset to saved database record"
              >
                Discard Draft
              </button>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-200 text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              id="save-biz-form-btn"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Persisting to Database...' : (initialData ? 'Update Business' : 'Add Business')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
