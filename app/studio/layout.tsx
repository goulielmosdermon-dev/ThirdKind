export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh overflow-auto bg-white">{children}</div>;
}
