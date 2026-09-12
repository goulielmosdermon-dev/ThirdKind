import { WorkIndexSheet } from '@/components/sheet/WorkIndexSheet';
import { allProjects } from '@/lib/content/queries';

export default async function MobileWorkIndexPage() {
  const projects = await allProjects();
  return <WorkIndexSheet projects={projects} />;
}
