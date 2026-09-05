import React from 'react';
import { 
  X, Landmark, Utensils, ShoppingBag, Trees, Music, Sparkles, 
  Map, Compass, Gem, Calendar, Store, Info, Home, 
  ChevronRight, ShieldAlert, Flame, MessageSquare
} from 'lucide-react';
import { useHiddenAdminTrigger } from '../../utils/useHiddenAdminTrigger';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute?: string;
  currentPath?: string;
  onNavigate: (route: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentRoute: propCurrentRoute,
  currentPath,
  onNavigate
}) => {
  const currentRoute = propCurrentRoute || currentPath || '/';

  const handleAdminTrigger = useHiddenAdminTrigger(() => {
    onClose();
    onNavigate('/admin/login');
  }, 3, 1800);

  if (!isOpen) return null;

  const menuSections = [
    {
      title: 'Main Exploration',
      items: [
        { label: 'Home', route: '/', icon: Home },
        { label: 'Explore Lucknow (All)', route: '/explore', icon: Compass },
        { label: 'Interactive Map', route: '/map', icon: Map, badge: 'Live GPS' },
        { label: 'Build My Day', route: '/build-my-day', icon: Calendar, badge: 'Planner' },
        { label: 'Explore by Vibe', route: '/vibes', icon: Sparkles },
        { label: 'Featured Lucknow', route: '/featured', icon: Flame },
        { label: 'Hidden Gems of Lucknow', route: '/hidden-gems', icon: Gem }
      ]
    },
    {
      title: 'Categories & Curations',
      items: [
        { label: 'Historical Places', route: '/explore?category=historical', icon: Landmark },
        { label: 'Food & Cuisine', route: '/explore?category=food', icon: Utensils },
        { label: 'Shopping & Bazaars', route: '/explore?category=shopping', icon: ShoppingBag },
        { label: 'Parks & Nature', route: '/explore?category=parks', icon: Trees },
        { label: 'Culture & Art', route: '/explore?category=culture', icon: Music },
        { label: 'Entertainment & Modern', route: '/explore?category=entertainment', icon: Sparkles },
        { label: 'Famous Landmarks', route: '/explore?category=landmarks', icon: Landmark }
      ]
    },
    {
      title: 'Local & Heritage Guides',
      items: [
        { label: 'Featured Local Businesses', route: '/businesses', icon: Store },
        { label: 'Feedback & Reviews', route: '/feedback', icon: MessageSquare, badge: 'Community' },
        { label: 'About Lucknow (History & Tehzeeb)', route: '/about-lucknow', icon: Landmark },
        { label: 'About Nawabi Safar', route: '/about', icon: Info },
        { label: 'Emergency Services (24x7)', route: '/emergency', icon: ShieldAlert, highlight: true }
      ]
    }
  ];

  const handleItemClick = (route: string) => {
    onNavigate(route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="mobile-navigation-drawer-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-xs sm:max-w-sm bg-stone-900 text-stone-100 flex flex-col shadow-2xl border-r border-stone-800 lucknow-pattern">
          {/* Header */}
          <div className="p-5 border-b border-stone-800/80 flex items-center justify-between bg-stone-950/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold font-royal text-lg shadow-lg border border-amber-400/40">
                NS
              </div>
              <div>
                <h3 className="font-bold text-lg text-white font-royal tracking-wider">
                  NAWABI SAFAR
                </h3>
                <p className="text-[10px] text-amber-400 font-medium tracking-wide uppercase">
                  Lucknow Tourism Discovery
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Close Menu"
              id="mobile-drawer-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {menuSections.map((section, idx) => (
              <div key={idx}>
                <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2 font-mono">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.route;
                    return (
                      <button
                        key={itemIdx}
                        onClick={() => handleItemClick(item.route)}
                        id={`mobile-nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          item.highlight
                            ? 'bg-red-950/50 text-red-300 hover:bg-red-900/70 border border-red-800/40'
                            : isActive
                            ? 'bg-amber-600 text-white font-semibold shadow-md'
                            : 'text-stone-300 hover:bg-stone-800/90 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-red-400' : 'text-amber-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer of Drawer */}
          <div className="p-4 border-t border-stone-800 bg-stone-950/90 flex flex-col gap-2">
            <button
              onClick={handleAdminTrigger}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-400 hover:text-amber-300 bg-stone-800/80 hover:bg-stone-800 text-center transition-colors border border-stone-700 cursor-pointer"
              id="mobile-drawer-admin-btn"
            >
              Curator Admin Access
            </button>
            <div className="text-center text-[11px] text-stone-500">
              Muskuraiye, aap Lucknow mein hain ✨
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
