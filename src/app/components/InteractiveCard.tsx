import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface InteractiveCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function InteractiveCard({ icon: Icon, title, description }: InteractiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.03, y: -5 }}
      className="relative p-8 bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-gray-900/10 dark:from-white/5 dark:to-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        <motion.div
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 0.6 }}
          className="w-14 h-14 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mb-6"
        >
          <Icon className="w-7 h-7 text-white dark:text-black" />
        </motion.div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
