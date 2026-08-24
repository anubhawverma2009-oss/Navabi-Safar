import React, { useState, useEffect } from 'react';
import { Place, CategoryInfo, VibeInfo, LocalBusiness } from '../types';
import { PlaceService } from '../services/placeService';
import { StorageService } from '../services/storageService';
import { PlaceCard } from '../components/common/PlaceCard';
import { CategoryCard } from '../components/common/CategoryCard';
import { VibeCard } from '../components/common/VibeCard';
import { StatsCounter } from '../components/common/StatsCounter';
import { InteractiveLucknowMap } from '../components/map/InteractiveLucknowMap';
import { 
  Compass, Map, Sparkles, Flame, Gem, ArrowRight, Calendar, 
  Store, ShieldAlert, CheckCircle2, ChevronRight, Navigation, IndianRupee, Heart
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [vibes, setVibes] = useState<VibeInfo[]>([]);
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [stats, setStats] = useState(StorageService.getStats());

  useEffect(() => {
    // Increment visitor count on page load
    const updatedStats = StorageService.incrementVisitorCount();
    setStats(updatedStats);

    const loadedPlaces = PlaceService.getPublishedPlaces();
    setPlaces(loadedPlaces);
    setCategories(StorageService.getCategories().filter(c => c.enabled));
    setVibes(StorageService.getVibes());
    setBusinesses(StorageService.getBusinesses().filter(b => b.status === 'published' && b.featured));
  }, []);

  const featuredPlaces = places.filter(p => p.featured).slice(0, 6);
  const hiddenGems = places.filter(p => p.hiddenGem).slice(0, 4);

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen text-stone-900" id="nawabi-safar-homepage">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-950 text-white" id="hero-section">
        {/* Real Lucknow Heritage Hero Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=85"
            alt="Lucknow Rumi Darwaza and Bara Imambara Heritage"
            className="w-full h-full object-cover object-center transform scale-105 animate-fade-in"
          />
          {/* Multi-layered Vignettes and Dark Gradients for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40" />
          <div className="absolute inset-0 bg-amber-950/30 mix-blend-multiply" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold mb-6 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Discover the Timeless Soul of Awadh</span>
          </div>

          {/* Main Title */}
          <h1 className="font-royal text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl leading-tight">
            NAWABI SAFAR
          </h1>

          <p className="font-serif-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl text-amber-300 font-bold mt-3 tracking-wide drop-shadow max-w-4xl leading-snug">
            Enter Your Nawabi Era — Where Heritage Meets Hype and Nawabi Vibes Meet Modern Adventures.
          </p>

          <p className="max-w-2xl text-stone-200 text-sm sm:text-base md:text-lg mt-5 leading-relaxed font-sans drop-shadow">
            Explore world-renowned royal monuments, legendary Awadhi kebabs, centuries-old Chikankari bazaars, serene riverfronts, and off-beat hidden gems across Lucknow.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('/explore')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-base shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              id="hero-explore-cta"
            >
              <Compass className="w-5 h-5" />
              <span>Explore Lucknow</span>
            </button>

            <button
              onClick={() => onNavigate('/map')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-white font-bold text-base border border-stone-700 backdrop-blur-md shadow-lg transition-all flex items-center justify-center gap-2"
              id="hero-map-cta"
            >
              <Map className="w-5 h-5 text-amber-400" />
              <span>Interactive Map</span>
            </button>

            <button
              onClick={() => onNavigate('/build-my-day')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 font-bold text-base border border-amber-400/30 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              id="hero-build-day-cta"
            >
              <Calendar className="w-5 h-5 text-amber-300" />
              <span>Build My Day</span>
            </button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-3 text-xs text-stone-300">
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-stone-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Real Lucknow Coordinates
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-stone-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Curated Timings & Entry Fees
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-stone-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> 100% Database Driven
            </span>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-stone-400 animate-bounce">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">Scroll to Explore</span>
          <div className="w-5 h-8 rounded-full border-2 border-stone-600 flex items-start justify-center p-1 mt-1">
            <div className="w-1.5 h-2 bg-amber-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC STATS SECTION: LUCKNOW AT A GLANCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <StatsCounter places={places} visitorCount={stats.totalVisitors} />
      </section>

      {/* 3. FEATURED LUCKNOW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="featured-destinations-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>The Crown Jewels</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-stone-900">
              Featured Lucknow
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-xl">
              Hand-picked iconic destinations that define the royal history, cultural elegance, and world-famous flavors of Lucknow.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/featured')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm transition-all self-start md:self-auto shadow-sm"
            id="view-all-featured-btn"
          >
            <span>View All Featured ({featuredPlaces.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} onNavigate={(slug) => onNavigate(`/places/${slug}`)} />
          ))}
        </div>
      </section>

      {/* 4. EXPLORE BY CATEGORY */}
      <section className="w-full bg-[#F5EFE6]/70 py-20 border-y border-stone-200" id="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-200/80 text-amber-950">
              Curation Collections
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-stone-900 mt-3">
              Explore by Category
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              From majestic 18th-century Imambaras to bustling Chikankari bazaars and tranquil urban eco-parks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat) => {
              const count = places.filter(p => p.category === cat.id).length;
              return (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  placeCount={count}
                  onClick={() => onNavigate(`/explore?category=${cat.id}`)}
                />
              );
            })}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('/explore')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition-all"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. EXPLORE BY VIBE (SIGNATURE CONCEPT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="vibes-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Signature Discovery Concept</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-stone-900">
              Find Your Vibe
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-xl">
              Whether you seek peaceful solitude, golden hour sunset photography, family picnics, or authentic street food trails.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/vibes')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm transition-all self-start md:self-auto shadow-sm"
          >
            <span>All Vibes ({vibes.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {vibes.map((vibe) => {
            const count = places.filter(p => p.vibes.includes(vibe.name)).length;
            return (
              <VibeCard
                key={vibe.id}
                vibe={vibe}
                placeCount={count}
                onClick={() => onNavigate(`/explore?vibe=${vibe.name}`)}
              />
            );
          })}
        </div>
      </section>

      {/* 6. HIDDEN GEMS OF LUCKNOW */}
      <section className="w-full bg-[#1C1814] text-white py-20 lucknow-pattern border-t border-amber-900/30" id="hidden-gems-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
                <Gem className="w-3.5 h-3.5" />
                <span>Off the Beaten Track</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-white">
                Hidden Gems of Lucknow
              </h2>
              <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-xl">
                Secluded Baroque hunting lodges, optical illusion portrait galleries, eccentric French palaces, and artisanal tea corners.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/hidden-gems')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm transition-all self-start md:self-auto shadow-lg"
              id="view-all-hidden-gems-btn"
            >
              <span>Explore All Hidden Gems</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hiddenGems.map((place) => (
              <PlaceCard key={place.id} place={place} onNavigate={(slug) => onNavigate(`/places/${slug}`)} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE MAP PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="interactive-map-preview-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
              <Map className="w-4 h-4 text-amber-600" />
              <span>Real-Time Coordinates</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-stone-900">
              Interactive Lucknow Map
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-xl">
              Locate monuments, restaurants, and bazaars plotted on a high-precision interactive city map.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/map')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm transition-all self-start md:self-auto shadow-md"
            id="open-full-map-btn"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Fullscreen Map</span>
          </button>
        </div>

        <InteractiveLucknowMap places={places} height="520px" />
      </section>

      {/* 8. BUILD MY LUCKNOW DAY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-amber-800/40">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Personalized Day Planner
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif-heading text-white mt-4 leading-tight">
              Build Your Perfect Lucknow Day
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mt-3 leading-relaxed">
              Tell us your available hours, budget, and desired vibes (Heritage, Food, Photography, Sunset). We calculate an optimal, rule-based timed itinerary tailored for you.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('/build-my-day')}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm shadow-xl transition-all flex items-center gap-2"
                id="plan-day-banner-btn"
              >
                <Calendar className="w-4 h-4" />
                <span>Start Planning Your Day →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FEATURED LOCAL BUSINESSES */}
      {businesses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="local-businesses-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                <Store className="w-4 h-4 text-amber-600" />
                <span>Authentic Awadhi Artisans</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-stone-900">
                Featured Local Businesses
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                Verified heritage Chikankari boutiques, century-old perfumers, and traditional confectioners.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/businesses')}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              <span>View All Local Businesses</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-36 rounded-xl overflow-hidden mb-4 bg-stone-100">
                    <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {biz.category}
                  </span>
                  <h4 className="font-bold text-base text-stone-900 mt-2 line-clamp-1">{biz.name}</h4>
                  <p className="text-xs text-amber-800 font-medium mt-0.5">{biz.specialty}</p>
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2">{biz.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>{biz.area}</span>
                  <a href={`tel:${biz.contactNumber}`} className="font-bold text-amber-700 hover:underline">
                    Call Store
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10. EMERGENCY HOTLINE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-10">
        <div className="bg-red-950/20 border border-red-800/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 mx-auto md:mx-0 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-stone-900 font-serif-heading">
                Lucknow Official Emergency & Tourist Helplines
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                Police Emergency (Dial 112) • UP Tourist Assistance (1800 180 5055) • Women Helpline (1090)
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/emergency')}
            className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all shrink-0"
            id="home-emergency-directory-btn"
          >
            Open Emergency Directory
          </button>
        </div>
      </section>
    </div>
  );
};
