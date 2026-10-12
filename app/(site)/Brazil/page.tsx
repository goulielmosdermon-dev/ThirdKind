import { PartnershipSheet } from '@/components/sheet/PartnershipSheet';
import { partnershipMeta } from '@/lib/partnership';

export const metadata = partnershipMeta('Brazil');

export default function BrazilPage() {
  return <PartnershipSheet market="Brazil" />;
}
