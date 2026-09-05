import React, { useState, useEffect } from 'react';
import { LocalBusiness } from '../types';
import { StorageService } from '../services/storageService';
import { Store, Phone, MapPin, Globe, Sparkles, Tag, ArrowRight, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';

interface BusinessesPageProps {
  onNavigate: (route: string) => void;
}

export const BusinessesPage: React.FC<BusinessesPageProps> = ({ onNavigate }) => {
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadBusinesses = () => {
    const all = StorageService.getBusinesses();
    // Only show businesses that are approved or published
    const publicBiz = all.filter(b => b.status === 'published' || b.status === 'approved');
    setBusinesses(publicBiz);
  };

  useEffect(() => {
    loadBusinesses();
    const unsubscribe = StorageService.subscribe(loadBusinesses);
    return () => unsubscribe();
  }, []);

  const filtered = selectedCategory === 'all'
    ? businesses
    : businesses.filter(b => b.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] py-12" id="local-businesses-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Partner CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60 mb-2">
              <Store className="w-3.5 h-3.5 text-amber-700" />
              <span>Awadhi Artisans & Merchants</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading text-stone-900">
              Featured Local Businesses
            </h1>
            <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl">
              Support authentic Lucknow heritage artisans — authentic Chikankari workshops, century-old natural Ittar distillers, legacy sweet-makers, and certified local storyteller guides.
            </p>
          </div>

          {/* Business Partner CTA Card */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-white p-5 rounded-2xl border border-amber-600/30 shadow-md shrink-0 max-w-md">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Own a Lucknow Business?</span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              Join Nawabi Safar as a verified Business Partner to list your establishment and connect with heritage travelers.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => onNavigate('/login?tab=partner')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow flex items-center gap-1"
                id="partner-register-cta-btn"
              >
                <span>Partner Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['all', 'attire', 'handicrafts', 'sweets', 'guide', 'restaurant', 'hotel'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-700 text-white shadow'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat === 'all' ? 'All Businesses' : cat}
            </button>
          ))}
        </div>

        {/* Businesses Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto">
            <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold font-serif-heading text-stone-900">No Approved Businesses in this Category</h3>
            <p className="text-xs text-stone-500 mt-1">Check other categories or submit a business application via our Partner Portal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(biz => (
              <div
                key={biz.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-stone-900 overflow-hidden">
                    <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-stone-900 backdrop-blur-md">
                      {biz.category}
                    </span>
                    {biz.featured && (
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-stone-950 flex items-center gap-1 shadow">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{biz.area}, Lucknow</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xl font-bold font-serif-heading text-stone-900">
                        {biz.name}
                      </h3>
                      {biz.priceRange && (
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {biz.priceRange}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-amber-800 mt-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>{biz.specialty}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 mt-3 leading-relaxed">
                      {biz.description}
                    </p>
                    {biz.openingHours && (
                      <div className="mt-2 text-xs text-stone-600 font-medium">
                        <strong>Timings:</strong> {biz.openingHours}
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
                      <strong>Address:</strong> {biz.address}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-3">
                  <a
                    href={`tel:${biz.contactNumber}`}
                    className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Call {biz.contactNumber}</span>
                  </a>
                  {biz.websiteUrl && (
                    <a
                      href={biz.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                      title="Visit Official Website / Social Link"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
