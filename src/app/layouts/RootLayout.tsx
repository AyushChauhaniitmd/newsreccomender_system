import { Outlet } from 'react-router';
import { Navbar } from '../components/Navbar';
import { ThemeProvider } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { HyperNewsAuthProvider } from '../../features/hypernews/auth';

export function RootLayout() {
  return (
    <HyperNewsAuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
          <Navbar />
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
    </HyperNewsAuthProvider>
  );
}
