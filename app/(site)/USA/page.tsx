import { PartnershipSheet } from '@/components/sheet/PartnershipSheet';
import { partnershipMeta } from '@/lib/partnership';

export const metadata = partnershipMeta('USA');

export default function UsaPage() {
  return <PartnershipSheet market="USA" />;
}
