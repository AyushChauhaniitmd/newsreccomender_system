import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-black transition-colors flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-9xl font-bold text-gray-900 dark:text-white mb-8"
        >
          404
        </motion.div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Oops! The page you're looking for seems to have wandered off into the digital void.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/explore')}
            className="px-8 py-4 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Explore Articles
          </motion.button>
        </div>

        {/* Fun animation elements */}
        <div className="mt-16 relative h-32">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-gray-300 dark:bg-zinc-700 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
