import { NewsRow } from './NewsRow';

const newsCategories = [
  {
    title: 'Breaking Tech',
    articles: [
      {
        id: 'ai-revolution',
        image: 'https://images.unsplash.com/photo-1579532537902-1e50099867b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'AI Revolution Transforms Global Markets',
        description: 'Industry leaders discuss the impact of artificial intelligence on economy and society.'
      },
      {
        id: 'digital-news',
        image: 'https://images.unsplash.com/photo-1697382608848-c5fea6dd9d60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Digital News Consumption Reaches All-Time High',
        description: 'Latest statistics reveal major shift in how people consume media worldwide.'
      },
      {
        id: 'innovation-summit',
        image: 'https://images.unsplash.com/photo-1581092787765-e3feb951d987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Innovation Summit Announces Groundbreaking Discoveries',
        description: 'Scientists and engineers unveil next-generation technologies at global conference.'
      },
      {
        id: 'startup-funding',
        image: 'https://images.unsplash.com/photo-1726566289392-011dc554e604?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Tech Startups Secure Record Funding',
        description: 'Venture capital investments surge as new companies emerge in competitive market.'
      },
      {
        id: 'remote-work',
        image: 'https://images.unsplash.com/photo-1726569058494-a8e6ddcf1799?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Remote Work Technology Evolves Rapidly',
        description: 'New platforms and tools reshape how teams collaborate across distances.'
      }
    ]
  },
  {
    title: 'Global Updates',
    articles: [
      {
        id: 'trade-agreements',
        image: 'https://images.unsplash.com/photo-1587231893324-56c58f6e4128?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'International Trade Agreements Reshape Markets',
        description: 'New partnerships forge economic opportunities across continents.'
      },
      {
        id: 'cybersecurity',
        image: 'https://images.unsplash.com/photo-1726568313407-c7d9c8a8ce88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Cybersecurity Measures Enhanced Worldwide',
        description: 'Governments implement stronger protocols to protect digital infrastructure.'
      },
      {
        id: 'mobile-tech',
        image: 'https://images.unsplash.com/photo-1760199789464-eff5ba507e32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Mobile Technology Reaches New Milestones',
        description: 'Latest smartphones feature unprecedented processing power and capabilities.'
      },
      {
        id: 'next-gen-devices',
        image: 'https://images.unsplash.com/photo-1717390758666-97dc77ef7a8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Next-Gen Devices Set to Launch',
        description: 'Major manufacturers prepare to unveil revolutionary product lines.'
      },
      {
        id: 'sports-tech',
        image: 'https://images.unsplash.com/photo-1763013258650-c92b085726c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Sports and Technology Converge',
        description: 'Advanced analytics and wearables transform athletic performance tracking.'
      }
    ]
  },
  {
    title: 'Digital Lifestyle',
    articles: [
      {
        id: 'wearable-tech',
        image: 'https://images.unsplash.com/photo-1646722313505-9c8f67727880?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Wearable Tech Becomes Essential',
        description: 'Smart devices integrate seamlessly into daily routines and health monitoring.'
      },
      {
        id: 'digital-reading',
        image: 'https://images.unsplash.com/photo-1535564801628-e71b7d119475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Digital Reading Experience Enhanced',
        description: 'E-readers and tablets offer new features for avid book lovers and students.'
      },
      {
        id: 'smartphone-photo',
        image: 'https://images.unsplash.com/photo-1730094737470-585776d7f790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Smartphone Photography Reaches Pro Level',
        description: 'Camera technology advancements blur line between phones and professional gear.'
      },
      {
        id: 'retro-tech',
        image: 'https://images.unsplash.com/photo-1768383235598-57b1ec107d45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Retro Tech Makes Surprising Comeback',
        description: 'Vintage devices gain renewed popularity among modern enthusiasts.'
      },
      {
        id: 'cloud-computing',
        image: 'https://images.unsplash.com/photo-1663124178598-71717cdea439?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        title: 'Cloud Computing Powers New Era',
        description: 'Businesses migrate to advanced platforms for enhanced efficiency and scale.'
      }
    ]
  }
];

export function NewsSection() {
  return (
    <div className="relative z-30 bg-gray-50 dark:bg-zinc-950 py-20 px-6 transition-colors duration-300">
      <div className="space-y-16">
        {newsCategories.map((category, index) => (
          <NewsRow key={index} title={category.title} articles={category.articles} />
        ))}
      </div>
    </div>
  );
}
