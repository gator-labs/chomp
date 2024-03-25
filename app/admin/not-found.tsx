import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2 className="text-3xl">Page not found</h2>
      <p>Could not find requested resource</p>
      <Link href="/admin">&larr; Home</Link>
    </div>
  );
}
