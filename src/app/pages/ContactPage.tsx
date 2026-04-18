import { motion } from 'motion/react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@newshub.com' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
    { icon: MapPin, label: 'Address', value: 'San Francisco, CA 94102' }
  ];

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-black transition-colors">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-gray-900 dark:focus:border-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-gray-900 dark:focus:border-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-gray-900 dark:focus:border-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-900 dark:text-white mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white rounded-xl border-2 border-transparent focus:border-gray-900 dark:focus:border-white outline-none transition-all resize-none"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                {submitted ? (
                  'Message Sent!'
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="p-3 bg-gray-900 dark:bg-white rounded-xl">
                      <item.icon className="w-6 h-6 text-white dark:text-black" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {item.label}
                      </p>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black dark:from-white dark:to-gray-100 rounded-3xl p-8 text-white dark:text-black">
              <h3 className="text-2xl font-bold mb-4">Office Hours</h3>
              <div className="space-y-2 text-white/80 dark:text-black/80">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
