import { ContactSheet } from '@/components/sheet/ContactSheet';
import { getContact } from '@/lib/content/queries';

export default async function ContactPage() {
  return <ContactSheet contact={await getContact()} />;
}
