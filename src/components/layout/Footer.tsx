import React from 'react';
import { Landmark, Compass, Map, ShieldAlert, Calendar, Store, Heart, Sparkles, Phone, ArrowUpRight, MessageSquare } from 'lucide-react';
import { useHiddenAdminTrigger } from '../../utils/useHiddenAdminTrigger';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleAdminTrigger = useHiddenAdminTrigger(() => {
    onNavigate('/admin/login');
  }, 3, 1800);

  return (
    <footer className="w-full bg-[#141210] text-stone-300 border-t border-stone-800 lucknow-pattern pt-16 pb-12" id="main-nawabi-safar-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Banner with Lucknow Motto */}
        <div className="bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border border-amber-800/40 rounded-3xl p-6 sm:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 mx-auto md:mx-0">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-white">
                “Muskuraiye, Aap Lucknow Mein Hain”
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
                Experience the timeless grace, royal Awadhi tehzeeb, and unmatched flavours of the City of Nawabs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/build-my-day')}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
              id="footer-plan-day-cta"
            >
              <Calendar className="w-4 h-4" />
              <span>Build My Lucknow Day</span>
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold font-royal text-lg shadow-lg">
                NS
              </div>
              <span className="font-royal text-xl font-bold tracking-wider text-white">
                NAWABI SAFAR
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              Discover Lucknow. Find Your Vibe. A modern, database-driven digital tourism and cultural discovery platform designed to guide travellers and locals alike through the soul of Awadh.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-stone-400">
              <span className="px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 font-semibold text-amber-300">
                Cloud Database Synchronized
              </span>
              <span>•</span>
              <span className="text-stone-400">Lucknow, Uttar Pradesh</span>
            </div>
          </div>

          {/* Col 2: Explore */}
          <div>
            <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider mb-4">
              Explore Lucknow
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('/explore?category=historical')} className="hover:text-amber-400 transition-colors">
                  Historical & Monuments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/explore?category=food')} className="hover:text-amber-400 transition-colors">
                  Food & Awadhi Cuisine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/explore?category=shopping')} className="hover:text-amber-400 transition-colors">
                  Bazaars & Chikankari
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/explore?category=parks')} className="hover:text-amber-400 transition-colors">
                  Parks & Gomti Nature
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/hidden-gems')} className="hover:text-amber-400 transition-colors text-amber-300 font-medium">
                  ★ Hidden Gems
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/featured')} className="hover:text-amber-400 transition-colors">
                  Featured Lucknow
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Discovery Platform */}
          <div>
            <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider mb-4">
              Discovery Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('/map')} className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <Map className="w-3.5 h-3.5 text-amber-400" />
                  Interactive City Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/vibes')} className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Explore by Vibe
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/build-my-day')} className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Build My Day Planner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/businesses')} className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  Featured Local Businesses
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/feedback')} className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  Feedback & Community Reviews
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about-lucknow')} className="hover:text-amber-400 transition-colors">
                  About Lucknow’s History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-amber-400 transition-colors">
                  About Nawabi Safar
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency & Quick Contact */}
          <div>
            <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-1.5 text-red-400">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Emergency Services
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-stone-400">Police Emergency</div>
                <div className="font-bold text-amber-400 text-sm">Dial 112</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-stone-400">Tourist Police Helpline</div>
                <div className="font-bold text-amber-400 text-sm">1800 180 5055</div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-stone-400">Women Power Helpline</div>
                <div className="font-bold text-amber-400 text-sm">Dial 1090</div>
              </div>
              <button
                onClick={() => onNavigate('/emergency')}
                className="w-full py-1.5 text-center text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                View Complete Directory →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Nawabi Safar. All rights reserved. Crafted for the royal city of Lucknow.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('/about')} className="hover:text-stone-300">
              Platform Architecture
            </button>
            <span>•</span>
            <button onClick={handleAdminTrigger} className="hover:text-amber-400 font-medium cursor-pointer" id="footer-admin-login-btn">
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
