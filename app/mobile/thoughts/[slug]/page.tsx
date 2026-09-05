import { ArticleSheet } from '@/components/sheet/ArticleSheet';
import {
  allArticles,
  articleByline,
  articleStaticParams,
  requireArticle,
} from '@/lib/content/queries';

export async function generateStaticParams() {
  return articleStaticParams();
}

export default async function MobileArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, more, byline] = await Promise.all([
    requireArticle(slug),
    allArticles(),
    articleByline(),
  ]);
  return (
    <ArticleSheet article={article} moreThoughts={more} byline={byline} />
  );
}
