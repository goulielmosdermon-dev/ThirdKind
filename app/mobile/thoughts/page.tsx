import { ThoughtsIndexSheet } from '@/components/sheet/ThoughtsIndexSheet';
import { allArticles } from '@/lib/content/queries';

export default async function MobileThoughtsIndexPage() {
  const articles = await allArticles();
  return <ThoughtsIndexSheet articles={articles} />;
}
