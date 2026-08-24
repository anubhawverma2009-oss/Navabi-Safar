import React from 'react';
import { Place } from '../../types';
import { Landmark, Utensils, Gem, ShoppingBag, Sparkles, Users } from 'lucide-react';

interface StatsProps {
  places: Place[];
  visitorCount?: number;
}

export const StatsCounter: React.FC<StatsProps> = ({ places, visitorCount = 48620 }) => {
  const totalPlaces = places.length;
  const historicalCount = places.filter(p => p.category === 'historical' || p.category === 'landmarks').length;
  const foodCount = places.filter(p => p.category === 'food').length;
  const hiddenGemsCount = places.filter(p => p.hiddenGem).length;
  const shoppingCount = places.filter(p => p.category === 'shopping').length;
  const featuredCount = places.filter(p => p.featured).length;

  const statItems = [
    {
      label: 'Curated Places',
      count: totalPlaces,
      suffix: '+',
      icon: Sparkles,
      desc: 'Verified Lucknow Spots'
    },
    {
      label: 'Heritage & Monuments',
      count: historicalCount,
      suffix: '',
      icon: Landmark,
      desc: 'Awadhi & Colonial Jewels'
    },
    {
      label: 'Food Experiences',
      count: foodCount,
      suffix: '',
      icon: Utensils,
      desc: 'Authentic Dastarkhwan'
    },
    {
      label: 'Hidden Gems',
      count: hiddenGemsCount,
      suffix: '',
      icon: Gem,
      desc: 'Off-beat Secret Havens'
    },
    {
      label: 'Bazaars & Artisans',
      count: shoppingCount,
      suffix: '',
      icon: ShoppingBag,
      desc: 'Chikankari & Attar'
    },
    {
      label: 'Curated Discoveries',
      count: visitorCount,
      suffix: '',
      icon: Users,
      desc: 'Happy Travellers Guided'
    }
  ];

  return (
    <div className="w-full bg-stone-900 text-white rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden lucknow-pattern border border-amber-900/40" id="lucknow-at-a-glance-stats">
      {/* Subtle Glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="max-w-3xl mb-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Real-Time Database Snapshot
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif-heading text-white mt-3 leading-tight">
            Lucknow at a Glance
          </h2>
          <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Every destination, culinary hotspot, and hidden alleyway is verified and dynamically synchronized from our central curated directory.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-stone-800/80 backdrop-blur-md rounded-2xl p-5 border border-stone-700/60 hover:border-amber-500/50 transition-all group"
                id={`stat-item-${idx}`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif-heading">
                  {item.count.toLocaleString()}{item.suffix}
                </div>
                <div className="text-xs font-bold text-amber-400 mt-1">
                  {item.label}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5 leading-tight">
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
