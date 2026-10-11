import { PartnershipSheet } from '@/components/sheet/PartnershipSheet';
import { partnershipMeta } from '@/lib/partnership';

export const metadata = partnershipMeta('UK');

export default function UkPage() {
  return <PartnershipSheet market="UK" />;
}
