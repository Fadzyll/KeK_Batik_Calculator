import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto mt-16 max-w-md text-center">
      <p className="text-4xl">🍫</p>
      <h1 className="h2 mt-2">Page not found</h1>
      <Link href="/" className="btn mt-2">Back to dashboard</Link>
    </div>
  );
}
