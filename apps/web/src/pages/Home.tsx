import { Link } from "react-router-dom";

export default function Home(): JSX.Element {
  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title" className="text-2xl font-bold">
        QR Table Ordering — Phase 0
      </h1>
      <p className="mt-2 max-w-prose text-sm opacity-80">
        Monorepo skeleton is up. Customer menu lives at <code>/t/&lt;token&gt;</code> (Phase 3).
        Staff dashboards (Kitchen / Bar / Floor / Admin) arrive in later phases.
      </p>
      <p className="mt-4">
        <Link
          to="/t/demo-table-7"
          className="inline-block min-h-[44px] rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white"
        >
          Open demo menu (Table 7)
        </Link>
      </p>
    </section>
  );
}
