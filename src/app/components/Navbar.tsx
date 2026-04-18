import { Link, useLocation } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  hyperNewsSearch?: {
    query: string;
    setQuery: (v: string) => void;
    suggestions: string[];
    onSearch: () => void;
    loading: boolean;
  };
}

export function Navbar({ hyperNewsSearch }: NavbarProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 10) {
        // At the top of the page - show navbar
        setIsVisible(true);
      } else {
        // Scrolled away from top - hide navbar
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const links = [
    { path: '/', label: 'Home' },
    { path: '/hypernews', label: 'HyperNews' },
    { path: '/explore', label: 'Explore' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent transition-transform duration-300"
      style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 py-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-black dark:text-white">
            NewsHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative transition-colors ${
                  isActive(link.path)
                    ? 'text-black dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-black dark:bg-white"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center justify-end gap-4">
            {/* HyperNews Search Bar */}
            {hyperNewsSearch && location.pathname.startsWith('/hypernews') && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  hyperNewsSearch.onSearch();
                }}
                className="hidden md:block"
              >
                <div className="relative">
                  <input
                    list="hypernews-navbar-suggestions"
                    type="text"
                    placeholder="Search..."
                    value={hyperNewsSearch.query}
                    onChange={(event) => hyperNewsSearch.setQuery(event.target.value)}
                    className="w-64 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-full px-4 py-2 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/30"
                  />
                  <button
                    type="submit"
                    disabled={hyperNewsSearch.loading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </button>
                  <datalist id="hypernews-navbar-suggestions">
                    {hyperNewsSearch.suggestions.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                </div>
              </form>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-800" />
              ) : (
                <Sun className="w-5 h-5 text-white" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-800 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5 text-gray-800 dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-4 pt-4 pb-2">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 transition-colors ${
                      isActive(link.path)
                        ? 'text-black dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
