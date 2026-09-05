import { ThoughtsIndexSheet } from '@/components/sheet/ThoughtsIndexSheet';
import { allArticles } from '@/lib/content/queries';

export default async function ThoughtsIndexPage() {
  const articles = await allArticles();
  return <ThoughtsIndexSheet articles={articles} />;
}
