import { useEffect, useMemo, useState } from "react";

import { DummyData } from "./DummyData";
import MiniMap from "./MiniMap";
import Chart from "./Chart";

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

function formatMonth(str) {
  if (!str || typeof str !== "string") return str;
  const [y, m] = str.split("-");
  if (!y || !m) return str;
  const date = new Date(parseInt(y), parseInt(m) - 1);
  if (isNaN(date.getTime())) return str;
  return date.toLocaleString("default", { month: "short", year: "numeric" });
}

function MarkdownText({ text }) {
  if (typeof text !== "string") return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </span>
  );
}

function EventCard({ ev }) {
  const cd = ev.contactDeets || {};
  return (
    <div
      className="rounded-2xl border p-4 shadow-sm bg-white"
      style={{
        margin: "8px",
        padding: "5px",
        display: "flex",
        flexDirection: "row",
        border: "1px solid black",
      }}
    >
      <div style={{ width: "600px" }}>
        <div className="mt-2 text-lg font-semibold">
          {ev.site} · {ev.type} · {ev.path}
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-sm">
            <div className="font-medium text-gray-500">
              Campaign - {ev.campaignId || "—"}
            </div>
          </div>
          {cd.name && (
            <div className="text-sm">
              <div>Name: {cd.name || "—"}</div>
              <div>Email: {cd.email || "—"}</div>
              <div>Phone: {cd.number || cd.phone || "—"}</div>
              <div>Postcode: {cd.postcode || "—"}</div>
            </div>
          )}
        </div>

        {cd.postcode && <MiniMap postcode={cd.postcode} />}

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

        {ev.complaintDeets ? (
          <details
            className="mt-3 text-sm"
            open={!!ev.complaintDeets.standards}
          >
            <summary className="cursor-pointer select-none text-gray-600 font-medium">
              Complaint Details
            </summary>
            <div className="mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {ev.complaintDeets.standards &&
              Array.isArray(ev.complaintDeets.standards) ? (
                <div className="space-y-3">
                  <div className="flex gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <span>
                      {formatMonth(ev.complaintDeets.dateStart)} –{" "}
                      {formatMonth(ev.complaintDeets.dateEnd)}
                    </span>
                  </div>
                  <ul className="list-disc ml-4 space-y-1.5 text-gray-700">
                    {ev.complaintDeets.standards.map((s, i) => (
                      <li key={i}>
                        <MarkdownText text={s} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words text-xs text-gray-600">
                  {typeof ev.complaintDeets === "string"
                    ? ev.complaintDeets
                    : JSON.stringify(ev.complaintDeets, null, 2)}
                </pre>
              )}
            </div>
          </details>
        ) : null}
      </div>
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

  useEffect(() => {
    //setEvents(DummyData);
  }, [error]);

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
            <Chart
              title="Page views"
              events={events.filter((ev) => ev.type == "page_view")}
            />
            <br />
            <br />

            {events.map((ev) => (
              <EventCard key={ev._id} ev={ev} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
