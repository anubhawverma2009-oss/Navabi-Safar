import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Place, PlaceCategory, PlaceVibe, BestTimeToVisit } from '../../types';
import { DraftService } from '../../services/draftService';
import { 
  X, Save, Image as ImageIcon, MapPin, Clock, IndianRupee, 
  Sparkles, Gem, Compass, Landmark, Plus, Trash2, ExternalLink,
  Info, CheckCircle2, AlertCircle, RefreshCw, Eye, Navigation,
  RotateCcw
} from 'lucide-react';

interface PlaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (placeData: Partial<Place>) => Promise<void>;
  initialData?: Place | null;
  existingPlaces: Place[];
  isSaving?: boolean;
}

const DEFAULT_CATEGORIES: { id: PlaceCategory; label: string }[] = [
  { id: 'historical', label: 'Historical & Heritage' },
  { id: 'food', label: 'Food & Awadhi Cuisine' },
  { id: 'shopping', label: 'Shopping & Bazaars' },
  { id: 'parks', label: 'Parks & Nature' },
  { id: 'culture', label: 'Culture, Arts & Music' },
  { id: 'entertainment', label: 'Entertainment & Modern' },
  { id: 'landmarks', label: 'Famous Landmarks' },
  { id: 'religious', label: 'Spiritual & Sacred' },
  { id: 'hidden-gems', label: 'Hidden Gems' },
  { id: 'experiences', label: 'Local Experiences' }
];

const POPULAR_AREAS = [
  'Hussainabad',
  'Chowk',
  'Hazratganj',
  'Aminabad',
  'Kaiserbagh',
  'Gomti Nagar',
  'Alambagh',
  'Mahanagar',
  'Indira Nagar',
  'Charbagh',
  'Aishbagh',
  'Daliganj'
];

const DEFAULT_VIBES: PlaceVibe[] = [
  'Heritage',
  'Photography',
  'Peaceful',
  'Family',
  'Food',
  'Shopping',
  'Culture',
  'Entertainment',
  'Outdoor',
  'Sunset',
  'Budget Friendly',
  'Hidden Gem',
  'Architecture',
  'Romantic',
  'Nightlife',
  'Spiritual'
];

export const PlaceFormModal: React.FC<PlaceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingPlaces,
  isSaving = false
}) => {
  // Form State
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('historical');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  
  // Media State
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [imageCredits, setImageCredits] = useState('');
  const [coverImageError, setCoverImageError] = useState(false);

  // Location State
  const [area, setArea] = useState('Hussainabad');
  const [customArea, setCustomArea] = useState('');
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [address, setAddress] = useState('Lucknow, Uttar Pradesh');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [googleMapsUrlError, setGoogleMapsUrlError] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(26.8687);
  const [longitude, setLongitude] = useState(80.9135);
  const [nearestMetro, setNearestMetro] = useState('');
  const [autoCabTips, setAutoCabTips] = useState('');
  const [busRoute, setBusRoute] = useState('');
  const [parking, setParking] = useState('');

  // Visit & Budget State
  const [openingTime, setOpeningTime] = useState('06:00 AM');
  const [closingTime, setClosingTime] = useState('05:00 PM');
  const [entryFee, setEntryFee] = useState('Free');
  const [estimatedBudget, setEstimatedBudget] = useState(0);
  const [bestTime, setBestTime] = useState<BestTimeToVisit>('Morning');
  const [recommendedDuration, setRecommendedDuration] = useState('2 Hours');

  // Highlights & Vibes
  const [whyVisitPoints, setWhyVisitPoints] = useState<string[]>([]);
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [selectedVibes, setSelectedVibes] = useState<PlaceVibe[]>(['Heritage']);
  const [customVibeInput, setCustomVibeInput] = useState('');

  // Status & Discovery
  const [featured, setFeatured] = useState(false);
  const [hiddenGem, setHiddenGem] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Draft Management State
  const [draftRestoredTime, setDraftRestoredTime] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const lastActiveSessionKeyRef = useRef<string | null>(null);

  // Record key for draft tracking ('new' or specific destination ID)
  const draftRecordId = initialData?.id || 'new';

  // Collect all unique categories across existing places
  const allKnownCategories = React.useMemo(() => {
    const set = new Map<string, string>();
    DEFAULT_CATEGORIES.forEach(c => set.set(c.id, c.label));
    existingPlaces.forEach(p => {
      if (p.category && !set.has(p.category)) {
        const formatted = p.category.charAt(0).toUpperCase() + p.category.slice(1).replace(/-/g, ' ');
        set.set(p.category, formatted);
      }
    });
    return Array.from(set.entries()).map(([id, label]) => ({ id: id as PlaceCategory, label }));
  }, [existingPlaces]);

  /**
   * Resets form state back to the original database record (for edit) or clean defaults (for new)
   */
  const resetToOriginalOrDefaults = useCallback(() => {
    setValidationError(null);
    setCoverImageError(false);

    if (initialData) {
      setName(initialData.name || '');
      setHindiName(initialData.hindiName || '');
      setSlug(initialData.slug || '');
      
      const isStandardCat = DEFAULT_CATEGORIES.some(c => c.id === initialData.category);
      if (isStandardCat || allKnownCategories.some(c => c.id === initialData.category)) {
        setCategory(initialData.category || 'historical');
        setIsCustomCategory(false);
      } else {
        setCategory(initialData.category || 'historical');
        setIsCustomCategory(true);
        setCustomCategoryInput(initialData.category || '');
      }

      setSubCategory(initialData.subCategory || '');
      setShortDescription(initialData.shortDescription || '');
      setDescription(initialData.description || '');
      setStory(initialData.story || '');

      setCoverImage(initialData.coverImage || '');
      setGalleryImages(initialData.galleryImages || []);
      setImageCredits(initialData.imageCredits || '');

      if (POPULAR_AREAS.includes(initialData.area)) {
        setArea(initialData.area);
        setIsCustomArea(false);
      } else {
        setArea('custom');
        setIsCustomArea(true);
        setCustomArea(initialData.area || '');
      }

      setAddress(initialData.address || 'Lucknow, Uttar Pradesh');
      const initialMapsUrl = initialData.googleMapsUrl || initialData.howToReach?.googleMapsUrl || '';
      setGoogleMapsUrl(initialMapsUrl);
      setGoogleMapsUrlError(null);
      setLatitude(initialData.latitude ?? 26.8687);
      setLongitude(initialData.longitude ?? 80.9135);

      setNearestMetro(initialData.howToReach?.nearestMetro || '');
      setAutoCabTips(initialData.howToReach?.autoCabTips || '');
      setBusRoute(initialData.howToReach?.busRoute || '');
      setParking(initialData.howToReach?.parking || '');

      setOpeningTime(initialData.openingTime || '06:00 AM');
      setClosingTime(initialData.closingTime || '05:00 PM');
      setEntryFee(initialData.entryFee || 'Free');
      setEstimatedBudget(initialData.estimatedBudget ?? 0);
      setBestTime(initialData.bestTime || 'Morning');
      setRecommendedDuration(initialData.recommendedDuration || '2 Hours');

      setWhyVisitPoints(initialData.whyVisit && initialData.whyVisit.length > 0 
        ? initialData.whyVisit 
        : ['Witness historic Lakhnawi craftsmanship']);
      setSelectedVibes(initialData.vibes && initialData.vibes.length > 0 
        ? initialData.vibes 
        : ['Heritage']);

      setFeatured(Boolean(initialData.featured));
      setHiddenGem(Boolean(initialData.hiddenGem));
      setStatus(initialData.status || 'published');
    } else {
      // Defaults for new place
      setName('');
      setHindiName('');
      setSlug('');
      setCategory('historical');
      setIsCustomCategory(false);
      setCustomCategoryInput('');
      setSubCategory('Monument');
      setShortDescription('');
      setDescription('');
      setStory('');

      setCoverImage('https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80');
      setGalleryImages([]);
      setImageCredits('');

      setArea('Hussainabad');
      setIsCustomArea(false);
      setCustomArea('');
      setAddress('Lucknow, Uttar Pradesh');
      setGoogleMapsUrl('');
      setGoogleMapsUrlError(null);
      setLatitude(26.8687);
      setLongitude(80.9135);

      setNearestMetro('Chowk / Hussainabad metro access');
      setAutoCabTips('E-rickshaws widely available from Charbagh');
      setBusRoute('City bus routes to Hussainabad');
      setParking('Public parking available outside');

      setOpeningTime('06:00 AM');
      setClosingTime('05:00 PM');
      setEntryFee('Free');
      setEstimatedBudget(0);
      setBestTime('Morning');
      setRecommendedDuration('2 Hours');

      setWhyVisitPoints([
        'Witness historic Lakhnawi craftsmanship',
        'Admire 18th-century vaulted Awadhi architecture'
      ]);
      setSelectedVibes(['Heritage', 'Photography']);

      setFeatured(false);
      setHiddenGem(false);
      setStatus('published');
    }
  }, [initialData, allKnownCategories]);

  /**
   * Applies a draft dataset to local component states
   */
  const applyDraftData = (draftData: any) => {
    if (!draftData) return;
    if (typeof draftData.name === 'string') setName(draftData.name);
    if (typeof draftData.hindiName === 'string') setHindiName(draftData.hindiName);
    if (typeof draftData.slug === 'string') setSlug(draftData.slug);
    if (draftData.category) setCategory(draftData.category);
    if (typeof draftData.isCustomCategory === 'boolean') setIsCustomCategory(draftData.isCustomCategory);
    if (typeof draftData.customCategoryInput === 'string') setCustomCategoryInput(draftData.customCategoryInput);
    if (typeof draftData.subCategory === 'string') setSubCategory(draftData.subCategory);
    if (typeof draftData.shortDescription === 'string') setShortDescription(draftData.shortDescription);
    if (typeof draftData.description === 'string') setDescription(draftData.description);
    if (typeof draftData.story === 'string') setStory(draftData.story);
    if (typeof draftData.coverImage === 'string') setCoverImage(draftData.coverImage);
    if (Array.isArray(draftData.galleryImages)) setGalleryImages(draftData.galleryImages);
    if (typeof draftData.imageCredits === 'string') setImageCredits(draftData.imageCredits);
    if (typeof draftData.area === 'string') setArea(draftData.area);
    if (typeof draftData.customArea === 'string') setCustomArea(draftData.customArea);
    if (typeof draftData.isCustomArea === 'boolean') setIsCustomArea(draftData.isCustomArea);
    if (typeof draftData.address === 'string') setAddress(draftData.address);
    if (typeof draftData.googleMapsUrl === 'string') setGoogleMapsUrl(draftData.googleMapsUrl);
    if (typeof draftData.latitude === 'number') setLatitude(draftData.latitude);
    if (typeof draftData.longitude === 'number') setLongitude(draftData.longitude);
    if (typeof draftData.nearestMetro === 'string') setNearestMetro(draftData.nearestMetro);
    if (typeof draftData.autoCabTips === 'string') setAutoCabTips(draftData.autoCabTips);
    if (typeof draftData.busRoute === 'string') setBusRoute(draftData.busRoute);
    if (typeof draftData.parking === 'string') setParking(draftData.parking);
    if (typeof draftData.openingTime === 'string') setOpeningTime(draftData.openingTime);
    if (typeof draftData.closingTime === 'string') setClosingTime(draftData.closingTime);
    if (typeof draftData.entryFee === 'string') setEntryFee(draftData.entryFee);
    if (typeof draftData.estimatedBudget === 'number') setEstimatedBudget(draftData.estimatedBudget);
    if (draftData.bestTime) setBestTime(draftData.bestTime);
    if (typeof draftData.recommendedDuration === 'string') setRecommendedDuration(draftData.recommendedDuration);
    if (Array.isArray(draftData.whyVisitPoints)) setWhyVisitPoints(draftData.whyVisitPoints);
    if (Array.isArray(draftData.selectedVibes)) setSelectedVibes(draftData.selectedVibes);
    if (typeof draftData.featured === 'boolean') setFeatured(draftData.featured);
    if (typeof draftData.hiddenGem === 'boolean') setHiddenGem(draftData.hiddenGem);
    if (draftData.status) setStatus(draftData.status);
  };

  /**
   * Serializes current form state for draft saving
   */
  const getCurrentFormData = useCallback(() => {
    return {
      name,
      hindiName,
      slug,
      category,
      isCustomCategory,
      customCategoryInput,
      subCategory,
      shortDescription,
      description,
      story,
      coverImage,
      galleryImages,
      imageCredits,
      area,
      customArea,
      isCustomArea,
      address,
      googleMapsUrl,
      latitude,
      longitude,
      nearestMetro,
      autoCabTips,
      busRoute,
      parking,
      openingTime,
      closingTime,
      entryFee,
      estimatedBudget,
      bestTime,
      recommendedDuration,
      whyVisitPoints,
      selectedVibes,
      featured,
      hiddenGem,
      status
    };
  }, [
    name, hindiName, slug, category, isCustomCategory, customCategoryInput, subCategory,
    shortDescription, description, story, coverImage, galleryImages, imageCredits,
    area, customArea, isCustomArea, address, googleMapsUrl, latitude, longitude,
    nearestMetro, autoCabTips, busRoute, parking, openingTime, closingTime, entryFee,
    estimatedBudget, bestTime, recommendedDuration, whyVisitPoints, selectedVibes,
    featured, hiddenGem, status
  ]);

  // Session-isolated modal initialization (RUNS ONLY ON MODAL OPEN OR RECORD CHANGE)
  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false;
      lastActiveSessionKeyRef.current = null;
      setDraftRestoredTime(null);
      return;
    }

    const currentSessionKey = initialData?.id || 'new';
    if (lastActiveSessionKeyRef.current === currentSessionKey && isInitializedRef.current) {
      // Modal is already open for this record; do NOT re-initialize on background prop/category updates!
      return;
    }

    lastActiveSessionKeyRef.current = currentSessionKey;

    // Check for existing local draft
    const existingDraft = DraftService.getDraft('destination', draftRecordId);
    if (existingDraft && existingDraft.data) {
      // Restore draft
      resetToOriginalOrDefaults();
      applyDraftData(existingDraft.data);
      setDraftRestoredTime(existingDraft.savedAt);
    } else {
      // Fresh initialization from database record or defaults
      resetToOriginalOrDefaults();
      setDraftRestoredTime(null);
    }

    isInitializedRef.current = true;
  }, [isOpen, initialData?.id, draftRecordId, resetToOriginalOrDefaults]);

  // Debounced Autosave to LocalStorage (Protects against tab switches, navigation, or reloads)
  useEffect(() => {
    if (!isOpen || !isInitializedRef.current) return;

    // Debounce 350ms
    const timer = setTimeout(() => {
      const data = getCurrentFormData();
      // Only save draft if user has entered non-empty meaningful info
      if (data.name.trim() || data.description.trim() || data.story.trim() || data.googleMapsUrl.trim() || initialData) {
        DraftService.saveDraft('destination', draftRecordId, data);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [isOpen, draftRecordId, getCurrentFormData, initialData]);

  // Immediate flush on visibility loss / before tab unload
  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityOrUnload = () => {
      if (isInitializedRef.current) {
        const data = getCurrentFormData();
        if (data.name.trim() || data.description.trim() || initialData) {
          DraftService.saveDraft('destination', draftRecordId, data);
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

  /**
   * Explicit user action to discard the restored local draft
   */
  const handleDiscardDraft = () => {
    DraftService.clearDraft('destination', draftRecordId);
    setDraftRestoredTime(null);
    resetToOriginalOrDefaults();
  };

  // Auto-generate slug when name changes if slug is empty or was auto-generated
  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      const generated = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleAddGalleryImage = () => {
    const trimmed = newGalleryInput.trim();
    if (trimmed) {
      if (!galleryImages.includes(trimmed)) {
        setGalleryImages([...galleryImages, trimmed]);
      }
      setNewGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  const handleAddHighlight = () => {
    const trimmed = newHighlightInput.trim();
    if (trimmed) {
      setWhyVisitPoints([...whyVisitPoints, trimmed]);
      setNewHighlightInput('');
    }
  };

  const handleRemoveHighlight = (idx: number) => {
    setWhyVisitPoints(whyVisitPoints.filter((_, i) => i !== idx));
  };

  const handleToggleVibe = (vibe: PlaceVibe) => {
    if (selectedVibes.includes(vibe)) {
      if (selectedVibes.length > 1) {
        setSelectedVibes(selectedVibes.filter(v => v !== vibe));
      }
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  const handleAddCustomVibe = () => {
    const trimmed = customVibeInput.trim();
    if (trimmed) {
      const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      if (!selectedVibes.includes(formatted as PlaceVibe)) {
        setSelectedVibes([...selectedVibes, formatted as PlaceVibe]);
      }
      setCustomVibeInput('');
    }
  };

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
      // Optional: Auto-detect lat/lng if the pasted link contains explicit coordinates
      const coordMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || 
                         trimmed.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                         trimmed.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        const parsedLat = parseFloat(coordMatch[1]);
        const parsedLng = parseFloat(coordMatch[2]);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          setLatitude(parsedLat);
          setLongitude(parsedLng);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Destination Name is required.');
      return;
    }
    if (!description.trim()) {
      setValidationError('Detailed Description is required.');
      return;
    }
    if (!coverImage.trim()) {
      setValidationError('Cover Image URL is required.');
      return;
    }

    if (googleMapsUrl.trim() && !validateUrl(googleMapsUrl.trim())) {
      setValidationError('Google Maps / Directions Link must be a valid URL (e.g. https://maps.app.goo.gl/... or https://www.google.com/maps/...)');
      return;
    }

    const finalCategory = isCustomCategory 
      ? customCategoryInput.trim().toLowerCase().replace(/\s+/g, '-') || 'historical'
      : category;

    const finalArea = isCustomArea ? customArea.trim() || 'Lucknow' : area;

    const finalSlug = slug.trim() || 
      trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      ('dest-' + Date.now());

    // Check slug collision
    const isEditing = Boolean(initialData && initialData.id);
    const slugConflict = existingPlaces.find(p => p.slug === finalSlug && (!isEditing || p.id !== initialData?.id));
    if (slugConflict) {
      setValidationError(`The URL slug "${finalSlug}" is already used by destination "${slugConflict.name}". Please edit the Slug field to make it unique.`);
      return;
    }

    const finalGallery = galleryImages.length > 0 ? galleryImages : [coverImage.trim()];

    const payload: Partial<Place> = {
      name: trimmedName,
      hindiName: hindiName.trim() || undefined,
      slug: finalSlug,
      category: finalCategory as PlaceCategory,
      subCategory: subCategory.trim() || undefined,
      shortDescription: shortDescription.trim() || trimmedName,
      description: description.trim(),
      story: story.trim(),
      whyVisit: whyVisitPoints.length > 0 ? whyVisitPoints : ['Explore historic Lucknow'],
      vibes: selectedVibes,
      coverImage: coverImage.trim(),
      galleryImages: finalGallery,
      imageCredits: imageCredits.trim() || undefined,
      address: address.trim() || 'Lucknow, Uttar Pradesh',
      area: finalArea,
      googleMapsUrl: googleMapsUrl.trim() || undefined,
      latitude: Number(latitude) || 26.8687,
      longitude: Number(longitude) || 80.9135,
      openingTime: openingTime.trim() || '06:00 AM',
      closingTime: closingTime.trim() || '05:00 PM',
      entryFee: entryFee.trim() || 'Free',
      estimatedBudget: Number(estimatedBudget) || 0,
      bestTime: bestTime,
      recommendedDuration: recommendedDuration.trim() || '2 Hours',
      howToReach: {
        nearestMetro: nearestMetro.trim() || undefined,
        autoCabTips: autoCabTips.trim() || undefined,
        busRoute: busRoute.trim() || undefined,
        parking: parking.trim() || undefined,
        googleMapsUrl: googleMapsUrl.trim() || undefined
      },
      featured,
      hiddenGem,
      status
    };

    try {
      await onSave(payload);
      // ONLY on confirmed successful database persistence:
      DraftService.clearDraft('destination', draftRecordId);
      setDraftRestoredTime(null);
    } catch (err: any) {
      // KEEP DRAFT ON ERROR, do not delete user edits
      setValidationError(err.message || 'Failed to save destination to database');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="place-form-modal">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-300 my-auto overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {initialData ? 'Edit Destination' : 'Add New Destination'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-300 border border-stone-700">
                  PostgreSQL Master
                </span>
                {DraftService.hasDraft('destination', draftRecordId) && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Draft Saved Locally
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-heading text-white truncate max-w-md">
                {name || 'Untitled Destination'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            id="close-place-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 text-xs sm:text-sm">
          
          {/* DRAFT RESTORATION BANNER */}
          {draftRestoredTime && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm" id="place-draft-restored-banner">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-stone-900">
                    Unsaved Local Draft Restored
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    Recovered your unsaved form edits from {DraftService.formatDraftTime(draftRestoredTime)}.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                  id="discard-place-draft-btn"
                >
                  Discard Draft
                </button>
                <button
                  type="button"
                  onClick={() => setDraftRestoredTime(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-colors cursor-pointer"
                  id="continue-place-draft-btn"
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
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Info className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                1. Basic Information & Heritage Identity
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="font-bold text-stone-700 block mb-1">
                  Destination Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Bara Imambara"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 font-semibold text-stone-900"
                  id="place-name-input"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="font-bold text-stone-700 block mb-1">
                  Urdu / Devanagari Script Name
                </label>
                <input
                  type="text"
                  value={hindiName}
                  onChange={e => setHindiName(e.target.value)}
                  placeholder="e.g. बड़ा इमामबाड़ा"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 font-serif text-stone-900"
                  id="place-hindi-name-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <label className="font-bold text-stone-700 block mb-1">
                  URL Slug / Key
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="bara-imambara"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white font-mono text-xs text-amber-900"
                    id="place-slug-input"
                  />
                  <button
                    type="button"
                    onClick={() => setSlug(name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded"
                    title="Regenerate slug from name"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto
                  </button>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="font-bold text-stone-700 block mb-1">
                  Primary Category <span className="text-red-500">*</span>
                </label>
                {!isCustomCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={category}
                      onChange={e => {
                        if (e.target.value === '__add_custom__') {
                          setIsCustomCategory(true);
                          setCustomCategoryInput('');
                        } else {
                          setCategory(e.target.value as PlaceCategory);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white font-semibold text-stone-800"
                      id="place-category-select"
                    >
                      {allKnownCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                      <option value="__add_custom__" className="font-bold text-amber-800">
                        + Add Custom Category...
                      </option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={customCategoryInput}
                      onChange={e => setCustomCategoryInput(e.target.value)}
                      placeholder="e.g. Literary Landmarks / Havelis"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-500 bg-amber-50/50 font-bold text-stone-900"
                      id="place-custom-category-input"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="px-3 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                    >
                      Use List
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Subcategory / Architectural Genre
                </label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  placeholder="e.g. Mughal-Awadhi Monument / Royal Tomb / Street Market"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                  id="place-subcategory-input"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Short One-Line Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  placeholder="e.g. 18th-century architectural marvel housing the famous Bhool Bhulaiya."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white"
                  id="place-short-desc-input"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Comprehensive Description & Experience <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what visitors see, architectural significance, ambience, soundscapes, and visiting advice..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white leading-relaxed"
                id="place-description-textarea"
              />
            </div>

            <div>
              <label className="font-bold text-amber-950 block mb-1 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-amber-700" />
                Royal Heritage, Patron Nawab & Historic Narrative
              </label>
              <textarea
                rows={2}
                value={story}
                onChange={e => setStory(e.target.value)}
                placeholder="Famine relief origin under Nawab Asaf-ud-Daula in 1784, engineering wonders, royal court tales..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50/40 focus:bg-white italic font-serif leading-relaxed"
                id="place-story-textarea"
              />
            </div>

            {/* WHY VISIT HIGHLIGHTS */}
            <div className="pt-2 border-t border-stone-100">
              <label className="font-bold text-stone-700 block mb-2">
                Key Highlights / Why Visit Reasons
              </label>
              <div className="space-y-2 mb-3">
                {whyVisitPoints.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="flex-1 text-xs text-stone-800 font-medium">{point}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="text-stone-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlightInput}
                  onChange={e => setNewHighlightInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddHighlight(); } }}
                  placeholder="e.g. World's largest unsupported vaulted hall ceiling"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* EXPERIENCE VIBES */}
            <div className="pt-2 border-t border-stone-100">
              <label className="font-bold text-stone-700 block mb-2">
                Experience Vibes (Select all matching tags)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DEFAULT_VIBES.map(vibe => {
                  const isSelected = selectedVibes.includes(vibe);
                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => handleToggleVibe(vibe)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      #{vibe}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={customVibeInput}
                  onChange={e => setCustomVibeInput(e.target.value)}
                  placeholder="Custom tag (e.g. Royal)"
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCustomVibe}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold shrink-0"
                >
                  + Add Vibe
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: MEDIA & VISUAL ASSETS */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <ImageIcon className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                2. Media & Visual Assets
              </h4>
            </div>

            {/* COVER IMAGE */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Cover Image URL (Direct CDN / Unsplash / High-Res Image) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={coverImage}
                  onChange={e => {
                    setCoverImage(e.target.value);
                    setCoverImageError(false);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white font-mono text-xs text-stone-800"
                  id="place-cover-image-input"
                />
                {coverImage && (
                  <a
                    href={coverImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 flex items-center justify-center shrink-0"
                    title="Open cover image in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* LIVE COVER IMAGE PREVIEW */}
              {coverImage && (
                <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-stone-900 border border-stone-300 shrink-0">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      onError={() => setCoverImageError(true)}
                      className="w-full h-full object-cover"
                    />
                    {coverImageError && (
                      <div className="absolute inset-0 bg-red-950/80 text-red-200 text-[10px] p-2 flex items-center justify-center text-center font-bold">
                        Image Failed to Load. Check URL.
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-stone-600 space-y-1">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      Live Cover Preview
                    </div>
                    <p className="text-[11px] text-stone-500">
                      This primary image is displayed on cards, explore lists, day planner maps, and the main hero banner.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* GALLERY IMAGES */}
            <div className="pt-3 border-t border-stone-100">
              <label className="font-bold text-stone-700 block mb-1">
                Visual Photo Gallery (Multiple High-Res Photos)
              </label>
              
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-900 h-24">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newGalleryInput}
                  onChange={e => setNewGalleryInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalleryImage(); } }}
                  placeholder="Paste additional image URL (https://...)"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Photo
                </button>
              </div>
            </div>

            {/* IMAGE CREDITS */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Image Attribution & Credits (Optional)
              </label>
              <input
                type="text"
                value={imageCredits}
                onChange={e => setImageCredits(e.target.value)}
                placeholder="e.g. Archaeological Survey of India / UP Tourism / Unsplash Curator"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
              />
            </div>
          </div>

          {/* SECTION 3: LOCATION & ACCESSIBILITY */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <MapPin className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                3. Location, Coordinates & Transit Logistics
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5">
                <label className="font-bold text-stone-700 block mb-1">
                  Locality / Neighborhood <span className="text-red-500">*</span>
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
                    id="place-area-select"
                  >
                    {POPULAR_AREAS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                    <option value="custom" className="text-amber-800 font-bold">+ Custom Locality / Ward...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={customArea}
                      onChange={e => setCustomArea(e.target.value)}
                      placeholder="e.g. Qaiser Bagh / Mohanlalganj"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-500 bg-amber-50/50 font-bold text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomArea(false)}
                      className="px-3 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                    >
                      Use List
                    </button>
                  </div>
                )}
              </div>

              <div className="sm:col-span-7">
                <label className="font-bold text-stone-700 block mb-1">
                  Full Postal Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Machchhi Bhavan, Lucknow, Uttar Pradesh 226003"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50"
                  id="place-address-input"
                />
              </div>
            </div>

            {/* GOOGLE MAPS / DIRECTIONS LINK */}
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5" htmlFor="place-google-maps-url">
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
                    id="place-google-maps-url"
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
                    id="test-google-maps-link"
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
                  Saved in Supabase PostgreSQL master. The public &ldquo;Get Live Directions&rdquo; button opens this destination URL in Google Maps. No manual latitude/longitude typing required.
                </p>
              )}
            </div>

            {/* GEO COORDINATES */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-700" />
                  Geographical Coordinates (For Map Plotting & Routing)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLatitude(26.8687);
                    setLongitude(80.9135);
                  }}
                  className="text-[11px] text-amber-800 hover:underline font-bold"
                >
                  Reset to Lucknow Center
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Latitude (Decimal, e.g. 26.8687)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={e => setLatitude(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono text-xs"
                    id="place-latitude-input"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Longitude (Decimal, e.g. 80.9135)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={e => setLongitude(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono text-xs"
                    id="place-longitude-input"
                  />
                </div>
              </div>
            </div>

            {/* TRANSIT & LOGISTICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Nearest Metro Station
                </label>
                <input
                  type="text"
                  value={nearestMetro}
                  onChange={e => setNearestMetro(e.target.value)}
                  placeholder="e.g. Hazratganj / Sachivalaya Metro"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Auto & E-Rickshaw Guidance
                </label>
                <input
                  type="text"
                  value={autoCabTips}
                  onChange={e => setAutoCabTips(e.target.value)}
                  placeholder="e.g. E-rickshaws available from Charbagh Station (₹20-30)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Bus Routes / Transit
                </label>
                <input
                  type="text"
                  value={busRoute}
                  onChange={e => setBusRoute(e.target.value)}
                  placeholder="e.g. Lucknow City Transport Route 11 / 14"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Parking Facilities
                </label>
                <input
                  type="text"
                  value={parking}
                  onChange={e => setParking(e.target.value)}
                  placeholder="e.g. Dedicated paid parking outside complex"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: VISIT INFORMATION & BUDGET */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Clock className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                4. Timings, Entry Fees & Visitor Budget
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Opening Time
                </label>
                <input
                  type="text"
                  value={openingTime}
                  onChange={e => setOpeningTime(e.target.value)}
                  placeholder="06:00 AM"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Closing Time
                </label>
                <input
                  type="text"
                  value={closingTime}
                  onChange={e => setClosingTime(e.target.value)}
                  placeholder="05:00 PM"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Entry Fee / Tickets
                </label>
                <input
                  type="text"
                  value={entryFee}
                  onChange={e => setEntryFee(e.target.value)}
                  placeholder="Free / ₹50 (Indians)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Est. Budget (₹ / person)
                </label>
                <input
                  type="number"
                  min="0"
                  value={estimatedBudget}
                  onChange={e => setEstimatedBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-bold text-amber-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Best Time of Day / Season
                </label>
                <select
                  value={bestTime}
                  onChange={e => setBestTime(e.target.value as BestTimeToVisit)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                >
                  <option value="Morning">Morning (Golden Light & Fewer Crowds)</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening (Cooler Breeze & Illumination)</option>
                  <option value="Sunset">Sunset</option>
                  <option value="Night">Night</option>
                  <option value="Any Time">Any Time of Day</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Recommended Duration
                </label>
                <input
                  type="text"
                  value={recommendedDuration}
                  onChange={e => setRecommendedDuration(e.target.value)}
                  placeholder="e.g. 2-3 Hours / 1 Hour"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: DISCOVERY, VISIBILITY & STATUS */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
                5. Discovery, Visibility & Curation Badges
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-semibold"
                >
                  <option value="published">Published (Live for Public)</option>
                  <option value="draft">Draft (Curator Review Only)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
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
                      Featured Hero Spot
                    </div>
                    <div className="text-[10px] text-stone-500">Showcase on Home and Highlights</div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  hiddenGem ? 'bg-teal-50 border-teal-300 shadow-sm' : 'bg-stone-50 border-stone-200'
                }`}>
                  <input
                    type="checkbox"
                    checked={hiddenGem}
                    onChange={e => setHiddenGem(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                  <div>
                    <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5 text-teal-600" />
                      Hidden Gem Badge
                    </div>
                    <div className="text-[10px] text-stone-500">Curated off-the-beaten-path gem</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </form>

        {/* MODAL STICKY FOOTER */}
        <div className="bg-stone-100 px-6 py-4 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-2">
            <span>Saves directly to Supabase PostgreSQL with Realtime live broadcast.</span>
            {DraftService.hasDraft('destination', draftRecordId) && (
              <span className="text-amber-700 font-semibold">• Local draft active</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {DraftService.hasDraft('destination', draftRecordId) && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleDiscardDraft}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                id="footer-discard-place-draft-btn"
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
              id="cancel-place-form-btn"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              id="save-place-form-btn"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Persisting to Database...' : (initialData ? 'Update Destination' : 'Create Destination')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
