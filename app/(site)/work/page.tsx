import { WorkIndexSheet } from '@/components/sheet/WorkIndexSheet';
import { allProjects } from '@/lib/content/queries';

export default async function WorkIndexPage() {
  const projects = await allProjects();
  return <WorkIndexSheet projects={projects} />;
}
