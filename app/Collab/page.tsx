import { companies } from './companies';
import { CompanyPage } from './CompanyPage';

export default function Page() {
  return <CompanyPage company={companies[0]!} />;
}
