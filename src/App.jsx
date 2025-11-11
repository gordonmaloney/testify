import { useEffect, useMemo, useState } from "react";

/**
 * Barebones React (Vite) frontend to:
 *  - enter password (Bearer token)
 *  - optionally enter site + limit
 *  - fetch from https://tenantactapi.vercel.app/api/fetch
 *  - render events
 *
 * Usage with Vite:
 *  1) `npm create vite@latest tenantact-admin -- --template react`
 *  2) Replace src/App.jsx with this file's contents (or create a new component and import it in App.jsx)
 *  3) `npm i`
 *  4) `npm run dev`
 */

const API_BASE = "https://tenantactapi.vercel.app"; // change to your API origin if needed

function prettyTs(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

function EventCard({ ev }) {
  const cd = ev.contactDeets || {};
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{ev._id}</div>
        <div className="text-xs text-gray-400">{prettyTs(ev.ts)}</div>
      </div>
      <div className="mt-2 text-lg font-semibold">
        {ev.site} · {ev.type}
      </div>
      <div className="text-sm text-gray-700">{ev.path}</div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="text-sm">
          <div className="font-medium text-gray-500">Campaign</div>
          <div>{ev.campaignId || "—"}</div>
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-500">Contact</div>
          <div>Name: {cd.name || "—"}</div>
          <div>Email: {cd.email || "—"}</div>
          <div>Phone: {cd.number || cd.phone || "—"}</div>
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-500">UA / Ref</div>
          <div className="truncate" title={ev.userAgent}>
            {ev.userAgent || "—"}
          </div>
          <div className="truncate" title={ev.ref}>
            {ev.ref || "—"}
          </div>
        </div>
      </div>

      {ev.testimonial ? (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer select-none text-gray-600">
            Testimonial
          </summary>
          <pre className="mt-2 whitespace-pre-wrap break-words bg-gray-50 p-2 rounded-lg text-xs">
            {typeof ev.testimonial === "string"
              ? ev.testimonial
              : JSON.stringify(ev.testimonial, null, 2)}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

function Controls({
  password,
  setPassword,
  site,
  setSite,
  limit,
  setLimit,
  onFetch,
  loading,
}) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto p-4 grid gap-3 md:grid-cols-5">
        <input
          className="md:col-span-2 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="password"
          placeholder="Bearer password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="site (optional)"
          value={site}
          onChange={(e) => setSite(e.target.value)}
        />
        <input
          className="rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="number"
          min={1}
          max={200}
          placeholder="limit"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value || 0))}
        />
        <button
          onClick={onFetch}
          disabled={loading || !password}
          className="rounded-xl px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Fetch"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [password, setPassword] = useState("");
  const [site, setSite] = useState("");
  const [limit, setLimit] = useState(20);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // load/save password locally so you don't retype during dev
  useEffect(() => {
    const saved = localStorage.getItem("ta_admin_pwd");
    if (saved) setPassword(saved);
  }, []);
  useEffect(() => {
    if (password) localStorage.setItem("ta_admin_pwd", password);
  }, [password]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (site) p.set("site", site);
    if (limit) p.set("limit", String(limit));
    return p.toString();
  }, [site, limit]);

  async function fetchEvents() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/fetch?${query}`, {
        headers: {
          Authorization: `Bearer ${password}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${text}`);
      }
      const json = await res.json();
      setEvents(json.events || []);
    } catch (e) {
      setError(e.message || String(e));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold p-4">TenantAct · Admin Viewer</h1>
        <Controls
          password={password}
          setPassword={setPassword}
          site={site}
          setSite={setSite}
          limit={limit}
          setLimit={setLimit}
          onFetch={fetchEvents}
          loading={loading}
        />

        <main className="max-w-5xl mx-auto p-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="text-sm text-gray-500">
              No events. Try lowering filters or adding data.
            </div>
          )}

          {loading && (
            <div className="text-sm text-gray-500">Loading events…</div>
          )}

          <div className="grid gap-3">
            {events.map((ev) => (
              <EventCard key={ev._id} ev={ev} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
