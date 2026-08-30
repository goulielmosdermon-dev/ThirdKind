import { ProjectSheet } from '@/components/sheet/ProjectSheet';
import {
  adjacentProjects,
  projectStaticParams,
  requireProject,
} from '@/lib/content/queries';

export function generateStaticParams() {
  return projectStaticParams();
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = requireProject(slug);
  const { prev, next } = adjacentProjects(slug);
  return (
    <ProjectSheet
      project={project}
      prevSlug={prev?.slug.current}
      nextSlug={next?.slug.current}
    />
  );
}
