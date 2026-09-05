/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import { PlaceService } from './services/placeService';
import { AuthService } from './services/authService';
import { Navbar } from './components/layout/Navbar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { MapPage } from './pages/MapPage';
import { BuildMyDayPage } from './pages/BuildMyDayPage';
import { VibesPage } from './pages/VibesPage';
import { FeaturedPage } from './pages/FeaturedPage';
import { HiddenGemsPage } from './pages/HiddenGemsPage';
import { BusinessesPage } from './pages/BusinessesPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { AboutLucknowPage } from './pages/AboutLucknowPage';
import { AboutPlatformPage } from './pages/AboutPlatformPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { Place, PlaceCategory, PlaceVibe } from './types';
import { Search, X, MapPin, Sparkles, Flame, Gem, ArrowRight } from 'lucide-react';

export default function App() {
  // Current route state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/';
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  // Initialize seed & update count
  useEffect(() => {
    StorageService.initSeedData();
    setSavedCount(StorageService.getBookmarks().length);

    // Listen to popstate
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname + window.location.search || '/');
    };
    window.addEventListener('popstate', handlePopState);

    // Keyboard shortcut for search (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setQuickSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sync quick search query
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = PlaceService.searchPlaces(searchQuery.trim()).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const navigate = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    setMobileDrawerOpen(false);
    setQuickSearchOpen(false);
    setSearchQuery('');
    setSavedCount(StorageService.getBookmarks().length);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching logic
  const parseRoute = () => {
    const url = new URL(window.location.origin + currentRoute);
    const path = url.pathname;
    const params = url.searchParams;

    // Detail page: /places/:slug
    if (path.startsWith('/places/')) {
      const slug = path.replace('/places/', '').trim();
      return <PlaceDetailPage slug={slug} onNavigate={navigate} />;
    }

    switch (path) {
      case '/':
      case '':
        return <HomePage onNavigate={navigate} />;

      case '/explore':
        return (
          <ExplorePage
            onNavigate={navigate}
            initialCategory={(params.get('category') as PlaceCategory) || 'all'}
            initialVibe={(params.get('vibe') as PlaceVibe) || 'all'}
          />
        );

      case '/map':
        return <MapPage onNavigate={navigate} />;

      case '/build-my-day':
        return <BuildMyDayPage onNavigate={navigate} />;

      case '/vibes':
        return (
          <VibesPage
            onNavigate={navigate}
            selectedVibeName={params.get('vibe') || undefined}
          />
        );

      case '/featured':
        return <FeaturedPage onNavigate={navigate} />;

      case '/hidden-gems':
        return <HiddenGemsPage onNavigate={navigate} />;

      case '/businesses':
        return <BusinessesPage onNavigate={navigate} />;

      case '/emergency':
        return <EmergencyPage onNavigate={navigate} />;

      case '/about-lucknow':
        return <AboutLucknowPage onNavigate={navigate} />;

      case '/about':
        return <AboutPlatformPage onNavigate={navigate} />;

      case '/feedback':
      case '/reviews':
        return (
          <FeedbackPage
            onNavigate={navigate}
            initialTab={(params.get('tab') as any) || 'place'}
          />
        );

      case '/admin/login':
        return (
          <AdminLoginPage
            onNavigate={navigate}
            onLoginSuccess={() => navigate('/admin/dashboard')}
          />
        );

      case '/admin/dashboard':
      case '/admin':
        return <AdminDashboardPage onNavigate={navigate} />;

      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  const isAdminRoute = currentRoute.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 font-sans antialiased selection:bg-amber-500 selection:text-stone-950">
      {/* 1. Global Navigation Bar */}
      {!isAdminRoute && (
        <Navbar
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
          onOpenQuickSearch={() => setQuickSearchOpen(true)}
          onNavigate={navigate}
          currentRoute={currentRoute}
          currentPath={currentRoute}
        />
      )}

      {/* 2. Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        onNavigate={navigate}
        currentRoute={currentRoute}
        currentPath={currentRoute}
      />

      {/* 3. Main Page Content */}
      <main className="flex-1 w-full" id="main-content-viewport">
        {parseRoute()}
      </main>

      {/* 4. Global Footer */}
      {!isAdminRoute && <Footer onNavigate={navigate} />}

      {/* 5. Quick Search Modal (Ctrl+K) */}
      {quickSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 sm:pt-20">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                <Search className="w-4 h-4" />
                <span>Instant Lucknow Search</span>
              </div>
              <button
                onClick={() => setQuickSearchOpen(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Bara Imambara, Tunday, Hazratganj, Attar..."
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Results list */}
            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-[10px] uppercase font-bold text-stone-400">Found Destinations</div>
                <div className="divide-y divide-stone-100">
                  {searchResults.map(place => (
                    <button
                      key={place.id}
                      onClick={() => navigate(`/places/${place.slug}`)}
                      className="w-full py-2.5 px-3 rounded-xl hover:bg-amber-50/60 text-left flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={place.coverImage}
                          alt={place.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-200"
                        />
                        <div>
                          <div className="font-bold text-stone-900 text-xs group-hover:text-amber-900">
                            {place.name}
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-2">
                            <span>{place.area}</span>
                            <span>•</span>
                            <span className="capitalize text-amber-800">{place.category}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-700 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.trim().length > 1 && searchResults.length === 0 && (
              <div className="text-center py-6 text-xs text-stone-500">
                No matching places found for "{searchQuery}". Try searching for another monument, kebab shop, or bazaar.
              </div>
            )}

            {/* Quick Filter Shortcuts */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-400">
              <span className="text-[11px]">Popular Quick Links:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/explore?category=food')}
                  className="text-amber-800 hover:underline font-semibold"
                >
                  Food Trail
                </button>
                <span>•</span>
                <button
                  onClick={() => navigate('/hidden-gems')}
                  className="text-teal-700 hover:underline font-semibold"
                >
                  Hidden Gems
                </button>
                <span>•</span>
                <button
                  onClick={() => navigate('/map')}
                  className="text-amber-800 hover:underline font-semibold"
                >
                  City Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
