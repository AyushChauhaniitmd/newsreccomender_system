import { NewsCard } from './NewsCard';

interface Article {
  id: string;
  image: string;
  title: string;
  description: string;
}

interface NewsRowProps {
  title: string;
  articles: Article[];
}

export function NewsRow({ title, articles }: NewsRowProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white px-4 transition-colors">{title}</h2>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 px-4 pb-4">
          {articles.map((article) => (
            <NewsCard key={article.id} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
}
