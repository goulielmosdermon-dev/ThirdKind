import { ThoughtsIndexSheet } from '@/components/sheet/ThoughtsIndexSheet';
import { allArticles, getHub } from '@/lib/content/queries';

export default async function ThoughtsIndexPage() {
  const [articles, hub] = await Promise.all([
    allArticles(),
    getHub('thoughts'),
  ]);
  return (
    <ThoughtsIndexSheet
      articles={articles}
      standfirst={hub?.description ?? ''}
    />
  );
}
