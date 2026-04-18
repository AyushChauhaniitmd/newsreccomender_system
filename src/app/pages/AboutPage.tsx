import { motion } from 'motion/react';
import { Sparkles, Target, Users, Zap } from 'lucide-react';
import { InteractiveCard } from '../components/InteractiveCard';

export function AboutPage() {
  const features = [
    {
      icon: Sparkles,
      title: 'Cutting-Edge Content',
      description: 'We deliver the latest news and insights from around the world with precision and speed.'
    },
    {
      icon: Target,
      title: 'Focused Coverage',
      description: 'Our editorial team curates content that matters most to our tech-savvy audience.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of readers who trust us for their daily dose of innovation and discovery.'
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Stay informed with instant notifications and breaking news alerts.'
    }
  ];

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-black transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            About NewsHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your trusted source for technology news, innovation updates, and insights that shape the future.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-12 mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            At NewsHub, we believe in the power of information to transform lives and communities.
            Our mission is to deliver accurate, timely, and engaging content that empowers our readers
            to make informed decisions and stay ahead in an ever-changing world. We combine cutting-edge
            technology with journalistic excellence to create an unparalleled news experience.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            What Sets Us Apart
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <InteractiveCard key={index} {...feature} />
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div className="p-8 bg-gray-100 dark:bg-zinc-900 rounded-2xl">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">10M+</div>
            <div className="text-gray-600 dark:text-gray-400">Monthly Readers</div>
          </div>
          <div className="p-8 bg-gray-100 dark:bg-zinc-900 rounded-2xl">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-400">Articles Published</div>
          </div>
          <div className="p-8 bg-gray-100 dark:bg-zinc-900 rounded-2xl">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">50+</div>
            <div className="text-gray-600 dark:text-gray-400">Expert Contributors</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
