import { Link, Outlet } from "react-router-dom";

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <nav
          className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3"
          aria-label="Primary"
        >
          <Link to="/" className="font-semibold">
            QR Table Ordering
          </Link>
          <Link to="/kitchen" className="text-sm underline-offset-4 hover:underline">
            Kitchen
          </Link>
          <Link to="/bar" className="text-sm underline-offset-4 hover:underline">
            Bar
          </Link>
          <Link to="/floor" className="text-sm underline-offset-4 hover:underline">
            Floor
          </Link>
          <Link to="/admin" className="text-sm underline-offset-4 hover:underline">
            Admin
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
