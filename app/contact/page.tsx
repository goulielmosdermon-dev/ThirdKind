import { ContactSheet } from '@/components/sheet/ContactSheet';
import { getContact } from '@/lib/content/queries';

export default function ContactPage() {
  return <ContactSheet contact={getContact()} />;
}
