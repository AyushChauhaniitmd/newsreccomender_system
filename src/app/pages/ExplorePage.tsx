import { motion } from 'motion/react';
import { useState } from 'react';
import { Search, TrendingUp, Filter } from 'lucide-react';
import { NewsCard } from '../components/NewsCard';

const allArticles = [
  {
    id: 'ai-revolution',
    image: 'https://images.unsplash.com/photo-1579532537902-1e50099867b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'AI Revolution Transforms Global Markets',
    description: 'Industry leaders discuss the impact of artificial intelligence on economy and society.',
    category: 'Technology'
  },
  {
    id: 'digital-news',
    image: 'https://images.unsplash.com/photo-1697382608848-c5fea6dd9d60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Digital News Consumption Reaches All-Time High',
    description: 'Latest statistics reveal major shift in how people consume media worldwide.',
    category: 'Media'
  },
  {
    id: 'innovation-summit',
    image: 'https://images.unsplash.com/photo-1581092787765-e3feb951d987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Innovation Summit Announces Groundbreaking Discoveries',
    description: 'Scientists and engineers unveil next-generation technologies at global conference.',
    category: 'Technology'
  },
  {
    id: 'startup-funding',
    image: 'https://images.unsplash.com/photo-1726566289392-011dc554e604?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Tech Startups Secure Record Funding',
    description: 'Venture capital investments surge as new companies emerge in competitive market.',
    category: 'Business'
  },
  {
    id: 'remote-work',
    image: 'https://images.unsplash.com/photo-1726569058494-a8e6ddcf1799?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Remote Work Technology Evolves Rapidly',
    description: 'New platforms and tools reshape how teams collaborate across distances.',
    category: 'Technology'
  },
  {
    id: 'cybersecurity',
    image: 'https://images.unsplash.com/photo-1726568313407-c7d9c8a8ce88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    title: 'Cybersecurity Measures Enhanced Worldwide',
    description: 'Governments implement stronger protocols to protect digital infrastructure.',
    category: 'Security'
  }
];

const categories = ['All', 'Technology', 'Media', 'Business', 'Security'];

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = allArticles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-gray-900 dark:text-white" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              Explore
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover trending stories and deep dive into topics that matter
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white rounded-2xl border-2 border-transparent focus:border-gray-900 dark:focus:border-white outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NewsCard {...article} />
              </motion.div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-400 dark:text-gray-600">
                No articles found. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
