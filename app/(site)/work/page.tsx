import { WorkIndexSheet } from '@/components/sheet/WorkIndexSheet';
import { allProjects, getHub } from '@/lib/content/queries';

export default async function WorkIndexPage() {
  const [projects, hub] = await Promise.all([allProjects(), getHub('work')]);
  return (
    <WorkIndexSheet projects={projects} standfirst={hub?.description ?? ''} />
  );
}
