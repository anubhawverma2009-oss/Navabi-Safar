import React, { useState, useEffect } from 'react';
import { Place, LocalBusiness, EmergencyService, CategoryInfo, VibeInfo, PlaceCategory, PlaceVibe } from '../../types';
import { PlaceService } from '../../services/placeService';
import { StorageService } from '../../services/storageService';
import { AuthService } from '../../services/authService';
import { VisitorService } from '../../services/visitorService';
import { isSupabaseConfigured, testSupabaseConnection } from '../../lib/supabaseClient';
import { AdminReviewsManager } from '../../components/admin/AdminReviewsManager';
import { PlaceFormModal } from '../../components/admin/PlaceFormModal';
import { BusinessFormModal } from '../../components/admin/BusinessFormModal';
import { 
  Landmark, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search, 
  Sparkles, Flame, Gem, Store, ShieldAlert, Database, RotateCcw, 
  Save, X, Eye, LogOut, ArrowLeft, Download, Upload, Layers, MapPin, 
  SlidersHorizontal, Check, RefreshCw, KeyRound, Lock, ShieldCheck, Cloud, AlertCircle, Copy,
  MessageSquare, Star, Clock
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
}

type TabType = 'places' | 'businesses' | 'emergency' | 'reviews' | 'database' | 'security';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('places');
  const [places, setPlaces] = useState<Place[]>([]);
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [platformVisitorsCount, setPlatformVisitorsCount] = useState<number>(() => VisitorService.getPlatformVisitorCountSync());

  // Password Management State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Place Modal / Form State
  const [isEditingPlace, setIsEditingPlace] = useState(false);
  const [selectedPlaceForEdit, setSelectedPlaceForEdit] = useState<Place | null>(null);
  const [isSavingPlace, setIsSavingPlace] = useState(false);

  // Business Modal / Form State
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [selectedBusinessForEdit, setSelectedBusinessForEdit] = useState<LocalBusiness | null>(null);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

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

  // Supabase Cloud State
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [isSeedingSupabase, setIsSeedingSupabase] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initAdmin() {
      // Check if user is logged in
      if (!AuthService.isLoggedIn()) {
        onNavigate('/admin/login');
        return;
      }

      // Authoritatively verify with Supabase Auth to refresh token
      if (isSupabaseConfigured()) {
        const verified = await AuthService.verifySession();
        if (!verified && isMounted) {
          showNotification('Admin session expired. Please sign in again.', 'error');
          onNavigate('/admin/login');
          return;
        }
      }

      if (isMounted) {
        loadData();
      }

      // Fetch authoritative platform visitor count from Supabase
      VisitorService.getPlatformVisitorCount().then(cnt => {
        if (isMounted) {
          setPlatformVisitorsCount(cnt);
        }
      });
    }

    initAdmin();

    // Subscribe to remote storage sync updates
    const unsubscribe = StorageService.subscribe(() => {
      if (isMounted) {
        loadData();
      }
    });

    // Subscribe to live Realtime platform visitor counter
    const unsubscribeVisitors = VisitorService.subscribe(() => {
      if (isMounted) {
        setPlatformVisitorsCount(VisitorService.getPlatformVisitorCountSync());
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      unsubscribeVisitors();
    };
  }, []);

  const loadData = () => {
    setPlaces(PlaceService.getAllPlaces());
    setBusinesses(StorageService.getBusinesses());
    setEmergencyServices(StorageService.getEmergencyServices());
  };

  const handleTestSupabase = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setDbTestResult(res);
      if (res.success) {
        showNotification('Successfully connected to Supabase PostgreSQL database!');
      } else {
        showNotification(res.message, 'error');
      }
    } catch (e: any) {
      setDbTestResult({ success: false, message: e.message || 'Connection test failed' });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSyncSeedToSupabase = async () => {
    setIsSeedingSupabase(true);
    setSeedResult(null);
    try {
      const res = await StorageService.syncSeedToSupabase();
      setSeedResult(res);
      if (res.success) {
        showNotification(res.message);
        loadData();
      } else {
        showNotification(res.message, 'error');
      }
    } catch (e: any) {
      setSeedResult({ success: false, message: e.message || 'Seed migration failed' });
    } finally {
      setIsSeedingSupabase(false);
    }
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
    setSelectedPlaceForEdit(null);
    setIsEditingPlace(true);
  };

  const handleOpenEditPlace = (place: Place) => {
    setSelectedPlaceForEdit(place);
    setIsEditingPlace(true);
  };

  const handleSavePlaceModal = async (payload: Partial<Place>) => {
    setIsSavingPlace(true);
    try {
      if (selectedPlaceForEdit && selectedPlaceForEdit.id) {
        await PlaceService.updatePlace(selectedPlaceForEdit.id, payload);
        showNotification(`Updated "${payload.name}" in database successfully!`);
      } else {
        await PlaceService.createPlace(payload as any);
        showNotification(`Created new destination "${payload.name}" in database!`);
      }
      setIsEditingPlace(false);
      setSelectedPlaceForEdit(null);
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Database write failed. Check your admin permissions.', 'error');
      throw err;
    } finally {
      setIsSavingPlace(false);
    }
  };

  const handleDeletePlace = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}" from the database?`)) {
      try {
        await PlaceService.deletePlace(id);
        showNotification(`Deleted "${name}" from database.`);
        loadData();
      } catch (err: any) {
        showNotification(err.message || 'Database deletion failed', 'error');
      }
    }
  };

  const handleToggleFeatured = async (place: Place) => {
    try {
      await PlaceService.updatePlace(place.id, { featured: !place.featured });
      showNotification(`Toggled featured status for ${place.name}`);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update featured status', 'error');
    }
  };

  const handleToggleHiddenGem = async (place: Place) => {
    try {
      await PlaceService.updatePlace(place.id, { hiddenGem: !place.hiddenGem });
      showNotification(`Toggled hidden gem status for ${place.name}`);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update hidden gem status', 'error');
    }
  };

  // -------------------------------------------------------------
  // BUSINESS HANDLERS
  // -------------------------------------------------------------
  const handleOpenNewBusiness = () => {
    setSelectedBusinessForEdit(null);
    setIsEditingBusiness(true);
  };

  const handleOpenEditBusiness = (biz: LocalBusiness) => {
    setSelectedBusinessForEdit(biz);
    setIsEditingBusiness(true);
  };

  const handleSaveBusinessModal = async (businessData: Partial<LocalBusiness>) => {
    setIsSavingBusiness(true);
    try {
      if (selectedBusinessForEdit && selectedBusinessForEdit.id) {
        const res = await StorageService.updateBusiness(selectedBusinessForEdit.id, businessData);
        if (!res.success) throw new Error(res.error || 'Failed to update business');
        showNotification(`Updated "${businessData.name}" in database successfully`);
      } else {
        const res = await StorageService.addBusiness(businessData as any);
        if (!res.success) throw new Error(res.error || 'Failed to add business');
        showNotification(`Added new local business "${businessData.name}" to database`);
      }
      setIsEditingBusiness(false);
      setSelectedBusinessForEdit(null);
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save business', 'error');
      throw err;
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (window.confirm('Delete this local business record from database?')) {
      try {
        const res = await StorageService.deleteBusiness(id);
        if (!res.success) throw new Error(res.error || 'Failed to delete business');
        showNotification('Deleted business from database');
        loadData();
      } catch (err: any) {
        showNotification(err.message || 'Failed to delete business', 'error');
      }
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

  const handleSaveEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyFormData.serviceName || !emergencyFormData.number) return;

    try {
      if (editingEmergencyId) {
        const res = await StorageService.updateEmergencyService(editingEmergencyId, emergencyFormData);
        if (!res.success) throw new Error(res.error || 'Failed to update emergency helpline');
        showNotification('Updated emergency helpline record in database');
      } else {
        const res = await StorageService.addEmergencyService(emergencyFormData as any);
        if (!res.success) throw new Error(res.error || 'Failed to add emergency helpline');
        showNotification('Added emergency helpline to database');
      }
      setIsEditingEmergency(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save helpline', 'error');
    }
  };

  const handleDeleteEmergency = async (id: string) => {
    if (window.confirm('Delete this helpline service from database?')) {
      try {
        const res = await StorageService.deleteEmergencyService(id);
        if (!res.success) throw new Error(res.error || 'Failed to delete helpline');
        showNotification('Deleted helpline from database');
        loadData();
      } catch (err: any) {
        showNotification(err.message || 'Failed to delete helpline', 'error');
      }
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

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    const res = await AuthService.changePassword(newPassword);
    if (res.success) {
      showNotification('Administrator password updated successfully in Supabase Auth!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
    } else {
      setPasswordError(res.error || 'Failed to update administrator password in Supabase.');
    }
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
              onClick={() => {
                setPasswordError(null);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setIsChangingPassword(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
              id="admin-change-pwd-header-btn"
              title="Change Administrator Password"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Change Password</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
            <div className="text-2xl font-bold text-stone-900 mt-1 font-serif-heading">{platformVisitorsCount.toLocaleString()}</div>
            <div className="text-[10px] text-stone-400 mt-0.5">Unique Visitors</div>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
            {[
              { id: 'places', label: `Destinations (${places.length})`, icon: Landmark },
              { id: 'businesses', label: `Local Businesses (${businesses.length})`, icon: Store },
              { id: 'emergency', label: `Emergency Contacts (${emergencyServices.length})`, icon: ShieldAlert },
              { id: 'reviews', label: 'Reviews & Feedback', icon: MessageSquare },
              { id: 'database', label: 'Database & Backup', icon: Database },
              { id: 'security', label: 'Security & Password', icon: KeyRound }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
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
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              id="admin-add-new-place-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Destination</span>
            </button>
          )}

          {activeTab === 'businesses' && (
            <button
              onClick={handleOpenNewBusiness}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Local Business</span>
            </button>
          )}

          {activeTab === 'emergency' && (
            <button
              onClick={handleOpenNewEmergency}
              className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
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
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-xs text-stone-600">
                Displaying <strong>{businesses.length}</strong> local merchants registered on Nawabi Safar.
              </div>
            </div>

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
                    <div className="mt-3 text-xs text-stone-500 space-y-0.5">
                      {b.ownerName && <div><strong>Owner:</strong> {b.ownerName}</div>}
                      <div><strong>Phone:</strong> {b.contactNumber}</div>
                      <div><strong>Area:</strong> {b.area}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditBusiness(b)}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBusiness(b.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 cursor-pointer"
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
          <div className="max-w-4xl space-y-6">
            {/* Supabase Cloud Relational Database Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                      Supabase Cloud PostgreSQL Database
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Centralized multi-device synchronization engine for tourist places, artisan shops, and emergency directories.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSupabaseConfigured() ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Cloud Sync Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      LocalStorage Fallback Active
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleTestSupabase}
                  disabled={isTestingDb}
                  className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-left transition-colors flex items-start gap-3 disabled:opacity-50 cursor-pointer"
                  id="admin-test-supabase-btn"
                >
                  <RefreshCw className={`w-5 h-5 text-amber-400 shrink-0 mt-0.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">
                      {isTestingDb ? 'Testing Connection...' : 'Test Supabase Connection'}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Verify live read/write capability to remote PostgreSQL instance.
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleSyncSeedToSupabase}
                  disabled={isSeedingSupabase || !isSupabaseConfigured()}
                  className="p-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-left transition-colors flex items-start gap-3 disabled:opacity-50 cursor-pointer"
                  id="admin-seed-supabase-btn"
                >
                  <CheckCircle2 className={`w-5 h-5 text-amber-300 shrink-0 mt-0.5 ${isSeedingSupabase ? 'animate-pulse' : ''}`} />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">
                      {isSeedingSupabase ? 'Migrating Data...' : 'Sync & Seed to Supabase'}
                    </div>
                    <div className="text-[11px] text-amber-200 mt-0.5">
                      Upload all {places.length} places & businesses to cloud database without duplicates.
                    </div>
                  </div>
                </button>
              </div>

              {/* Database Test Alert */}
              {dbTestResult && (
                <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium ${
                  dbTestResult.success 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {dbTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                    {dbTestResult.success ? 'Supabase Connection Verified' : 'Supabase Connection Notice'}
                  </div>
                  <div className="mt-1 text-xs opacity-90">{dbTestResult.message}</div>
                </div>
              )}

              {/* Seed Migration Alert */}
              {seedResult && (
                <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium ${
                  seedResult.success 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  <div className="font-bold">{seedResult.success ? 'Cloud Migration Complete' : 'Migration Result'}</div>
                  <div className="mt-1 text-xs opacity-90">{seedResult.message}</div>
                </div>
              )}

              {/* Architecture & SQL Schema Reference */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-2">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span>Database Configuration Guide (.env)</span>
                  <span className="text-[10px] font-mono bg-stone-200 px-2 py-0.5 rounded text-stone-800">supabase_schema.sql</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  To connect your custom Supabase project, supply <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in project settings. Run <code>supabase_schema.sql</code> in your Supabase SQL editor to create all required tables (<code>places</code>, <code>local_businesses</code>, <code>emergency_services</code>) with Row Level Security.
                </p>
              </div>
            </div>

            {/* Local Backup & Reset Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                  JSON Backups & Local Cache Operations
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Download offline snapshot backups or restore database state from any previously exported JSON bundle.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleExportJSON}
                  className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-left transition-colors flex items-start gap-3 cursor-pointer"
                >
                  <Download className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Export Full Database (.json)</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">Download snapshot of all places, businesses, and settings.</div>
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
                    className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Database</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS & FEEDBACK */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>Visitor Feedback & Review Moderation</span>
              </div>
              <h3 className="text-2xl font-bold font-serif-heading text-stone-900">
                Reviews, Ratings & Community Suggestions
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Moderate visitor destination reviews, review platform ratings, track community suggestions, and resolve reported inaccuracies.
              </p>
            </div>

            <AdminReviewsManager />
          </div>
        )}

        {/* TAB 5: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Administrator Security & Credentials</span>
              </div>
              <h3 className="text-2xl font-bold font-serif-heading text-stone-900">Change Admin Password</h3>
              <p className="text-xs text-stone-500 mt-1">
                Update the master administrator access password for Nawabi Safar curator management.
              </p>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current administrator password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    id="admin-change-current-pwd-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    id="admin-change-new-pwd-input"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    id="admin-change-confirm-pwd-input"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  id="admin-change-pwd-submit-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Password</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PLACE EDIT / ADD MODAL */}
      {/* ------------------------------------------------------------- */}
      <PlaceFormModal
        isOpen={isEditingPlace}
        onClose={() => {
          setIsEditingPlace(false);
          setSelectedPlaceForEdit(null);
        }}
        onSave={handleSavePlaceModal}
        initialData={selectedPlaceForEdit}
        existingPlaces={places}
        isSaving={isSavingPlace}
      />

      {/* ------------------------------------------------------------- */}
      {/* BUSINESS EDIT / ADD MODAL */}
      {/* ------------------------------------------------------------- */}
      <BusinessFormModal
        isOpen={isEditingBusiness}
        onClose={() => {
          setIsEditingBusiness(false);
          setSelectedBusinessForEdit(null);
        }}
        onSave={handleSaveBusinessModal}
        initialData={selectedBusinessForEdit}
        existingBusinesses={businesses}
        isSaving={isSavingBusiness}
      />

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

      {/* ------------------------------------------------------------- */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ------------------------------------------------------------- */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif-heading text-stone-900">
                    Change Admin Password
                  </h3>
                  <p className="text-[11px] text-stone-500">Update curator authentication key</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangingPassword(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 text-xs sm:text-sm" autoComplete="off">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Current Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">New Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Confirm New Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow cursor-pointer"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
