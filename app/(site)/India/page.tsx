import { PartnershipSheet } from '@/components/sheet/PartnershipSheet';
import { partnershipMeta } from '@/lib/partnership';

export const metadata = partnershipMeta('India');

export default function IndiaPage() {
  return <PartnershipSheet market="India" />;
}
