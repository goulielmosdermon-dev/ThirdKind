import { PartnershipSheet } from '@/components/sheet/PartnershipSheet';
import { partnershipMeta } from '@/lib/partnership';

export const metadata = partnershipMeta('China');

export default function ChinaPage() {
  return <PartnershipSheet market="China" />;
}
