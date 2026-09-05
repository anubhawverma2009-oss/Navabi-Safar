import React, { useState, useEffect } from 'react';
import { Menu, Search, Bookmark, Lock } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { AuthService } from '../../services/authService';
import { useHiddenAdminTrigger } from '../../utils/useHiddenAdminTrigger';

interface NavbarProps {
  currentRoute?: string;
  currentPath?: string;
  onNavigate: (route: string) => void;
  onOpenMobileMenu: () => void;
  onOpenQuickSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute: propCurrentRoute,
  currentPath,
  onNavigate,
  onOpenMobileMenu,
  onOpenQuickSearch
}) => {
  const currentRoute = propCurrentRoute || currentPath || '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const isAdmin = AuthService.isAuthenticated();

  const handleAdminTrigger = useHiddenAdminTrigger(() => {
    onNavigate(isAdmin ? '/admin/dashboard' : '/admin/login');
  }, 3, 1800);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const updateBookmarks = () => {
      setBookmarkCount(StorageService.getBookmarks().length);
    };
    updateBookmarks();
    window.addEventListener('storage', updateBookmarks);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateBookmarks);
    };
  }, []);

  const navLinks = [
    { label: 'Home', route: '/' },
    { label: 'Explore', route: '/explore' },
    { label: 'Map', route: '/map', badge: 'Live' },
    { label: 'Discover Vibes', route: '/vibes' },
    { label: 'Featured', route: '/featured' },
    { label: 'Local Businesses', route: '/businesses' },
    { label: 'Build My Day', route: '/build-my-day' },
    { label: 'Reviews', route: '/feedback' },
    { label: 'Emergency', route: '/emergency', highlight: true }
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#181512]/95 backdrop-blur-md text-white shadow-xl border-b border-stone-800'
          : 'bg-[#181512] text-white border-b border-stone-800/80'
      }`}
      id="main-nawabi-safar-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Left section: Hamburger (Mobile) + Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile 3-line Hamburger Button */}
            <button
              onClick={onOpenMobileMenu}
              className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors lg:hidden cursor-pointer"
              aria-label="Open Navigation Menu"
              id="navbar-hamburger-btn"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo & Name */}
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
              id="navbar-brand-logo"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-[#181512] rounded-[10px] flex items-center justify-center">
                  <span className="font-royal font-bold text-amber-400 text-lg sm:text-xl tracking-tighter">
                    NS
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-royal text-lg sm:text-xl font-bold tracking-wider text-white group-hover:text-amber-300 transition-colors">
                    NAWABI SAFAR
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-amber-400/90 font-medium tracking-wide">
                  Discover Lucknow • Find Your Vibe
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.route || (link.route !== '/' && currentRoute.startsWith(link.route));
              return (
                <button
                  key={link.route}
                  onClick={() => onNavigate(link.route)}
                  id={`nav-link-${link.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all relative flex items-center gap-1.5 cursor-pointer ${
                    link.highlight
                      ? 'bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-800/60 shadow-sm'
                      : isActive
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Explore / Search Button */}
            <button
              onClick={() => onOpenQuickSearch ? onOpenQuickSearch() : onNavigate('/explore')}
              className="p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Search Places (Ctrl+K)"
              id="navbar-search-btn"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>Search</span>
            </button>

            {/* Bookmarks Counter */}
            <button
              onClick={() => onNavigate('/explore?filter=saved')}
              className="relative p-2.5 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              title="Saved Places"
              id="navbar-saved-bookmarks-btn"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={handleAdminTrigger}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-800 text-emerald-100 border-emerald-600 hover:bg-emerald-700'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white'
              }`}
              id="navbar-admin-access-btn"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{isAdmin ? 'Admin CMS' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
