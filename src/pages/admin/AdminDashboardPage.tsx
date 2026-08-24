import React, { useState, useEffect } from 'react';
import { Place, LocalBusiness, EmergencyService, CategoryInfo, VibeInfo, PlaceCategory, PlaceVibe } from '../../types';
import { PlaceService } from '../../services/placeService';
import { StorageService } from '../../services/storageService';
import { AuthService } from '../../services/authService';
import { 
  Landmark, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, 
  Sparkles, Flame, Gem, Store, ShieldAlert, Database, RotateCcw, 
  Save, X, Eye, LogOut, ArrowLeft, Download, Upload, Layers, MapPin, 
  SlidersHorizontal, Check, RefreshCw
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
}

type TabType = 'places' | 'businesses' | 'emergency' | 'database';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('places');
  const [places, setPlaces] = useState<Place[]>([]);
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Place Modal / Form State
  const [isEditingPlace, setIsEditingPlace] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [placeFormData, setPlaceFormData] = useState<Partial<Place>>({
    name: '',
    hindiName: '',
    slug: '',
    category: 'historical',
    subcategory: '',
    shortDescription: '',
    description: '',
    story: '',
    coverImage: '',
    galleryImages: [],
    latitude: 26.8687,
    longitude: 80.9135,
    area: 'Hussainabad',
    address: 'Lucknow, Uttar Pradesh',
    openingTime: '06:00 AM',
    closingTime: '05:00 PM',
    entryFee: 'Free',
    estimatedBudget: 0,
    bestTime: 'Morning',
    recommendedDuration: '2 Hours',
    vibes: ['Heritage'],
    whyVisit: [],
    howToReach: {
      nearestMetro: '',
      autoCabTips: '',
      busRoute: '',
      parking: ''
    },
    featured: false,
    hiddenGem: false,
    status: 'published'
  });

  // Gallery URLs text helper
  const [galleryInput, setGalleryInput] = useState('');
  const [whyVisitInput, setWhyVisitInput] = useState('');

  // Business Modal / Form State
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [editingBusinessId, setEditingBusinessId] = useState<string | null>(null);
  const [businessFormData, setBusinessFormData] = useState<Partial<LocalBusiness>>({
    name: '',
    category: 'attire',
    specialty: '',
    description: '',
    image: '',
    area: 'Chowk',
    address: 'Lucknow, Uttar Pradesh',
    contactNumber: '+91 522 2256000',
    featured: true,
    status: 'published'
  });

  // Emergency Modal / Form State
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);
  const [editingEmergencyId, setEditingEmergencyId] = useState<string | null>(null);
  const [emergencyFormData, setEmergencyFormData] = useState<Partial<EmergencyService>>({
    serviceName: '',
    category: 'police',
    number: '',
    description: '',
    address: 'Lucknow, UP',
    availability: '24x7',
    officialSource: 'UP Government',
    enabled: true
  });

  useEffect(() => {
    // Check if user is logged in
    if (!AuthService.isLoggedIn()) {
      onNavigate('/admin/login');
      return;
    }
    loadData();
  }, []);

  const loadData = () => {
    setPlaces(PlaceService.getAllPlaces());
    setBusinesses(StorageService.getBusinesses());
    setEmergencyServices(StorageService.getEmergencyServices());
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleLogout = () => {
    AuthService.logout();
    onNavigate('/admin/login');
  };

  // -------------------------------------------------------------
  // PLACE HANDLERS
  // -------------------------------------------------------------
  const handleOpenNewPlace = () => {
    setEditingPlaceId(null);
    setPlaceFormData({
      name: '',
      hindiName: '',
      slug: '',
      category: 'historical',
      subcategory: 'Monument',
      shortDescription: '',
      description: '',
      story: '',
      coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
      galleryImages: [],
      latitude: 26.8687,
      longitude: 80.9135,
      area: 'Hussainabad',
      address: 'Lucknow, Uttar Pradesh',
      openingTime: '06:00 AM',
      closingTime: '05:00 PM',
      entryFee: 'Free',
      estimatedBudget: 0,
      bestTime: 'Morning',
      recommendedDuration: '2 Hours',
      vibes: ['Heritage'],
      whyVisit: ['Witness historic Lakhnawi craftsmanship'],
      howToReach: {
        nearestMetro: 'Chowk / Hussainabad metro access',
        autoCabTips: 'E-rickshaws widely available from Charbagh',
        busRoute: 'City bus routes to Hussainabad',
        parking: 'Public parking available outside'
      },
      featured: false,
      hiddenGem: false,
      status: 'published'
    });
    setGalleryInput('');
    setWhyVisitInput('Witness historic Lakhnawi craftsmanship\nAdmire 18th century vaulted architecture');
    setIsEditingPlace(true);
  };

  const handleOpenEditPlace = (place: Place) => {
    setEditingPlaceId(place.id);
    setPlaceFormData({ ...place });
    setGalleryInput((place.galleryImages || []).join('\n'));
    setWhyVisitInput((place.whyVisit || []).join('\n'));
    setIsEditingPlace(true);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeFormData.name || !placeFormData.description) {
      showNotification('Place Name and Description are required', 'error');
      return;
    }

    const galleries = galleryInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const whyVisits = whyVisitInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const finalSlug = placeFormData.slug?.trim() || 
      placeFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const payload: Partial<Place> = {
      ...placeFormData,
      slug: finalSlug,
      galleryImages: galleries.length > 0 ? galleries : [placeFormData.coverImage || ''],
      whyVisit: whyVisits
    };

    if (editingPlaceId) {
      PlaceService.updatePlace(editingPlaceId, payload);
      showNotification(`Updated "${payload.name}" successfully!`);
    } else {
      PlaceService.createPlace(payload as any);
      showNotification(`Created new destination "${payload.name}"!`);
    }

    setIsEditingPlace(false);
    loadData();
  };

  const handleDeletePlace = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      PlaceService.deletePlace(id);
      showNotification(`Deleted "${name}"`);
      loadData();
    }
  };

  const handleToggleFeatured = (place: Place) => {
    PlaceService.updatePlace(place.id, { featured: !place.featured });
    showNotification(`Toggled featured status for ${place.name}`);
    loadData();
  };

  const handleToggleHiddenGem = (place: Place) => {
    PlaceService.updatePlace(place.id, { hiddenGem: !place.hiddenGem });
    showNotification(`Toggled hidden gem status for ${place.name}`);
    loadData();
  };

  // -------------------------------------------------------------
  // BUSINESS HANDLERS
  // -------------------------------------------------------------
  const handleOpenNewBusiness = () => {
    setEditingBusinessId(null);
    setBusinessFormData({
      name: '',
      category: 'attire',
      specialty: 'Authentic Chikankari Work',
      description: 'Generations-old craft shop in Old Lucknow.',
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80',
      area: 'Chowk',
      address: 'Chowk, Lucknow, Uttar Pradesh',
      contactNumber: '+91 522 2256000',
      featured: true,
      status: 'published'
    });
    setIsEditingBusiness(true);
  };

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessFormData.name) return;

    if (editingBusinessId) {
      StorageService.updateBusiness(editingBusinessId, businessFormData);
      showNotification('Updated local business successfully');
    } else {
      StorageService.addBusiness(businessFormData as any);
      showNotification('Added new local business successfully');
    }
    setIsEditingBusiness(false);
    loadData();
  };

  const handleDeleteBusiness = (id: string) => {
    if (window.confirm('Delete this local business record?')) {
      StorageService.deleteBusiness(id);
      showNotification('Deleted business');
      loadData();
    }
  };

  // -------------------------------------------------------------
  // EMERGENCY SERVICE HANDLERS
  // -------------------------------------------------------------
  const handleOpenNewEmergency = () => {
    setEditingEmergencyId(null);
    setEmergencyFormData({
      serviceName: '',
      category: 'police',
      number: '112',
      description: '24x7 emergency helpline',
      address: 'Lucknow, UP',
      availability: '24x7',
      officialSource: 'UP Government',
      enabled: true
    });
    setIsEditingEmergency(true);
  };

  const handleSaveEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyFormData.serviceName || !emergencyFormData.number) return;

    if (editingEmergencyId) {
      StorageService.updateEmergencyService(editingEmergencyId, emergencyFormData);
      showNotification('Updated emergency helpline record');
    } else {
      StorageService.addEmergencyService(emergencyFormData as any);
      showNotification('Added emergency helpline');
    }
    setIsEditingEmergency(false);
    loadData();
  };

  const handleDeleteEmergency = (id: string) => {
    if (window.confirm('Delete this helpline service?')) {
      StorageService.deleteEmergencyService(id);
      showNotification('Deleted helpline');
      loadData();
    }
  };

  // -------------------------------------------------------------
  // DATABASE ACTIONS
  // -------------------------------------------------------------
  const handleResetDatabase = () => {
    if (window.confirm('WARNING: Reset database to authentic factory default Lucknow records? Any custom additions will be restored to seed state.')) {
      StorageService.resetToSeed();
      showNotification('Database successfully reset to authentic Lucknow seed!');
      loadData();
    }
  };

  const handleExportJSON = () => {
    const data = StorageService.exportFullDatabase();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nawabi_safar_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showNotification('Database exported to JSON');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const ok = StorageService.importFullDatabase(content);
      if (ok) {
        showNotification('Database restored from JSON successfully!');
        loadData();
      } else {
        showNotification('Failed to parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Filtered places
  const filteredPlaces = places.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const stats = StorageService.getStats();

  return (
    <div className="w-full min-h-screen bg-[#F7F5F0] text-stone-900 pb-20" id="admin-dashboard-container">
      {/* Top Admin Navigation Bar */}
      <header className="bg-[#181512] text-white border-b border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/')}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors flex items-center gap-1 text-xs"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Public Site</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-royal text-lg font-bold tracking-wider text-amber-400">
                NAWABI SAFAR
              </span>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold font-mono">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 hidden sm:inline">
              Curator: <strong>{AuthService.getCurrentUser()?.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              id="admin-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification toast */}
      {statusMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-red-950 text-red-200 border-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI / STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Destinations</div>
            <div className="text-2xl font-bold text-stone-900 mt-1 font-serif-heading">{places.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{places.filter(p => p.status === 'published').length} Active Live</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Featured Places</div>
            <div className="text-2xl font-bold text-amber-700 mt-1 font-serif-heading">
              {places.filter(p => p.featured).length}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Hero Highlights</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Hidden Gems</div>
            <div className="text-2xl font-bold text-teal-700 mt-1 font-serif-heading">
              {places.filter(p => p.hiddenGem).length}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Off-Beat Gems</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Local Businesses</div>
            <div className="text-2xl font-bold text-stone-900 mt-1 font-serif-heading">{businesses.length}</div>
            <div className="text-[10px] text-stone-400 mt-0.5">Verified Merchants</div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Platform Visitors</div>
            <div className="text-2xl font-bold text-stone-900 mt-1 font-serif-heading">{stats.totalVisitors}</div>
            <div className="text-[10px] text-stone-400 mt-0.5">Session Counter</div>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'places', label: `Destinations (${places.length})`, icon: Landmark },
              { id: 'businesses', label: `Local Businesses (${businesses.length})`, icon: Store },
              { id: 'emergency', label: `Emergency Contacts (${emergencyServices.length})`, icon: ShieldAlert },
              { id: 'database', label: 'Database & Backup', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-amber-700 text-white shadow-md'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'places' && (
            <button
              onClick={handleOpenNewPlace}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              id="admin-add-new-place-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Destination</span>
            </button>
          )}

          {activeTab === 'businesses' && (
            <button
              onClick={handleOpenNewBusiness}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Local Business</span>
            </button>
          )}

          {activeTab === 'emergency' && (
            <button
              onClick={handleOpenNewEmergency}
              className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Emergency Helpline</span>
            </button>
          )}
        </div>

        {/* TAB 1: PLACES MANAGEMENT */}
        {activeTab === 'places' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter places by name or locality..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Categories</option>
                  <option value="historical">Historical</option>
                  <option value="food">Food & Awadhi</option>
                  <option value="shopping">Shopping & Bazaars</option>
                  <option value="parks">Parks & Nature</option>
                  <option value="culture">Culture & Museums</option>
                  <option value="spiritual">Spiritual</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100/70 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="py-3.5 px-4">Destination</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Area / Locality</th>
                      <th className="py-3.5 px-4">Budget</th>
                      <th className="py-3.5 px-4 text-center">Featured</th>
                      <th className="py-3.5 px-4 text-center">Hidden Gem</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredPlaces.map(place => (
                      <tr key={place.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={place.coverImage}
                              alt={place.name}
                              className="w-10 h-10 rounded-lg object-cover bg-stone-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-stone-900 text-sm line-clamp-1">{place.name}</div>
                              {place.hindiName && (
                                <div className="text-[11px] text-amber-800 font-serif">{place.hindiName}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800">
                            {place.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-stone-800">
                          {place.area}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-amber-800">
                          {place.estimatedBudget === 0 ? 'Free' : `₹${place.estimatedBudget}`}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(place)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              place.featured ? 'bg-amber-100 text-amber-800 font-bold' : 'text-stone-300 hover:text-stone-500'
                            }`}
                            title="Toggle Featured"
                          >
                            <Flame className="w-4 h-4" />
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleHiddenGem(place)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              place.hiddenGem ? 'bg-teal-100 text-teal-800 font-bold' : 'text-stone-300 hover:text-stone-500'
                            }`}
                            title="Toggle Hidden Gem"
                          >
                            <Gem className="w-4 h-4" />
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            place.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}>
                            {place.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onNavigate(`/places/${place.slug}`)}
                              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors"
                              title="Preview on site"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditPlace(place)}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
                              title="Edit Destination"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlace(place.id, place.name)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                              title="Delete Destination"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOCAL BUSINESSES */}
        {activeTab === 'businesses' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map(b => (
                <div key={b.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                        {b.category}
                      </span>
                      {b.featured && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          Featured
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-stone-900 text-base">{b.name}</h4>
                    <p className="text-xs text-amber-800 font-medium">{b.specialty}</p>
                    <p className="text-xs text-stone-600 mt-2 line-clamp-2">{b.description}</p>
                    <div className="mt-3 text-xs text-stone-500">
                      <div><strong>Phone:</strong> {b.contactNumber}</div>
                      <div><strong>Area:</strong> {b.area}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingBusinessId(b.id);
                        setBusinessFormData({ ...b });
                        setIsEditingBusiness(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBusiness(b.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EMERGENCY DIRECTORY */}
        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emergencyServices.map(s => (
                <div key={s.id} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                        {s.category}
                      </span>
                      <span className="text-xs font-bold text-red-700 font-mono">
                        {s.number}
                      </span>
                    </div>
                    <h4 className="font-bold text-stone-900 text-base">{s.serviceName}</h4>
                    <p className="text-xs text-stone-600 mt-1">{s.description}</p>
                    <div className="mt-2 text-xs text-stone-400">
                      Availability: {s.availability} • Source: {s.officialSource}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingEmergencyId(s.id);
                        setEmergencyFormData({ ...s });
                        setIsEditingEmergency(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEmergency(s.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE & BACKUPS */}
        {activeTab === 'database' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                  Data Persistence & Factory Reset
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Nawabi Safar uses browser storage persistence with export/import JSON capabilities. You can reset anytime to restore authentic Lucknow records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleExportJSON}
                  className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-left transition-colors flex items-start gap-3"
                >
                  <Download className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Export Full Database (.json)</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Download current places, businesses, and settings.</div>
                  </div>
                </button>

                <label className="p-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-left transition-colors flex items-start gap-3 cursor-pointer">
                  <Upload className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Import Database Backup</div>
                    <div className="text-[11px] text-amber-200 mt-0.5">Restore database from a saved JSON file.</div>
                  </div>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>

              <div className="pt-6 border-t border-stone-100">
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-red-900 text-sm">Reset to Official Seed Data</h4>
                    <p className="text-xs text-red-700 mt-0.5">
                      Restores all {places.length} Lucknow monuments, foods, bazaars, and contacts to factory standard.
                    </p>
                  </div>

                  <button
                    onClick={handleResetDatabase}
                    className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow shrink-0 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Database</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PLACE EDIT / ADD MODAL */}
      {/* ------------------------------------------------------------- */}
      {isEditingPlace && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  {editingPlaceId ? 'Edit Destination' : 'New Destination'}
                </span>
                <h3 className="text-2xl font-bold font-serif-heading text-stone-900">
                  {placeFormData.name || 'Untitled Destination'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingPlace(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-6 text-xs sm:text-sm">
              {/* Row 1: Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Place Name *</label>
                  <input
                    type="text"
                    required
                    value={placeFormData.name || ''}
                    onChange={e => setPlaceFormData({ ...placeFormData, name: e.target.value })}
                    placeholder="e.g. Bara Imambara"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Hindi Name</label>
                  <input
                    type="text"
                    value={placeFormData.hindiName || ''}
                    onChange={e => setPlaceFormData({ ...placeFormData, hindiName: e.target.value })}
                    placeholder="e.g. बड़ा इमामबाड़ा"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-amber-500 font-serif"
                  />
                </div>
              </div>

              {/* Row 2: Category & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={placeFormData.category || 'historical'}
                    onChange={e => setPlaceFormData({ ...placeFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="historical">Historical & Heritage</option>
                    <option value="food">Food & Awadhi</option>
                    <option value="shopping">Shopping & Bazaars</option>
                    <option value="parks">Parks & Nature</option>
                    <option value="culture">Culture & Museums</option>
                    <option value="spiritual">Spiritual</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={placeFormData.subcategory || ''}
                    onChange={e => setPlaceFormData({ ...placeFormData, subcategory: e.target.value })}
                    placeholder="e.g. Awadhi Monument / Kebab Stall"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Locality / Area *</label>
                  <input
                    type="text"
                    required
                    value={placeFormData.area || ''}
                    onChange={e => setPlaceFormData({ ...placeFormData, area: e.target.value })}
                    placeholder="e.g. Hussainabad / Chowk / Hazratganj"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              {/* Row 3: Descriptions */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Short One-Line Summary</label>
                <input
                  type="text"
                  value={placeFormData.shortDescription || ''}
                  onChange={e => setPlaceFormData({ ...placeFormData, shortDescription: e.target.value })}
                  placeholder="e.g. 18th-century royal architectural complex famous for Bhool Bhulaiya."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={placeFormData.description || ''}
                  onChange={e => setPlaceFormData({ ...placeFormData, description: e.target.value })}
                  placeholder="Comprehensive description of the place, significance, and experience..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Historical & Cultural Story</label>
                <textarea
                  rows={2}
                  value={placeFormData.story || ''}
                  onChange={e => setPlaceFormData({ ...placeFormData, story: e.target.value })}
                  placeholder="Royal background, Nawab patrons, famine relief origin, folk tales..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 italic font-serif"
                />
              </div>

              {/* Row 4: Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Cover Image URL *</label>
                  <input
                    type="url"
                    required
                    value={placeFormData.coverImage || ''}
                    onChange={e => setPlaceFormData({ ...placeFormData, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Additional Photo URLs (1 per line)</label>
                  <textarea
                    rows={2}
                    value={galleryInput}
                    onChange={e => setGalleryInput(e.target.value)}
                    placeholder="https://...\nhttps://..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Row 5: Coordinates & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Latitude (e.g. 26.8687)</label>
                  <input
                    type="number"
                    step="any"
                    value={placeFormData.latitude || 26.8687}
                    onChange={e => setPlaceFormData({ ...placeFormData, latitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Longitude (e.g. 80.9135)</label>
                  <input
                    type="number"
                    step="any"
                    value={placeFormData.longitude || 80.9135}
                    onChange={e => setPlaceFormData({ ...placeFormData, longitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Full Postal Address</label>
                  <input
                    type="text"
                    value={placeFormData.address || ''}
                    onChange={e => setPlaceFormData({ ...placeFormData, address: e.target.value })}
                    placeholder="Machchhi Bhavan, Lucknow, Uttar Pradesh 226003"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              {/* Row 6: Timings, Fees & Budget */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Opening Time</label>
                  <input
                    type="text"
                    value={placeFormData.openingTime || '06:00 AM'}
                    onChange={e => setPlaceFormData({ ...placeFormData, openingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Closing Time</label>
                  <input
                    type="text"
                    value={placeFormData.closingTime || '05:00 PM'}
                    onChange={e => setPlaceFormData({ ...placeFormData, closingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Entry Fee</label>
                  <input
                    type="text"
                    value={placeFormData.entryFee || 'Free'}
                    onChange={e => setPlaceFormData({ ...placeFormData, entryFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Est. Budget (₹ / person)</label>
                  <input
                    type="number"
                    value={placeFormData.estimatedBudget ?? 0}
                    onChange={e => setPlaceFormData({ ...placeFormData, estimatedBudget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              {/* Row 7: Why Visit Bullets */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Why Visit Highlights (1 point per line)</label>
                <textarea
                  rows={2}
                  value={whyVisitInput}
                  onChange={e => setWhyVisitInput(e.target.value)}
                  placeholder="Point 1\nPoint 2\nPoint 3"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              {/* Switches */}
              <div className="flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="flex items-center gap-2 font-bold cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    checked={placeFormData.featured || false}
                    onChange={e => setPlaceFormData({ ...placeFormData, featured: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span>Featured Destination (Hero Showcase)</span>
                </label>

                <label className="flex items-center gap-2 font-bold cursor-pointer text-stone-800">
                  <input
                    type="checkbox"
                    checked={placeFormData.hiddenGem || false}
                    onChange={e => setPlaceFormData({ ...placeFormData, hiddenGem: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                  <span>Hidden Gem (Off-the-beaten-track)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingPlace(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Destination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BUSINESS EDIT / ADD MODAL */}
      {/* ------------------------------------------------------------- */}
      {isEditingBusiness && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-5">
              <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                {editingBusinessId ? 'Edit Local Merchant' : 'Add Local Merchant'}
              </h3>
              <button onClick={() => setIsEditingBusiness(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={businessFormData.name || ''}
                  onChange={e => setBusinessFormData({ ...businessFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Specialty / Subtitle *</label>
                <input
                  type="text"
                  required
                  value={businessFormData.specialty || ''}
                  onChange={e => setBusinessFormData({ ...businessFormData, specialty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={businessFormData.description || ''}
                  onChange={e => setBusinessFormData({ ...businessFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={businessFormData.contactNumber || ''}
                    onChange={e => setBusinessFormData({ ...businessFormData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Area</label>
                  <input
                    type="text"
                    value={businessFormData.area || ''}
                    onChange={e => setBusinessFormData({ ...businessFormData, area: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={businessFormData.image || ''}
                  onChange={e => setBusinessFormData({ ...businessFormData, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBusiness(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-stone-950 font-bold"
                >
                  Save Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EMERGENCY EDIT / ADD MODAL */}
      {/* ------------------------------------------------------------- */}
      {isEditingEmergency && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-5">
              <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                {editingEmergencyId ? 'Edit Emergency Record' : 'Add Emergency Helpline'}
              </h3>
              <button onClick={() => setIsEditingEmergency(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEmergency} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={emergencyFormData.serviceName || ''}
                  onChange={e => setEmergencyFormData({ ...emergencyFormData, serviceName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Number *</label>
                  <input
                    type="text"
                    required
                    value={emergencyFormData.number || ''}
                    onChange={e => setEmergencyFormData({ ...emergencyFormData, number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={emergencyFormData.category || 'police'}
                    onChange={e => setEmergencyFormData({ ...emergencyFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                  >
                    <option value="police">Police</option>
                    <option value="medical">Medical</option>
                    <option value="tourist">Tourist</option>
                    <option value="women">Women</option>
                    <option value="fire">Fire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={emergencyFormData.description || ''}
                  onChange={e => setEmergencyFormData({ ...emergencyFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingEmergency(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 text-white font-bold"
                >
                  Save Helpline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
