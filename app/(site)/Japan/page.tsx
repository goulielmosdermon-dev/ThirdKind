import { PartnershipSheet } from '@/components/sheet/PartnershipSheet';
import { partnershipMeta } from '@/lib/partnership';

export const metadata = partnershipMeta('Japan');

export default function JapanPage() {
  return <PartnershipSheet market="Japan" />;
}
