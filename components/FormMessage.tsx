export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>;
}
