import { notFound } from 'next/navigation';

import { companies } from '../companies';
import { CompanyPage } from '../CompanyPage';

export function generateStaticParams() {
  return companies.map((company) => ({ company: company.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: id } = await params;
  const company = companies.find((item) => item.id === id);
  return {
    title: company ? `${company.name} — ThirdKind Collab` : 'ThirdKind Collab',
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: id } = await params;
  const company = companies.find((item) => item.id === id);
  if (!company) notFound();
  return <CompanyPage company={company} />;
}
