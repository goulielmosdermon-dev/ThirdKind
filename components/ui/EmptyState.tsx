export function EmptyState({ message }: { message: string }) {
  return (
    <p className="border border-dashed border-hairline px-4 py-8 text-center text-caption text-mute">
      {message}
    </p>
  );
}
