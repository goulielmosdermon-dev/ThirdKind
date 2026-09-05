import { ProjectSheet } from '@/components/sheet/ProjectSheet';
import {
  allProjects,
  projectStaticParams,
  requireProject,
} from '@/lib/content/queries';

export async function generateStaticParams() {
  return projectStaticParams();
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, moreWork] = await Promise.all([
    requireProject(slug),
    allProjects(),
  ]);
  return <ProjectSheet project={project} moreWork={moreWork} />;
}
