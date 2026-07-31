import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-woo-gradient px-4 text-center">
      <p className="font-serif italic text-4xl text-woo-text">Woo</p>
      <h1 className="mt-6 font-serif text-3xl font-bold text-woo-text">
        This Woo couldn&apos;t be found
      </h1>
      <p className="mt-3 max-w-sm text-woo-muted">
        The link may be wrong, or this invitation no longer exists.
      </p>
      <Link href="/" className="woo-btn mt-8">
        Go home
      </Link>
    </div>
  );
}
