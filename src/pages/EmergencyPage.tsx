import React, { useState, useEffect } from 'react';
import { EmergencyService } from '../types';
import { StorageService } from '../services/storageService';
import { 
  ShieldAlert, PhoneCall, CheckCircle2, AlertTriangle, 
  MapPin, Clock, Info, ShieldCheck, HeartPulse 
} from 'lucide-react';

interface EmergencyPageProps {
  onNavigate: (route: string) => void;
}

export const EmergencyPage: React.FC<EmergencyPageProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const loadEmergency = () => {
      setServices(StorageService.getEmergencyServices().filter(s => s.enabled));
    };
    loadEmergency();
    const unsubscribe = StorageService.subscribe(loadEmergency);
    return () => {
      unsubscribe();
    };
  }, []);

  const filtered = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] py-12" id="emergency-services-directory-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-900 border border-red-300 mb-3">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Verified 24x7 Government & Safety Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading text-stone-900">
            Emergency & Tourist Assistance
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Instant contact information for law enforcement, emergency medical trauma centers, tourist safety helplines, and women protection services across Lucknow.
          </p>
        </div>

        {/* Top Rapid Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-red-600 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-red-100 font-bold">Police Emergency</div>
              <div className="text-3xl font-extrabold font-serif-heading mt-0.5">Dial 112</div>
              <div className="text-xs text-red-100 mt-1">24x7 Immediate UP Police Dispatch</div>
            </div>
            <a
              href="tel:112"
              className="p-3 bg-white text-red-600 rounded-full shadow hover:scale-110 transition-transform"
            >
              <PhoneCall className="w-6 h-6" />
            </a>
          </div>

          <div className="bg-amber-600 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-100 font-bold">Tourist Assistance</div>
              <div className="text-2xl font-extrabold font-serif-heading mt-0.5">1800 180 5055</div>
              <div className="text-xs text-amber-100 mt-1">UP Tourism Helpline & Grievances</div>
            </div>
            <a
              href="tel:18001805055"
              className="p-3 bg-white text-amber-600 rounded-full shadow hover:scale-110 transition-transform"
            >
              <PhoneCall className="w-6 h-6" />
            </a>
          </div>

          <div className="bg-purple-700 text-white rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-purple-100 font-bold">Women Power Line</div>
              <div className="text-3xl font-extrabold font-serif-heading mt-0.5">Dial 1090</div>
              <div className="text-xs text-purple-100 mt-1">Confidential Harassment & Safety</div>
            </div>
            <a
              href="tel:1090"
              className="p-3 bg-white text-purple-700 rounded-full shadow hover:scale-110 transition-transform"
            >
              <PhoneCall className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'police', label: 'Police & Law' },
            { id: 'medical', label: 'Medical & Trauma' },
            { id: 'tourist', label: 'Tourist Support' },
            { id: 'women', label: 'Women Safety' },
            { id: 'fire', label: 'Fire & Rescue' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-stone-900 text-white shadow'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Detailed Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(service => (
            <div
              key={service.id}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800">
                    {service.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Clock className="w-3 h-3" />
                    {service.availability}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-serif-heading text-stone-900 leading-snug">
                  {service.serviceName}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                  {service.description}
                </p>

                {service.address && (
                  <div className="mt-3 flex items-start gap-1.5 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>{service.address}</span>
                  </div>
                )}

                {service.officialSource && (
                  <div className="mt-2 text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Source: {service.officialSource}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Helpline Number</div>
                  <div className="text-lg font-extrabold text-red-700 font-mono">{service.number}</div>
                </div>

                <a
                  href={`tel:${service.number.replace(/\s+/g, '')}`}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 shadow transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Footer Note */}
        <div className="mt-12 p-6 rounded-3xl bg-amber-50/80 border border-amber-200 text-stone-800 text-xs leading-relaxed flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <strong>Verified Directory Notice:</strong> All emergency phone numbers, medical trauma networks, and tourist help lines are cross-verified with Uttar Pradesh government authorities and King George’s Medical University (KGMU). Content administrators can update and manage these records directly via the CMS.
          </div>
        </div>
      </div>
    </div>
  );
};
