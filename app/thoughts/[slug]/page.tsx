import { ArticleSheet } from '@/components/sheet/ArticleSheet';
import { articleStaticParams, requireArticle } from '@/lib/content/queries';

export function generateStaticParams() {
  return articleStaticParams();
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleSheet article={requireArticle(slug)} />;
}
