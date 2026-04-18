import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Clock, Share2, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const articleData: Record<string, any> = {
  'ai-revolution': {
    title: 'AI Revolution Transforms Global Markets',
    image: 'https://images.unsplash.com/photo-1579532537902-1e50099867b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    category: 'Technology',
    date: 'April 15, 2026',
    readTime: '5 min read',
    content: `The artificial intelligence revolution is reshaping industries across the globe at an unprecedented pace. From healthcare to finance, AI technologies are automating complex tasks, providing deep insights, and creating new opportunities for innovation.

    Major tech companies have invested billions into AI research and development, leading to breakthroughs in natural language processing, computer vision, and autonomous systems. These advancements are not just theoretical—they're already transforming how businesses operate and how consumers interact with technology.

    Industry experts predict that AI will contribute trillions of dollars to the global economy over the next decade. However, this transformation also raises important questions about workforce displacement, ethical AI development, and the need for regulatory frameworks to ensure responsible innovation.

    Companies that successfully integrate AI into their operations are seeing dramatic improvements in efficiency, customer satisfaction, and competitive advantage. The race to develop and deploy AI solutions has become a defining characteristic of the modern business landscape.`
  },
  'digital-news': {
    title: 'Digital News Consumption Reaches All-Time High',
    image: 'https://images.unsplash.com/photo-1697382608848-c5fea6dd9d60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
    category: 'Media',
    date: 'April 14, 2026',
    readTime: '4 min read',
    content: `Digital platforms have fundamentally changed how people consume news and information. Recent studies show that over 80% of adults now get their news primarily from digital sources, marking a historic shift in media consumption patterns.

    Social media platforms, news aggregators, and specialized apps have become the primary gateways to information for billions of people worldwide. This shift has democratized content creation while also raising concerns about information quality and the spread of misinformation.

    Traditional media organizations have had to adapt rapidly, developing robust digital strategies and experimenting with new formats like interactive storytelling, podcasts, and video content. Many have successfully transitioned to subscription-based models, proving that quality journalism can thrive in the digital age.

    The challenge now is ensuring that the digital news ecosystem remains diverse, trustworthy, and accessible to all segments of society.`
  }
};

export function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

  const article = id ? articleData[id] : null;

  if (!article) {
    return (
      <div className="min-h-screen pt-32 px-6 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-black transition-colors">
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-1 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-full">
              {article.category}
            </span>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{article.readTime}</span>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {article.title}
          </h1>

          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-600 dark:text-gray-400">{article.date}</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`p-2 rounded-full transition-colors ${
                  bookmarked
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 rounded-2xl overflow-hidden"
        >
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-96 object-cover"
          />
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          {article.content.split('\n\n').map((paragraph: string, index: number) => (
            <p key={index} className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {paragraph.trim()}
            </p>
          ))}
        </motion.div>
      </article>
    </div>
  );
}
