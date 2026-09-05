import React from 'react';
import { Compass, Database, Shield, Zap, Sparkles, Map, Heart, Code2, Users } from 'lucide-react';
import { useHiddenAdminTrigger } from '../utils/useHiddenAdminTrigger';

interface AboutPlatformPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPlatformPage: React.FC<AboutPlatformPageProps> = ({ onNavigate }) => {
  const handleAdminTrigger = useHiddenAdminTrigger(() => {
    onNavigate('/admin/login');
  }, 3, 1800);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] py-12" id="about-platform-nawabi-safar">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-3">
            <Compass className="w-4 h-4 text-amber-700" />
            <span>Modern Digital Tourism & Heritage Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading text-stone-900 leading-tight">
            About Nawabi Safar
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-3">
            A state-of-the-art, database-backed digital discovery platform built to illuminate Lucknow's historic monuments, gastronomic treasures, and local artisans.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif-heading text-stone-900">
              Live Database Architecture
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every monument, kebab stall, timing, fee, and coordinate is dynamically managed through a live structured datastore with full CRUD and persistence.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif-heading text-stone-900">
              Deterministic Day Planner
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              "Build My Day" utilizes a rule-based pacing engine that calculates real geographical transit, time windows, and expense budgets without mock dependencies.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif-heading text-stone-900">
              Admin & Curator Control
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Includes a protected administrative dashboard for tourism officers and curators to add, edit, or feature destinations in real-time.
            </p>
          </div>
        </div>

        {/* Lucknow Tehzeeb Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-8 sm:p-12 text-white border border-amber-800/40 shadow-xl text-center">
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-white">
            “Muskuraiye, Aap Lucknow Mein Hain”
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto mt-2 leading-relaxed">
            Nawabi Safar is dedicated to preserving the cultural memory and living tehzeeb of Awadh while giving 21st-century travellers a fast, fluid, and intuitive digital guide.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => onNavigate('/explore')}
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow transition-all"
            >
              Explore Destinations
            </button>
            <button
              onClick={handleAdminTrigger}
              className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-sm border border-stone-700 transition-all cursor-pointer"
            >
              Curator Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
