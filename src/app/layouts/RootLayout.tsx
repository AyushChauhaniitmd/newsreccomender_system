import { Outlet } from 'react-router';
import { Navbar } from '../components/Navbar';
import { ThemeProvider } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { HyperNewsAuthProvider } from '../../features/hypernews/auth';
import { HyperNewsSearchProvider, useHyperNewsSearch } from '../../features/hypernews/SearchContext';
import { useLocation } from 'react-router';

function NavbarWithSearch() {
  const location = useLocation();
  const isHyperNews = location.pathname.startsWith('/hypernews');
  
  if (isHyperNews) {
    const search = useHyperNewsSearch();
    return (
      <Navbar
        hyperNewsSearch={{
          query: search.query,
          setQuery: search.setQuery,
          suggestions: search.suggestions,
          onSearch: search.onSearch || (() => {}),
          loading: search.loading,
        }}
      />
    );
  }
  
  return <Navbar />;
}

export function RootLayout() {
  return (
    <HyperNewsAuthProvider>
      <HyperNewsSearchProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
            <NavbarWithSearch />
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </ThemeProvider>
      </HyperNewsSearchProvider>
    </HyperNewsAuthProvider>
  );
}
