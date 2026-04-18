import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

interface NewsCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
}

export function NewsCard({ id, image, title, description }: NewsCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/article/${id}`)}
      className="flex-shrink-0 w-80 bg-gray-100 dark:bg-zinc-900 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-white/10 cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 dark:from-zinc-900 to-transparent opacity-60"></div>
      </div>
      <div className="p-6 space-y-3">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-white/90 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-white/60 line-clamp-3">
          {description}
        </p>
        <div className="pt-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:underline">
            Read more →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
